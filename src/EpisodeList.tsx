import React from 'react';

import './EpisodeList.css'
import { Episode } from './CommonAppTypes'
import { EpisodeListItem } from './EpisodeListItem'

type EpisodeListProps = {
  episodes: Array<Episode>,
  onEpisodeClick : (episodeIndex : number) => void
};

export function EpisodeList(props : EpisodeListProps) {

  return (
    <div className="EpisodeList">
      <h1>Episode list:</h1>
      <ul>
        {props.episodes.map((e, episodeIndex) => {
          return (<li onClick={() => { props.onEpisodeClick(episodeIndex) }}
              key={e.uri}
              >
            <EpisodeListItem
              episodeIndex={episodeIndex}
              episode={e}
              onEpisodeClick={props.onEpisodeClick}/>
          </li>);
        })}
      </ul>
    </div>
  );
}

