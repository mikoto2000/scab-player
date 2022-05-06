import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from "react-router-dom";

import './App.css';

import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

import VirtualChannelRegister from './VirtualChannelRegister';
import ChannelList from './ChannelList';
import { Player, PlayerType } from './Player';
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
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const playerElement = useRef<PlayerType>(null!);

  useEffect(() => {
    updateChannelList();

    appWindow.listen('tauri://close-requested', async ({ event, payload }) => {

      // 再生中エピソードがあるときのみ再生情報の更新を行う
      const currentEpisode = episodes[playEpisodeIndex];
      if (currentEpisode != null) {
        await updateEpisode({
          id: currentEpisode.id,
          current_time: Math.floor(playerElement.current.getCurrentTime()),
          is_finish: currentEpisode.is_finish
        });
      }

      appWindow.close()
    });

  }, [episodes, playEpisodeIndex]);

  async function updateChannelList() {
      const channells : Array<Channel> = await invoke('get_channels', {});
      setChannels(channells);
  }

  async function getEpisodesFromChannelIndex(channel_index : number) {
    const channel = channels[channel_index];

    const episodes : Array<Episode> = await invoke('get_episodes', { channelUri: channel.uri });

    setEpisodes(episodes);
  }

  async function handleEnded(episodeIndex : number) {
    episodes[episodeIndex].current_time = 0;
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

  async function handleEpisodeClick(episodeIndex: number) {

    // 初回選択時など、 oldEpisode が無ければ oldEpisode の更新をしない
    if (playEpisodeIndex >= 0) {
      const oldEpisode = episodes[playEpisodeIndex];
      const currentEpisode = episodes[episodeIndex];

      oldEpisode.current_time = Math.floor(playerElement.current.getCurrentTime());

      // 同じエピソードがクリックされている場合、何もしない
      if (oldEpisode.id === currentEpisode.id) {
          return;
      }

      // oldEpisode の情報更新
      // audio 要素から currentTime を引っ張ってきて、「ここまで再生したよ」を記録する。
      updateEpisode({
          id: oldEpisode.id,
          current_time: Math.floor(playerElement.current.getCurrentTime()),
          is_finish: oldEpisode.is_finish
        });
    }

    // 選択したエピソードをプレイヤーで再生
    setPlayEpisodeIndex(episodeIndex);
  }

  async function playNextEpisode(episodeIndex : number) {

      const nextEpisodeIndex = episodeIndex + 1;
      const nextEpisode = episodes[nextEpisodeIndex];

      if (nextEpisode != null) {
        // 継続再生の場合は、戦闘から再生する
        nextEpisode.current_time = 0;
        setPlayEpisodeIndex(nextEpisodeIndex);
      } else {
        setIsAutoPlay(false);
      }
  }


  return (
    <div className="App">
      <div>
        <Link to="virtual_channel_register">仮想チャンネル登録</Link>
        &nbsp; - &nbsp;
        <Link to="/">エピソード再生</Link>
      </div>
      <Routes>
        <Route path="/virtual_channel_register" element={
          <React.Fragment>
            <VirtualChannelRegister onRegisterChannel={updateChannelList}/>
          </React.Fragment>
        } />
        <Route path="/" element={
          <React.Fragment>
            <ChannelList
              channels={channels}
              onClick={(channel_index: number) => {getEpisodesFromChannelIndex(channel_index)}}
            />
            <Player
              isAutoPlay={isAutoPlay}
              episodeIndex={playEpisodeIndex}
              episode={episodes[playEpisodeIndex] || null}
              onEnded={handleEnded}
              ref={playerElement}
            />
            <EpisodeList
              episodes={episodes}
              onEpisodeClick={handleEpisodeClick}
            />
          </React.Fragment>
        } />
      </Routes>
    </div>
  );
}

export default App;
