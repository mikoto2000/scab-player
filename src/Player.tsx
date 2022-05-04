import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

type PlayerProps = {
  isAutoPlay: boolean,
  episodeIndex: number,
  episodeUri: string,
  currentTime: number,
  onEnded: (episodeIndex : number) => void,
};

export type PlayerType = {
  getCurrentTime: () => number
}


export const Player = forwardRef((props : PlayerProps, ref : any) => {
  const audioElement = useRef<HTMLAudioElement>(null!);

  useEffect(() => {
    audioElement.current.currentTime = props.currentTime;
  });

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      return audioElement.current.currentTime;
    }
  }));

  return (
    <div className="Player">
      <h1>Player</h1>
      <audio
        autoPlay={props.isAutoPlay}
        controls src={props.episodeUri}
        onEnded={(e) => { props.onEnded(props.episodeIndex) }}
        ref={audioElement}
      />
    </div>
  );
});

export default Player;

