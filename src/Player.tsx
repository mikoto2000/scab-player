import React, { useState, useEffect } from 'react';

type PlayerProps = {
  episode_uri: string
};

function Player(props : PlayerProps) {

  return (
    <div className="Player">
      <h1>プレイヤー</h1>
      <audio controls src={props.episode_uri} />
    </div>
  );
}

export default Player;



