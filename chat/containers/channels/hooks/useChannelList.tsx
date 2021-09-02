import { useReducer, useCallback, useEffect, useMemo, createContext, FC, useContext, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { toast } from 'feather';
import qs from 'qs';

import { chatActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShallowEqualSelector, useShowDialog, useTypedSelector } from '@hooks';
import { useIsNCSoft } from '@hooks/useIsNCSoft';

type Options = { channelType: ChannelType };

type ChannelListState<T extends ChannelType = any> = {
  channelType: ChannelType;
  selectedChannels: ChannelTyped<T>[];
  channels: readonly ChannelTyped<T>[];
  next: string;
  isFetching: boolean;
  isFetchingLoadMore: boolean;
  search: { option: ChannelSearchOptionKey; query: string; isSearching: boolean; isSuccess: boolean };
  current: ChannelTyped<T> | null;
};

type TypedChannelListState<T extends ChannelType> = ChannelListState<T>;

type NavigateToChannel = (payload: { url: string; customType: string }) => void;

type ChannelListActions<T extends ChannelType = any> = {
  setSelectedChannels: (selectedChannels: readonly ChannelTyped<T>[]) => void;
  handleChannelSelectionChange: (channel: Channel, isSelected: boolean) => void;
  fetchChannels: () => void;
  handleSearchClear: () => void;
  handleSearchQueryChange: (query: string) => void;
  handleSearchOptionChange: (option: ChannelSearchOption<T>) => void;
  loadMoreChannels: () => void;
  navigateToChannel: NavigateToChannel;
  navigateToList: () => void;
  editChannel: (channel: ChannelTyped<T>) => void;
  editChannelMetadata: (channel: ChannelTyped<T>) => void;
  sendAdminMessage: (channels: ChannelTyped<T>[]) => void;
  deleteChannels: (channels: ChannelTyped<T>[]) => void;

  // redux actions
  searchChannels: (options: { option: ChannelSearchOptionKey; query: string; init?: boolean }) => void;
  setSearchState: (value: boolean) => void;
  setSearchSuccess: (value: boolean) => void;
};

type TypedChannelListActions<T extends ChannelType> = ChannelListActions<T>;

type ChannelsReducerState = { selectedChannels: Channel[] };
type ChannelsReducerAction =
  | { type: 'HANDLE_CHECK_CHANGE'; payload: { checked: boolean; channel: Channel } }
  | { type: 'SET_SELECTED_CHANNELS'; payload: Channel[] };

function channelsReducer(state: ChannelsReducerState, action: ChannelsReducerAction) {
  switch (action.type) {
    case 'HANDLE_CHECK_CHANGE': {
      const { checked, channel } = action.payload;
      return {
        ...state,
        selectedChannels: checked
          ? [...state.selectedChannels, channel]
          : state.selectedChannels.filter((selected) => selected.channel_url !== channel.channel_url),
      };
    }
    case 'SET_SELECTED_CHANNELS':
      return {
        ...state,
        selectedChannels: action.payload,
      };
    default:
      return state;
  }
}

export const channelsInitialState = {
  selectedChannels: [],
};

const ChannelListStateContext = createContext<ChannelListState>({
  channelType: 'open_channels',
  selectedChannels: [],
  channels: [],
  next: '',
  isFetching: true,
  isFetchingLoadMore: false,
  search: { option: '' as ChannelSearchOptionKey, query: '', isSearching: false, isSuccess: false },
  current: null,
});

const ChannelListActionsContext = createContext<ChannelListActions>(undefined as any);

export const ChannelListContextsProvider: FC<Options> = ({ channelType, children }) => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const history = useHistory();
  const dispatchReduxAction = useDispatch();
  const isNCSoft = useIsNCSoft();
  const allowedChannelCustomTypes = useTypedSelector((state) => {
    return state.moderations.sdkUser?.allowed_channel_custom_types ?? [];
  });
  const { channels, search, current, next, isFetching, isFetchingLoadMore } = useShallowEqualSelector((state) => {
    const { channels, search, current, next, isFetching, isFetchingLoadMore } =
      channelType === 'open_channels' ? state.openChannels : state.groupChannels;
    return { channels, search, current, next, isFetching, isFetchingLoadMore };
  });
  const application = useTypedSelector((state) => state.applicationState.data);
  const [{ selectedChannels }, dispatch] = useReducer(channelsReducer, channelsInitialState);
  const removeSelectedChannelRef = useRef<(channel: Channel) => void>();

  const reduxActions = useMemo(() => {
    if (channelType === 'open_channels') {
      return {
        fetchChannels: chatActions.fetchOpenChannelsRequest,
        searchChannels: chatActions.searchOpenChannelsRequest,
        resetChannels: chatActions.resetOpenChannelsRequest,
        setSearchQuery: chatActions.setOpenChannelSearchQuery,
        setSearchOption: chatActions.setOpenChannelSearchOption,
        setSearchState: chatActions.setOpenChannelSearchState,
        setSearchSuccess: chatActions.setOpenChannelSearchSuccess,
      };
    }
    return {
      fetchChannels: chatActions.fetchGroupChannelsRequest,
      searchChannels: chatActions.searchGroupChannelsRequest,
      resetChannels: chatActions.resetGroupChannelsRequest,
      setSearchQuery: chatActions.setGroupChannelSearchQuery,
      setSearchOption: chatActions.setGroupChannelSearchOption,
      setSearchState: chatActions.setGroupChannelSearchState,
      setSearchSuccess: chatActions.setGroupChannelSearchSuccess,
    };
  }, [channelType]);

  const setSelectedChannels = useCallback((channels: Channel[]) => {
    dispatch({
      type: 'SET_SELECTED_CHANNELS',
      payload: channels,
    });
  }, []);

  const handleChannelSelectionChange = useCallback((channel: Channel, isSelected: boolean) => {
    dispatch({ type: 'HANDLE_CHECK_CHANGE', payload: { channel, checked: isSelected } });
  }, []);

  useEffect(() => {
    return () => {
      dispatchReduxAction(reduxActions.resetChannels());
    };
  }, [dispatchReduxAction, reduxActions]);

  useEffect(() => {
    setSelectedChannels([]);
  }, [channels, setSelectedChannels]);

  const fetchChannels = useCallback(() => {
    dispatchReduxAction(reduxActions.fetchChannels({ init: true }));
  }, [dispatchReduxAction, reduxActions]);

  const handleSearchClear = useCallback(() => {
    dispatchReduxAction(reduxActions.setSearchQuery(''));
  }, [dispatchReduxAction, reduxActions]);

  const handleSearchQueryChange = useCallback(
    (query: string) => {
      dispatchReduxAction(reduxActions.setSearchQuery(query));
    },
    [dispatchReduxAction, reduxActions],
  );

  const handleSearchOptionChange = useCallback(
    (option: ChannelSearchOption<ChannelType>) => {
      dispatchReduxAction((reduxActions.setSearchOption as Function)(option.key));
    },
    [dispatchReduxAction, reduxActions],
  );

  const loadMoreChannels = useCallback(() => {
    if (search.query) {
      dispatchReduxAction(reduxActions.searchChannels({ option: search.option, query: search.query } as any));
    } else {
      dispatchReduxAction(reduxActions.fetchChannels({ init: false }));
    }
  }, [dispatchReduxAction, reduxActions, search.option, search.query]);

  const navigateToChannel: NavigateToChannel = useCallback(
    ({ url, customType }) => {
      if (isNCSoft && channelType === 'group_channels') {
        if (!customType || !allowedChannelCustomTypes.includes(customType)) {
          toast.warning({ message: intl.formatMessage({ id: 'chat.groupChannels.toast.noAccess' }) });
          return;
        }
      }
      if (current?.channel_url !== url) {
        if (channelType === 'open_channels') {
          dispatchReduxAction(chatActions.updateOpenChannelsMessages({ messages: [], preservedMessages: [] }));
        }
        dispatchReduxAction(chatActions.goToModeration({ types: channelType, channelURL: url }));
      }
    },
    [current, dispatchReduxAction, intl, isNCSoft, allowedChannelCustomTypes, channelType],
  );

  const navigateToList = useCallback(() => {
    if (application == null) return;

    const queryString = search.option && search.query ? `?${qs.stringify({ [search.option]: search.query })}` : '';
    history.push(`/${application.app_id}/${channelType}${queryString}`);
  }, [application, channelType, history, search.option, search.query]);

  useEffect(() => {
    const removeSelectedChannel = (channel: Channel) => {
      const filteredChannels = selectedChannels.filter((selectedChannel) => {
        return selectedChannel.channel_url !== channel.channel_url;
      });
      setSelectedChannels(filteredChannels);
    };
    removeSelectedChannelRef.current = removeSelectedChannel;
  }, [selectedChannels, setSelectedChannels]);

  const editChannel = useCallback(
    (channel: Channel) => {
      showDialog({
        dialogTypes: DialogType.EditChannel,
        dialogProps: { channel, channelType },
      });
    },
    [channelType, showDialog],
  );

  const editChannelMetadata = useCallback(
    (channel: Channel) => {
      showDialog({
        dialogTypes: DialogType.ChannelMetadata,
        dialogProps: { channel, channelType },
      });
    },
    [channelType, showDialog],
  );

  const sendAdminMessage = useCallback(
    (channels: Channel[]) => {
      if (application == null) return;

      showDialog({
        dialogTypes: DialogType.AdminMessage,
        dialogProps: {
          plan: application.plan,
          channels,
          channelType,
          total: selectedChannels.length,
          removeSelectedChannelRef,
        },
      });
    },
    [application, selectedChannels.length, channelType, showDialog],
  );

  const deleteChannels = useCallback(
    (channels: Channel[]) => {
      const completeDeleteChannels = (channels: readonly Channel[]) => {
        if (application == null) return;

        setSelectedChannels([]);
        fetchChannels();
        if (current && channels.some((channel) => channel.channel_url === current?.channel_url)) {
          navigateToList();
        }
      };

      showDialog({
        dialogTypes: DialogType.DeleteChannels,
        dialogProps: {
          channelType,
          completeDeleteChannels,
          channels,
          total: selectedChannels.length,
          removeSelectedChannelRef,
        },
      });
    },
    [
      application,
      current,
      fetchChannels,
      navigateToList,
      selectedChannels.length,
      setSelectedChannels,
      channelType,
      showDialog,
    ],
  );

  const setSearchState = useCallback(
    (value: boolean) => {
      dispatchReduxAction(reduxActions.setSearchState(value));
    },
    [dispatchReduxAction, reduxActions],
  );

  const setSearchSuccess = useCallback(
    (value: boolean) => {
      dispatchReduxAction(reduxActions.setSearchSuccess(value));
    },
    [dispatchReduxAction, reduxActions],
  );

  const searchChannels: ChannelListActions['searchChannels'] = useCallback(
    (options) => {
      dispatchReduxAction(reduxActions.searchChannels(options as any));
    },
    [dispatchReduxAction, reduxActions],
  );

  return (
    <ChannelListStateContext.Provider
      value={{ channelType, selectedChannels, channels, search, current, next, isFetching, isFetchingLoadMore }}
    >
      <ChannelListActionsContext.Provider
        value={{
          setSelectedChannels,
          handleChannelSelectionChange,
          fetchChannels,
          handleSearchClear,
          handleSearchQueryChange,
          handleSearchOptionChange,
          loadMoreChannels,
          navigateToChannel,
          navigateToList,
          editChannel,
          editChannelMetadata,
          sendAdminMessage,
          deleteChannels,
          setSearchState,
          searchChannels,
          setSearchSuccess,
        }}
      >
        {children}
      </ChannelListActionsContext.Provider>
    </ChannelListStateContext.Provider>
  );
};

export const useChannelListState = <T extends ChannelType>() =>
  useContext(ChannelListStateContext) as TypedChannelListState<T>;

export const useChannelListActions = <T extends ChannelType>() =>
  useContext(ChannelListActionsContext) as TypedChannelListActions<T>;
