import React, { useRef } from 'react';

import './ChannelList.css';
import { Channel } from './CommonAppTypes'

type ChannelListProps = {
  channels: Array<Channel>,
  onChannelClick: (channel_index: number) => void,
  onChannelDeleteClick: (channel_index: number, event: React.MouseEvent<HTMLElement>) => void
};

export function ChannelList(props: ChannelListProps) {
  const dialog = useRef<HTMLDialogElement | null>(null);

  //   const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const channelList = props.channels.map((channel, channel_index) => {
    return (
      <>
        <li
          key={channel.uri}
          onClick={() => props.onChannelClick(channel_index)}
        >
          <label>{channel.name}</label>
          <button onClick={(event) => {
            event.stopPropagation();
            if (dialog && dialog.current) {
              dialog.current.showModal();
            }
          }}>
            削除
          </button>
        </li>
        <dialog
          ref={dialog}
        >
          <p>エピソードを削除しますか？</p>
          <div>
            <button onClick={() => { if (dialog && dialog.current) { dialog.current.close() } }}>キャンセル</button>
            <button onClick={(event) => props.onChannelDeleteClick(channel_index, event)}>削除</button>
          </div>
        </dialog>
      </>
    )
  });

  return (
    <>
      <div className="ChannelList">
        <h1>Subscribed channels:</h1>
        <ul>
          {channelList}
        </ul>
      </div>
    </>
  );
}

