import { createContext, useContext, FC, useState, useCallback } from 'react';

import moment from 'moment-timezone';

import { ClientStorage } from '@utils';

const LOCAL_STORAGE_TIMEZONE_KEY = 'announcementTimezone';

const AnnouncementTimezoneContext = createContext(moment.tz.guess());
const AnnouncementTimezoneSetterContext = createContext<(timezone: string) => void>(() => {});

export const AnnouncementTimezoneContextProvider: FC = ({ children }) => {
  const [timezone, setTimezone] = useState(ClientStorage.get(LOCAL_STORAGE_TIMEZONE_KEY) || moment.tz.guess());

  const updateTimezone = useCallback((value: string) => {
    setTimezone(value);
    ClientStorage.set(LOCAL_STORAGE_TIMEZONE_KEY, value);
  }, []);
  return (
    <AnnouncementTimezoneContext.Provider value={timezone}>
      <AnnouncementTimezoneSetterContext.Provider value={updateTimezone}>
        {children}
      </AnnouncementTimezoneSetterContext.Provider>
    </AnnouncementTimezoneContext.Provider>
  );
};

export const useAnnouncementTimezone = () => useContext(AnnouncementTimezoneContext);

export const useAnnouncementTimezoneSetter = () => useContext(AnnouncementTimezoneSetterContext);
