import React, { useState } from 'react';

import {  } from '@tauri-apps/api'

import './VirtualChannelRegister.css'
import { Episode } from './CommonAppTypes'
import { useTauriService } from './service/TauriService'
import * as dialog from "@tauri-apps/plugin-dialog"

type VirtualChannelRegisterProps = {
  onRegisterChannel: () => void
};

function VirtualChannelRegister(props : VirtualChannelRegisterProps) {
  const [channelBaseDirectory, setChannelBaseDirectory] = useState("");
  const [findEpisodes, setFindEpisodes] = useState([] as Array<Episode>);
  const [addChannelResultMessage, setAddChannelResultMessage] = useState("");

  const service = useTauriService();

  async function selectChannelBaseDirectory() {
    const directory = await dialog.open({
      title: "Select channel base directory",
      directory: true
    });

    if (typeof directory === "string") {
      setChannelBaseDirectory(directory);

      const episodes : Array<Episode> = await service.findNewEpisodes(directory);

      setFindEpisodes(episodes);
    }

  }

  function addNewChannel() {

       service.addVirtualChannel(channelBaseDirectory)
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
      <h1>仮想チャンネル選択</h1>
      <div className="channel">
        <div>{channelBaseDirectory}</div>
        <div>
          <button onClick={selectChannelBaseDirectory} >チャンネルディレクトリ選択</button>
          <button onClick={addNewChannel}>チャンネル登録</button>
        </div>
        <div className="message">
            {addChannelResultMessage}
        </div>
      </div>
      <div className="episode-list">
        <h2>Episodes:</h2>
        <ol>
          {episodes}
        </ol>
      </div>
    </div>
  );
}

export default VirtualChannelRegister;


