import React, { useState, useEffect } from 'react';

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

export function EpisodeList(props : EpisodeListProps) {

  const episodeList = props.episodes.map((episode, episode_index) => {

    return <li onClick={() => { props.onEpisodeClick(episode_index) }}
        key={episode.uri}
        >
          {getEpisodeIcon(episode)} : {episode.title}
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

