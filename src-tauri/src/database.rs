use rand::Rng;
use std::path::PathBuf;
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
