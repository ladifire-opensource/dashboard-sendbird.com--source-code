import { FC, useState, useRef, useMemo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';

import { toast, Tag, TagVariant } from 'feather';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { fetchSettingsForCustomChannelType } from '@core/api';
import { useSettingsGlobal } from '@core/containers/useSettingsGlobal';
import { getErrorMessage } from '@epics';
import { useAppId, useAsync, useErrorToast } from '@hooks';
import { PropOf } from '@utils';

import { ProfanityFilterForm, ProfanityFilterFormRef } from './ProfanityFilterForm';
import {
  useSettingsForCustomChannelTypeActions,
  useSettingsForCustomChannelTypes,
} from './SettingsForCustomChannelTypesContextProvider';

export const EditProfanityFilter: FC = () => {
  const intl = useIntl();
  const appId = useAppId();
  const { custom_type: customTypeParam } = useParams<{ custom_type?: string }>();
  const customType = decodeURIComponent(customTypeParam ?? '');
  const history = useHistory();
  const {
    state: { settingsGlobal, status: settingsGlobalFetchStatus, error: settingsGlobalFetchError },
    updateSettingsGlobal,
  } = useSettingsGlobal();
  const { settings } = useSettingsForCustomChannelTypes();
  const { updateSettings: updateSettingsForCustomChannelType } = useSettingsForCustomChannelTypeActions();

  const [
    { status, data: settingsForCustomChannelType, error: settingsForCustomChannelTypeFetchError },
    loadSettingsForCustomChannelType,
  ] = useAsync(
    async (custom_type: string) => {
      const { data } = await fetchSettingsForCustomChannelType({ appId, custom_type });
      return data;
    },
    [appId],
  );

  const [submitStatus, setSubmitStatus] = useState<'init' | 'pending' | 'done'>('init');
  const formRef = useRef<ProfanityFilterFormRef>(null);

  const listUrl = `/${appId}/settings/profanity-filter`;
  const isGlobalSettings = !customType;

  const channelSettings = useMemo(() => {
    if (!customType) {
      return settingsGlobalFetchStatus === 'success' ? settingsGlobal : undefined;
    }
    if (status === 'loading' || status === 'error') {
      return;
    }
    const setting = settingsForCustomChannelType || settings.find((item) => item.custom_type === customType);
    if (setting) {
      return setting;
    }
    loadSettingsForCustomChannelType(customType);
    return undefined;
  }, [
    customType,
    loadSettingsForCustomChannelType,
    settings,
    settingsForCustomChannelType,
    settingsGlobal,
    settingsGlobalFetchStatus,
    status,
  ]);

  const effectiveStatus = customType ? status : settingsGlobalFetchStatus;
  const effectiveError = customType ? settingsForCustomChannelTypeFetchError : settingsGlobalFetchError;

  useErrorToast(effectiveError);

  useEffect(() => {
    if (effectiveStatus === 'error') {
      // if it fails to load the settings to be edited, navigate back to the list
      history.push(listUrl);
    }
  }, [history, listUrl, effectiveStatus]);

  const defaultValues: PropOf<typeof ProfanityFilterForm, 'defaultValues'> = useMemo(
    () =>
      channelSettings && {
        customChannelType: channelSettings['custom_type'],
        keywords: channelSettings.profanity_filter.keywords,
        regexFilters: channelSettings.profanity_filter.regex_filters.map(({ regex }) => regex),
        type: channelSettings.profanity_filter.type,
      },
    [channelSettings],
  );

  if (channelSettings == null) {
    // wait for the global settings or the settings for the custom channel type to be loaded
    return null;
  }

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={`/${appId}/settings/profanity-filter`} />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'chat.settings.profanityFilter.edit.title' })}
          {isGlobalSettings && (
            <Tag
              variant={TagVariant.Dark}
              css={`
                display: flex; // override display: inline-flex
                margin-left: 8px;
              `}
            >
              {intl.formatMessage({
                id: 'chat.settings.profanityFilter.table.column.isGlobal.global.tag.default',
              })}
            </Tag>
          )}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <ProfanityFilterForm
        ref={formRef}
        hasCustomChannelTypeField={!isGlobalSettings}
        defaultValues={defaultValues}
        submitStatus={submitStatus}
        onCancel={() => history.push(listUrl)}
        onSubmit={async ({ customChannelType, type, keywords, regexFilters }) => {
          setSubmitStatus('pending');
          try {
            const profanity_filter = { type, keywords, regex_filters: regexFilters.map((regex) => ({ regex })) };
            const request = isGlobalSettings
              ? updateSettingsGlobal({ profanity_filter }, { throwError: true })
              : updateSettingsForCustomChannelType(customChannelType, { profanity_filter });
            await request;
            setSubmitStatus('done');

            toast.success({ message: intl.formatMessage({ id: 'chat.settings.channelSettings.noti.updated' }) });
            history.push(listUrl);
          } catch (error) {
            toast.error({ message: getErrorMessage(error) });
            setSubmitStatus('init');
          }
        }}
      />
    </AppSettingsContainer>
  );
};
