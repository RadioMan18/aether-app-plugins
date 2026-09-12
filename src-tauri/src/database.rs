use rand::Rng;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<rusqlite::Connection>,
    db_path: PathBuf,
}

impl Database {
    pub fn open(app_data_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;

        let db_path = app_data_dir.join("aether.db");
        let key = Self::get_or_create_key(&app_data_dir)?;

        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        let key_hex = hex::encode(key);
        conn.execute_batch(&format!("PRAGMA key = '{}';", key_hex))
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

    pub fn db_path(&self) -> &PathBuf {
        &self.db_path
    }

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

    fn get_or_create_key(app_data_dir: &PathBuf) -> Result<Vec<u8>, String> {
        let key_path = app_data_dir.join("db.key");

        if key_path.exists() {
            let key = std::fs::read(&key_path)
                .map_err(|e| format!("Failed to read database key: {}", e))?;
            return Ok(key);
        }

        let mut key = [0u8; 32];
        rand::rng().fill(&mut key);
        std::fs::write(&key_path, key)
            .map_err(|e| format!("Failed to write database key: {}", e))?;

        Ok(key.to_vec())
    }

    fn initialize_schema(conn: &rusqlite::Connection) -> Result<(), String> {
        conn.execute_batch(include_str!("schema.sql"))
            .map_err(|e| format!("Failed to initialize schema: {}", e))?;
        Ok(())
    }
}
