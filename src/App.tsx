import React, { useState, useEffect } from 'react';
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
  is_finish: boolean
};

type UpdateEpisode = {
  id: number,
  current_time: number,
  is_finish: boolean
};


function App() {
  const [channels, setChannels] = useState([] as Array<Channel>);
  const [episodes, setEpisodes] = useState([] as Array<Episode>);
  const [playEpisodeIndex, setPlayEpisodeIndex] = useState(-1);
  const [playEpisodeUri, setPlayEpisodeUri] = useState("");
  const [playEpisodeCurrentTime, setPlayEpisodeCurrentTime] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  let playerCurrentTime = 0;

  useEffect(() => {
    updateChannelList();
  }, [episodes]);

  async function updatePlayEpisodeCurrentTime(currentTime : number) {
    playerCurrentTime = currentTime;
  }

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

  async function handleEnded(episodeIndex : number) {
    episodes[episodeIndex].is_finish = true;
    updateEpisode({
        id: episodes[episodeIndex].id,
        current_time: 0,
        is_finish: true,
      });
    playNextEpisode(episodeIndex);
  }

  async function updateEpisode(episode : UpdateEpisode) {
    invoke('update_episode', { episode: episode })
        .then((e) => { console.log(e)})
        .catch((err) => { console.log(err)});
  }

  async function handlePause(episodeIndex: number) {
    updateEpisode({
        id: episodes[episodeIndex].id,
        current_time: Math.floor(playerCurrentTime),
        is_finish: false
      });
  }

  async function handleEpisodeClick(episodeIndex: number, episodeUri : string, current_time : number) {

    // 初回選択時など、 oldEpisode が無ければ oldEpisode の更新をしない
    if (playEpisodeIndex >= 0) {
      const oldEpisode = episodes[playEpisodeIndex];
      const currentEpisode = episodes[episodeIndex];

      // 同じエピソードがクリックされている場合、何もしない
      if (oldEpisode.id == currentEpisode.id) {
          return;
      }

      // oldEpisode の情報更新
      updateEpisode({
          id: oldEpisode.id,
          current_time: Math.floor(playerCurrentTime),
          is_finish: oldEpisode.is_finish
        });
    }

    // 選択したエピソードをプレイヤーで再生
    setEpisodeToPlayer(episodeIndex, episodeUri, current_time);
  }

  async function playNextEpisode(episodeIndex : number) {

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
        onEnded={handleEnded}
        onPause={handlePause}
        onUpdateCurrentTime={updatePlayEpisodeCurrentTime}
      />
      <EpisodeList
        episodes={episodes}
        onEpisodeClick={handleEpisodeClick}
      />
    </div>
  );
}

export default App;
