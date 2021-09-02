import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import cidrRegex from 'cidr-regex';
import {
  Button,
  cssVariables,
  InputText,
  Subtitles,
  Body,
  ContextualHelp,
  Toggle,
  IconButton,
  ToggleProps,
  InlineNotification,
  Link,
  LinkVariant,
} from 'feather';
import ipRegex from 'ip-regex';
import isEqual from 'lodash/isEqual';

import { commonActions } from '@actions';
import { setLoginIPRanges } from '@common/api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsCardGroup, SettingsGridCard } from '@common/containers/layout';
import { useAuthorization, useTypedSelector, useAsync, useShowDialog } from '@hooks';
import { Tooltip } from '@ui/components';

const IPInputAction = styled.div``;

const IPRow = styled.div`
  padding: 4px 8px 4px 16px;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-2')};
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  display: flex;
  align-items: center;
  ${IPInputAction} {
    margin-left: auto;
  }
`;

const IPRows = styled.div`
  margin-top: 8px;
  flex: 1;
  ${IPRow} + ${IPRow} {
    margin-top: 8px;
  }
`;

const IPInputWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px;
  grid-column-gap: 8px;
`;

const AllowAccessInformation = styled.div`
  h3 {
    ${Subtitles['subtitle-01']};
    font-size: 14px;
  }
  p {
    margin-top: 8px;
    ${Body['body-short-01']};
  }
`;

const AllowAccess = styled.div<{ $disabled: boolean }>`
  margin-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding: 24px 0 0 0;
  display: grid;
  grid-template-columns: 1fr 40px;
  grid-column-gap: 32px;
  align-items: flex-start;
  ${({ $disabled }) => {
    if ($disabled) {
      return css`
        ${AllowAccessInformation} > h3,
        ${AllowAccessInformation} > p {
          color: ${cssVariables('neutral-5')};
        }
      `;
    }
  }}
`;

const useSetLoginIPRanges = () => {
  const dispatch = useDispatch();
  const [{ data, status }, update] = useAsync((payload: SetLoginIPRangesPayload) => setLoginIPRanges(payload), []);

  useEffect(() => {
    if (data) {
      dispatch(commonActions.updateOrganizationSuccess(data?.data.organization));
    }
  }, [dispatch, data]);
  return {
    loading: status === 'loading',
    update,
  };
};

export const LoginIPRestriction = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const organization = useTypedSelector((state) => state.organizations.current);
  const { isPermitted } = useAuthorization();
  const { register, handleSubmit, errors, reset } = useForm({
    defaultValues: {
      ipAddress: '',
    },
  });
  const [ipAddresses, setIpAddresses] = useState<string[]>(organization.login_cidr_list as string[]);
  const [allowAccess, setAllowAccess] = useState(organization.ignore_cidr_on_two_factor_authentication);

  const { loading, update } = useSetLoginIPRanges();

  const onSubmit = ({ ipAddress }) => {
    setIpAddresses([...ipAddresses, ipAddress]);
    reset({ ipAddress: '' });
  };

  const deleteIP = (ipAddress) => () => {
    const newAddresses = ipAddresses.filter((ip) => ip !== ipAddress);
    if (newAddresses.length === 0) {
      setAllowAccess(false);
    }
    setIpAddresses(newAddresses);
  };

  const onAllowAccessChange: ToggleProps['onChange'] = (checked) => {
    if (!checked) {
      setAllowAccess(checked);
      return;
    }
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: intl.formatMessage({
          id: 'common.settings.security.loginRestriction.allowAccess.confirmDialog.title',
        }),
        description: intl.formatMessage({
          id: 'common.settings.security.loginRestriction.allowAccess.confirmDialog.description',
        }),
        confirmText: intl.formatMessage({
          id: 'common.settings.security.loginRestriction.allowAccess.confirmDialog.ok',
        }),
        onConfirm: () => {
          setAllowAccess(checked);
        },
      },
    });
  };

  const isFormChanged =
    !isEqual(organization.login_cidr_list, ipAddresses) ||
    !isEqual(organization.ignore_cidr_on_two_factor_authentication, allowAccess);

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

  const handleConfirmChange = () => {
    update({
      loginIPRanges: ipAddresses,
      ignore_cidr_on_two_factor_authentication: allowAccess,
    });
  };

  const allowAccessDisabled = ipAddresses.length === 0 || !isPermitted(['organization.security.all']);

  return (
    <SettingsCardGroup>
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.security.loginRestriction.title' })}
        description={intl.formatMessage({ id: 'common.settings.security.loginRestriction.desc' })}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        actions={[
          {
            key: 'confirmChange',
            label: intl.formatMessage({ id: 'common.settings.security.loginRestriction.button.save' }),
            buttonType: 'primary',
            type: 'submit',
            disabled: !isFormChanged || loading,
            isLoading: loading,
            onClick: handleConfirmChange,
          },
        ]}
        showActions={isFormChanged}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <IPInputWrapper>
            <InputText
              ref={register({
                validate: (value: string) => {
                  if (ipAddresses.includes(value)) {
                    return intl.formatMessage({
                      id: 'common.settings.security.loginRestriction.error.alreadyExistsIP',
                    });
                  }
                  return (
                    [ipRegex.v4({ exact: true }), cidrRegex.v4({ exact: true })].some((regex) => regex.test(value)) ||
                    intl.formatMessage({ id: 'common.settings.security.loginRestriction.error.invalidIP' })
                  );
                },
              })}
              name="ipAddress"
              placeholder={intl.formatMessage({ id: 'common.settings.security.loginRestriction.ph' })}
              error={errorProcessor('ipAddress')}
              disabled={!isPermitted(['organization.security.all'])}
              data-test-id="IPAddressInput"
            />
            <IPInputAction>
              <Button buttonType="primary" type="submit" disabled={!isPermitted(['organization.security.all'])}>
                {intl.formatMessage({ id: 'common.settings.security.loginRestriction.allowAccess.add' })}
              </Button>
            </IPInputAction>
          </IPInputWrapper>
        </form>
        <InlineNotification
          type="warning"
          message={intl.formatMessage(
            { id: 'common.settings.security.loginRestriction.warning' },
            {
              a: (text) => {
                return (
                  <Link
                    role="button"
                    variant={LinkVariant.Inline}
                    onClick={() =>
                      showDialog({
                        dialogTypes: DialogType.IPRestrictionGuide,
                      })
                    }
                  >
                    {text}
                  </Link>
                );
              },
            },
          )}
          css={css`
            margin-top: 24px;
          `}
        />
        <IPRows>
          {ipAddresses.map((item) => (
            <IPRow key={`ipRowItem_${item}`}>
              {item}
              <IPInputAction>
                <Tooltip
                  offset="0, 6"
                  placement="bottom"
                  target={<IconButton buttonType="tertiary" size="small" icon="delete" onClick={deleteIP(item)} />}
                  content={intl.formatMessage({ id: 'common.settings.security.loginRestriction.deleteIP' })}
                />
              </IPInputAction>
            </IPRow>
          ))}
        </IPRows>
        <AllowAccess $disabled={allowAccessDisabled}>
          <AllowAccessInformation>
            <h3>{intl.formatMessage({ id: 'common.settings.security.loginRestriction.allowAccess.title' })}</h3>
            <p>{intl.formatMessage({ id: 'common.settings.security.loginRestriction.allowAccess.description' })}</p>
          </AllowAccessInformation>
          {allowAccessDisabled ? (
            <ContextualHelp
              placement="bottom-end"
              content={intl.formatMessage({
                id: 'common.settings.security.loginRestriction.allowAccess.disabled.tooltip',
              })}
              popperProps={{ positionFixed: true, modifiers: { offset: { offset: '0, 6' } } }}
              tooltipContentStyle={css`
                width: 256px;
              `}
            >
              <Toggle onChange={onAllowAccessChange} checked={ipAddresses.length > 0 && allowAccess} disabled={true} />
            </ContextualHelp>
          ) : (
            <Toggle onChange={onAllowAccessChange} checked={allowAccess} />
          )}
        </AllowAccess>
      </SettingsGridCard>
    </SettingsCardGroup>
  );
};
