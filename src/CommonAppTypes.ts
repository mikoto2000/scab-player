export type Channel = {
  uri: string,
  name: string
};

export type Episode = {
  id: number,
  channel_name: string,
  uri: string,
  title: string,
  current_time: number,
  is_finish: boolean
};

