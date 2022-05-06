import React, { useState, useEffect } from 'react';

import { dialog } from '@tauri-apps/api'
import { invoke } from '@tauri-apps/api/tauri'

import { Episode } from './CommonAppTypes'

type VirtualChannelRegisterProps = {
  onRegisterChannel: () => void
};

function VirtualChannelRegister(props : VirtualChannelRegisterProps) {
  const [channelBaseDirectory, setChannelBaseDirectory] = useState("");
  const [findEpisodes, setFindEpisodes] = useState([] as Array<Episode>);
  const [addChannelResultMessage, setAddChannelResultMessage] = useState("");

  async function selectChannelBaseDirectory() {
    const directory = await dialog.open({
      title: "Select channel base directory",
      directory: true
    });

    if (typeof directory === "string") {
      setChannelBaseDirectory(directory);

      const episodes : Array<Episode> = await invoke('find_new_episodes', { newChannel: directory});

      setFindEpisodes(episodes);
    }

  }

  function addNewChannel() {

       invoke('add_virtual_channel', { newChannel: channelBaseDirectory})
           .then((_) => {
               setAddChannelResultMessage("チャンネル登録に成功しました。");

               setChannelBaseDirectory("");
               setFindEpisodes([]);

               props.onRegisterChannel();
           })
           .catch((e) => {
                setAddChannelResultMessage(`チャンネル登録に失敗しました。${e}`);
           });

  }

  const episodes = findEpisodes.map((e) => {
    return <li key={e.uri}>{e.title}</li>
  });

  return (
    <div className="VirtualChannelRegister">
      <h1>Selected channel</h1>
      <div>
        <h2>Virtual Channel: </h2>
        <div>{channelBaseDirectory}</div>
        <button onClick={selectChannelBaseDirectory} >チャンネル選択</button>
        <button onClick={addNewChannel}>チャンネル登録</button>
        <div>
            {addChannelResultMessage}
        </div>
        <h2>Episodes:</h2>
        <div>
          <ol>
            <div>{episodes}</div>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default VirtualChannelRegister;


