import { memo, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio, InputText } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { Unsaved } from '@hooks';

enum RoutingBy {
  ALL = 'all',
  TIER = 'tier',
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RadioWrapper = styled.div`
  margin-bottom: 8px;
`;

const Input = styled(InputText)`
  width: 100%;
  padding-left: 28px;

  // Remove number arrow if it is Number type input for Chrome
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  // Remove number arrow if it is Number type input for FireFox
  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

type Props = {
  liveTicketLimit: Project['liveTicketLimit'];
  autoRoutingLimits: Project['autoRoutingLimits'];
  enableTierBasedRouting: Project['enableTierBasedRouting'];
  isUpdating: DeskStoreState['isUpdating'];

  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

type FormValues = {
  liveTicketLimit: number;
  expertTierTicketLimit: number;
  intermediateTierTicketLimit: number;
  routingBy: RoutingBy.ALL | RoutingBy.TIER;
};

export const LiveTicketLimit = memo<Props>(
  ({ liveTicketLimit, autoRoutingLimits, isUpdating, setUnsaved, updateProjectRequest, enableTierBasedRouting }) => {
    const intl = useIntl();

    const defaultExpertLimit = autoRoutingLimits['EXPERT'] ?? liveTicketLimit;
    const defaultIntermediateLimit = autoRoutingLimits['INTERMEDIATE'] ?? liveTicketLimit;

    const { formState, errors, reset, register, watch, handleSubmit } = useForm<FormValues>({
      mode: 'onChange',
      defaultValues: {
        liveTicketLimit,
        expertTierTicketLimit: defaultExpertLimit,
        intermediateTierTicketLimit: defaultIntermediateLimit,
        routingBy: enableTierBasedRouting ? RoutingBy.TIER : RoutingBy.ALL,
      },
    });

    const errorProcessor = useCallback(
      (key) => {
        return errors[key]
          ? {
              hasError: true,
              message: errors[key].message || '',
            }
          : undefined;
      },
      [errors],
    );

    const onSubmit: SubmitHandler<FormValues> = (values) => {
      const params = {
        autoRoutingLimits:
          values.routingBy === RoutingBy.TIER
            ? {
                EXPERT: values.expertTierTicketLimit,
                INTERMEDIATE: values.intermediateTierTicketLimit,
              }
            : undefined,
        liveTicketLimit: values.routingBy === RoutingBy.ALL ? values.liveTicketLimit : undefined,
        enableTierBasedRouting: values.routingBy === RoutingBy.TIER,
      };
      updateProjectRequest({
        ...params,
        onSuccess: () => reset(values),
      });
    };

    const validate: RegisterOptions = {
      validate: {
        required: (value) =>
          value.trim().length > 0 ||
          intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.error.required' }),
      },
      pattern: {
        value: /^[0-9]*$/,
        message: intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.error.number' }),
      },
      valueAsNumber: true,
    };

    useEffect(() => {
      setUnsaved(formState.isDirty);
    }, [formState.isDirty, setUnsaved]);

    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.title' })}
        titleColumns={6}
        description={intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.description' })}
        showActions={formState.isDirty}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        actions={[
          {
            key: 'cancel',
            type: 'button',
            label: intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.button.cancel' }),
            buttonType: 'tertiary',
            onClick: () => reset(),
          },
          {
            key: 'save',
            type: 'submit',
            label: intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.button.save' }),
            buttonType: 'primary',
            isLoading: isUpdating,
            disabled: isUpdating || !formState.isValid,
            form: 'autoTicketRouting',
          },
        ]}
      >
        <Form id="autoTicketRouting" onSubmit={handleSubmit(onSubmit)}>
          <RadioWrapper>
            <Radio
              ref={register}
              name="routingBy"
              role="radio"
              label={intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.routingBy.all' })}
              value="all"
            />
          </RadioWrapper>
          {watch('routingBy') === RoutingBy.ALL && (
            <Input
              data-test-id="LiveTicketLimitInput"
              ref={register(validate)}
              name="liveTicketLimit"
              defaultValue={liveTicketLimit}
              error={errorProcessor('liveTicketLimit')}
              css="margin-bottom: 8px;"
            />
          )}
          <RadioWrapper>
            <Radio
              ref={register}
              name="routingBy"
              role="radio"
              label={intl.formatMessage({ id: 'desk.settings.automation.autoTicketRouting.routingBy.tier' })}
              value="tier"
            />
          </RadioWrapper>
          {watch('routingBy') === RoutingBy.TIER && (
            <>
              <Input
                data-test-id="ExpertTierTicketLimitInput"
                ref={register(validate)}
                label={intl.formatMessage({ id: 'desk.agent.tier.expert' })}
                name="expertTierTicketLimit"
                defaultValue={defaultExpertLimit}
                error={errorProcessor('expertTierTicketLimit')}
              />
              <Input
                data-test-id="IntermediateTierTicketLimitInput"
                ref={register(validate)}
                label={intl.formatMessage({ id: 'desk.agent.tier.intermediate' })}
                name="intermediateTierTicketLimit"
                defaultValue={defaultIntermediateLimit}
                error={errorProcessor('intermediateTierTicketLimit')}
              />
            </>
          )}
        </Form>
      </SettingsGridCard>
    );
  },
);
