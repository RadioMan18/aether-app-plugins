use crate::biometrics::{BiometricAuth, BiometricResult};
use crate::database::{Database, PluginInfo};
use crate::ipc::{PluginBroker, PluginRequest, PluginResponse};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::AppHandle;

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
    let db = Database::initialize_new(app_data_dir.clone()).map_err(|e| e.to_string())?;

    Ok(DatabaseInfo {
        path: db.db_path().to_string_lossy().to_string(),
        initialized: true,
    })
}

#[tauri::command]
pub async fn unlock_database(app: AppHandle) -> Result<DatabaseInfo, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db_path = app_data_dir.join("aether.db");

    if !db_path.exists() {
        return Err("Database does not exist. Please initialize first.".to_string());
    }

    let auth = BiometricAuth::new();
    let biometric_result = auth
        .invoke_challenge("Unlock Aether App Suite")
        .await
        .map_err(|e| format!("Biometric challenge failed: {}", e))?;

    if !biometric_result.success {
        return Err(format!(
            "Biometric verification failed: {}",
            biometric_result.message
        ));
    }

    let db = Database::open(app_data_dir).map_err(|e| e.to_string())?;

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

#[tauri::command]
pub async fn invoke_biometric_challenge(message: String) -> Result<BiometricResult, String> {
    let auth = BiometricAuth::new();
    auth.invoke_challenge(&message).await
}

#[tauri::command]
pub fn register_plugin(
    app: AppHandle,
    id: String,
    name: String,
    version: String,
    permissions: Vec<String>,
) -> Result<(), String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir).map_err(|e| e.to_string())?;
    db.register_plugin(&id, &name, &version, &permissions)
}

#[tauri::command]
pub fn plugin_ipc(app: AppHandle, request: PluginRequest) -> Result<PluginResponse, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir).map_err(|e| e.to_string())?;
    let broker = PluginBroker::new(&db);
    let plugin_id = request.plugin_id.clone();
    broker.handle(&plugin_id, request)
}

#[tauri::command]
pub fn install_plugin(
    app: AppHandle,
    id: String,
    name: String,
    version: String,
    permissions: Vec<String>,
    zip_data: Vec<u8>,
) -> Result<(), String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir.clone()).map_err(|e| e.to_string())?;
    db.register_plugin(&id, &name, &version, &permissions)?;
    db.extract_plugin(app_data_dir, &id, &zip_data).map(|_| ())
}

#[tauri::command]
pub fn list_plugins(app: AppHandle) -> Result<Vec<PluginInfo>, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir).map_err(|e| e.to_string())?;
    db.list_plugins()
}

#[tauri::command]
pub fn uninstall_plugin(app: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let db = Database::open(app_data_dir.clone()).map_err(|e| e.to_string())?;
    db.uninstall_plugin(&id)?;
    db.remove_plugin_files(app_data_dir, &id)
}

fn get_app_data_dir(_app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = dirs::data_dir()
        .ok_or_else(|| "Failed to determine app data directory".to_string())?
        .join("aether")
        .join("appsuite");

    Ok(app_data_dir)
}
