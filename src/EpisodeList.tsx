import React, { useState, useEffect } from 'react';

type EpisodeListProps = {
  episodes: Array<Episode>,
};

type Episode = {
  id: number,
  channelName: string,
  uri: string,
  title: string,
  currentTime: number,
  isFinish: boolean
};

function EpisodeList(props : EpisodeListProps) {

  const episodeList = props.episodes.map((episode, episode_index) => {
    return <li
        key={episode.uri}
        >
        {JSON.stringify(episode)}</li>
  });

  return (
    <div className="EpisodeList">
      <h1>エピソード一覧</h1>
      <ul>
        {episodeList}
      </ul>
    </div>
  );
}

export default EpisodeList;


