import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

import { convertFileSrc } from '@tauri-apps/api/tauri'

type PlayerProps = {
  isAutoPlay: boolean,
  episodeIndex: number,
  episode: Episode,
  onEnded: (episodeIndex : number) => void,
};

export type PlayerType = {
  getCurrentTime: () => number
}

type Episode = {
  id: number,
  channel_name: string,
  uri: string,
  title: string,
  current_time: number,
  is_finish: boolean
};

export const Player = forwardRef((props : PlayerProps, ref : any) => {
  const audioElement = useRef<HTMLAudioElement>(null!);

  useEffect(() => {
    audioElement.current.currentTime = props.episode ? props.episode.current_time : 0;
  });

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      return audioElement.current.currentTime;
    }
  }));

  return (
    <div className="Player">
      <h1>Player</h1>
      <h2>{ props.episode ? props.episode.title : ""}</h2>
      <audio
        autoPlay={props.isAutoPlay}
        controls src={props.episode ? convertFileSrc(props.episode.uri, 'stream') : ""}
        onEnded={(e) => { props.onEnded(props.episodeIndex) }}
        ref={audioElement}
      />
    </div>
  );
});

export default Player;

