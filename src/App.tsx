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
  channelName: string,
  uri: string,
  title: string,
  currentTime: number,
  isFinish: boolean
};


function App() {
  const [channels, setChannels] = useState([] as Array<Channel>);
  const [episodes, setEpisodes] = useState([] as Array<Episode>);
  const [playEpisodeUri, setPlayEpisodeUri] = useState("");

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

  async function setEpisodeToPlayer(episodeUri : string) {
    const audioFileUrl = convertFileSrc(episodeUri, 'stream');

    setPlayEpisodeUri(audioFileUrl);
  }

  return (
    <div className="App">
      <VirturlChannelRegister onRegisterChannel={updateChannelList}/>
      <ChannelList
        channels={channels}
        onClick={(channel_index: number) => {getEpisodesFromChannelIndex(channel_index)}}
      />
      <Player episode_uri={playEpisodeUri} />
      <EpisodeList
        episodes={episodes}
        onEpisodeClick={setEpisodeToPlayer}
      />
    </div>
  );
}

export default App;
