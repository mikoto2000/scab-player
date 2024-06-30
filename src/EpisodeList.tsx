import React, { useState } from 'react';

import './EpisodeList.css'
import { Episode } from './CommonAppTypes'
import { EpisodeListItem } from './EpisodeListItem'

type SortParam = "title" | "publishDate";
type SortOrder = "asc" | "desc";

type EpisodeListProps = {
  episodes: Array<Episode>,
  onEpisodeClick : (episodeIndex : number) => void
};

export function EpisodeList(props : EpisodeListProps) {

  const [sortTarget, setSortTarget] = useState<SortParam>("publishDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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
        </div>
      </div>
      <ul>
        {props.episodes.sort(orderFunc())
          .map((e, episodeIndex) => {
            return (
              <li onClick={() => { props.onEpisodeClick(episodeIndex) }}
                key={e.uri}
                >
                <EpisodeListItem
                  episodeIndex={episodeIndex}
                  episode={e}
                  onEpisodeClick={props.onEpisodeClick}/>
              </li>);
        })}
      </ul>
    </div>
  );
}

