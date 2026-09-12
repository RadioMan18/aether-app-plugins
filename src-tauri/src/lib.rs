mod biometrics;
mod commands;
mod database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_data_dir = get_app_data_dir(app.handle())?;
            if let Err(e) = database::Database::open(app_data_dir) {
                eprintln!("Failed to initialize database: {}", e);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_app_version,
            commands::initialize_database,
            commands::get_database_info,
            commands::invoke_biometric_challenge
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_app_data_dir(_app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    dirs::data_dir()
        .ok_or_else(|| "Failed to determine app data directory".to_string())?
        .join("aether")
        .join("appsuite")
        .to_str()
        .map(|s| s.into())
        .ok_or_else(|| "Invalid app data directory path".to_string())
}
