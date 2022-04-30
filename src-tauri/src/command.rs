use tauri;

use crate::channel_manager;
use crate::model::Channel;
use crate::model::Episode;

#[tauri::command]
pub fn get_channels() -> Vec<Channel> {
    channel_manager::get_channels()
}

#[tauri::command]
pub fn get_episodes(channel_uri : String) -> Vec<Episode> {
    channel_manager::get_episodes(channel_uri)
}

