import { Channel, Episode, Feed, UpdateEpisode } from '../CommonAppTypes'

export type Service = {
    onClose: (handleCloseFunction : () => void) => void,
    getChannels: () => Promise<Array<Channel>>,
    addVirtualChannel: ( newChannel: string ) => Promise<number>,
    addPodcastChannel: ( newChannel: string ) => Promise<number>,
    readRssInfo: (feedUrl: string) => Promise<Feed>,
    deleteChannel: ( channelUri : string ) => Promise<void>,
    getEpisodes: ( channelUri : string ) => Promise<Array<Episode>>,
    findNewEpisodes: ( newChannel: string ) => Promise<Array<Episode>>,
    updateEpisode: (episode: UpdateEpisode) => Promise<number>
};

