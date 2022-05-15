import { Channel, Episode, UpdateEpisode } from '../CommonAppTypes'

export type Service = {
    onClose: (handleCloseFunction : () => void) => void,
    getChannels: () => Promise<Array<Channel>>,
    addVirtualChannel: ( newChannel: string ) => Promise<number>,
    deleteChannel: ( channelUri : string ) => Promise<void>,
    getEpisodes: ( channelUri : string ) => Promise<Array<Episode>>,
    findNewEpisodes: ( newChannel: string ) => Promise<Array<Episode>>,
    updateEpisode: (episode: UpdateEpisode) => Promise<number>
};

