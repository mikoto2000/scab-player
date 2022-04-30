use tauri;

use crate::channel_manager;
use crate::model::Channel;

#[tauri::command]
pub fn get_channels() -> Vec<Channel> {
    channel_manager::get_channels()
}

