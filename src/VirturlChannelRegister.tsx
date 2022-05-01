import React, { useState, useEffect } from 'react';

import { dialog } from '@tauri-apps/api'
import { invoke } from '@tauri-apps/api/tauri'

type Episode = {
    channelUri: string,
    title: string,
    uri: string
};

function VirtualChannelRegister() {
  const [channelBaseDirectory, setChannelBaseDirectory] = useState("");
  const [findEpisodes, setFindEpisodes] = useState([] as Array<Episode>);

  async function selectChannelBaseDirectory() {
    const directory = await dialog.open({
      title: "Select channel base directory",
      directory: true
    });

    console.log(directory);

    if (typeof directory === "string") {
      setChannelBaseDirectory(directory);

      const episodes : Array<Episode> = await invoke('find_new_episodes', { newChannel: directory});

      console.log(episodes);

      setFindEpisodes(episodes);
    }

  }

  const episodes = findEpisodes.map((e) => {
    return <li>{JSON.stringify(e)}</li>
  });

  return (
    <div className="ChannelList">
      <h1>選択チャンネル</h1>
      <div>
        <h2>Virtual Channel: </h2>
        <div>{channelBaseDirectory}</div>
        <h2>Episodes:</h2>
        <div>
          <ol>
            <div>{episodes}</div>
          </ol>
        </div>
        <button onClick={selectChannelBaseDirectory} >チャンネル選択</button>
        <button>チャンネル登録</button>
      </div>
    </div>
  );
}

export default VirtualChannelRegister;


