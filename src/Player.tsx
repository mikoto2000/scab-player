import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

import { convertFileSrc } from '@tauri-apps/api/tauri'

import './Player.css';
import { Episode } from './CommonAppTypes'

type PlayerProps = {
  isAutoPlay: boolean,
  episode?: Episode,
  onEnded: (episodeIndex: number) => void,
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
  }, [props.episode?.id]);

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

  function getPlayerSrc(episode?: Episode) {
    // そもそもエピソードが無ければ空
    if (!episode) {
      return "";
    }

    // キャッシュ URI の有無確認
    if (episode.cache_uri) {
      // キャッシュ URI があれば、そちらを再生に使う
      if (episode.cache_uri.startsWith("http")) {
        return episode.cache_uri
      } else {
        return convertFileSrc(props.episode?.cache_uri ?? "", 'stream')
      }
    } else {
      // キャッシュ URI が無ければ、URI を使う
      if (episode.uri.startsWith("http")) {
        return episode.uri
      } else {
        return convertFileSrc(props.episode?.uri ?? "", 'stream')
      }
    }
  }

  return (
    <div className="Player">
      <figure>
        <figcaption>{ props.episode ? props.episode.title : ""}</figcaption>
        <audio
          autoPlay={props.isAutoPlay}
          controls src={getPlayerSrc(props.episode)}
          onEnded={() => { props.onEnded(props.episode?.id ?? -1) }}
          ref={audioElement}
        />
      </figure>
    </div>
  );
});

export default Player;

