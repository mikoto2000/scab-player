import React, { useEffect, useState } from 'react';

import './EpisodeList.css'
import { Episode } from './CommonAppTypes'
import { EpisodeListItem } from './EpisodeListItem'
import { Service } from './service/Service';
import { useParams } from 'react-router-dom';

type SortParam = "title" | "publishDate";
type SortOrder = "asc" | "desc";

type EpisodeListProps = {
  service: Service,
  onEpisodeClick: (episodeId: number) => void
  onLoadEpisodes: (episodes: Array<Episode>) => void
};

export function EpisodeList(props: EpisodeListProps) {

  const [episodes, setEpisodes] = useState<Array<Episode>>([]);
  const [sortTarget, setSortTarget] = useState<SortParam>("publishDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { channelUrl } = useParams();
  const decodedChannelUrl = decodeURIComponent(channelUrl ?? "");

  async function updateErrorMessage(message: string) {
    const errorArea = document.getElementById("error-area");
    if (errorArea) {
      errorArea.textContent = message;
    }
  }

  useEffect(() => {
    props.service.getEpisodes(decodedChannelUrl)
      .then((episodes) => {
        setEpisodes(episodes as Array<Episode>);
        props.onLoadEpisodes(episodes);
      })
      .catch((err) => updateErrorMessage(`⚠️ get episode list error: ${err}`));
  }, [decodedChannelUrl]);

  const タイトル昇順 = (a: Episode, b: Episode) => a.title.localeCompare(b.title);
  const タイトル降順 = (a: Episode, b: Episode) => -a.title.localeCompare(b.title);
  const 公開日昇順 = (a: Episode, b: Episode) => {
    if (!a.publish_date && !b.publish_date) return 0;
    if (!a.publish_date) return -1;
    if (!b.publish_date) return 1;
    return a.publish_date.localeCompare(b.publish_date);
  }
  const 公開日降順 = (a: Episode, b: Episode) => {
    if (!a.publish_date && !b.publish_date) return 0;
    if (!a.publish_date) return 1;
    if (!b.publish_date) return -1;
    return b.publish_date.localeCompare(a.publish_date);
  }

  const changeSortTarget = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortTarget(event.currentTarget.value as SortParam);
  };

  const changeSortOrder = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.currentTarget.value as SortOrder);
  };

  const orderFunc = () => {
    if (sortTarget === "title") {
      if (sortOrder === "asc") {
        return タイトル昇順;
      } else {
        return タイトル降順;
      }
    } else {
      if (sortOrder === "asc") {
        return 公開日昇順;
      } else {
        return 公開日降順;
      }
    }
  }

  return (
    <div className="EpisodeList">
      <div className="title-area">
        <h1 className="title">Episode list:</h1>
        <div className="control">
          <label>ソート順:</label>
          <select
            onChange={changeSortTarget}
            value={sortTarget}>
            <option value="title">タイトル</option>
            <option value="publishDate">公開日</option>
          </select>
          <select
            onChange={changeSortOrder}
            value={sortOrder}
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
          <button onClick={async () => {
            const feed = await props.service.readRssInfo(decodedChannelUrl);
            await props.service.addPodcastChannel(feed);
            window.location.reload();
          }}>RSS 再読み込み</button>
        </div>
      </div>
      <ul>
        {episodes.sort(orderFunc())
          .map((e) => {
            return (
              <li onClick={() => { props.onEpisodeClick(e.id) }}
                key={e.id}
              >
                <EpisodeListItem
                  episodeId={e.id}
                  episode={e}
                />
              </li>);
          })}
      </ul>
    </div>
  );
}

