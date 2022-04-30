import React, { useState, useEffect } from 'react';

import { invoke } from '@tauri-apps/api/tauri'

type Channel = {
  uri: string,
  name: string
};

type ChannelListProps = {
  channels: Array<Channel>
};

function ChannelList(props : ChannelListProps) {

  const channel_list = props.channels.map((channel) => {
    return <li>{channel.name}({channel.uri})</li>
  });

  return (
    <div className="ChannelList">
      <ul>
        {channel_list}
      </ul>
    </div>
  );
}

export default ChannelList;

