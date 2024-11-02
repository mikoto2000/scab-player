use std::path::Path;

use diesel::SqliteConnection;

use crate::channel_manager::*;
use crate::model::NewEpisode;

pub fn add_virtual_channel(
    conn: &mut SqliteConnection,
    virtual_channel_path_str: String,
) -> Result<Vec<NewEpisode>, String> {
    let virtual_channel_path = Path::new(&virtual_channel_path_str);
    if virtual_channel_path.is_dir() {
        insert_channel(
            conn,
            virtual_channel_path
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
            virtual_channel_path
                .file_name()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
        )?;

        let new_episodes = find_new_episodes(virtual_channel_path_str);

        insert_episodes(conn, new_episodes.clone())?;

        Ok(new_episodes)
    } else {
        Err(format!("{} is not directory.", virtual_channel_path_str))
    }
}

pub fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
    use walkdir::WalkDir;
    let channel_uri = Path::new(&new_channel)
        .canonicalize()
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    WalkDir::new(new_channel)
        .into_iter()
        .filter_map(|e| {
            let unwraped_e = e.unwrap();
            let path = unwraped_e.path().canonicalize().unwrap();
            if path.is_file()
                && vec!["mp3", "wav"].contains(&path.extension().unwrap().to_str().unwrap())
            {
                let uri = path.to_str().unwrap().to_string();
                let title = path.file_stem().unwrap().to_str().unwrap().to_string();

                Some(NewEpisode {
                    channel_uri: channel_uri.clone(),
                    uri: uri.clone(),
                    title: title,
                    cache_uri: Some(uri.clone()),
                    publish_date: None,
                })
            } else {
                None
            }
        })
        .collect::<Vec<_>>()
}

#[cfg(test)]
mod virtual_channel_tests {
    use crate::virtual_channel::*;
    use std::process::Command;

    const LATEST_MIGRATION_DIR: &str = "./migrations/2022-04-29-021610_create_scab-player/";

    fn before() {
        clear_db();
    }

    fn after() {
        clear_db();
    }

    #[test]
    fn test_add_virtual_channel() {
        use crate::channel_manager::get_episodes;

        before();

        let channel_dir = "./test/virtual_channel/add_virtual_channel/basic_testdata".to_string();
        let channel_path = Path::new(&channel_dir);

        let added_episodes = add_virtual_channel(channel_dir.clone()).unwrap();

        let first_added_episode = added_episodes.get(0).unwrap();
        assert_eq!(
            first_added_episode.channel_uri,
            channel_path
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );
        assert_eq!(first_added_episode.title, "test_audio_01");
        assert_eq!(
            first_added_episode.uri,
            channel_path
                .join("test_audio_01.mp3")
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );

        let second_added_episode = added_episodes.get(0).unwrap();
        assert_eq!(
            second_added_episode.channel_uri,
            channel_path
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );
        assert_eq!(second_added_episode.title, "test_audio_01");
        assert_eq!(
            second_added_episode.uri,
            channel_path
                .join("test_audio_01.mp3")
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );

        let episodes = get_episodes(
            channel_path
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
        )
        .unwrap();

        let first_episode = episodes.get(0).unwrap();
        assert_eq!(first_episode.channel_name, "basic_testdata");
        assert_eq!(first_episode.title, "test_audio_01");
        assert_eq!(
            first_episode.uri,
            channel_path
                .join("test_audio_01.mp3")
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );
        assert_eq!(first_episode.current_time, None);
        assert_eq!(first_episode.is_finish, false);

        let second_episode = episodes.get(1).unwrap();
        assert_eq!(second_episode.channel_name, "basic_testdata");
        assert_eq!(second_episode.title, "test_audio_02");
        assert_eq!(
            second_episode.uri,
            channel_path
                .join("test_audio_02.mp3")
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );
        assert_eq!(second_episode.current_time, None);
        assert_eq!(second_episode.is_finish, false);

        after();
    }

    #[test]
    fn test_get_channels() {
        before();

        let base_dir = "./test/virtual_channel/find_new_episodes/basic_testdata".to_string();
        let results = find_new_episodes(base_dir);

        let first_result = results.get(0).unwrap();
        let except_title_1 = "test_audio_01";
        let except_uri_1 =
            "./test/virtual_channel/find_new_episodes/basic_testdata/test_audio_01.mp3";
        assert_eq!(first_result.title, except_title_1);
        assert_eq!(
            first_result.uri,
            Path::new(except_uri_1)
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );

        let second_result = results.get(1).unwrap();
        let except_title_2 = "test_audio_02";
        let except_uri_2 =
            "./test/virtual_channel/find_new_episodes/basic_testdata/test_audio_02.mp3";
        assert_eq!(second_result.title, except_title_2);
        assert_eq!(
            second_result.uri,
            Path::new(except_uri_2)
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string()
        );

        after();
    }

    fn clear_db() {
        run_sql_from_file(
            (LATEST_MIGRATION_DIR.to_string() + "down.sql").as_str(),
            "./assets/scab-player.db",
        );
        run_sql_from_file(
            (LATEST_MIGRATION_DIR.to_string() + "up.sql").as_str(),
            "./assets/scab-player.db",
        );
    }

    fn run_sql_from_file(file_path: &str, db_path: &str) {
        let shell = get_shell();

        Command::new(shell)
            .args([
                "-c",
                format!("cat {} | sqlite3 {}", file_path, db_path).as_str(),
            ])
            .output()
            .expect("failed to execute process");
    }

    fn get_shell() -> &'static str {
        if cfg!(target_os = "windows") {
            "pwsh"
        } else {
            "sh"
        }
    }
}
