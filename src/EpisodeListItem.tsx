import { useEffect, useState } from 'react';

import './EpisodeListItem.css'

import { Episode } from './CommonAppTypes'

import { useTauriService } from './service/TauriService'

type EpisodeListItemProps = {
  episodeIndex: number,
  episode: Episode,
};

export function EpisodeListItem(props : EpisodeListItemProps) {

  const [downloaded, setDownloaded] = useState(false);

  const service = useTauriService();

  useEffect(() => {
    if (props.episode.cache_uri) {
      setDownloaded(true);
    }
  }, [props.episode.cache_uri]);

  function getEpisodeIcon(episode : Episode) {

    if (episode.current_time == null) {
      return "🆕";
    }

    return episode.is_finish ? '☑': '☐';
  }


  function getEpisodeDownloadArea(episode : Episode) {

    // 仮想チャンネル(ローカルファイル)なのでダウンロードの必要はない
    if (!episode.uri.startsWith("http")) {
      return <></>;
    }

    const label = downloaded
    ?
    "再ダウンロード"
    :
    "ダウンロード";

    return <button className="download" onClick={(event) => download(event, episode)}>{label}</button>;
  }

  function download(event: React.MouseEvent<HTMLButtonElement>, episode : Episode) {
    console.log("download!");
    event.stopPropagation();
    (async() => {
      let cache_uri = await service.downloadPodcastEpisode(episode);
      console.log(cache_uri);
      episode.cache_uri = cache_uri;
      setDownloaded(true);
    })();
  }

  return (
    <div className="EpisodeListItem">
      <div className="episode">
        {getEpisodeIcon(props.episode)} : {props.episode.title}
      </div>
      {getEpisodeDownloadArea(props.episode)}
    </div>
  );
}

