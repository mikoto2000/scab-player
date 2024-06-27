import React, { useState, ChangeEvent, MouseEvent } from 'react';

import './PodcastChannelRegister.css'
import { Feed } from './CommonAppTypes'
import { useTauriService } from './service/TauriService'

type PodcastChannelRegisterProps = {
  onRegisterChannel: () => void
};

function PodcastChannelRegister(props : PodcastChannelRegisterProps) {
  const [channelFeedUrl, setChannelFeedUrl] = useState("");
  const [feed, setFeed] = useState<Feed|undefined>(undefined);
  const [readRssResultMessage, setReadRssResultMessage] = useState("");
  const [addChannelResultMessage, setAddChannelResultMessage] = useState("");

  const service = useTauriService();

  function changesChannelRssUrl(event: ChangeEvent<HTMLInputElement>) {
    setChannelFeedUrl(event.currentTarget.value);
  }

  async function readRssInfo(event: MouseEvent<HTMLButtonElement>) {
       service.readRssInfo(channelFeedUrl)
           .then((feed) => {
             setFeed(feed);
           })
           .catch((e) => {
                setReadRssResultMessage(`RSS 読み込みに失敗しました。${e}`);
           });
  }

  function addNewChannel() {

    if (feed) {
       service.addPodcastChannel(feed)
         .then((_) => {
           setAddChannelResultMessage("チャンネル登録に成功しました。");

           setChannelFeedUrl("");

           props.onRegisterChannel();
         })
         .catch((e) => {
            setAddChannelResultMessage(`チャンネル登録に失敗しました。${e}`);
         });
    }

  }

  return (
    <div className="PodcastChannelRegister">
      <h1>Channel select</h1>
      <div className="channel">
        <h2>Channel: </h2>
        <div>
        RSS URL: <input type="text" onChange={changesChannelRssUrl}></input>
          <button onClick={readRssInfo}>RSS 読み込み</button>
          <button onClick={addNewChannel}>チャンネル登録</button>
        </div>
        <div className="message">
            {readRssResultMessage}
        </div>
        <div className="message">
            {addChannelResultMessage}
        </div>
      </div>
      <div className="episode-list">
        {
          feed
          ?
          <>
            <h2>Podcast Information:</h2>
            <ul>
              <li>title: {feed.title}</li>
              <li>author: {feed.author.join(", ")}</li>
              <li>description: {feed.description}</li>
            </ul>
          </>
          :
          <></>
        }
      </div>
    </div>
  );
}

export default PodcastChannelRegister;



