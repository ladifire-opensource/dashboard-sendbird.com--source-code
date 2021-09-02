import { FC, useEffect } from 'react';
import { RegisterOptions, useFormContext, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Lozenge, LozengeVariant, Dropdown, Icon, cssVariables, Subtitles, Typography } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { BotMessagesKey, DeskBotType } from '@constants';
import { InfoTooltip } from '@ui/components';
import { onDropdownChangeIgnoreNull } from '@utils';

import { useDefaultBotFormValues } from '../useDefaultBotFormValues';
import { FormattedBotMessage } from './FormattedBotMessage';

const FormattedWrapper = styled.div`
  & + & {
    margin-top: 16px;
  }
`;

const InputLabelWrapper = styled.label`
  display: flex;
  align-items: center;
  ${Typography['label-02']};

  ${Icon} {
    margin-left: 4px;
  }
`;

const FallbackCountFieldLabel = styled.div`
  margin-bottom: 12px;
  color: ${cssVariables('neutral-10')};
  ${Subtitles['subtitle-01']}
`;

const FallbackRetryTimesFieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const FallbackRetryTimesFieldSuffix = styled.div`
  margin-left: 8px;
  color: ${cssVariables('neutral-10')};
  ${Subtitles['subtitle-01']};
`;

const TimeLimitFieldLabel = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
  ${Typography['label-03']};
  font-weight: 500;
`;

const TimeLimitSecondsFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 32px;
`;

const TimeLimitFieldsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  ${Subtitles['subtitle-01']};

  > div {
    margin-right: 8px;
  }

  span {
    margin-top: 8px;
  }
`;

const TimeLimitFieldErrorMessage = styled.div`
  margin-top: 4px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
  font-size: 12px;
`;

export const DeskBotFallbackMessageSetting: FC = () => {
  const intl = useIntl();
  const { errors, control, getValues, watch, trigger } = useFormContext<BotFormValues>();
  const defaultValues = useDefaultBotFormValues(DeskBotType.CUSTOMIZED);

  const timeLimitMinutes = watch('timeLimitMinutes');

  useEffect(() => {
    trigger('timeLimitSeconds');
  }, [timeLimitMinutes, trigger]);

  const serverErrorMessageValidationOptions: RegisterOptions = {
    required: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.fallback.serverMessage.input.error.required',
    }),
    maxLength: {
      value: 254,
      message: intl.formatMessage({
        id: 'desk.settings.bots.detail.form.message.fallback.serverMessage.input.error.maxLength',
      }),
    },
  };

  const timeoutMessageValidationOptions: RegisterOptions = {
    required: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.fallback.timeoutMessage.input.error.required',
    }),
    maxLength: {
      value: 254,
      message: intl.formatMessage({
        id: 'desk.settings.bots.detail.form.message.fallback.timeoutMessage.input.error.maxLength',
      }),
    },
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.desc' })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <FallbackCountFieldLabel>
        {intl.formatMessage(
          { id: 'desk.settings.bots.detail.form.message.fallback.count.label' },
          {
            pending: (
              <Lozenge
                variant={LozengeVariant.Light}
                color="red"
                css={css`
                  display: inline-block;
                `}
              >
                {intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.count.label.tag' })}
              </Lozenge>
            ),
          },
        )}
      </FallbackCountFieldLabel>
      <FallbackRetryTimesFieldWrapper data-test-id="fallbackRetryLimit">
        <Controller
          control={control}
          name="fallbackRetryLimit"
          defaultValue={defaultValues.fallbackRetryLimit}
          render={({ onChange, value, ref }) => {
            return (
              <Dropdown<number>
                ref={ref}
                selectedItem={value}
                onChange={onDropdownChangeIgnoreNull(onChange)}
                items={Array.from({ length: 5 }).map((_, index) => index + 1)}
                width={156}
              />
            );
          }}
        />
        <FallbackRetryTimesFieldSuffix>
          {intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.count.input.suffix' })}
        </FallbackRetryTimesFieldSuffix>
      </FallbackRetryTimesFieldWrapper>
      <FormattedWrapper>
        <InputLabelWrapper>
          {intl.formatMessage({
            id: 'desk.settings.bots.detail.form.message.fallback.serverMessage.input.label',
          })}
          <InfoTooltip
            content={intl.formatMessage({
              id: 'desk.settings.bots.detail.form.message.fallback.serverMessage.input.tooltip',
            })}
          />
        </InputLabelWrapper>
        <FormattedBotMessage
          name="serverErrorMessage"
          defaultValue={defaultValues.serverErrorMessage ?? ''}
          registerOptions={serverErrorMessageValidationOptions}
          tags={[BotMessagesKey.TICKET_NAME, BotMessagesKey.CUSTOMER_NAME]}
        />
      </FormattedWrapper>
      <FormattedWrapper>
        <InputLabelWrapper>
          {intl.formatMessage({
            id: 'desk.settings.bots.detail.form.message.fallback.timeoutMessage.input.label',
          })}
          <InfoTooltip
            content={intl.formatMessage({
              id: 'desk.settings.bots.detail.form.message.fallback.timeoutMessage.input.tooltip',
            })}
          />
        </InputLabelWrapper>
        <FormattedBotMessage
          name="timeoutMessage"
          defaultValue={defaultValues.timeoutMessage ?? ''}
          registerOptions={timeoutMessageValidationOptions}
          tags={[BotMessagesKey.TICKET_NAME, BotMessagesKey.CUSTOMER_NAME]}
        />
      </FormattedWrapper>
      <TimeLimitFieldLabel>
        {intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.timeLimit.label' })}
      </TimeLimitFieldLabel>
      <TimeLimitFieldsWrapper data-test-id="timeLimitMinutes">
        <Controller
          control={control}
          name="timeLimitMinutes"
          defaultValue={defaultValues.timeLimitMinutes}
          render={({ onChange, value, ref }) => {
            return (
              <Dropdown<number>
                ref={ref}
                selectedItem={value}
                items={Array.from({ length: 6 }, (_, index) => index)}
                onChange={onDropdownChangeIgnoreNull(onChange)}
                width={156}
              />
            );
          }}
        />
        <span>{intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.timeLimit.minutes' })}</span>
        <TimeLimitSecondsFieldWrapper data-test-id="timeLimitSeconds">
          <Controller
            control={control}
            name="timeLimitSeconds"
            defaultValue={defaultValues.timeLimitSeconds}
            rules={{
              validate: {
                limit: (seconds) => {
                  if (getValues('timeLimitMinutes') === 5 && seconds > 0) {
                    return intl.formatMessage({
                      id: 'desk.settings.bots.detail.form.message.fallback.timeLimit.seconds.error.limit',
                    });
                  }
                  return true;
                },
              },
            }}
            render={({ onChange, value, ref }) => {
              return (
                <Dropdown<number>
                  ref={ref}
                  selectedItem={value}
                  items={Array.from({ length: 6 }, (_, index) => index * 10)}
                  onChange={onDropdownChangeIgnoreNull(onChange)}
                  hasError={!!errors.timeLimitSeconds}
                  width={156}
                />
              );
            }}
          />
          {errors.timeLimitSeconds && (
            <TimeLimitFieldErrorMessage>{errors.timeLimitSeconds.message}</TimeLimitFieldErrorMessage>
          )}
        </TimeLimitSecondsFieldWrapper>
        <span>{intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.fallback.timeLimit.seconds' })}</span>
      </TimeLimitFieldsWrapper>
    </SettingsGridCard>
  );
};
