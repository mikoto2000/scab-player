use diesel::prelude::*;

use crate::model::Channel;

pub fn get_channels() -> Vec<Channel> {
    use crate::schema::channel::dsl::channel;
    use crate::sqlite3::establish_connection;

    let conn = establish_connection();
    channel.load::<Channel>(&conn).expect("Error loading posts")
}

#[cfg(test)]
mod main_tests {
    use std::process::Command;
    use crate::channel_manager::get_channels;

    const LATEST_MIGRATION_DIR: &str = "./migrations/2022-04-29-021610_create_scab-player/";

    fn before() {
        clear_db();
        run_sql_from_file("./test/channel_manager/before.sql", "./assets/scab-player.db");
    }

    fn after() {
        clear_db();
    }

    #[test]
    fn test_get_channels() {
        before();

        let channels = get_channels();

        let first_channel = channels.first().unwrap();

        assert_eq!(first_channel.id, 0);
        assert_eq!(first_channel.uri, "uri");
        assert_eq!(first_channel.name, "name");

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
