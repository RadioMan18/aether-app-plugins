use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::AppHandle;

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize)]
pub struct GreetPayload {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GreetResponse {
    pub greeting: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseInfo {
    pub path: String,
    pub initialized: bool,
}

#[tauri::command]
pub fn greet(payload: GreetPayload) -> Result<GreetResponse, String> {
    Ok(GreetResponse {
        greeting: format!("Hello, {}! You have been greeted from Rust!", payload.name),
    })
}

#[tauri::command]
pub fn get_app_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
pub fn initialize_database(app: AppHandle) -> Result<DatabaseInfo, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir.clone()).map_err(|e| e.to_string())?;

    Ok(DatabaseInfo {
        path: db.db_path().to_string_lossy().to_string(),
        initialized: true,
    })
}

#[tauri::command]
pub fn get_database_info(app: AppHandle) -> Result<Option<DatabaseInfo>, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db_path = app_data_dir.join("aether.db");

    if !db_path.exists() {
        return Ok(None);
    }

    Ok(Some(DatabaseInfo {
        path: db_path.to_string_lossy().to_string(),
        initialized: true,
    }))
}

fn get_app_data_dir(_app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = dirs::data_dir()
        .ok_or_else(|| "Failed to determine app data directory".to_string())?
        .join("aether")
        .join("appsuite");

    Ok(app_data_dir)
}
