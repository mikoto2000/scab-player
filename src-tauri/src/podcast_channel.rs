use crate::channel_manager::*;
use crate::model::Feed;
use crate::model::NewEpisode;

pub fn add_podcast_channel(feed: Feed) -> Result<Vec<NewEpisode>, String> {

    insert_channel(
        feed.url.clone(),
        feed.title.clone(),
    )?;

    let new_episodes = find_new_episodes(&feed);

    insert_episodes(new_episodes.clone())?;

    Ok(new_episodes)
}


pub fn find_new_episodes(feed: &Feed) -> Vec<NewEpisode> {

    feed.entries.iter().map(|e|
        NewEpisode {
            channel_uri: feed.url.clone(),
            title: e.title.clone(),
            uri: e.media_url[0][0].clone(),
            cache_uri: e.media_url[0][0].clone(),
        }
    ).collect()
}

