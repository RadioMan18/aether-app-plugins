use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GreetPayload {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GreetResponse {
    pub greeting: String,
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
