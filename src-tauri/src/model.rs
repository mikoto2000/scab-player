use serde::Deserialize;
use serde::Serialize;

use crate::schema::channel;

#[derive(Serialize, Deserialize, Queryable, Debug)]
pub struct Channel {
    pub id: i32,
    pub uri: String,
    pub name: String
}

#[derive(Insertable)]
#[table_name = "channel"]
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
    pub is_finish: bool
}

#[derive(Insertable, Debug, Clone)]
#[table_name = "episode"]
pub struct NewEpisode {
    pub channel_id: i32,
    pub title: String,
    pub uri: String
}
