import React, { useState, useEffect } from 'react';

import { invoke } from '@tauri-apps/api/tauri'

type Channel = {
  uri: string,
  name: string
};

type ChannelListProps = {
  channels: Array<Channel>,
  onClick: (channel_index: number) => void
};

function ChannelList(props : ChannelListProps) {

  const channelList = props.channels.map((channel, channel_index) => {
    return <li
        key={channel.uri}
        onClick={() => props.onClick(channel_index)}
        >
        {channel.name}({channel.uri})</li>
  });

  return (
    <div className="ChannelList">
      <h1>購読チャンネル一覧</h1>
      <ul>
        {channelList}
      </ul>
    </div>
  );
}

export default ChannelList;

