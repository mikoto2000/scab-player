import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

import { convertFileSrc } from '@tauri-apps/api/tauri'

import './Player.css';
import { Episode } from './CommonAppTypes'

type PlayerProps = {
  isAutoPlay: boolean,
  episodeIndex: number,
  episode: Episode,
  onEnded: (episodeIndex : number) => void,
};

export type PlayerType = {
  getCurrentTime: () => number,
  play: () => void,
  pause: () => void
}

export const Player = forwardRef((props : PlayerProps, ref : any) => {
  const audioElement = useRef<HTMLAudioElement>(null!);

  useEffect(() => {
    audioElement.current.currentTime = props.episode ? props.episode.current_time : 0;
  });

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      return audioElement.current.currentTime;
    },
    play: () => {
      audioElement.current.play();
    },
    pause: () => {
      audioElement.current.pause();
    }
  }));

  return (
    <div className="Player">
      <figure>
        <figcaption>{ props.episode ? props.episode.title : ""}</figcaption>
        <audio
          autoPlay={props.isAutoPlay}
          controls src={
            props.episode
            ?
              props.episode.uri.startsWith("http")
              ?
                props.episode.uri
              :
                convertFileSrc(props.episode.uri, 'stream')
            :
              ""}
          onEnded={(e) => { props.onEnded(props.episodeIndex) }}
          ref={audioElement}
        />
      </figure>
    </div>
  );
});

export default Player;

