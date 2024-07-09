use std::fs::copy;
use std::fs::create_dir_all;
use std::path::PathBuf;

use tauri::App;
use tauri::AppHandle;
use tauri::Manager;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

const DB_NAME : &str = "scab-player.db";

pub fn init_db(app: &App, app_handle: &AppHandle) {
    let app_cache_dir = app.path().app_cache_dir().unwrap();
    println!("{:?}", app_cache_dir);

    // エピソードキャッシュ用のフォルダを作成
    let episode_cache_dir = app_cache_dir.join("episodes");
    println!("episode_cache_dir: {:?}", episode_cache_dir);
    create_dir_all(episode_cache_dir)
        .expect("エピソードキャッシュ用ディレクトリの作成に失敗しました。");

    // db_path に db が見つからない場合、初期 DB ファイルをコピー
    let db_path : PathBuf = app_cache_dir.join(DB_NAME);
    println!("{:?}", db_path);
    let original_db = PathBuf::from("assets/scab-player.db");
    if original_db.is_file() {
        println!("original_db: {:#?}", original_db);
        copy(original_db, db_path).expect("initial db copy error.");
    }

    use crate::sqlite3::establish_connection;
    let mut conn = establish_connection(app_handle);
    let _ = conn.run_pending_migrations(MIGRATIONS);
}
