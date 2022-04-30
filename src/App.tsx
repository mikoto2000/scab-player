import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import { invoke } from '@tauri-apps/api/tauri'

import ChannelList from './ChannelList';

type Channel = {
  uri: string,
  name: string
};

function App() {
  const [channels, setChannels] = useState([] as Array<Channel>);

  useEffect(() => {
    (async () => {
      const channells = await invoke('get_channels', {});

      setChannels((channells as Array<Channel>));
    })()
  }, []);

  return (
    <div className="App">
      <ChannelList channels={channels} />
    </div>
  );
}

export default App;
