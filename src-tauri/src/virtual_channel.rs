use std::path::Path;
use std::sync::Arc;
use std::sync::Mutex;

use diesel::prelude::*;

use crate::channel_manager::*;
use crate::model::NewEpisode;

pub fn add_virtual_channel(conn: &Arc<Mutex<SqliteConnection>>, virtual_channel_path_str: String) -> Result<Vec<NewEpisode>, String> {
    let virtual_channel_path = Path::new(&virtual_channel_path_str);
    if virtual_channel_path.is_dir() {

        insert_channel(
            &conn,
            virtual_channel_path.canonicalize().unwrap().to_str().unwrap().to_string(),
            virtual_channel_path.file_name().unwrap().to_str().unwrap().to_string()
        )?;

        let new_episodes = find_new_episodes(virtual_channel_path_str);

        insert_episodes(&conn, new_episodes.clone())?;

        Ok(new_episodes)

    } else {
        Err(format!("{} is not directory.", virtual_channel_path_str))
    }
}

pub fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
    use walkdir::WalkDir;
    let channel_uri = Path::new(&new_channel).canonicalize().unwrap().to_str().unwrap().to_string();

    WalkDir::new(new_channel).into_iter()
        .filter_map(|e| {
            let unwraped_e = e.unwrap();
            let path = unwraped_e.path().canonicalize().unwrap();
            if path.is_file() && vec!["mp3", "wav"].contains(&path.extension().unwrap().to_str().unwrap()) {
                let uri = path.to_str().unwrap().to_string();
                let title = path.file_stem().unwrap().to_str().unwrap().to_string();

                Some(NewEpisode {
                    channel_uri: channel_uri.clone(),
                    uri: uri.clone(),
                    title: title,
                    cache_uri: Some(uri.clone()),
                    publish_date: None
                })
            } else {
                None
            }
        }).collect::<Vec<_>>()

}

