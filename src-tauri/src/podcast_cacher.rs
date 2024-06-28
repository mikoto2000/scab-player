use std::io::prelude::*;
use std::fs::File;
use std::path::Path;
use std::path::PathBuf;

use tauri::api::path::local_data_dir;

use reqwest::get;

use crate::model::Episode;

pub async fn download_and_cache_podcast_episode(episode: Episode) {
    println!("download_and_cache_podcast_episode");

    // データ取得
    let episode_media_url = episode.uri.clone();
    print!("download {} ...", episode_media_url.clone());
    let response = get(episode_media_url.clone()).await.unwrap();
    let episode_media_bytes = response.bytes().await.unwrap();
    println!(" done.");


    // ファイル名組み立て

    // メディアの拡張子を取得
    let episode_media_extension_pathbuf = PathBuf::from(episode.uri.clone()).clone();
    let episode_media_extension_pathbuf = episode_media_extension_pathbuf.extension();
    let episode_media_extension_pathbuf = episode_media_extension_pathbuf.unwrap();
    let episode_media_extension_string = episode_media_extension_pathbuf.to_string_lossy();

    // ファイル内容から md5 ハッシュを取得
    let file_name = md5::compute(episode_media_bytes.clone());
    let formated_file_name = format!("{:x}.{}", file_name, episode_media_extension_string);


    // ファイルパス組み立て

    // エピソードキャッシュ用フォルダパス組み立て
    // TODO: util 化
    // TODO: identifer をどうしようか...
    let ldd = local_data_dir().unwrap();
    let episode_cache_dir = Path::new(&ldd).join("dev.mikoto2000.scab-player").join("episodes");
    let file_path = episode_cache_dir.join(formated_file_name);


    // ファイル保存
    println!("save to: {:?}", file_path);
    let mut buffer = File::create(file_path).unwrap();
    buffer.write_all(&episode_media_bytes).unwrap();

    // TODO: DB 内のエピソードの cache_uri を更新
}
