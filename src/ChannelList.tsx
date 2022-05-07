import React, { useState, useEffect } from 'react';

import { invoke } from '@tauri-apps/api/tauri'

import './ChannelList.css';
import { Channel } from './CommonAppTypes'

type ChannelListProps = {
  channels: Array<Channel>,
  onChannelClick: (channel_index: number) => void,
  onChannelDeleteClick: (channel_index: number, event : React.MouseEvent<HTMLElement>) => void
};

export function ChannelList(props : ChannelListProps) {

  const channelList = props.channels.map((channel, channel_index) => {
    return <li
        key={channel.uri}
        onClick={() => props.onChannelClick(channel_index)}
        >
        <label>{channel.name}</label><button onClick={(event) => props.onChannelDeleteClick(channel_index, event)}>削除</button></li>
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

