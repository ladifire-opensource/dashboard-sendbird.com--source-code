import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Radio, Spinner, toast } from 'feather';

import { fetchUsageAlertEmail, updateUsageAlertEmail } from '@common/api';
import { SettingsGridCard, SettingsCardGroup } from '@common/containers/layout';
import { getErrorMessage } from '@epics';
import { useAsync } from '@hooks';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const useUsageAlertAPI = () => {
  const uid = useSelector((state: RootState) => state.organizations.current.uid);

  const [{ data: fetchResponse, status: fetchStatus }, fetch] = useAsync(async () => {
    return await fetchUsageAlertEmail(uid);
  }, [uid]);

  const [{ data: updateResponse, status: updateStatus, error: updateError }, update] = useAsync(
    async (payload) => {
      return await updateUsageAlertEmail(uid, payload);
    },
    [uid],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (updateError) {
      toast.error({ message: getErrorMessage(updateError) });
    }
  }, [updateError]);

  return {
    isFetching: fetchStatus === 'loading',
    fetchStatus,
    isLoading: updateStatus === 'loading',
    update,
    data: fetchResponse?.data ?? null,
    updated: updateResponse?.data ?? null,
  };
};

export const EmailAlert = () => {
  const intl = useIntl();
  const { isFetching, fetchStatus, isLoading, update, data } = useUsageAlertAPI();

  const { formState, handleSubmit, register, reset } = useForm<{ usage_alert_email: UsageAlertEmail }>({
    mode: 'onChange',
  });

  useEffect(() => {
    if (fetchStatus === 'success' && data) {
      reset({ usage_alert_email: data.usage_alert_email });
    }
  }, [data, fetchStatus, isFetching, reset]);

  const resetForm = () => {
    reset();
  };

  const onSubmit = (data) => {
    try {
      update(data);
      toast.success({ message: intl.formatMessage({ id: 'common.settings.usage.emailAlerts.toast.success' }) });
      reset(data);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
      reset();
    }
  };

  return (
    <SettingsCardGroup>
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.usage.emailAlerts.title' })}
        description={intl.formatMessage({ id: 'common.settings.usage.emailAlerts.description' })}
        showActions={formState.isDirty}
        actions={[
          {
            key: `default-cancel`,
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: resetForm,
          },
          {
            key: `default-save`,
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: handleSubmit(onSubmit),
            isLoading,
            disabled: isLoading,
          },
        ]}
      >
        {isFetching || !data ? (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Wrapper>
              <Radio
                ref={register}
                name="usage_alert_email"
                label={intl.formatMessage({ id: 'common.settings.usage.emailAlerts.options.ownerOnly' })}
                value="OWNER_ONLY"
              />
              <Radio
                ref={register}
                name="usage_alert_email"
                label={intl.formatMessage({ id: 'common.settings.usage.emailAlerts.options.ownerAdmin' })}
                value="OWNER_ADMIN"
              />
              {/* <Radio
                ref={register}
                name="usage_alert_email"
                label={intl.formatMessage({ id: 'common.settings.usage.emailAlerts.options.all' })}
                value="ALL"
              /> */}
            </Wrapper>
          </form>
        )}
      </SettingsGridCard>
    </SettingsCardGroup>
  );
};
