import { FC, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { toast } from 'feather';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { createSettingsForCustomChannelType } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';
import { PropOf } from '@utils';

import { ProfanityFilterForm, ProfanityFilterFormRef } from './ProfanityFilterForm';
import { useSettingsForCustomChannelTypeActions } from './SettingsForCustomChannelTypesContextProvider';

type HandleSubmit = PropOf<typeof ProfanityFilterForm, 'onSubmit'>;

export const AddProfanityFilterForCustomChannelType: FC = () => {
  const intl = useIntl();
  const appId = useAppId();
  const history = useHistory();
  const [submitStatus, setSubmitStatus] = useState<'init' | 'pending' | 'done'>('init');
  const { reload } = useSettingsForCustomChannelTypeActions();
  const formRef = useRef<ProfanityFilterFormRef>(null);

  const listUrl = `/${appId}/settings/profanity-filter`;

  const handleSubmit: HandleSubmit = async ({ customChannelType, type, keywords, regexFilters }) => {
    setSubmitStatus('pending');
    try {
      await createSettingsForCustomChannelType({
        appId,
        custom_type: customChannelType,
        profanity_filter: { type, keywords, regex_filters: regexFilters.map((regex) => ({ regex })) },
      });
      setSubmitStatus('done');

      // reload the list to show the new item
      reload();
      toast.success({ message: intl.formatMessage({ id: 'chat.settings.profanityFilter.noti.added' }) });
      history.push(listUrl);
    } catch (error) {
      if (error?.data?.code === 400202) {
        // Channel settings for the custom type already exists and we cannot create another one.
        formRef.current?.setError('customChannelType', { type: 'duplicated' });
      } else {
        toast.error({ message: getErrorMessage(error) });
      }
      setSubmitStatus('init');
    }
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={`/${appId}/settings/profanity-filter`} />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'chat.settings.profanityFilter.add.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <ProfanityFilterForm
        ref={formRef}
        hasCustomChannelTypeField={true}
        submitStatus={submitStatus}
        onCancel={() => history.push(listUrl)}
        onSubmit={handleSubmit}
      />
    </AppSettingsContainer>
  );
};
