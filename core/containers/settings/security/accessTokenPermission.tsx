import React, { useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { useForm, useField, Radio, cssVariables, transitionDefault, Lozenge, LozengeVariant } from 'feather';
import upperFirst from 'lodash/upperFirst';

import { coreActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { SettingsRadioGridDeprecated } from '@common/containers/layout/settingsGrid/SettingsRadioGridDeprecated';
import { Product } from '@constants';
import { Unsaved, useIsCallsEnabled } from '@hooks';

const PermissionTable = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 1fr;
  grid-template-rows: auto 40px 40px 40px;
`;

const PermissionRadioWrapper = styled.div`
  display: flex;
`;

const PermissionHeader = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: -0.13px;
  color: ${cssVariables('neutral-10')};
  padding-bottom: 8px;
  padding-left: 16px;
`;

const PermissionColumn = styled.div<{ isSelected: boolean }>`
  display: flex;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  align-items: center;
  padding-left: 16px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  & + & {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  transition: 0.2s ${transitionDefault};
  transition-property: background;

  ${({ isSelected }) => (isSelected ? `background: ${cssVariables('neutral-2')};` : '')}
`;

const PermissionRecomended = styled(Lozenge)`
  margin-left: 8px;
`;

type Props = {
  application: Application;
  setUnsaved: Unsaved['setUnsaved'];
  isFetchingAccessTokenUserPolicy: SettingsState['isFetchingAccessTokenUserPolicy'];
  isEditable: boolean;

  updateAccessTokenUserPolicyRequest: typeof coreActions.updateAccessTokenUserPolicyRequest;
};

export enum AccessTokenEnum {
  READ_WRITE = '0',
  READ_ONLY = '1',
  BLOCK = '2',
}

const radioItems = [
  {
    labelIntlKey: 'core.settings.application.security.permission.radio.readWrite',
    callsKey: 'core.settings.application.security.permission.radio.calls.callNanswer',
    value: AccessTokenEnum.READ_WRITE,
  },
  {
    labelIntlKey: 'core.settings.application.security.permission.radio.readOnly',
    callsKey: 'core.settings.application.security.permission.radio.calls.callNanswer',
    value: AccessTokenEnum.READ_ONLY,
  },
  {
    labelIntlKey: 'core.settings.application.security.permission.radio.block',
    callsKey: 'core.settings.application.security.permission.radio.calls.block',
    value: AccessTokenEnum.BLOCK,
  },
];

export const AccessTokenPermission: React.FC<Props> = React.memo(
  ({ application, setUnsaved, isFetchingAccessTokenUserPolicy, isEditable, updateAccessTokenUserPolicyRequest }) => {
    const { guest_user_policy } = application;

    const isCallsEnabled = useIsCallsEnabled();

    const intl = useIntl();
    const form = useForm({
      onSubmit: ({ permission }) => {
        updateAccessTokenUserPolicyRequest({ guest_user_policy: permission, onSuccess: form.onSuccess });
      },
    });
    const field = useField('permission', form, { defaultValue: guest_user_policy.toString(), isControlled: true });

    useEffect(() => {
      setUnsaved(field.updatable);
    }, [field.updatable, setUnsaved]);

    const handleRadioChange = (type) => () => {
      field.updateValue(type);
    };

    const onSaveButtonClick = useCallback((e) => form.onSubmit(e), [form]);

    if (isCallsEnabled) {
      return (
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.settings.application.security.permission.title' })}
          description={intl.formatMessage({ id: 'core.settings.application.security.permission.desc' })}
          titleColumns={6}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
          showActions={field.updatable}
          actions={[
            {
              key: `${field.name}-cancel`,
              label: intl.formatMessage({ id: 'label.cancel' }),
              buttonType: 'tertiary',
              onClick: form.reset,
            },
            {
              key: `${field.name}-save`,
              label: intl.formatMessage({ id: 'label.save' }),
              buttonType: 'primary',
              onClick: onSaveButtonClick,
              isLoading: isFetchingAccessTokenUserPolicy,
              disabled: isFetchingAccessTokenUserPolicy || !isEditable,
            },
          ]}
        >
          <form onSubmit={form.onSubmit}>
            <PermissionTable>
              <PermissionRadioWrapper />
              <PermissionHeader>{upperFirst(Product.chat)}</PermissionHeader>
              <PermissionHeader>{upperFirst(Product.calls)}</PermissionHeader>
              {[...radioItems].reverse().map(({ labelIntlKey, callsKey, value }) => {
                const checked = field.value === value;
                return (
                  <>
                    <PermissionRadioWrapper>
                      <Radio
                        key={intl.formatMessage({ id: labelIntlKey })}
                        name={field.name}
                        checked={checked}
                        disabled={(isFetchingAccessTokenUserPolicy && !checked) || !isEditable}
                        onChange={handleRadioChange(value)}
                      />
                    </PermissionRadioWrapper>
                    <PermissionColumn isSelected={checked}>{intl.formatMessage({ id: labelIntlKey })}</PermissionColumn>
                    <PermissionColumn isSelected={checked}>
                      {intl.formatMessage({ id: callsKey })}
                      {value === AccessTokenEnum.BLOCK ? (
                        <PermissionRecomended color="neutral" variant={LozengeVariant.Dark}>
                          {intl.formatMessage({
                            id: 'core.settings.application.security.permission.radio.calls.recommended',
                          })}
                        </PermissionRecomended>
                      ) : (
                        ''
                      )}
                    </PermissionColumn>
                  </>
                );
              })}
            </PermissionTable>
          </form>
        </SettingsGridCard>
      );
    }
    return (
      <SettingsRadioGridDeprecated
        title={intl.formatMessage({ id: 'core.settings.application.security.permission.title' })}
        description={intl.formatMessage({ id: 'core.settings.application.security.permission.desc' })}
        radioItems={radioItems.map(({ labelIntlKey, value }) => ({
          label: intl.formatMessage({ id: labelIntlKey }),
          value,
        }))}
        form={form}
        field={field}
        gridItemConfig={{ subject: { alignSelf: 'start' } }}
        isFetching={isFetchingAccessTokenUserPolicy}
        isEditable={isEditable}
      />
    );
  },
);
