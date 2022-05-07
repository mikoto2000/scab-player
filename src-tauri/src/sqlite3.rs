#[cfg(not(test))]
use std::path::PathBuf;
#[cfg(not(test))]
use tauri::api::path::local_data_dir;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

#[cfg(not(test))]
const DB_NAME : &str = "scab-player.db";

pub fn establish_connection() -> SqliteConnection {
    // TODO: tauri.conf.json と同期
    #[cfg(not(test))]
    let identifier : &str = "dev.mikoto2000.scab-player";
    #[cfg(not(test))]
    let local_data_dir_path : PathBuf = local_data_dir().unwrap();
    #[cfg(not(test))]
    let db_path : PathBuf = local_data_dir_path.join(identifier).join(DB_NAME);

    #[cfg(not(test))]
    let database_url : &str = db_path.to_str().unwrap();
    #[cfg(test)]
    let database_url = "assets/scab-player.db";
    SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}

