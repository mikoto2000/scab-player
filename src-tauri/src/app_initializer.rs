use std::fs::{copy, create_dir_all};
use std::path::PathBuf;

use tauri::App;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

const DB_NAME : &str = "scab-player.db";

pub fn init_db(app : &App) {
    let app_cache_dir = app.path_resolver().app_cache_dir().unwrap();

    // エピソードキャッシュ用のフォルダを作成
    let episode_cache_dir = app_cache_dir.join("episodes");
    println!("episode_cache_dir: {:?}", episode_cache_dir);
    create_dir_all(episode_cache_dir)
        .expect("エピソードキャッシュ用ディレクトリの作成に失敗しました。");

    let db_path : PathBuf = app_cache_dir.join(DB_NAME);

    println!("db_path: {:#?}", db_path);

    if db_path.is_file() {
      // db_path に DB が見つかった場合、マイグレーション
      use crate::sqlite3::establish_connection;
      let mut conn = establish_connection();
      let _ = conn.run_pending_migrations(MIGRATIONS);

      return;
    }

    // db_path に db が見つからない場合、初期 DB ファイルをコピー
    let original_db = PathBuf::from("assets/scab-player.db");
    if original_db.is_file() {
      println!("original_db: {:#?}", original_db);
      copy(original_db, db_path)
          .expect("initial db copy error.");
    }
}
