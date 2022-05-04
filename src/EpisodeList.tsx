import React, { useState, useEffect } from 'react';

type EpisodeListProps = {
  episodes: Array<Episode>,
  onEpisodeClick : (episodeIndex : number, episodeUri : string, current_time : number) => void
};

type Episode = {
  id: number,
  channel_name: string,
  uri: string,
  title: string,
  current_time: number,
  is_finish: boolean
};

function getEpisodeIcon(episode : Episode) {
  if (episode.current_time == null) {
    return "🆕";
  }

  return episode.is_finish ? '☑': '☐';
}

function EpisodeList(props : EpisodeListProps) {

  const episodeList = props.episodes.map((episode, episode_index) => {
    return <li onClick={() => { props.onEpisodeClick(episode_index, episode.uri, episode.current_time) }}
        key={episode.uri}
        >
        {JSON.stringify(episode)}<br/>
          {getEpisodeIcon(episode)} : { episode.title}
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

export default EpisodeList;


