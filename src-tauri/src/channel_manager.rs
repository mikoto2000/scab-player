use diesel::prelude::*;

use crate::model::Channel;

pub fn get_channels() -> Result<Vec<Channel>, String> {
    use crate::schema::channel::dsl::channel;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();
    let channels_result = channel.load::<Channel>(&conn);

    match channels_result {
        Err(why) => Err(why.to_string().into()),
        Ok(channels) => Ok(channels)
    }
}

pub fn insert_channel(uri: String, name: String) -> Result<usize, String> {
    use crate::schema::channel;
    use crate::model::NewChannel;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();

    let new_channel = NewChannel {
        uri: uri.as_str(),
        name: name.as_str()
    };

    let insert_result = diesel::insert_into(channel::table)
        .values(new_channel)
        .execute(&conn);

    match insert_result {
        Err(why) => Err(why.to_string().into()),
        Ok(insert_row_count) => Ok(insert_row_count)
    }
}

use crate::model::Episode;

pub fn get_episodes(channel_uri : String) -> Result<Vec<Episode>, String> {
    use crate::schema::channel;
    use crate::schema::episode;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();
    let get_episode_result = episode::dsl::episode
        .inner_join(channel::dsl::channel)
        .select((
            episode::id,
            channel::name,
            episode::title,
            episode::uri,
            episode::current_time,
            episode::is_finish))
        .filter(episode::channel_uri.eq(channel_uri))
        .load::<Episode>(&conn);

    match get_episode_result {
        Err(why) => Err(why.to_string().into()),
        Ok(episodes) => Ok(episodes)
    }
}

use crate::model::NewEpisode;

pub fn insert_episodes(episodes: Vec<NewEpisode>) -> Result<usize, String> {
    use crate::schema::episode;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();

    let insert_result = diesel::insert_into(episode::table)
        .values(episodes)
        .execute(&conn);

    match insert_result {
        Err(why) => Err(why.to_string().into()),
        Ok(insert_row_count) => Ok(insert_row_count)
    }
}

pub fn delete_episodes(channel_uri: String) -> Result<usize, String> {
    use crate::schema::episode;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();

    let delete_result = diesel::delete(episode::table.filter(episode::channel_uri.eq(channel_uri)))
        .execute(&conn);

    match delete_result {
        Err(why) => Err(why.to_string().into()),
        Ok(delete_row_count) => Ok(delete_row_count)
    }
}

use crate::model::UpdateEpisode;

pub fn update_episode(update_episode: UpdateEpisode) -> Result<usize, String> {
    use crate::schema::episode;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();

    let update_result = diesel::update(episode::table.filter(episode::id.eq(update_episode.id)))
        .set(update_episode)
        .execute(&conn);

    match update_result {
        Err(why) => Err(why.to_string().into()),
        Ok(update_row_count) => Ok(update_row_count)
    }
}

#[cfg(test)]
mod channel_manager_tests {
    use std::process::Command;
    use crate::channel_manager::*;

    const LATEST_MIGRATION_DIR: &str = "./migrations/2022-04-29-021610_create_scab-player/";

    fn before() {
        clear_db();
    }

    fn after() {
        clear_db();
    }

    #[test]
    fn test_get_channels() {
        before();

        run_sql_from_file("./test/channel_manager/test_get_channels.sql", "./assets/scab-player.db");

        let channels = get_channels().unwrap();
        assert_eq!(channels.len(), 1);

        let first_channel = channels.first().unwrap();

        assert_eq!(first_channel.uri, "uri");
        assert_eq!(first_channel.name, "name");

        after();
    }

    #[test]
    fn test_insert_channel() {
        before();

        let insert_count = insert_channel("insert_uri".to_string(), "insert_name".to_string());
        assert_eq!(insert_count.unwrap(), 1);

        let channels = get_channels().unwrap();
        let first_channel = channels.first().unwrap();

        assert_eq!(first_channel.uri, "insert_uri");
        assert_eq!(first_channel.name, "insert_name");

        after();
    }

    #[test]
    fn test_get_episodes() {
        before();

        run_sql_from_file("./test/channel_manager/test_get_episodes.sql", "./assets/scab-player.db");

        let episodes = get_episodes("target_uri".to_string()).unwrap();
        assert_eq!(episodes.len(), 1);

        let first_episode = episodes.first().unwrap();

        assert_eq!(first_episode.id, 1);
        assert_eq!(first_episode.channel_name, "name");
        assert_eq!(first_episode.title, "hit_episode_title");
        assert_eq!(first_episode.uri, "hit_episode_uri");
        assert_eq!(first_episode.current_time, None);
        assert_eq!(first_episode.is_finish, false);

        after();
    }

    #[test]
    fn test_insert_episodes() {
        before();

        run_sql_from_file("./test/channel_manager/test_insert_episodes.sql", "./assets/scab-player.db");

        let new_episodes = vec![
            NewEpisode {
                channel_uri: "channel_uri".to_string(),
                title: "episode_title_1".to_string(),
                uri: "episode_uri_1".to_string(),
            },
            NewEpisode {
                channel_uri: "channel_uri".to_string(),
                title: "episode_title_2".to_string(),
                uri: "episode_uri_2".to_string(),
            },
        ];

        let insert_count = insert_episodes(new_episodes);
        assert_eq!(insert_count.unwrap(), 2);

        let episodes = get_episodes("channel_uri".to_string()).unwrap();
        let first_episode = episodes.first().unwrap();
        assert_eq!(first_episode.id, 1);
        assert_eq!(first_episode.channel_name, "channel_name");
        assert_eq!(first_episode.title, "episode_title_1");
        assert_eq!(first_episode.uri, "episode_uri_1");
        assert_eq!(first_episode.current_time, None);
        assert_eq!(first_episode.is_finish, false);

        let second_episode = episodes.get(1).unwrap();
        assert_eq!(second_episode.id, 2);
        assert_eq!(second_episode.channel_name, "channel_name");
        assert_eq!(second_episode.title, "episode_title_2");
        assert_eq!(second_episode.uri, "episode_uri_2");
        assert_eq!(second_episode.current_time, None);
        assert_eq!(second_episode.is_finish, false);

        after();
    }

    #[test]
    fn test_delete_episodes() {
        before();

        run_sql_from_file("./test/channel_manager/test_delete_episodes.sql", "./assets/scab-player.db");

        let channel_uri = "target_channel_uri".to_string();

        let delete_count = delete_episodes(channel_uri).unwrap();
        assert_eq!(delete_count, 2);

        let target_episodes = get_episodes("target_channel_uri".to_string()).unwrap();
        assert_eq!(target_episodes.len(), 0);

        let target_episodes = get_episodes("no_target_channel_uri".to_string()).unwrap();
        assert_eq!(target_episodes.len(), 2);

        after();
    }

    #[test]
    fn test_update_episodes() {
        before();

        run_sql_from_file("./test/channel_manager/test_update_episodes.sql", "./assets/scab-player.db");

        let episode = UpdateEpisode {
            id: 1,
            current_time: Some(255),
            is_finish: true
        };

        let update_count = update_episode(episode).unwrap();
        assert_eq!(update_count, 1);

        let episodes = get_episodes("channel_uri".to_string()).unwrap();
        let first_episode = episodes.first().unwrap();
        assert_eq!(first_episode.id, 1);
        assert_eq!(first_episode.channel_name, "channel_name");
        assert_eq!(first_episode.title, "episode_title");
        assert_eq!(first_episode.uri, "episode_uri");
        assert_eq!(first_episode.current_time, Some(255));
        assert_eq!(first_episode.is_finish, true);

        let second_episode = episodes.get(1).unwrap();
        assert_eq!(second_episode.id, 2);
        assert_eq!(second_episode.channel_name, "channel_name");
        assert_eq!(second_episode.title, "non_target_episode_title");
        assert_eq!(second_episode.uri, "non_target_episode_uri");
        assert_eq!(second_episode.current_time, None);
        assert_eq!(second_episode.is_finish, false);

        after();
    }

    fn clear_db() {
        run_sql_from_file((LATEST_MIGRATION_DIR.to_string() + "down.sql").as_str(), "./assets/scab-player.db");
        run_sql_from_file((LATEST_MIGRATION_DIR.to_string() + "up.sql").as_str(), "./assets/scab-player.db");
    }

    fn run_sql_from_file(file_path: &str, db_path: &str) {
        let shell = get_shell();

        Command::new(shell)
                .args([
                      "-c",
                      format!("cat {} | sqlite3 {}", file_path, db_path).as_str()
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
