use tauri;

use crate::channel_manager;
use crate::virtual_channel;
use crate::model::Channel;
use crate::model::Episode;
use crate::model::Feed;
use crate::model::NewEpisode;
use crate::model::UpdateEpisode;

#[tauri::command]
pub fn get_channels() -> Result<Vec<Channel>, String> {
//    println!("get_channels");
    channel_manager::get_channels()
}

#[tauri::command]
pub fn get_episodes(channel_uri : String) -> Result<Vec<Episode>, String> {
//    println!("get_episodes");
    channel_manager::get_episodes(channel_uri)
}

#[tauri::command]
pub fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
//    println!("find_new_episodes");
    virtual_channel::find_new_episodes(new_channel)
}

#[tauri::command]
pub fn add_virtual_channel(new_channel: String) -> Result<Vec<NewEpisode>, String> {
//    println!("add_virtual_channel");
    virtual_channel::add_virtual_channel(new_channel)
}

#[tauri::command]
pub fn update_episode(episode : UpdateEpisode) -> Result<usize, String> {
//    println!("update_episode : {:?}", episode);
    channel_manager::update_episode(episode)
}

#[tauri::command]
pub fn delete_channel(channel_uri : String) -> Result<usize, String> {
//    println!("delete_channel : {:?}", channel_uri);
    channel_manager::delete_channel(&channel_uri)
}

#[tauri::command]
pub fn read_rss_info(channel_uri: String) -> Result<Feed, String> {
    println!("read_rss_info");

    // RSS 取得
    use reqwest::blocking::get;
    let response = get(channel_uri).unwrap();

    // RSS パース
    use feed_rs::parser;
    let feed = parser::parse(response.text().unwrap().as_bytes()).unwrap();

    Ok(Feed {
        title: feed.title.unwrap().content,
        author: feed.authors.iter().map(|e| e.name.clone()).collect(),
        description: feed.description.unwrap().content,
    })
}

#[tauri::command]
pub fn add_podcast_channel(_feed: Feed) -> Result<(), String> {
    println!("add_podcast_channel");
    //channel_manager::add_podcast_channel()
    Ok(())
}
