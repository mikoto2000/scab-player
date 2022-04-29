use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Queryable, Debug)]
pub struct Channel {
    pub id: i32,
    pub uri: String,
    pub name: String
}

