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
