use rand::Rng;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use zeroize::Zeroize;

pub struct Database {
    #[allow(dead_code)]
    conn: Mutex<rusqlite::Connection>,
    db_path: PathBuf,
}

impl Database {
    pub fn open(app_data_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;

        let db_path = app_data_dir.join("aether.db");
        let key = CredentialManager::retrieve_key().map_err(|e| {
            format!(
                "Failed to retrieve encryption key from credential manager: {}",
                e
            )
        })?;

        Self::open_with_key(db_path, key)
    }

    pub fn initialize_new(app_data_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;

        let db_path = app_data_dir.join("aether.db");
        let mut key = [0u8; 32];
        rand::rng().fill(&mut key);

        let mut key_hex = hex::encode(key);
        CredentialManager::store_key(&key_hex).map_err(|e| {
            format!(
                "Failed to store encryption key in credential manager: {}",
                e
            )
        })?;

        let result = Self::open_with_key(db_path, key_hex.clone());
        key.zeroize();
        key_hex.zeroize();
        result
    }

    pub fn db_path(&self) -> &PathBuf {
        &self.db_path
    }

    #[allow(dead_code)]
    pub fn with_connection<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&rusqlite::Connection) -> Result<R, String>,
    {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
        f(&conn)
    }

    fn open_with_key(db_path: PathBuf, key: String) -> Result<Self, String> {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        conn.execute_batch(&format!("PRAGMA key = '{}';", key))
            .map_err(|e| format!("Failed to set encryption key: {}", e))?;

        let integrity: String = conn
            .query_row("PRAGMA cipher_integrity_check;", [], |row| row.get(0))
            .map_err(|e| format!("Failed to check database integrity: {}", e))?;

        if integrity != "ok" {
            return Err(format!("Database integrity check failed: {}", integrity));
        }

        Self::initialize_schema(&conn)
            .map_err(|e| format!("Failed to initialize schema: {}", e))?;

        Ok(Self {
            conn: Mutex::new(conn),
            db_path,
        })
    }

    fn initialize_schema(conn: &rusqlite::Connection) -> Result<(), String> {
        conn.execute_batch(include_str!("schema.sql"))
            .map_err(|e| format!("Failed to initialize schema: {}", e))?;
        Ok(())
    }

    pub fn register_plugin(
        &self,
        id: &str,
        name: &str,
        version: &str,
        permissions: &[String],
    ) -> Result<(), String> {
        self.with_connection(|conn| {
            let permissions_json = serde_json::to_string(permissions)
                .map_err(|e| format!("Failed to serialize permissions: {}", e))?;
            conn.execute(
                "INSERT OR REPLACE INTO plugins (id, name, version, permissions) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![id, name, version, permissions_json],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    pub fn get_plugin_permissions(&self, plugin_id: &str) -> Result<Vec<String>, String> {
        self.with_connection(|conn| {
            let mut stmt = conn
                .prepare("SELECT permissions FROM plugins WHERE id = ?1")
                .map_err(|e| e.to_string())?;
            let permissions_json: String = stmt
                .query_row(rusqlite::params![plugin_id], |row| row.get(0))
                .map_err(|e| e.to_string())?;
            let permissions: Vec<String> =
                serde_json::from_str(&permissions_json).map_err(|e| e.to_string())?;
            Ok(permissions)
        })
    }

    pub fn list_plugins(&self) -> Result<Vec<PluginInfo>, String> {
        self.with_connection(|conn| {
            let mut stmt = conn
                .prepare("SELECT id, name, version, permissions, installed_at FROM plugins")
                .map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map([], |row| {
                    Ok(PluginInfo {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        version: row.get(2)?,
                        permissions: serde_json::from_str(&row.get::<_, String>(3)?)
                            .unwrap_or_default(),
                        installed_at: row.get(4)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            rows.collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())
        })
    }

    pub fn uninstall_plugin(&self, plugin_id: &str) -> Result<(), String> {
        self.with_connection(|conn| {
            conn.execute(
                "DELETE FROM plugins WHERE id = ?1",
                rusqlite::params![plugin_id],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub permissions: Vec<String>,
    pub installed_at: String,
}

impl Database {
    pub fn plugins_dir(app_data_dir: &Path) -> Result<PathBuf, String> {
        let plugins_dir = app_data_dir.join("plugins");
        std::fs::create_dir_all(&plugins_dir)
            .map_err(|e| format!("Failed to create plugins directory: {}", e))?;
        Ok(plugins_dir)
    }

    pub fn extract_plugin(
        &self,
        app_data_dir: PathBuf,
        plugin_id: &str,
        zip_data: &[u8],
    ) -> Result<PathBuf, String> {
        let plugins_dir = Self::plugins_dir(&app_data_dir)?;
        let plugin_dir = plugins_dir.join(plugin_id);
        std::fs::create_dir_all(&plugin_dir)
            .map_err(|e| format!("Failed to create plugin directory: {}", e))?;

        let cursor = std::io::Cursor::new(zip_data);
        let mut archive = zip::ZipArchive::new(cursor)
            .map_err(|e| format!("Failed to read plugin zip: {}", e))?;

        for i in 0..archive.len() {
            let mut file = archive
                .by_index(i)
                .map_err(|e| format!("Failed to read zip entry: {}", e))?;
            let out_path = plugin_dir.join(file.mangled_name().as_path());
            if file.is_dir() {
                std::fs::create_dir_all(&out_path)
                    .map_err(|e| format!("Failed to create directory: {}", e))?;
            } else {
                if let Some(parent) = out_path.parent() {
                    std::fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }
                let mut outfile = std::fs::File::create(&out_path)
                    .map_err(|e| format!("Failed to create file: {}", e))?;
                std::io::copy(&mut file, &mut outfile)
                    .map_err(|e| format!("Failed to write file: {}", e))?;
            }
        }

        Ok(plugin_dir)
    }

    pub fn remove_plugin_files(
        &self,
        app_data_dir: PathBuf,
        plugin_id: &str,
    ) -> Result<(), String> {
        let plugins_dir = Self::plugins_dir(&app_data_dir)?;
        let plugin_dir = plugins_dir.join(plugin_id);
        if plugin_dir.exists() {
            std::fs::remove_dir_all(&plugin_dir)
                .map_err(|e| format!("Failed to remove plugin directory: {}", e))?;
        }
        Ok(())
    }
}

struct CredentialManager;

impl CredentialManager {
    const SERVICE: &'static str = "aether-app-suite";
    const USERNAME: &'static str = "db-encryption-key";

    fn store_key(key: &str) -> Result<(), String> {
        let entry = keyring::Entry::new(Self::SERVICE, Self::USERNAME)
            .map_err(|e| format!("Failed to create credential manager entry: {}", e))?;
        entry
            .set_password(key)
            .map_err(|e| format!("Failed to store encryption key: {}", e))?;
        Ok(())
    }

    fn retrieve_key() -> Result<String, String> {
        let entry = keyring::Entry::new(Self::SERVICE, Self::USERNAME)
            .map_err(|e| format!("Failed to create credential manager entry: {}", e))?;
        entry
            .get_password()
            .map_err(|e| format!("Failed to retrieve encryption key: {}", e))
    }
}
