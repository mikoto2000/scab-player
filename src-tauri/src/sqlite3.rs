use std::env;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

const DB_NAME: &str = "scab-player.db";

pub fn establish_connection(default_database_url: String) -> SqliteConnection {
    let database_url = env::var("DATABASE_URL").unwrap_or(default_database_url);
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}
