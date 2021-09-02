import { createContext, FC, useContext } from 'react';

import { useMobileAppUsers } from './dialogs/useMobileAppUsers';

type ContextValue = ReturnType<typeof useMobileAppUsers>;

const ContactsContext = createContext<ContextValue | undefined>(undefined);

export const ContactsProvider: FC = ({ children }) => {
  const contextValue = useMobileAppUsers();

  return <ContactsContext.Provider value={contextValue}>{children}</ContactsContext.Provider>;
};

export const useContactsContext = () => {
  const contextValue = useContext(ContactsContext);

  if (!contextValue) {
    throw new Error('The component using ContactsContext must be a descendant of ContactsContext.Provider');
  }

  return contextValue;
};
