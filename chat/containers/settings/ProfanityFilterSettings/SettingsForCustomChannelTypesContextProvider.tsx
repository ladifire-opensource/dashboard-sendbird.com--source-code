import { FC, createContext, useEffect, useState, useContext, useCallback } from 'react';

import { fetchSettingsForCustomChannelTypes, updateSettingsForCustomChannelType } from '@core/api';
import { useAppId, useAsync, useErrorToast } from '@hooks';

const SettingsForCustomChannelTypesContext = createContext<{
  settings: ChannelSettingsForCustomChannelType[];
  hasNext: boolean;
  status: 'init' | 'loading' | 'error' | 'success';
}>(undefined as any);

const SettingsForCustomChannelTypeActionsContext = createContext<{
  reload();
  loadMore();
  updateSettings(customType: string, updates: Partial<ChannelSettings>);
}>(undefined as any);

export const SettingsForCustomChannelTypesContextProvider: FC = ({ children }) => {
  const appId = useAppId();
  const [customChannelTypeSettings, setCustomChannelTypeSettings] = useState<ChannelSettingsForCustomChannelType[]>([]);

  const [fetchState, loadSettingsForCustomChannelTypes] = useAsync(
    async (token: string | null) => {
      const { data } = await fetchSettingsForCustomChannelTypes({ appId, token: token || undefined });
      return { ...data, token };
    },
    [appId],
  );

  useEffect(() => {
    loadSettingsForCustomChannelTypes(null);
  }, [loadSettingsForCustomChannelTypes]);

  useEffect(() => {
    if (!fetchState.data) {
      return;
    }
    const { token, channel_custom_type_settings } = fetchState.data;
    if (token) {
      // the data is from the response of a load more request.
      setCustomChannelTypeSettings((currentItems) => currentItems.concat(channel_custom_type_settings));
    } else {
      setCustomChannelTypeSettings(channel_custom_type_settings);
    }
  }, [fetchState.data]);

  useErrorToast(fetchState.error);

  const reload = useCallback(() => loadSettingsForCustomChannelTypes(null), [loadSettingsForCustomChannelTypes]);

  const loadMore = useCallback(() => loadSettingsForCustomChannelTypes(fetchState.data?.next ?? null), [
    fetchState.data,
    loadSettingsForCustomChannelTypes,
  ]);

  const updateSettings = useCallback(
    async (customChannelType: string, updates: Partial<ChannelSettings>) => {
      // Note that Promise rejection must be handled from where this function is called.
      const { data: updatedSettings } = await updateSettingsForCustomChannelType({
        appId,
        custom_type: customChannelType,
        ...updates,
      });

      setCustomChannelTypeSettings((settings) => {
        const targetSettingsIndex = settings.findIndex((item) => item.custom_type === updatedSettings.custom_type);
        if (targetSettingsIndex > -1) {
          const newSettings = [...settings];
          newSettings[targetSettingsIndex] = updatedSettings;
          return newSettings;
        }
        return settings;
      });
    },
    [appId],
  );

  return (
    <SettingsForCustomChannelTypesContext.Provider
      value={{
        settings: customChannelTypeSettings,
        hasNext: !!fetchState.data?.next,
        status: fetchState.status,
      }}
    >
      <SettingsForCustomChannelTypeActionsContext.Provider value={{ loadMore, reload, updateSettings }}>
        {children}
      </SettingsForCustomChannelTypeActionsContext.Provider>
    </SettingsForCustomChannelTypesContext.Provider>
  );
};

export const useSettingsForCustomChannelTypes = () => useContext(SettingsForCustomChannelTypesContext);
export const useSettingsForCustomChannelTypeActions = () => useContext(SettingsForCustomChannelTypeActionsContext);
