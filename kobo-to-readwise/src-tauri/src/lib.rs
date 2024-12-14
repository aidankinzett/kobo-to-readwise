use rusqlite::Connection;
use serde::Serialize;
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
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
        .invoke_handler(tauri::generate_handler![get_kobo_devices, get_kobo_books])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
struct KoboDevice {
    name: String,
    path: String,
    #[serde(default)]
    is_file: bool,
}

#[derive(Debug, Serialize)]
pub struct KoboBook {
    title: String,
    author: String,
    book_id: String,
    highlight_count: i32,
    source: String,
}

#[derive(Debug)]
struct Highlight {
    text: String,
    container_path: String,
    date_created: String,
    annotation: Option<String>,
    title: String,
    author: String,
    book_id: String,
}

#[tauri::command]
fn get_kobo_devices() -> Vec<KoboDevice> {
    let mut devices = Vec::new();

    // On Unix-like systems, check appropriate mount points
    #[cfg(target_family = "unix")]
    {
        // For macOS, check /Volumes
        #[cfg(target_os = "macos")]
        let mount_points = vec!["/Volumes"];

        // For Linux, check /media and /run/media/$USER
        #[cfg(target_os = "linux")]
        let mount_points = vec!["/media"];

        for mount_point in mount_points {
            if let Ok(entries) = std::fs::read_dir(mount_point) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() && is_kobo_device(&path) {
                        devices.push(KoboDevice {
                            name: entry.file_name().to_string_lossy().to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_file: false,
                        });
                    }
                }
            }
        }
    }

    // On Windows, check mounted drives
    #[cfg(target_family = "windows")]
    {
        for drive_letter in b'C'..=b'Z' {
            let path = PathBuf::from(format!("{}:\\", drive_letter as char));
            if path.exists() && is_kobo_device(&path) {
                devices.push(KoboDevice {
                    name: format!("Kobo ({}:)", drive_letter as char),
                    path: path.to_string_lossy().to_string(),
                    is_file: false,
                });
            }
        }
    }

    devices
}

fn is_kobo_device(path: &PathBuf) -> bool {
    // If it's a file that ends with .sqlite or .db, consider it valid
    if path.is_file() {
        if let Some(ext) = path.extension() {
            return ext == "sqlite" || ext == "db";
        }
    }

    // Original directory check logic
    let kobo_dir = path.join(".kobo");
    let db_file = path.join(".kobo/KoboReader.sqlite");
    kobo_dir.exists() && db_file.exists()
}

#[tauri::command]
fn get_kobo_books(device_path: String) -> Result<Vec<KoboBook>, String> {
    get_books_from_device(&device_path).map_err(|e| e.to_string())
}

fn get_books_from_device(device_path: &str) -> Result<Vec<KoboBook>, Box<dyn Error>> {
    // If it's a direct file path, use it directly, otherwise construct the path
    let db_path = if device_path.ends_with(".sqlite") || device_path.ends_with(".db") {
        device_path.to_string()
    } else {
        format!("{}/.kobo/KoboReader.sqlite", device_path)
    };

    println!("Attempting to open database at: {}", db_path);

    let conn = Connection::open(&db_path)?;

    // Modified query to get books with highlight counts directly
    let mut stmt = conn.prepare(
        "SELECT 
            book.Title as title,
            book.Attribution as author,
            book.ContentID as book_id,
            COUNT(b.BookmarkID) as highlight_count
         FROM content book
         LEFT JOIN Bookmark b ON book.ContentID = b.VolumeID AND b.Text IS NOT NULL
         WHERE book.Title IS NOT NULL
         AND book.ContentID IS NOT NULL
         GROUP BY book.ContentID, book.Title, book.Attribution
         HAVING highlight_count > 0
         ORDER BY book.Title COLLATE NOCASE, book.Attribution COLLATE NOCASE",
    )?;

    let books = stmt.query_map([], |row| {
        let book_id: String = row.get(2)?;
        let source = if book_id.contains('/') {
            "Sideloaded".to_string()
        } else {
            "Kobo Store".to_string()
        };

        Ok(KoboBook {
            title: row.get(0)?,
            author: row.get(1)?,
            book_id: format!("{} {}", row.get::<_, String>(0)?, row.get::<_, String>(1)?),
            highlight_count: row.get(3)?,
            source,
        })
    })?;

    let books: Vec<KoboBook> = books.filter_map(Result::ok).collect();

    println!("Successfully found {} books with highlights", books.len());

    Ok(books)
}
