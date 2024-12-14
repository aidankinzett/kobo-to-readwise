use std::path::Path;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
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
        .invoke_handler(tauri::generate_handler![find_kobo_device])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn find_kobo_device() -> Result<String, String> {
    let mount_points = if cfg!(target_os = "windows") {
        // Windows drives from D: to Z:
        (b'D'..=b'Z')
            .map(|drive| format!("{}:\\.kobo", drive as char))
            .collect::<Vec<String>>()
    } else if cfg!(target_os = "macos") {
        vec![
            "/Volumes/KOBOeReader/.kobo".to_string(),
            "/Volumes/kobo/.kobo".to_string(),
        ]
    } else {
        // Linux common mount points
        vec![
            "/media/$USER/KOBOeReader/.kobo".to_string(),
            "/media/$USER/kobo/.kobo".to_string(),
            "/run/media/$USER/KOBOeReader/.kobo".to_string(),
            "/run/media/$USER/kobo/.kobo".to_string(),
        ]
    };

    for path in &mount_points {
        if Path::new(path).exists() {
            return Ok(path.to_string());
        }
    }

    Err("Kobo device not found. Please make sure your Kobo is connected and mounted.".to_string())
}
