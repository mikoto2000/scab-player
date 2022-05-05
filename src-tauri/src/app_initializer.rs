use std::fs::copy;
use std::path::PathBuf;

use tauri::api::path::local_data_dir;

use tauri::App;

const DB_NAME : &str = "scab-player.db";

pub fn init_db(app : &App) {
    let identifier : &String = &app.config().tauri.bundle.identifier;
    let local_data_dir_path : PathBuf = local_data_dir().unwrap();
    let db_path : PathBuf =local_data_dir_path.join(identifier).join(DB_NAME);

    println!("db_path: {:#?}", db_path);

    if db_path.is_file() {
      return;
    }

    let original_db = PathBuf::from("assets/scab-player.db");
    if original_db.is_file() {
      println!("original_db: {:#?}", original_db);
      copy(original_db, db_path)
          .expect("initial db copy error.");
    }

}
