use std::fs::create_dir_all;

use diesel::SqliteConnection;
use tauri::App;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init_db(app : &App) -> SqliteConnection {
    let app_cache_dir = app.path_resolver().app_cache_dir().unwrap();

    // エピソードキャッシュ用のフォルダを作成
    let episode_cache_dir = app_cache_dir.join("episodes");
    println!("episode_cache_dir: {:?}", episode_cache_dir);
    create_dir_all(episode_cache_dir)
        .expect("エピソードキャッシュ用ディレクトリの作成に失敗しました。");

    use crate::sqlite3::establish_connection;
    let mut conn = establish_connection();
    let _ = conn.run_pending_migrations(MIGRATIONS);

    conn
}
