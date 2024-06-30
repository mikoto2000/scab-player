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

  const [sortTarget, setSortTarget] = useState<SortParam>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const タイトル昇順 = (a: Episode, b: Episode) => a.title.localeCompare(b.title);
  const タイトル降順 = (a: Episode, b: Episode) => -a.title.localeCompare(b.title);

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
        // TODO: パラメーターに公開日を追加したらそちらでソートする
        return タイトル昇順;
      } else {
        // TODO: パラメーターに公開日を追加したらそちらでソートする
        return タイトル降順;
      }
    }
  }

  return (
    <div className="EpisodeList">
      <div className="title-area">
        <h1 className="title">Episode list:</h1>
        <div className="control">
          <label>ソート順:</label>
            <select onChange={changeSortTarget}>
              <option value="title">タイトル</option>
              <option value="publishDate">公開日</option>
            </select>
            <select onChange={changeSortOrder}>
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

