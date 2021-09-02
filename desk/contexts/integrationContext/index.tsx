import React, { useEffect } from 'react';

import { useInstagramReducer, InstagramIntegrationInitialState } from './useInstagramReducer';
import { useTwitterReducer, TwitterIntegrationInitialState } from './useTwitterReducer';

type Props = {
  pid: RootState['desk']['project']['pid'];
  region: Application['region'];
};

export type TwitterReducer = ReturnType<typeof useTwitterReducer>;
export type InstagramReducer = ReturnType<typeof useInstagramReducer>;

export const IntegrationContext = React.createContext<{
  instagramReducer: ReturnType<typeof useInstagramReducer>;
  twitterReducer: ReturnType<typeof useTwitterReducer>;
}>({
  twitterReducer: {
    state: TwitterIntegrationInitialState,
    dispatch: () => TwitterIntegrationInitialState,
    actions: {
      fetchTwitterUsers: async () => {},
      authenticateTwitter: async () => {},
      subscribeTwitterRequest: async () => {},
      removeTwitterAccount: async () => {},
      patchTwitterAccount: async () => {},
    },
  },
  instagramReducer: {
    state: InstagramIntegrationInitialState,
    dispatch: () => InstagramIntegrationInitialState,
    actions: {
      fetchInstagramAccounts: async () => {},
      addInstagramAccountsRequest: async () => {},
      patchInstagramAccountRequest: async () => {},
    },
  },
});

export const IntegrationContextProvider: React.FC<Props> = ({ pid, region, children }) => {
  const twitterReducer = useTwitterReducer({ pid, region });
  const instagramReducer = useInstagramReducer({ pid, region });

  useEffect(() => {
    if (pid && region) {
      instagramReducer.actions.fetchInstagramAccounts();
      twitterReducer.actions.fetchTwitterUsers();
    }
  }, [pid, region]);

  return (
    <IntegrationContext.Provider
      value={{
        twitterReducer,
        instagramReducer,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  );
};

export * from './useInstagramReducer';
export * from './useTwitterReducer';
