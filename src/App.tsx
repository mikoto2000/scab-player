import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Link as MuiLink, useMediaQuery } from '@mui/material';

import './App.css';

import { Channel, DisplayMode, Episode, UpdateEpisode } from './CommonAppTypes'
import { useTauriService } from './service/TauriService'

import VirtualChannelRegister from './VirtualChannelRegister';
import PodcastChannelRegister from './PodcastChannelRegister';
import { ChannelList } from './ChannelList';
import { Player, PlayerType } from './Player';
import { EpisodeList } from './EpisodeList';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Setting } from './Setting';


function App() {

  const [displayMode, setDisplayMode] = useState<DisplayMode>("system");

  const [channels, setChannels] = useState([] as Array<Channel>);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [episodes, setEpisodes] = useState([] as Array<Episode>);
  const [playEpisodeId, setPlayEpisodeId] = useState(-1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const playerElement = useRef<PlayerType>(null!);
  const navigate = useNavigate();

  const service = useTauriService();

  const savedDisplayMode = localStorage.getItem("displayMode") as DisplayMode;
  const systemDisplayModeIsDark = useMediaQuery('(prefers-color-scheme: dark)');
  const systemDisplayMode = (systemDisplayModeIsDark ? "dark" : "light");

  useEffect(() => {
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }

    updateChannelList();

    service.onClose(async () => {
      // 再生中エピソードがあるときのみ再生情報の更新を行う
      const currentEpisode = episodes.find((e) => e.id === playEpisodeId)
      if (currentEpisode != null) {
        await updateEpisode({
          id: currentEpisode.id,
          current_time: Math.floor(playerElement.current.getCurrentTime()),
          is_finish: currentEpisode.is_finish
        });
      }
    });
    // 初回のみ実行してほしいので、依存はなし
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateErrorMessage(message: string) {
    const errorArea = document.getElementById("error-area");
    if (errorArea) {
      errorArea.textContent = message;
    }
  }

  async function updateChannelList() {
    service.getChannels()
      .then((channels) => setChannels(channels as Array<Channel>))
      .catch((err) => updateErrorMessage(`⚠️ get channel list error: ${err}`));
  }

  async function handleNavClick(episodeId: number) {
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) {
      return;
    }

    updateEpisode({
      id: episode.id,
      current_time: Math.floor(playerElement.current.getCurrentTime()),
      is_finish: episode.is_finish,
    });
  }

  async function handleChannelClick(channel_index: number) {
    const channel = channels[channel_index];

    // 選択中チャンネルと同じだった場合、再生を続ける
    if (channels[selectedChannel].uri !== channels[channel_index].uri) {
      setSelectedChannel(channel_index);
      setPlayEpisodeId(-1);
      setIsAutoPlay(false);
    }

    navigate(`/episodes`);
  }

  async function handleChannelDeleteClick(channel_index: number, event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();

    const channel = channels[channel_index];

    service.deleteChannel(channel.uri)
      .then((_) => {
        const newChannels = channels.slice();
        newChannels.splice(channel_index, 1);
        setChannels(newChannels);
      })
      .catch((err) => updateErrorMessage(`⚠️ delete channel list error: ${err}`));

  }

  async function handleEnded(episodeId: number) {
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) {
      return
    }

    episode.current_time = 0;
    episode.is_finish = true;
    await updateEpisode({
      id: episode.id,
      current_time: 0,
      is_finish: true,
    })
      .then((_) => playNextEpisode(episodeId))
      .catch((err) => updateErrorMessage(`⚠️ update episode error: ${err}`));
  }

  async function updateEpisode(episode: UpdateEpisode) {
    return service.updateEpisode(episode);
  }

  async function handleEpisodeClick(episodeId: number) {
    // エピソードの新規マークをはがす
    const currentEpisode = episodes.find((e) => e.id === episodeId);
    if (!currentEpisode) {
      return
    }

    if (!currentEpisode.current_time) {
      currentEpisode.current_time = 0;
    }

    // 初回選択時など、 oldEpisode が無ければ oldEpisode の更新をしない
    if (playEpisodeId >= 0) {
      const oldEpisode = episodes.find((e) => e.id === playEpisodeId);

      if (oldEpisode) {

        oldEpisode.current_time = Math.floor(playerElement.current.getCurrentTime());

        // 同じエピソードがクリックされている場合、再生状態にする
        if (oldEpisode.id === currentEpisode.id) {
          playerElement.current.play();
          return;
        }

        // oldEpisode の情報更新
        // audio 要素から currentTime を引っ張ってきて、「ここまで再生したよ」を記録する。
        await updateEpisode({
          id: oldEpisode.id,
          current_time: Math.floor(playerElement.current.getCurrentTime()),
          is_finish: oldEpisode.is_finish
        });
      }
    }

    // 選択したエピソードをプレイヤーで再生
    setPlayEpisodeId(episodeId);
    setIsAutoPlay(true);
  }

  async function playNextEpisode(episodeId: number) {

    const currentEpisodeIndex = episodes.findIndex((e) => e.id === episodeId);
    const nextEpisodeIndex = currentEpisodeIndex + 1;
    const nextEpisode = episodes[nextEpisodeIndex];

    if (nextEpisode != null) {
      // 継続再生の場合は、先頭から再生する
      nextEpisode.current_time = 0;
      setPlayEpisodeId(nextEpisode.id);
    } else {
      setIsAutoPlay(false);
    }
  }


  return (
    <ThemeProvider theme={theme(displayMode === "system" ? systemDisplayMode : displayMode)} >
      <CssBaseline />
      <div className="App">
        <nav>
          <MuiLink
            component={Link}
            onClick={() => handleNavClick(playEpisodeId)}
            to="channel_register" >
            チャンネル登録
          </MuiLink>
          &nbsp; - &nbsp;
          <MuiLink
            component={Link}
            onClick={() => handleNavClick(playEpisodeId)}
            to="/" >
            チャンネル選択
          </MuiLink>
          {channels[selectedChannel]
            ?
            <>
              &nbsp; - &nbsp;
              <MuiLink
                component={Link}
                onClick={() => handleNavClick(playEpisodeId)}
                to={`/episodes`}>
                エピソード再生
              </MuiLink>
            </>
            :
            <></>
          }
          &nbsp; - &nbsp;
          <MuiLink
            component={Link}
            onClick={() => handleNavClick(playEpisodeId)}
            to="/setting" >
            設定
          </MuiLink>
        </nav>
        <Player
          isAutoPlay={isAutoPlay}
          episode={episodes.find((e) => e.id === playEpisodeId)}
          onEnded={handleEnded}
          ref={playerElement}
        />
        <div id="error-area">
        </div>
        <Routes>
          <Route path="/channel_register" element={
            <React.Fragment>
              <PodcastChannelRegister onRegisterChannel={updateChannelList} />
              <VirtualChannelRegister onRegisterChannel={updateChannelList} />
            </React.Fragment>
          } />
          <Route path="/" element={
            <React.Fragment>
              <ChannelList
                channels={channels}
                onChannelClick={(channel_index: number) => { handleChannelClick(channel_index) }}
                onChannelDeleteClick={(channel_index: number, event: React.MouseEvent<HTMLElement>) => { handleChannelDeleteClick(channel_index, event) }}
              />
            </React.Fragment>
          } />
          <Route path="/episodes" element={
            <React.Fragment>
              <EpisodeList
                service={service}
                channelUrl={channels[selectedChannel]?.uri}
                onEpisodeClick={handleEpisodeClick}
                onLoadEpisodes={(episodes: Array<Episode>) => setEpisodes(episodes)}
              />
            </React.Fragment>
          } />
          <Route path="/setting" element={
            <React.Fragment>
              <Setting
                initialDisplayMode={displayMode}
                onDisplayModeChange={(mode: DisplayMode) => {
                  localStorage.setItem("displayMode", mode);
                  setDisplayMode(mode);
                }}
              />
            </React.Fragment>
          } />
        </Routes>
      </div>
    </ThemeProvider >
  );
}

export default App;
