use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Manager;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

const DB_NAME: &str = "scab-player.db";

pub fn establish_connection(app_handle: &AppHandle) -> SqliteConnection {
    let app_cache_dir = app_handle.path().app_cache_dir().unwrap();
    let db_path : PathBuf = app_cache_dir.join(DB_NAME);

    let database_url: &str = db_path.to_str().unwrap();
    SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}
