#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[macro_use]
extern crate diesel;

mod channel_manager;
mod command;
mod model;
mod schema;
mod sqlite3;
mod virtual_channel;

fn main() {
  tauri::Builder::default()
    .invoke_handler(
        tauri::generate_handler![
            command::get_channels,
            command::get_episodes,
            command::find_new_episodes
        ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
