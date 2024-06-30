export type Channel = {
  uri: string,
  name: string
};

export type Episode = {
  id: number,
  channel_name: string,
  uri: string,
  cache_uri: string,
  title: string,
  current_time: number,
  is_finish: boolean,
  publish_date: string,
};

export type UpdateEpisode = {
  id: number,
  current_time: number,
  is_finish: boolean
};

export type Feed = {
  title: string;
  authors: string[];
  description: string;
}

