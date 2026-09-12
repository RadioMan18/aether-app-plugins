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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_app_version,
            commands::initialize_database,
            commands::unlock_database,
            commands::get_database_info,
            commands::invoke_biometric_challenge
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
