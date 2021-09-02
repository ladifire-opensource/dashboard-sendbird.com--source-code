import { createContext, FC, useCallback, useEffect, useRef, useState } from 'react';

type UserProfilePopupContextProviderProps = { channelType: ChannelType; channelUrl: string };

type BanStateChangeListener = (userId: string, isBanned: boolean) => void;
type MuteStateChangeListener = (userId: string, isMuted: boolean) => void;
type DeactivatedListener = (userId: string) => void;

type UpdateChangeListener = {
  (type: 'ban', listener: BanStateChangeListener): void;
  (type: 'mute', listener: MuteStateChangeListener): void;
  (type: 'deactivate', listener: DeactivatedListener): void;
};

type NotifyChange = {
  (type: 'ban', change: { userId: string; isBanned: boolean }): void;
  (type: 'mute', change: { userId: string; isMuted: boolean }): void;
  (type: 'deactivate', change: { userId: string }): void;
};

export const UserProfilePopupContext = createContext<
  {
    openProfilePopup: (popupId: string) => void;
    closeProfilePopup: () => void;
    currentPopupId: string | null;
    addChangeListener: UpdateChangeListener;
    removeChangeListener: UpdateChangeListener;
    notifyChange: NotifyChange;
  } & UserProfilePopupContextProviderProps
>({
  openProfilePopup: () => {},
  closeProfilePopup: () => {},
  currentPopupId: null,
  addChangeListener: () => {},
  removeChangeListener: () => {},
  notifyChange: () => {},
  channelType: 'group_channels',
  channelUrl: '',
});

const UserProfilePopupContextProvider: FC<UserProfilePopupContextProviderProps> = ({
  children,
  channelUrl,
  channelType,
}) => {
  const [currentPopupId, setCurrentPopupId] = useState<string | null>(null);
  const banStateChangeListeners = useRef<Set<BanStateChangeListener>>(new Set());
  const muteStateChangeListeners = useRef<Set<MuteStateChangeListener>>(new Set());
  const deactivatedListeners = useRef<Set<DeactivatedListener>>(new Set());

  useEffect(() => {
    return () => {
      // When channelUrl or channelType changes, close the open popup.
      setCurrentPopupId(null);
    };
  }, [channelUrl, channelType]);

  const openProfilePopup = useCallback((popupId: string) => setCurrentPopupId(popupId), []);

  const closeProfilePopup = useCallback(() => setCurrentPopupId(null), []);

  const addChangeListener = useCallback<UpdateChangeListener>((type, listener) => {
    switch (type) {
      case 'ban':
        banStateChangeListeners.current.add(listener);
        break;
      case 'mute':
        muteStateChangeListeners.current.add(listener);
        break;
      case 'deactivate':
        deactivatedListeners.current.add(listener);
        break;
      default:
        return;
    }
  }, []);

  const removeChangeListener = useCallback<UpdateChangeListener>((type, listener) => {
    switch (type) {
      case 'ban':
        banStateChangeListeners.current.delete(listener);
        break;
      case 'mute':
        muteStateChangeListeners.current.delete(listener);
        break;
      case 'deactivate':
        deactivatedListeners.current.delete(listener);
        break;
      default:
        return;
    }
  }, []);

  const notifyChange = useCallback<NotifyChange>((type, change) => {
    switch (type) {
      case 'ban':
        banStateChangeListeners.current.forEach((listener) => listener(change.userId, change.isBanned));
        break;
      case 'mute':
        muteStateChangeListeners.current.forEach((listener) => listener(change.userId, change.isMuted));
        break;
      case 'deactivate':
        deactivatedListeners.current.forEach((listener) => listener(change.userId));
        break;
      default:
        return;
    }
  }, []);

  return (
    <UserProfilePopupContext.Provider
      value={{
        currentPopupId,
        openProfilePopup,
        closeProfilePopup,
        addChangeListener,
        removeChangeListener,
        notifyChange,
        channelUrl,
        channelType,
      }}
    >
      {children}
    </UserProfilePopupContext.Provider>
  );
};

export default UserProfilePopupContextProvider;
