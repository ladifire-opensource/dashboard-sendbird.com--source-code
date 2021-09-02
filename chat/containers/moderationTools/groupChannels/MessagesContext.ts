import { createContext } from 'react';

import useMessagesStateReducer from './hooks/useMessagesStateReducer';

const MessagesContext = createContext<ReturnType<typeof useMessagesStateReducer>>(undefined as any);

export default MessagesContext;
