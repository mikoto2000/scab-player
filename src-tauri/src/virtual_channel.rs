use std::path::Path;

//use crate::channel_manager::*;
use crate::model::NewEpisode;

//fn add_virtual_channel(virtual_channel_path_str: String) -> Result<Vec<NewEpisode>, String> {
//    let virtual_channel_path = Path::new(&virtual_channel_path_str);
//    if virtual_channel_path.is_dir() {
//
//        insert_channel(
//            virtual_channel_path.to_str().unwrap().to_string(),
//            virtual_channel_path.file_stem().unwrap().to_str().unwrap().to_string()
//        ).expect("Channel insert error.");
//
//        let new_episodes = find_new_episodes(virtual_channel_path_str);
//
//        insert_episodes(new_episodes.clone())
//            .expect("Episode insert error.");
//
//        Ok(new_episodes)
//
//    } else {
//        Err(format!("{} is not directory.", virtual_channel_path_str))
//    }
//}

fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
    use walkdir::WalkDir;

    WalkDir::new(new_channel).into_iter()
        .filter_map(|e| {
            let unwraped_e = e.unwrap();
            let path = unwraped_e.path().canonicalize().unwrap();
            if path.is_file() && path.extension().unwrap() == "mp3" {
                let uri = path.to_str().unwrap().to_string();
                let title = path.file_stem().unwrap().to_str().unwrap().to_string();

                Some(NewEpisode {
                    channel_uri: "channel_uri".to_string(),
                    uri: uri,
                    title: title,
                })
            } else {
                None
            }
        }).collect::<Vec<_>>()

}

#[cfg(test)]
mod virtual_channel_tests {
    use crate::virtual_channel::*;

    #[test]
    fn test_get_channels() {
        let base_dir = "./test/virtual_channel/find_new_episodes/basic_testdata".to_string();
        let results = find_new_episodes(base_dir);

        let first_result = results.get(0).unwrap();
        let except_title_1 = "test_audio_01";
        let except_uri_1 = "./test/virtual_channel/find_new_episodes/basic_testdata/test_audio_01.mp3";
        assert_eq!(first_result.title, except_title_1);
        assert_eq!(
            first_result.uri,
            Path::new(except_uri_1).canonicalize().unwrap().to_str().unwrap().to_string()
        );

        let second_result = results.get(1).unwrap();
        let except_title_2 = "test_audio_02";
        let except_uri_2 = "./test/virtual_channel/find_new_episodes/basic_testdata/test_audio_02.mp3";
        assert_eq!(second_result.title, except_title_2);
        assert_eq!(
            second_result.uri,
            Path::new(except_uri_2).canonicalize().unwrap().to_str().unwrap().to_string()
        );
    }
}
