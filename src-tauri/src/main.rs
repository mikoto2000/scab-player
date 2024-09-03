#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};

use diesel::SqliteConnection;
use tauri::Manager;

#[macro_use]
extern crate diesel;
extern crate diesel_migrations;

mod app_initializer;
mod channel_manager;
mod command;
mod model;
mod podcast_cacher;
mod podcast_channel;
mod schema;
mod sqlite3;
mod virtual_channel;

struct AppState {
    conn: Arc<Mutex<SqliteConnection>>,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let conn = app_initializer::init_db(app);

            app.manage(AppState {
                conn: Arc::new(Mutex::new(conn)),
            });

            Ok(())
        })
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            command::get_channels,
            command::get_episodes,
            command::find_new_episodes,
            command::add_virtual_channel,
            command::delete_channel,
            command::update_episode,
            command::read_rss_info,
            command::add_podcast,
            command::download_podcast_episode,
        ])
        .register_uri_scheme_protocol("stream", move |_app, request| {
            use std::{
                cmp::min,
                io::{Read, Seek, SeekFrom},
                path::PathBuf,
            };
            use tauri::http::{HttpRange, ResponseBuilder};
            use urlencoding::decode;

            // リクエストからファイルパスを取得
            #[cfg(target_os = "windows")]
            let raw_path = request.uri().replace("stream://localhost/", "");
            #[cfg(not(target_os = "windows"))]
            let raw_path = request.uri().replace("stream://", "");

            let decoded_path = decode(raw_path.as_str()).unwrap().to_string();

            // 配信ファイル読み込み
            let video_file = PathBuf::from(&decoded_path);
            let mut content = std::fs::File::open(&video_file)?;
            let mut buf = Vec::new();

            // レスポンスの組み立て開始
            let mut response = ResponseBuilder::new();

            // デフォルトステータスコードを成功に設定
            let mut status_code = 200;

            // ヘッダーに range が入っていたら Partial Content 対応を行う
            if let Some(range) = request.headers().get("range") {
                // 配信ファイルサイズ取得
                let file_size = content.metadata().unwrap().len();

                // レスポンスに含める範囲を取得
                let range = HttpRange::parse(range.to_str().unwrap(), file_size).unwrap();

                // ひとつの範囲を含むレスポンスにのみ対応
                let first_range = range.first();

                // レンジの確認
                if let Some(range) = first_range {
                    // レンジがあったら読み込む範囲を計算する
                    let mut real_length = range.length;

                    // レスポンスに含める範囲の長さを計算
                    // この実装では 1 リクエスト 400k
                    // ローカルファイルシステムなのでもっと少なくても OK
                    // (ネットワークを介さないので、頻繁にリクエストのやり取りしても大丈夫)
                    if range.length > file_size / 3 {
                        real_length = min(file_size - range.start, 1024 * 400);
                    }

                    // レスポンスに含める範囲の末尾を計算
                    let last_byte = range.start + real_length - 1;

                    // partial content のステータスコードを設定
                    status_code = 206;

                    // ヘッダー組み立て
                    response = response
                        .header("Connection", "Keep-Alive")
                        .header("Accept-Ranges", "bytes")
                        .header("Content-Length", real_length)
                        .header(
                            "Content-Range",
                            format!("bytes {}-{}/{}", range.start, last_byte, file_size),
                        );

                    // 計算した範囲を読み込む
                    content.seek(SeekFrom::Start(range.start))?;
                    content.take(real_length).read_to_end(&mut buf)?;
                } else {
                    // レンジが無ければ最後まで読み込む
                    content.read_to_end(&mut buf)?;
                }
            }

            // 読み込んだ内容をレスポンスへ
            response.mimetype("audio").status(status_code).body(buf)
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
