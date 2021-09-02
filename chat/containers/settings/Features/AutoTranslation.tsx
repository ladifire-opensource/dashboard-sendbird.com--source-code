import { useState, useEffect, FC, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Dropdown, toast } from 'feather';

import { SettingsGridCard } from '@common/containers/layout';
import { fetchTranslationSetting, updateTranslationSetting } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAsync } from '@hooks';

const Wrapper = styled.div`
  margin-bottom: 32px;
`;

type EngineItem = {
  label: string;
  value: 'google' | 'bing';
};

const engineItems: EngineItem[] = [
  {
    label: 'Google translate',
    value: 'google',
  },
  {
    label: 'Microsoft translator',
    value: 'bing',
  },
];

const useTranslationVendorAPI = () => {
  const application = useSelector((state: RootState) => state.applicationState.data);

  const [{ status, data }, load] = useAsync(async () => {
    return fetchTranslationSetting({ appId: application?.app_id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [{ status: updateStatus, data: updateData, error: updateError }, update] = useAsync(
    async (translation_vendor) => {
      return await updateTranslationSetting({
        appId: application?.app_id,
        payload: {
          translation_vendor,
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (updateError) {
      toast.error({ message: getErrorMessage(updateError) });
    }
  }, [updateError]);

  const translationVendor = updateData?.data.translation_vendor || data?.data.translation_vendor;

  return {
    fetchStatus: status,
    isUpdating: updateStatus === 'loading',
    original: translationVendor,
    update,
  };
};

type Props = {
  isDisabled: ComponentProps<typeof SettingsGridCard>['isDisabled'];
};

export const AutoTranslation: FC<Props> = ({ isDisabled }) => {
  const intl = useIntl();

  const { fetchStatus, isUpdating, original, update } = useTranslationVendorAPI();

  const [translationVendor, setTranslationVendor] = useState<EngineItem>(engineItems[0]);

  useEffect(() => {
    const found = engineItems.find((item) => item.value === original);
    if (found) {
      setTranslationVendor(found);
    }
  }, [original]);

  const handleSubmit = () => {
    try {
      update(translationVendor.value);
      toast.success({ message: intl.formatMessage({ id: 'common.changesSaved' }) });
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    }
  };

  const handleItemSelected = (item) => {
    setTranslationVendor(item);
  };

  return (
    <Wrapper>
      <SettingsGridCard
        title={intl.formatMessage({ id: 'chat.settings.features.autoTranslation.title' })}
        description={intl.formatMessage({ id: 'chat.settings.features.autoTranslation.description' })}
        showActions={fetchStatus === 'success' && translationVendor.value !== original}
        actions={[
          {
            key: 'autoTranslation_cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: () => setTranslationVendor(original),
          },
          {
            key: 'autoTranslation_save',
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: handleSubmit,
            isLoading: isUpdating,
            disabled: isUpdating,
          },
        ]}
        isDisabled={isDisabled}
      >
        <Dropdown<EngineItem>
          disabled={isDisabled}
          items={engineItems}
          selectedItem={translationVendor}
          onItemSelected={handleItemSelected}
          itemToString={(item) => item.label}
          width="100%"
        />
      </SettingsGridCard>
    </Wrapper>
  );
};
