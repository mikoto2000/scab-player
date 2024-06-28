use std::io::prelude::*;
use std::fs::File;
use std::path::Path;
use std::path::PathBuf;

use tauri::api::path::local_data_dir;

use reqwest::blocking::get;

use crate::model::Episode;

pub fn download_and_cache_podcast_episode(episode: Episode) {
    println!("download_and_cache_podcast_episode");

    // エピソードキャッシュ用フォルダパス組み立て
    // TODO: util 化
    // TODO: identifer をどうしようか...
    let ldd = local_data_dir().unwrap();
    let episode_cache_dir = Path::new(&ldd).join("dev.mikoto2000.scab-player").join("episodes");

    let episode_media_url = episode.uri.clone();
    let episode_media_extension_pathbuf = PathBuf::from(episode.uri.clone()).clone();
    let episode_media_extension_pathbuf = episode_media_extension_pathbuf.extension();
    let episode_media_extension_pathbuf = episode_media_extension_pathbuf.unwrap();
    let episode_media_extension_string = episode_media_extension_pathbuf.to_string_lossy();

    let title_md5 = md5::compute(episode.title);
    let formated_title_md5 = format!("{:x}.{}", title_md5, episode_media_extension_string);

    let episode_file_path = episode_cache_dir.join(formated_title_md5);

    println!("download {} ...", episode_media_url.clone());

    // データ取得
    // TODO: ブロッキングを止めなければいけない？？？
    //let response = get(episode_media_url.clone()).unwrap();
    // let episode_media_bytes = response.bytes().unwrap();

    println!(" done.");

    println!("{:?}", episode_file_path);
    let mut buffer = File::create(episode_file_path).unwrap();
    buffer.write_all(b"aaaaaaaaa").unwrap();

    // TODO: DB 内のエピソードの cache_uri を更新
}
