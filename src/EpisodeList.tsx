import React from 'react';

import './EpisodeList.css'
import { Episode } from './CommonAppTypes'
import { useTauriService } from './service/TauriService'

type EpisodeListProps = {
  episodes: Array<Episode>,
  onEpisodeClick : (episodeIndex : number) => void
};

function getEpisodeIcon(episode : Episode) {

  if (episode.current_time == null) {
    return "🆕";
  }

  return episode.is_finish ? '☑': '☐';
}

export function EpisodeList(props : EpisodeListProps) {

  const service = useTauriService();

  function download(event: React.MouseEvent<HTMLButtonElement>, episode : Episode) {
    console.log("download!");
    event.stopPropagation();
    (async() => {
      service.downloadPodcastEpisode(episode);
    })();
  }

  function getEpisodeDownloadArea(episode : Episode) {

    // 仮想チャンネル(ローカルファイル)なのでダウンロードの必要はない
    if (!episode.uri.startsWith("http")) {
      return <></>;
    }

    const label = episode.cache_uri
    ?
    "再ダウンロード"
    :
    "ダウンロード";

    return <button className="dowlnlad" onClick={(event) => download(event, episode)}>{label}</button>;
  }

  const episodeList = props.episodes.map((episode, episode_index) => {

    return <li onClick={() => { props.onEpisodeClick(episode_index) }}
        key={episode.uri}
        >
          <div><div className="episode">{getEpisodeIcon(episode)} : {episode.title}</div> {getEpisodeDownloadArea(episode)}</div>
        </li>

  });

  return (
    <div className="EpisodeList">
      <h1>Episode list:</h1>
      <ul>
        {episodeList}
      </ul>
    </div>
  );
}

