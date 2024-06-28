import React from 'react';

import './EpisodeList.css'
import { Episode } from './CommonAppTypes'

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

function getEpisodeDownloadArea(episode : Episode) {
  // 仮想チャンネル(ローカルファイル)なのでダウンロードの必要はない
  if (!episode.uri.startsWith("http")) {
    return <></>;
  }

  return episode.cache_uri
  ?
    <button className="dowlnlad">再ダウンロード</button>
  :
    <button className="dowlnlad">ダウンロード</button>
  ;
}

export function EpisodeList(props : EpisodeListProps) {

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

