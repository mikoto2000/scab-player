import React, { useState, useEffect } from 'react';

type PlayerProps = {
  isAutoPlay: boolean,
  episodeIndex: number,
  episodeUri: string,
  currentTime: number,
  onEnded: (episodeIndex : number) => void,
  onPause: (currentTime : number) => void,
  onUpdateCurrentTime: (currentTime : number) => void
};

function Player(props : PlayerProps) {

  return (
    <div className="Player">
      <h1>Player</h1>
      <audio
        autoPlay={props.isAutoPlay}
        controls src={props.episodeUri}
        onEnded={(e) => { props.onEnded(props.episodeIndex) }}
        onPause={(e) => { props.onPause(props.episodeIndex) }}
        onTimeUpdate={(e) => {
          if (e.currentTarget != null) {
            if (e.currentTarget instanceof HTMLMediaElement) {
              props.onUpdateCurrentTime(e.currentTarget.currentTime);
            }
          }
        }}
        ref={ (e : HTMLAudioElement) => { if (e != null) {
          e.currentTime=props.currentTime;
        }}}
      />
    </div>
  );
}

export default Player;



