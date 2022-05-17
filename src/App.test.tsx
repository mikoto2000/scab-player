import React from 'react';
import { act, fireEvent, getByText, render, screen, waitFor } from '@testing-library/react';

import { BrowserRouter } from "react-router-dom";

import { Service } from "./service/Service";
import { TauriServiceContext } from "./service/TauriService";

import App from './App';


const MockService : Service = {
    onClose: async (handleCloseFunction) => {
    },
    getChannels: async () => {
        return await new Promise((callback) => {
            callback([
                {
                    url: 'channel_url_1',
                    name: 'channel_name_1'
                },
                {
                    url: 'channel_url_2',
                    name: 'channel_name_2'
                },
            ]);
        });
    },
    addVirtualChannel: async ( newChannel: string ) => {
        return await new Promise(() => {});
    },
    deleteChannel: async ( channelUri : string ) => {
        return await new Promise(() => {});
    },
    getEpisodes: async ( channelUri : string ) => {
        return await new Promise(() => {});
    },
    findNewEpisodes: async ( newChannel: string ) => {
        return await new Promise(() => {});
    },
    updateEpisode: async (episode: UpdateEpisode) => {
        return await new Promise(() => {});
    }
};

test('channel list', async () => {
  render(
    <React.StrictMode>
      <TauriServiceContext.Provider value={MockService}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TauriServiceContext.Provider>
    </React.StrictMode>
  );

  await waitFor(() => {
      const first_channel = screen.getByText(/channel_name_1/i);
      expect(first_channel).toBeInTheDocument();

      const second_channel = screen.getByText(/channel_name_2/i);
      expect(second_channel).toBeInTheDocument();

      const channelLiElements = [...document.querySelectorAll('.ChannelList li')];
      expect(channelLiElements.length).toBe(2);
      expect(channelLiElements[0]).toBeInTheDocument();
      expect(channelLiElements[1]).toBeInTheDocument();

  });

});

