use tauri;
use tauri::AppHandle;

use feed_rs::model::Text;
use tauri::State;

use crate::channel_manager;
use crate::model::Channel;
use crate::model::Entry;
use crate::model::Episode;
use crate::model::Feed;
use crate::model::NewEpisode;
use crate::model::UpdateEpisode;
use crate::podcast_cacher;
use crate::podcast_channel;
use crate::virtual_channel;
use crate::AppState;

#[tauri::command]
pub fn get_channels(state: State<'_, AppState>) -> Result<Vec<Channel>, String> {
    //    println!("get_channels");
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    channel_manager::get_channels(&mut conn)
}

#[tauri::command]
pub fn get_episodes(
    state: State<'_, AppState>,
    channel_uri: String,
) -> Result<Vec<Episode>, String> {
    //    println!("get_episodes");
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    channel_manager::get_episodes(&mut conn, channel_uri)
}

#[tauri::command]
pub fn find_new_episodes(new_channel: String) -> Vec<NewEpisode> {
    //    println!("find_new_episodes");
    virtual_channel::find_new_episodes(new_channel)
}

#[tauri::command]
pub fn add_virtual_channel(
    state: State<'_, AppState>,
    new_channel: String,
) -> Result<Vec<NewEpisode>, String> {
    //    println!("add_virtual_channel");
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    virtual_channel::add_virtual_channel(&mut conn, new_channel)
}

#[tauri::command]
pub fn update_episode(state: State<'_, AppState>, episode: UpdateEpisode) -> Result<usize, String> {
    //    println!("update_episode : {:?}", episode);
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    channel_manager::update_episode(&mut conn, episode)
}

#[tauri::command]
pub fn delete_channel(state: State<'_, AppState>, channel_uri: String) -> Result<usize, String> {
    //    println!("delete_channel : {:?}", channel_uri);
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    channel_manager::delete_channel(&mut conn, &channel_uri)
}

#[tauri::command]
pub fn read_rss_info(channel_uri: String) -> Result<Feed, String> {
    //println!("read_rss_info");

    // RSS 取得
    use reqwest::blocking::get;
    let response = get(channel_uri.clone()).unwrap();

    // RSS パース
    use feed_rs::parser;
    let feed = parser::parse(response.text().unwrap().as_bytes()).unwrap();

    Ok(Feed {
        title: feed
            .title
            .unwrap_or_else(|| Text {
                content_type: "text/plain; charset=utf-8;".parse().unwrap(),
                src: None,
                content: "".to_string(),
            })
            .content,
        authors: feed.authors.iter().map(|e| e.name.clone()).collect(),
        description: feed
            .description
            .unwrap_or_else(|| Text {
                content_type: "text/plain; charset=utf-8;".parse().unwrap(),
                src: None,
                content: "".to_string(),
            })
            .content,
        url: channel_uri.clone(),
        entries: feed
            .entries
            .iter()
            .map(|e| Entry {
                id: e.id.clone(),
                title: e
                    .title
                    .clone()
                    .unwrap_or_else(|| Text {
                        content_type: "text/plain; charset=utf-8;".parse().unwrap(),
                        src: None,
                        content: "".to_string(),
                    })
                    .content,
                media_url: e
                    .media
                    .iter()
                    .map(|m| {
                        m.content
                            .iter()
                            .map(|c| c.url.clone().unwrap().to_string())
                            .collect()
                    })
                    .collect(),
                publish_date: Some(e.published.unwrap().to_string()),
            })
            .collect(),
    })
}

#[tauri::command]
pub fn add_podcast(state: State<'_, AppState>, feed: Feed) -> Vec<NewEpisode> {
    //println!("add_podcast");
    let state = state.clone();
    let conn = state.conn.clone();
    let mut conn = conn.lock().unwrap();
    podcast_channel::add_podcast_channel(&mut conn, feed).unwrap()
}

// ファイルをダウンロードし、キャッシュディレクトリへ保存する:w
// 戻り値はキャッシュしたファイルのファイルパス
#[tauri::command]
pub async fn download_podcast_episode(
    app_handle: AppHandle,
    episode: Episode,
) -> Result<String, String> {
    //println!("download_podcast_episode");
    podcast_cacher::download_and_cache_podcast_episode(app_handle, episode).await
}
