import React, { useState, useEffect } from 'react';

type PlayerProps = {
  episodeUri: string,
  currentTime: number
};

function Player(props : PlayerProps) {

  return (
    <div className="Player">
      <h1>プレイヤー</h1>
      <audio controls src={props.episodeUri}
        ref={ (e : HTMLAudioElement) => { if (e != null) { e.currentTime=props.currentTime }}}
      />
    </div>
  );
}

export default Player;



