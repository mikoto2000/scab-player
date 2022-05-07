import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import './App.css';

import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

import { Channel, Episode } from './CommonAppTypes'

import VirtualChannelRegister from './VirtualChannelRegister';
import { ChannelList } from './ChannelList';
import { Player, PlayerType } from './Player';
import { EpisodeList } from './EpisodeList';

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
  const navigate = useNavigate();

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

  async function updateErrorMessage(message: string) {
    const errorArea = document.getElementById("error-area");
    if (errorArea) {
      errorArea.textContent = message;
    }
  }

  async function updateChannelList() {
      invoke('get_channels', {})
          .then((channels) => setChannels(channels as Array<Channel>))
          .catch((err) => updateErrorMessage(`⚠️ get channel list error: ${err}`));
  }

  async function handleNavClick(episodeIndex : number) {
    if (!episodes[episodeIndex]) {
      return;
    }

    episodes[episodeIndex].current_time = playerElement.current.getCurrentTime();
    updateEpisode({
        id: episodes[episodeIndex].id,
        current_time: Math.floor(playerElement.current.getCurrentTime()),
        is_finish: episodes[episodeIndex].is_finish,
      });
  }

  async function handleChannelClick(channel_index : number) {
    const channel = channels[channel_index];

    invoke('get_episodes', { channelUri: channel.uri })
        .then((episodes) => {
            setEpisodes(episodes as Array<Episode>);
            setPlayEpisodeIndex(-1);
            setIsAutoPlay(false);

            navigate("/episodes");
        })
        .catch((err) => updateErrorMessage(`⚠️ get episode list error: ${err}`));

  }

  async function handleChannelDeleteClick(channel_index : number, event : React.MouseEvent<HTMLElement>) {
    event.stopPropagation();

    const channel = channels[channel_index];

    invoke('delete_channel', { channelUri: channel.uri })
        .then((_) => {
          const newChannels = channels.slice();
          newChannels.splice(channel_index, 1);
          setChannels(newChannels);
        })
        .catch((err) => updateErrorMessage(`⚠️ delete channel list error: ${err}`));

  }

  async function handleEnded(episodeIndex : number) {
    episodes[episodeIndex].current_time = 0;
    episodes[episodeIndex].is_finish = true;
    updateEpisode({
        id: episodes[episodeIndex].id,
        current_time: 0,
        is_finish: true,
    })
      .then((_) => playNextEpisode(episodeIndex))
      .catch((err) => updateErrorMessage(`⚠️ update episode error: ${err}`));
  }

  async function updateEpisode(episode : UpdateEpisode) {
    return invoke('update_episode', { episode: episode });
  }

  async function handleEpisodeClick(episodeIndex: number) {

    // エピソードの新規マークをはがす
    const currentEpisode = episodes[episodeIndex];
    if (!currentEpisode.current_time) {
        currentEpisode.current_time = 0;
    }

    // 初回選択時など、 oldEpisode が無ければ oldEpisode の更新をしない
    if (playEpisodeIndex >= 0) {
      const oldEpisode = episodes[playEpisodeIndex];

      oldEpisode.current_time = Math.floor(playerElement.current.getCurrentTime());

      // 同じエピソードがクリックされている場合、再生状態にする
      if (oldEpisode.id === currentEpisode.id) {
          playerElement.current.play();
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
    setIsAutoPlay(true);
  }

  async function playNextEpisode(episodeIndex : number) {

      const nextEpisodeIndex = episodeIndex + 1;
      const nextEpisode = episodes[nextEpisodeIndex];

      if (nextEpisode != null) {
        // 継続再生の場合は、先頭から再生する
        nextEpisode.current_time = 0;
        setPlayEpisodeIndex(nextEpisodeIndex);
      } else {
        setIsAutoPlay(false);
      }
  }


  return (
    <div className="App">
      <nav>
        <Link onClick={() => handleNavClick(playEpisodeIndex) } to="virtual_channel_register" >仮想チャンネル登録</Link>
        &nbsp; - &nbsp;
        <Link onClick={() => handleNavClick(playEpisodeIndex) } to="/" >チャンネル選択</Link>
        &nbsp; - &nbsp;
        <Link onClick={() => handleNavClick(playEpisodeIndex) } to="/episodes">エピソード再生</Link>
      </nav>
      <Player
        isAutoPlay={isAutoPlay}
        episodeIndex={playEpisodeIndex}
        episode={episodes[playEpisodeIndex] || null}
        onEnded={handleEnded}
        ref={playerElement}
      />
      <div id="error-area">
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
              onChannelClick={(channel_index: number) => {handleChannelClick(channel_index)}}
              onChannelDeleteClick={(channel_index: number, event : React.MouseEvent<HTMLElement>) => {handleChannelDeleteClick(channel_index, event)}}
            />
          </React.Fragment>
        } />
        <Route path="/episodes" element={
          <React.Fragment>
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
