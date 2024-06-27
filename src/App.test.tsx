import React from 'react';
import { act, fireEvent, getByText, render, screen, waitFor } from '@testing-library/react';

import { BrowserRouter } from "react-router-dom";

import { Episode, Feed, UpdateEpisode } from "./CommonAppTypes";

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
                    uri: 'channel_uri_1',
                    name: 'channel_name_1'
                },
                {
                    uri: 'channel_uri_2',
                    name: 'channel_name_2'
                },
            ]);
        });
    },
    addVirtualChannel: async ( newChannel: string ) => {
        return await new Promise(() => {});
    },
    addPodcastChannel: async ( feed: Feed ) => {
        return await new Promise(() => {});
    },
    readRssInfo: async (feedUrl: string) => {
        return await new Promise(() => {});
    },
    deleteChannel: async ( channelUri : string ) => {
        return await new Promise(() => {});
    },
    getEpisodes: async ( channelUri : string ) => {
        return await new Promise((callback) => {
            callback([
                {
                    id: 1,
                    channel_name: 'channel_name_1',
                    uri: 'channel_uri_1/episode_title_1',
                    title: 'episode_title_1',
                    current_time: null,
                    is_finish: false
                },
                {
                    id: 2,
                    channel_name: 'channel_name_1',
                    uri: 'channel_uri_1/episode_title_2',
                    title: 'episode_title_2',
                    current_time: 0,
                    is_finish: false
                },
                {
                    id: 3,
                    channel_name: 'channel_name_1',
                    uri: 'channel_uri_1/episode_title_3',
                    title: 'episode_title_3',
                    current_time: 0,
                    is_finish: true
                },
            ] as Array<Episode>);
        });
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

      const channelLiElements = Array.from(document.querySelectorAll('.ChannelList li'));
      expect(channelLiElements.length).toBe(2);
      expect(channelLiElements[0]).toBeInTheDocument();
      expect(channelLiElements[1]).toBeInTheDocument();

  });

});


test('episode list', async () => {
  render(
    <React.StrictMode>
      <TauriServiceContext.Provider value={MockService}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TauriServiceContext.Provider>
    </React.StrictMode>
  );

  await waitFor(async () => {
      const channelLiElements = Array.from(document.querySelectorAll('.ChannelList li'));
      expect(channelLiElements.length).toBe(2);
      await fireEvent.click(
          channelLiElements[0]
      );
  });

  await waitFor(async () => {
      const episodeLiElements = Array.from(document.querySelectorAll('.EpisodeList li'));
      expect(episodeLiElements.length).toBe(3);

      expect(episodeLiElements[0].textContent).toBe('🆕 : episode_title_1');
      expect(episodeLiElements[1].textContent).toBe('☐ : episode_title_2');
      expect(episodeLiElements[2].textContent).toBe('☑ : episode_title_3');
  });

});
