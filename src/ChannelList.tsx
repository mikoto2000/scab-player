import React, { useState, useEffect } from 'react';

import { invoke } from '@tauri-apps/api/tauri'

import { Channel } from './CommonAppTypes'

type ChannelListProps = {
  channels: Array<Channel>,
  onClick: (channel_index: number) => void
};

export function ChannelList(props : ChannelListProps) {

  const channelList = props.channels.map((channel, channel_index) => {
    return <li
        key={channel.uri}
        onClick={() => props.onClick(channel_index)}
        >
        {channel.name}</li>
  });

  return (
    <div className="ChannelList">
      <h1>Subscribed channels:</h1>
      <ul>
        {channelList}
      </ul>
    </div>
  );
}

