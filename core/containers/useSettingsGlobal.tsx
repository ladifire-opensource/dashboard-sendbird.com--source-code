import { FC, useContext, createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';

import { toast } from 'feather';

import { fetchSettingsGlobal, updateSettingsGlobal } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAsync, useAppId } from '@hooks';
import {
  ImageModerationTypeEnum,
  ProfanityTriggeredModerationActionEnum,
  DomainFilterTypeEnum,
  ProfanityFilterTypeEnum,
} from '@interfaces/core/ChannelSettingsEnums';
import { RecursivePartial } from '@utils';

type State = {
  settingsGlobal: ChannelSettings;
  status: 'init' | 'loading' | 'success' | 'error';
  error: string | null;
  updateRequest: {
    status: 'init' | 'loading' | 'success' | 'error';
    error: string | null;
  };
};

type SettingsGlobalContextValue = {
  state: State;
  reloadSettingsGlobal: () => void;
  /**
   * @param updates
   * @param options If passed, onSuccess function will be called when the request succeeds. A success message will be
   * shown as a toast if showSuccessToast is true. An error will be thrown if throwError is true, or the error will be
   * shown as a toast message and won't be thrown.
   */
  updateSettingsGlobal: (
    updates: RecursivePartial<ChannelSettings>,
    options?: { onSuccess?: () => void; showSuccessToast?: boolean; throwError?: boolean },
  ) => void;
};

export const initialSettings: ChannelSettings = {
  domain_filter: {
    domains: [],
    type: DomainFilterTypeEnum.none,
  },
  profanity_filter: {
    keywords: '',
    regex_filters: [],
    type: ProfanityFilterTypeEnum.none,
  },
  max_message_length: -1,
  display_past_message: false,
  text_moderation: {
    languages: [],
    requestedAttributes: {
      TOXICITY: [],
    },
    moderationLevel: 0,
    doNotStore: true,
  },
  image_moderation: {
    type: ImageModerationTypeEnum.none,
    soft_block: false,
    limits: {
      adult: 0,
      spoof: 0,
      medical: 0,
      violence: 0,
      racy: 0,
    },
    check_urls: false,
  },
  allow_links: false,
  user_messages_per_channel_duration: 1,
  user_messages_per_channel: -1,
  profanity_triggered_moderation: {
    count: 0,
    duration: 1, // max 86400  **(Default: 1)
    action: ProfanityTriggeredModerationActionEnum.noAction,
  },
  message_retention_hours: 2400,
};

const SettingsGlobalContext = createContext<SettingsGlobalContextValue>({
  state: {
    settingsGlobal: initialSettings,
    status: 'init',
    error: null,
    updateRequest: { status: 'init', error: null },
  },
  reloadSettingsGlobal: () => {},
  updateSettingsGlobal: () => {},
});

export const SettingsGlobalContextProvider: FC = ({ children }) => {
  const appId = useAppId();
  const intl = useIntl();
  const [settingsGlobal, setSettingsGlobal] = useState<ChannelSettings>(initialSettings);
  const [{ status, error }, reloadSettings] = useAsync(async () => {
    const { data } = await fetchSettingsGlobal({ appId });
    setSettingsGlobal(data);
  }, [appId]);

  const [updateState, setUpdateState] = useState<{
    status: 'init' | 'loading' | 'success' | 'error';
    error: string | null;
  }>({ status: 'init', error: null });

  const updateSettings: SettingsGlobalContextValue['updateSettingsGlobal'] = useCallback(
    async (updates: RecursivePartial<ChannelSettings>, options) => {
      setUpdateState((currentState) => ({ ...currentState, status: 'loading' }));
      try {
        const response = await updateSettingsGlobal({ appId, payload: updates });
        options?.onSuccess?.();
        setSettingsGlobal(response.data);
        setUpdateState((currentState) => ({ ...currentState, status: 'success', error: null }));

        if (options?.showSuccessToast) {
          toast.success({ message: intl.formatMessage({ id: 'chat.settings.channelSettings.noti.updated' }) });
        }

        return response.data;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setUpdateState((currentState) => ({ ...currentState, status: 'error', error: errorMessage }));
        if (options?.throwError) {
          throw error;
        }
        toast.error({ message: errorMessage });
      }
    },
    [appId, intl],
  );

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  const contextValue = useMemo(
    () => ({
      state: {
        status,
        error: error && getErrorMessage(error),
        settingsGlobal,
        updateRequest: { status: updateState.status, error: updateState.error },
      },
      reloadSettingsGlobal: reloadSettings,
      updateSettingsGlobal: updateSettings,
    }),
    [error, reloadSettings, settingsGlobal, status, updateSettings, updateState.error, updateState.status],
  );

  return <SettingsGlobalContext.Provider value={contextValue}>{children}</SettingsGlobalContext.Provider>;
};

export const useSettingsGlobal = () => useContext(SettingsGlobalContext);
