import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import { invoke, convertFileSrc } from '@tauri-apps/api/tauri'

import VirturlChannelRegister from './VirturlChannelRegister';
import ChannelList from './ChannelList';
import Player from './Player';
import EpisodeList from './EpisodeList';

type Channel = {
  uri: string,
  name: string
};

type Episode = {
  id: number,
  channel_name: string,
  uri: string,
  title: string,
  current_time: number,
  isFinish: boolean
};


function App() {
  const [channels, setChannels] = useState([] as Array<Channel>);
  const [episodes, setEpisodes] = useState([] as Array<Episode>);
  const [playEpisodeIndex, setPlayEpisodeIndex] = useState(0);
  const [playEpisodeUri, setPlayEpisodeUri] = useState("");
  const [playEpisodeCurrentTime, setPlayEpisodeCurrentTime] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    updateChannelList();
  }, [episodes]);

  async function updateChannelList() {
      const channells : Array<Channel> = await invoke('get_channels', {});
      setChannels(channells);
  }

  async function getEpisodesFromChannelIndex(channel_index : number) {
    const channel = channels[channel_index];

    const episodes : Array<Episode> = await invoke('get_episodes', { channelUri: channel.uri });

    setEpisodes(episodes);
  }

  async function setEpisodeToPlayer(episodeIndex: number, episodeUri : string, current_time : number) {
    const audioFileUrl = convertFileSrc(episodeUri, 'stream');

    setPlayEpisodeIndex(episodeIndex);
    setPlayEpisodeUri(audioFileUrl);
    setPlayEpisodeCurrentTime(current_time);
  }

  async function playNextEpisode(episodeIndex : number) {
      console.log(episodeIndex);

      const nextEpisodeIndex = episodeIndex + 1;
      const nextEpisode = episodes[nextEpisodeIndex];

      if (nextEpisode != null) {
        setEpisodeToPlayer(nextEpisodeIndex, nextEpisode.uri, 0);
      } else {
        setIsAutoPlay(false);
      }
  }


  return (
    <div className="App">
      <VirturlChannelRegister onRegisterChannel={updateChannelList}/>
      <ChannelList
        channels={channels}
        onClick={(channel_index: number) => {getEpisodesFromChannelIndex(channel_index)}}
      />
      <Player
        isAutoPlay={isAutoPlay}
        episodeIndex={playEpisodeIndex}
        episodeUri={playEpisodeUri}
        currentTime={playEpisodeCurrentTime}
        onEnded={playNextEpisode}
      />
      <EpisodeList
        episodes={episodes}
        onEpisodeClick={setEpisodeToPlayer}
      />
    </div>
  );
}

export default App;
