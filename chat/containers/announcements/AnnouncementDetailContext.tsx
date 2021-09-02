import { useCallback, useMemo, useEffect, useReducer, useContext, createContext, FC } from 'react';
import { useIntl } from 'react-intl';
import { batch } from 'react-redux';

import { toast } from 'feather';

import { fetchAnnouncement, fetchAnnouncementOpenRate, updateAnnouncement } from '@chat/api';
import { normalizeOpenRate } from '@chat/utils';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { getErrorMessage } from '@epics';
import { useAppId, useShowDialog } from '@hooks';

import { getAnnouncementErrorMessage } from './getAnnouncementErrorMessage';
import { useAnnouncementActions } from './useAnnouncementActions';
import { useAnnouncementVersion } from './useAnnouncementVersion';

type State = {
  item: AnnouncementUnknownVersion | null;
  isLoading: boolean;
  updateStatus: 'idle' | 'pending' | 'done';
  error: string | null;
  stats: Omit<FetchAnnouncementOpenRateAPIResponse, 'event_id'> | null;
  statsLoadTimestamp: number | null;
  isLoadingStats: boolean;
  statsLoadError: string | null;
  isWaitingToResume: boolean;
};

type Action =
  | { type: 'START_FETCHING' }
  | { type: 'SET_ITEM'; payload: { item: AnnouncementUnknownVersion; isWaitingToResume?: boolean } }
  | { type: 'FETCHING_ITEM_FAILED'; payload: { error: string } }
  | { type: 'FETCHING_ITEM_SETTLED' }
  | { type: 'SET_STATS'; payload: { stats: NonNullable<State['stats']>; timestamp: number } }
  | { type: 'FETCHING_STATS_FAILED'; payload: { error: string } }
  | { type: 'FETCHING_STATS_SETTLED' }
  | { type: 'UPDATE_ITEM_RESET_STATUS' }
  | { type: 'UPDATE_ITEM_START' }
  | { type: 'UPDATE_ITEM_SUCCESS' }
  | { type: 'UPDATE_ITEM_FAIL' };

type EditAnnouncementPayload =
  | EditableAnnouncementPropsV10
  | EditableAnnouncementPropsV15
  | EditableAnnouncementPropsV16;

type AnnouncementDetailActions = {
  cancel: () => void;
  stop: () => void;
  pause: () => Promise<AnnouncementUnknownVersion | undefined>;
  resume: () => Promise<AnnouncementUnknownVersion | undefined>;

  edit: (payload: EditAnnouncementPayload) => Promise<boolean>;
  reload: () => void;
  resetUpdateStatus: () => void;
};

const useCannotSaveChangesDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  return (message: string) =>
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'chat.announcements.editAnnouncement.cannotSaveChangesDialog.title' }),
        description: message,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'chat.announcements.editAnnouncement.cannotSaveChangesDialog.btn.ok' }),
        },
        isNegativeButtonHidden: true,
      },
    });
};

const AnnouncementDetailContext = createContext<{ id: string } & State>(undefined as any);
const AnnouncementDetailActionsContext = createContext<AnnouncementDetailActions>(undefined as any);

export const AnnouncementDetailContextProvider: FC<{
  id: string;
  onAnnouncementUpdated: (item: AnnouncementUnknownVersion) => void;
}> = ({ id, children, onAnnouncementUpdated }) => {
  const intl = useIntl();
  const appId = useAppId();
  const announcementVersion = useAnnouncementVersion();
  const runAnnouncementAction = useAnnouncementActions(onAnnouncementUpdated);
  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'START_FETCHING':
          return { ...state, isLoading: true, isLoadingStats: true };
        case 'SET_ITEM':
          return {
            ...state,
            item: action.payload.item,
            isWaitingToResume:
              typeof action.payload.isWaitingToResume === 'boolean'
                ? action.payload.isWaitingToResume
                : state.isWaitingToResume,
            error: null,
          };
        case 'FETCHING_ITEM_FAILED':
          return { ...state, error: action.payload.error };
        case 'FETCHING_ITEM_SETTLED':
          return { ...state, isLoading: false };
        case 'SET_STATS':
          return {
            ...state,
            stats: action.payload.stats,
            statsLoadError: null,
            statsLoadTimestamp: action.payload.timestamp,
          };
        case 'FETCHING_STATS_FAILED':
          return { ...state, statsLoadError: action.payload.error };
        case 'FETCHING_STATS_SETTLED':
          return { ...state, isLoadingStats: false };
        case 'UPDATE_ITEM_START':
          return { ...state, updateStatus: 'pending' };
        case 'UPDATE_ITEM_SUCCESS':
          return { ...state, updateStatus: 'done' };
        case 'UPDATE_ITEM_RESET_STATUS':
        case 'UPDATE_ITEM_FAIL':
          return { ...state, updateStatus: 'idle' };
        default:
          return state;
      }
    },
    {
      item: null,
      isLoading: false,
      updateStatus: 'idle',
      error: null,
      stats: null,
      isLoadingStats: false,
      statsLoadError: null,
      statsLoadTimestamp: null,
      isWaitingToResume: false,
    },
  );

  const showCannotSaveChangesDialog = useCannotSaveChangesDialog();

  const loadItem = useCallback(async () => {
    if (!announcementVersion) {
      return;
    }

    dispatch({ type: 'START_FETCHING' });
    try {
      const { data } = await fetchAnnouncement({ appId, eventId: id });
      dispatch({ type: 'SET_ITEM', payload: { item: data } });
    } catch (error) {
      dispatch({ type: 'FETCHING_ITEM_FAILED', payload: { error: getErrorMessage(error) } });
    } finally {
      dispatch({ type: 'FETCHING_ITEM_SETTLED' });
    }

    try {
      const { data } = await fetchAnnouncementOpenRate({ appId, eventId: id });
      dispatch({
        type: 'SET_STATS',
        payload: {
          stats: normalizeOpenRate(data, announcementVersion),
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      dispatch({ type: 'FETCHING_STATS_FAILED', payload: { error: getErrorMessage(error) } });
    } finally {
      dispatch({ type: 'FETCHING_STATS_SETTLED' });
    }
  }, [announcementVersion, appId, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  useEffect(() => {
    let setTimeoutID = -1;
    let isCleanedUp = false;

    const refreshAnnouncement = async () => {
      const { data } = await fetchAnnouncement({ appId, eventId: id });
      if (!isCleanedUp) {
        const isWaitingToResume = data.status === 'scheduled';

        dispatch({ type: 'SET_ITEM', payload: { item: data, isWaitingToResume } });
        // update the item on the list
        onAnnouncementUpdated(data);

        if (isWaitingToResume) {
          setTimeoutID = window.setTimeout(refreshAnnouncement, 5000);
        }
      }
    };

    if (state.isWaitingToResume) {
      // While waiting to resume, refresh the announcement every 5 seconds.
      setTimeoutID = window.setTimeout(refreshAnnouncement, 5000);
    }

    return () => {
      isCleanedUp = true;
      window.clearTimeout(setTimeoutID);
    };
  }, [appId, id, onAnnouncementUpdated, state.isWaitingToResume]);

  /**
   * The returned Promise resolves with true if it succeeds to update the announcement, or false.
   * The promise never rejects.
   */
  const edit = useCallback(
    async (payload: EditAnnouncementPayload) => {
      dispatch({ type: 'UPDATE_ITEM_START' });
      try {
        const { data } = await updateAnnouncement({ appId, id, payload });
        batch(() => {
          dispatch({ type: 'SET_ITEM', payload: { item: data } });
          dispatch({ type: 'UPDATE_ITEM_SUCCESS' });

          // update the item on the list
          onAnnouncementUpdated(data);
        });
        return true;
      } catch (error) {
        dispatch({ type: 'UPDATE_ITEM_FAIL' });

        const dialogErrorMessage = getAnnouncementErrorMessage(error, intl);
        if (dialogErrorMessage) {
          showCannotSaveChangesDialog(dialogErrorMessage);
        } else {
          toast.error({ message: getErrorMessage(error) });
        }

        return false;
      }
    },
    [appId, id, intl, onAnnouncementUpdated, showCannotSaveChangesDialog],
  );

  const cancel = useCallback(async () => {
    const updatedAnnouncement = await runAnnouncementAction(id, 'cancel');
    if (updatedAnnouncement) {
      dispatch({ type: 'SET_ITEM', payload: { item: updatedAnnouncement } });
    }
  }, [id, runAnnouncementAction]);

  const stop = useCallback(async () => {
    const updatedAnnouncement = await runAnnouncementAction(id, 'stop');
    if (updatedAnnouncement) {
      dispatch({ type: 'SET_ITEM', payload: { item: updatedAnnouncement } });
    }
  }, [id, runAnnouncementAction]);

  const pause = useCallback(async () => {
    const updatedAnnouncement = await runAnnouncementAction(id, 'pause');
    if (updatedAnnouncement) {
      dispatch({ type: 'SET_ITEM', payload: { item: updatedAnnouncement } });
    }
    return updatedAnnouncement;
  }, [id, runAnnouncementAction]);

  const resume = useCallback(async () => {
    const updatedAnnouncement = await runAnnouncementAction(id, 'resume');
    if (updatedAnnouncement) {
      dispatch({
        type: 'SET_ITEM',
        payload: {
          item: updatedAnnouncement,
          isWaitingToResume: updatedAnnouncement.status === 'scheduled',
        },
      });
    }
    return updatedAnnouncement;
  }, [id, runAnnouncementAction]);

  const resetUpdateStatus = useCallback(async () => dispatch({ type: 'UPDATE_ITEM_RESET_STATUS' }), []);

  const actions = useMemo(() => ({ cancel, stop, pause, resume, edit, reload: loadItem, resetUpdateStatus }), [
    cancel,
    edit,
    loadItem,
    pause,
    resetUpdateStatus,
    resume,
    stop,
  ]);

  return (
    <AnnouncementDetailContext.Provider value={useMemo(() => ({ id, ...state }), [id, state])}>
      <AnnouncementDetailActionsContext.Provider value={actions}>{children}</AnnouncementDetailActionsContext.Provider>
    </AnnouncementDetailContext.Provider>
  );
};

export const useAnnouncementDetailContext = () => useContext(AnnouncementDetailContext);
export const useAnnouncementDetailActionsContext = () => useContext(AnnouncementDetailActionsContext);
