import { createContext, FC, useRef, useCallback, useContext } from 'react';

interface CallWidgetApp {
  mainApp: { dial: (peerId: string, isVideoCall?: boolean, callOption?: any) => void };
  openWidget: () => void;
  closeWidget: () => void;
}

const CallWidgetAppUpdaterContext = createContext<(newValue: any) => void>(undefined as any);
const CallWidgetAppRefContext = createContext<{ current: CallWidgetApp | null }>(undefined as any);

export const CallWidgetAppProvider: FC = ({ children }) => {
  const widgetAppRef = useRef<CallWidgetApp | null>(null);

  const updateWidgetApp = useCallback((newValue: any) => {
    widgetAppRef.current = newValue;
  }, []);

  return (
    <CallWidgetAppRefContext.Provider value={widgetAppRef}>
      <CallWidgetAppUpdaterContext.Provider value={updateWidgetApp}>{children}</CallWidgetAppUpdaterContext.Provider>
    </CallWidgetAppRefContext.Provider>
  );
};

export const useCallWidgetApp = () => {
  const widgetAppRef = useContext(CallWidgetAppRefContext);

  if (typeof widgetAppRef === undefined) {
    throw new Error('useCallWidgetApp must be used within a CallWidgetAppProvider');
  }
  return widgetAppRef.current;
};

export const useCallWidgetAppUpdater = () => {
  const updateWidgetApp = useContext(CallWidgetAppUpdaterContext);

  if (typeof updateWidgetApp === undefined) {
    throw new Error('useCallWidgetAppUpdater must be used within a CallWidgetAppProvider');
  }
  return updateWidgetApp;
};
