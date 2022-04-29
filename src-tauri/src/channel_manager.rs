use diesel::prelude::*;

use crate::model::Channel;

pub fn get_channels() -> Vec<Channel> {
    use crate::schema::channel::dsl::channel;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();
    channel.load::<Channel>(&conn).expect("Error loading posts")
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


#[cfg(test)]
mod main_tests {
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

        run_sql_from_file("./test/channel_manager/before.sql", "./assets/scab-player.db");

        let channels = get_channels();

        let first_channel = channels.first().unwrap();

        assert_eq!(first_channel.id, 0);
        assert_eq!(first_channel.uri, "uri");
        assert_eq!(first_channel.name, "name");

        after();
    }

    #[test]
    fn test_insert_channel() {
        before();

        let insert_count = insert_channel("insert_uri".to_string(), "insert_name".to_string());
        assert_eq!(insert_count.unwrap(), 1);

        let channels = get_channels();
        let first_channel = channels.first().unwrap();

        assert_eq!(first_channel.id, 1);
        assert_eq!(first_channel.uri, "insert_uri");
        assert_eq!(first_channel.name, "insert_name");

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
