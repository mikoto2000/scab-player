use serde::Deserialize;
use serde::Serialize;

use crate::schema::channel;

#[derive(Serialize, Deserialize, Queryable, Debug)]
pub struct Channel {
    pub uri: String,
    pub name: String
}

#[derive(Insertable)]
#[diesel(table_name = channel)]
pub struct NewChannel<'a> {
    pub uri: &'a str,
    pub name: &'a str
}

use crate::schema::episode;

#[derive(Serialize, Deserialize, Queryable, Debug)]
pub struct Episode {
    pub id: i32,
    pub channel_name: String,
    pub title: String,
    pub uri: String,
    pub current_time: Option<i32>,
    pub is_finish: bool,
    pub cache_uri: Option<String>,
}

#[derive(AsChangeset, Serialize, Deserialize, Debug)]
#[diesel(table_name = episode)]
pub struct UpdateEpisode {
    pub id: i32,
    pub current_time: Option<i32>,
    pub is_finish: bool
}

#[derive(Serialize, Deserialize, Insertable, Debug, Clone)]
#[diesel(table_name = episode)]
pub struct NewEpisode {
    pub channel_uri: String,
    pub title: String,
    pub uri: String,
    pub cache_uri: Option<String>
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Entry {
    pub id: String,
    pub title: String,
    pub media_url: Vec<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Feed {
    pub title: String,
    pub authors: Vec<String>,
    pub description: String,
    pub url: String,
    pub entries: Vec<Entry>,
}

#[derive(AsChangeset, Serialize, Deserialize, Debug)]
#[diesel(table_name = episode)]
pub struct UpdateEpisodeAddCacheUrl {
    pub id: i32,
    pub cache_uri: String
}

