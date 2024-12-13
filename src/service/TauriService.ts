import React, { useContext } from 'react';

import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { invoke } from '@tauri-apps/api/core'

import { Episode, Feed, UpdateEpisode } from '../CommonAppTypes'
import { Service } from './Service'
const appWindow = getCurrentWebviewWindow()

export const TauriService : Service = {
    onClose: async (handleCloseFunction) => {
        appWindow.listen('tauri://close-requested', async () => {

          await handleCloseFunction();

          appWindow.destroy();
        });
    },
    getChannels: async () => {
        return await invoke('get_channels', {});
    },
    addVirtualChannel: async ( newChannel: string ) => {
        return await invoke('add_virtual_channel', { newChannel: newChannel});
    },
    readRssInfo: async (feedUrl: string) => {
        return await invoke('read_rss_info', { channelUri: feedUrl });
    },
    addPodcastChannel: async ( feed: Feed ) => {
        return await invoke('add_podcast', { feed: feed});
    },
    downloadPodcastEpisode: async ( episode: Episode ) => {
        return await invoke('download_podcast_episode', { episode: episode});
    },
    deleteChannel: async ( channelUri : string ) => {
        return await invoke('delete_channel', { channelUri: channelUri });
    },
    getEpisodes: async ( channelUri : string ) => {
        return await invoke('get_episodes', { channelUri: channelUri });
    },
    findNewEpisodes: async ( newChannel: string ) => {
        return await invoke('find_new_episodes', { newChannel: newChannel});
    },
    updateEpisode: async (episode: UpdateEpisode) => {
        return await invoke('update_episode', { episode: episode });
    }
};

export const TauriServiceContext = React.createContext(TauriService);

export function useTauriService() {
  return useContext(TauriServiceContext);
}
