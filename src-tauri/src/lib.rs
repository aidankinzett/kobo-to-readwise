use rusqlite::Connection;
use serde::Serialize;
use std::error::Error;
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
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
        .invoke_handler(tauri::generate_handler![
            get_kobo_devices,
            get_kobo_books,
            get_book_highlights
        ])
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

#[derive(Debug, Serialize)]
pub struct KoboHighlight {
    text: String,
    title: String,
    author: String,
    note: Option<String>,
    date: String,
    location: Option<i32>,
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
         LEFT JOIN Bookmark b ON book.ContentID = b.VolumeID 
         AND (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
         AND b.Type IN ('highlight', 'note')
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
            book_id: row.get(2)?,
            highlight_count: row.get(3)?,
            source,
        })
    })?;

    let books: Vec<KoboBook> = books.filter_map(Result::ok).collect();

    println!("Successfully found {} books with highlights", books.len());

    Ok(books)
}

#[tauri::command]
fn get_book_highlights(
    device_path: String,
    book_ids: Vec<String>,
) -> Result<Vec<KoboHighlight>, String> {
    get_highlights_from_device(&device_path, &book_ids).map_err(|e| e.to_string())
}

fn calculate_location(content_id: &str, chapter_progress: f64) -> i32 {
    // Strip everything after # if present
    let clean_content_id = content_id.split('#').next().unwrap_or(content_id);

    // Extract chapter number from various possible formats
    let chapter_num = clean_content_id
        .split(|c| c == '/' || c == '!') // Split on both / and !
        .find(|s| {
            s.contains("part")
                || s.contains("chapter")
                || (s.ends_with(".xhtml") && s.contains(char::is_numeric))
        })
        .and_then(|s| {
            // Try to extract number from different formats:
            // - part0016.xhtml
            // - chapter004.xhtml
            s.chars()
                .filter(|c| c.is_numeric())
                .collect::<String>()
                .parse::<i32>()
                .ok()
        })
        .unwrap_or(0);

    // Format as "CCCCPPPP" where:
    // - CCCC is the chapter number (left-padded with zeros)
    // - PPPP is the progress percentage (0-9999)
    let chapter_str = format!("{:04}", chapter_num);
    let progress_str = format!("{:04}", (chapter_progress * 10000.0) as i32);

    // Combine them and parse back to integer
    format!("{}{}", chapter_str, progress_str)
        .parse::<i32>()
        .unwrap_or(0)
}

fn get_header_level(note: &Option<String>) -> i32 {
    note.as_ref()
        .and_then(|n| {
            if n.starts_with(".h") {
                n.trim_start_matches(".h").parse::<i32>().ok()
            } else {
                None
            }
        })
        .unwrap_or(99) // Non-header notes sort after headers
}

fn get_highlights_from_device(
    device_path: &str,
    book_ids: &[String],
) -> Result<Vec<KoboHighlight>, Box<dyn Error>> {
    let db_path = if device_path.ends_with(".sqlite") || device_path.ends_with(".db") {
        device_path.to_string()
    } else {
        format!("{}/.kobo/KoboReader.sqlite", device_path)
    };

    let conn = Connection::open(&db_path)?;

    let placeholders: Vec<String> = (0..book_ids.len())
        .map(|i| format!("book.ContentID = ?{}", i + 1))
        .collect();

    // Simpler SQL query without REGEXP_REPLACE
    let query = format!(
        "SELECT 
          b.Text as highlight,
          b.Annotation as note,
          b.DateCreated as date,
          b.ContentID as content_id,
          b.ChapterProgress as progress,
          b.StartContainerPath as container_path,
          book.Title as title,
          book.Attribution as author
       FROM Bookmark b 
       INNER JOIN content book ON book.ContentID = b.VolumeID
       WHERE ({}) 
       AND (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
       AND b.Type IN ('highlight', 'note')",
        placeholders.join(" OR ")
    );

    let mut stmt = conn.prepare(&query)?;
    let params: Vec<&str> = book_ids.iter().map(|s| s.as_str()).collect();

    let highlights = stmt.query_map(rusqlite::params_from_iter(params), |row| {
        let content_id: String = row.get(3)?;
        let progress: f64 = row.get(4)?;
        let location = calculate_location(&content_id, progress);

        Ok(KoboHighlight {
            text: row.get(0)?,
            title: row.get(6)?,
            author: row.get(7)?,
            note: row.get(1)?,
            date: row.get(2)?,
            location: Some(location),
        })
    })?;

    let mut highlights: Vec<KoboHighlight> = highlights.filter_map(Result::ok).collect();

    // Sort by location, then header level, then date
    highlights.sort_by(|a, b| {
        match (a.location, b.location) {
            (Some(loc_a), Some(loc_b)) => {
                if loc_a == loc_b {
                    // If locations are the same, check header levels
                    let header_level_a = get_header_level(&a.note);
                    let header_level_b = get_header_level(&b.note);

                    if header_level_a != header_level_b {
                        // Lower header numbers come first
                        header_level_a.cmp(&header_level_b)
                    } else {
                        // If header levels are the same (or both non-headers), sort by date
                        a.date.cmp(&b.date)
                    }
                } else {
                    loc_a.cmp(&loc_b)
                }
            }
            // Handle cases where location might be None
            (None, None) => a.date.cmp(&b.date),
            (Some(_), None) => std::cmp::Ordering::Less,
            (None, Some(_)) => std::cmp::Ordering::Greater,
        }
    });

    Ok(highlights)
}
