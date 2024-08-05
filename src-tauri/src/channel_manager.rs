use std::fs::remove_file;
use std::path::Path;
use std::sync::Arc;
use std::sync::Mutex;

use diesel::prelude::*;

use crate::model::Channel;
use crate::model::UpdateEpisodeAddCacheUrl;

pub fn get_channels(conn: &Arc<Mutex<SqliteConnection>>) -> Result<Vec<Channel>, String> {
    let mut conn = conn.lock().unwrap();

    use crate::schema::channel::dsl::channel;

    let channels_result = channel.load::<Channel>(&mut *conn);

    match channels_result {
        Err(why) => Err(why.to_string().into()),
        Ok(channels) => Ok(channels)
    }
}

pub fn insert_channel(conn: &Arc<Mutex<SqliteConnection>>, uri: String, name: String) -> Result<usize, String> {
    let mut conn = conn.lock().unwrap();
    use crate::schema::channel;
    use crate::model::NewChannel;

    let new_channel = NewChannel {
        uri: uri.as_str(),
        name: name.as_str()
    };

    let insert_result = diesel::insert_or_ignore_into(channel::table)
        .values(new_channel)
        .execute(&mut *conn);

    match insert_result {
        Err(why) => Err(why.to_string().into()),
        Ok(insert_row_count) => Ok(insert_row_count)
    }
}

pub fn delete_channel(conn: &Arc<Mutex<SqliteConnection>>, channel_uri: &String) -> Result<usize, String> {
    use crate::schema::channel;

    // エピソード削除
    delete_episodes(conn, &channel_uri)?;

    let mut conn = conn.lock().unwrap();
    let delete_result = diesel::delete(channel::table.filter(channel::uri.eq(channel_uri)))
        .execute(&mut *conn);

    match delete_result {
        Err(why) => Err(why.to_string().into()),
        Ok(delete_row_count) => Ok(delete_row_count)
    }

}

use crate::model::Episode;

pub fn get_episodes(conn: &Arc<Mutex<SqliteConnection>>, channel_uri : String) -> Result<Vec<Episode>, String> {
    let mut conn = conn.lock().unwrap();
    use crate::schema::channel;
    use crate::schema::episode;

    let get_episode_result = episode::dsl::episode
        .inner_join(channel::dsl::channel)
        .select((
            episode::id,
            channel::name,
            episode::title,
            episode::uri,
            episode::current_time,
            episode::is_finish,
            episode::cache_uri,
            episode::publish_date,
            ))
        .filter(episode::channel_uri.eq(channel_uri))
        .load::<Episode>(&mut *conn);

    match get_episode_result {
        Err(why) => Err(why.to_string().into()),
        Ok(episodes) => Ok(episodes)
    }
}

use crate::model::NewEpisode;

pub fn insert_episodes(conn: &Arc<Mutex<SqliteConnection>>, episodes: Vec<NewEpisode>) -> Result<usize, String> {
    let mut conn = conn.lock().unwrap();
    use crate::schema::episode;

    let insert_result = diesel::insert_or_ignore_into(episode::table)
        .values(episodes)
        .execute(&mut *conn);

    match insert_result {
        Err(why) => Err(why.to_string().into()),
        Ok(insert_row_count) => Ok(insert_row_count)
    }
}

pub fn delete_episodes(conn: &Arc<Mutex<SqliteConnection>>, channel_uri: &String) -> Result<usize, String> {
    use crate::schema::episode;

    // キャッシュファイル削除のためにエピソードを取得しておく
    let episodes = get_episodes(conn, (&channel_uri).to_string())?;

    let mut conn = conn.lock().unwrap();
    let delete_result = diesel::delete(episode::table.filter(episode::channel_uri.eq(channel_uri)))
        .execute(&mut *conn);

    match delete_result {
        Err(why) => Err(why.to_string().into()),
        Ok(delete_row_count) => {
            // キャッシュファイルの削除
            episodes.iter()
                .filter(|e| e.cache_uri != None)
                .for_each(|e| 
                    remove_file(Path::new(&e.cache_uri.clone().unwrap())).unwrap()
                );

            Ok(delete_row_count)
        }
    }
}

use crate::model::UpdateEpisode;

pub fn update_episode(conn: &Arc<Mutex<SqliteConnection>>, update_episode: UpdateEpisode) -> Result<usize, String> {
    let mut conn = conn.lock().unwrap();
    use crate::schema::episode;

    let update_result = diesel::update(episode::table.filter(episode::id.eq(update_episode.id)))
        .set(update_episode)
        .execute(&mut *conn);

    match update_result {
        Err(why) => Err(why.to_string().into()),
        Ok(update_row_count) => Ok(update_row_count)
    }
}

pub fn update_episode_add_cache_uri(conn: &Arc<Mutex<SqliteConnection>>, update_episode: UpdateEpisodeAddCacheUrl) -> Result<usize, String> {
    let mut conn = conn.lock().unwrap();
    use crate::schema::episode;

    let update_result = diesel::update(episode::table.filter(episode::id.eq(update_episode.id)))
        .set(update_episode)
        .execute(&mut *conn);

    match update_result {
        Err(why) => Err(why.to_string().into()),
        Ok(update_row_count) => Ok(update_row_count)
    }
}

