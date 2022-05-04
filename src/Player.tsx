import React, { useState, useEffect } from 'react';

type PlayerProps = {
  isAutoPlay: boolean,
  episodeIndex: number,
  episodeUri: string,
  currentTime: number,
  onEnded: (episodeIndex : number) => void
};

function Player(props : PlayerProps) {

  return (
    <div className="Player">
      <h1>プレイヤー</h1>
      <audio autoPlay={props.isAutoPlay} controls src={props.episodeUri} onEnded={(e) => { props.onEnded(props.episodeIndex) }}
        ref={ (e : HTMLAudioElement) => { if (e != null) { e.currentTime=props.currentTime }}}
      />
    </div>
  );
}

export default Player;


