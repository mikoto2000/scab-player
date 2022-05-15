import React, { useContext } from 'react';

import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'

import { UpdateEpisode } from '../CommonAppTypes'
import { Service } from './Service'

export const TauriService : Service = {
    onClose: async (handleCloseFunction) => {
        appWindow.listen('tauri://close-requested', async ({ event, payload }) => {

          await handleCloseFunction();

          appWindow.close();
        });
    },
    getChannels: async () => {
        return await invoke('get_channels', {});
    },
    addVirtualChannel: async ( newChannel: string ) => {
        return await invoke('add_virtual_channel', { newChannel: newChannel});
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
