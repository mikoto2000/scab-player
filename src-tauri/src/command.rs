use tauri;

use crate::channel_manager;
use crate::virtual_channel;
use crate::model::Channel;
use crate::model::Episode;
use crate::model::NewEpisode;

#[tauri::command]
pub fn get_channels() -> Vec<Channel> {
    channel_manager::get_channels()
}

#[tauri::command]
pub fn get_episodes(channel_uri : String) -> Vec<Episode> {
    channel_manager::get_episodes(channel_uri)
}

#[tauri::command]
pub fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
    println!("find_new_episodes: {:#?}", new_channel);
    virtual_channel::find_new_episodes(new_channel)
}

