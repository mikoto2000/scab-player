import React, { useState, useEffect } from 'react';

type EpisodeListProps = {
  episodes: Array<Episode>,
  onEpisodeClick : (episodeUri : string) => void
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

  async function onEpisodeClick(episodeUri : string) {
    props.onEpisodeClick(episodeUri);
  }

  const episodeList = props.episodes.map((episode, episode_index) => {
    return <li onClick={() => {onEpisodeClick(episode.uri)}}
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


