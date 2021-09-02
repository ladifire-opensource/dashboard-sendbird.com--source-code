import { memo, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Toggle, InputTextarea } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { Unsaved } from '@hooks';

type FormValues = {
  customerSatisfactionEnabled: boolean;
  customerSatisfactionMessage: string;
  customerSatisfactionRatedMessage: string;
};

type Props = {
  desk: DeskStoreState;
  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;

  > button {
    min-width: 40px;
    margin-right: 24px;
  }
`;

const ToggleFooter = styled.div`
  margin-top: 16px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 16px;
`;

export const Satisfaction = memo<Props>(({ desk, setUnsaved, updateProjectRequest }) => {
  const intl = useIntl();
  const { customerSatisfactionEnabled, customerSatisfactionMessage, customerSatisfactionRatedMessage } = desk.project;
  const { formState, control, errors, reset, register, watch, handleSubmit } = useForm({
    mode: 'onChange',
    defaultValues: {
      customerSatisfactionEnabled,
      customerSatisfactionMessage,
      customerSatisfactionRatedMessage,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    updateProjectRequest({ ...values, onSuccess: () => reset(values) });
  };

  useEffect(() => {
    setUnsaved(formState.isDirty);
  }, [formState.isDirty, setUnsaved]);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.automation.satisfaction.title' })}
      description={intl.formatMessage({ id: 'desk.settings.automation.satisfaction.desc' })}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
      showActions={formState.isDirty}
      actions={[
        {
          key: 'cancel',
          type: 'button',
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: () => reset(),
        },
        {
          key: 'save',
          type: 'submit',
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          isLoading: desk.isUpdating,
          disabled: desk.isUpdating || Object.keys(errors).length > 0,
          form: 'satisfaction',
        },
      ]}
    >
      <form id="satisfaction" onSubmit={handleSubmit(onSubmit)}>
        <ToggleContainer>
          <Controller
            name="customerSatisfactionEnabled"
            control={control}
            defaultValue={customerSatisfactionEnabled}
            render={({ onChange, onBlur, value, name, ref }) => {
              return <Toggle ref={ref} name={name} checked={value} onChange={onChange} onBlur={onBlur} />;
            }}
          />
        </ToggleContainer>
        <ToggleFooter>
          <InputTextarea
            ref={register({
              required: intl.formatMessage({ id: 'desk.settings.automation.satisfaction.rating.error.required' }),
            })}
            name="customerSatisfactionMessage"
            label={intl.formatMessage({ id: 'desk.settings.automation.satisfaction.rating.title' })}
            disabled={!watch('customerSatisfactionEnabled')}
            error={{
              hasError: !!errors.customerSatisfactionMessage,
              message: (errors.customerSatisfactionMessage?.message as string) ?? '',
            }}
          />
          <InputTextarea
            ref={register({
              required: intl.formatMessage({ id: 'desk.settings.automation.satisfaction.completion.error.required' }),
            })}
            name="customerSatisfactionRatedMessage"
            label={intl.formatMessage({ id: 'desk.settings.automation.satisfaction.completion.title' })}
            disabled={!watch('customerSatisfactionEnabled')}
            error={{
              hasError: !!errors.customerSatisfactionRatedMessage,
              message: (errors.customerSatisfactionRatedMessage?.message as string) ?? '',
            }}
          />
        </ToggleFooter>
      </form>
    </SettingsGridCard>
  );
});
