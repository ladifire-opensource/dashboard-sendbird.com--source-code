import React, { useEffect, useCallback } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { sanitize } from 'dompurify';
import { Alert, AlertMessageAlign, AlertStatus, cssVariables, ScrollBar } from 'feather';
import { compose } from 'redux';

import { commonActions } from '@actions';
import { AuthErrorCode } from '@common/epics/authError';
import { useForm, useField } from '@hooks';
import { InputInform, FormInput, AuthFooter, FormInputSize, HistoryBackText } from '@ui/components';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxDescription,
  AuthBoxCenter,
  AuthBoxBody,
  AuthButton,
  AuthFormWrapper,
} from './components';

const ResendButton = styled.button`
  color: ${cssVariables('red-5')};
  font-weight: 600;
  background-color: transparent;
  border: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const AlertContentWithAction = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;

  p {
    flex: 1;
    margin-right: 24px;
  }
`;

const mapStateToProps = (state: RootState) => ({
  isFetching: state.auth.isFetching,
  samlSigninInitiateError: state.auth.samlSigninInitiateError,
  authenticated: state.auth.authenticated,
});

const mapDispatchToProps = {
  pushHistory: commonActions.pushHistory,
  addNotificationsRequest: commonActions.addNotificationsRequest,
  samlSigninInitiateRequest: commonActions.samlSigninInitiateRequest,
  samlSigninInitiateReset: commonActions.samlSigninInitiateReset,
  resendActivationMail: commonActions.resendActivationMail,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps & RCProps<StoreProps & ActionProps> & WrappedComponentProps;

export const SignInWithSsoConnectable: React.NamedExoticComponent<Props> = React.memo(
  ({
    authenticated,
    intl,
    isFetching,
    samlSigninInitiateError,
    samlSigninInitiateRequest,
    samlSigninInitiateReset,
    resendActivationMail,
    pushHistory,
    history: { location },
  }) => {
    const form = useForm({
      onSubmit: ({ organizationKey }) => samlSigninInitiateRequest({ slug_name: organizationKey }),
      onReset: () => samlSigninInitiateReset(),
    });

    const field = useField('organizationKey', form, {
      defaultValue: sanitize(location.query['slug_name']) || '',
      placeholder: intl.formatMessage({ id: 'common.authentication.sso.placeholder.organizationKey' }),
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage(
            { id: 'error.fieldIsRequired' },
            { field: intl.formatMessage({ id: 'common.authentication.sso.label.organizationKey' }) },
          );
        }
        return '';
      },
    });

    useEffect(() => form.setDisabled(isFetching), [form, isFetching]);

    useEffect(() => {
      if (authenticated) {
        pushHistory('/');
      }
    }, [authenticated, pushHistory]);

    const onResendButtonClick = useCallback(() => {
      if (samlSigninInitiateError && samlSigninInitiateError.data && samlSigninInitiateError.data['user_email']) {
        resendActivationMail({
          email: samlSigninInitiateError.data['user_email'],
        });
      }
    }, [samlSigninInitiateError, resendActivationMail]);

    let alertStatus: AlertStatus = AlertStatus.LIGHT;
    let alertMessage: React.ReactNode;
    if (samlSigninInitiateError) {
      switch (samlSigninInitiateError.code) {
        case AuthErrorCode.organizationSsoEnforced:
          alertStatus = AlertStatus.DANGER;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.error.ssoIsEnforced' });
          break;
        case AuthErrorCode.ssoOrganizationNotFound:
          alertStatus = AlertStatus.DANGER;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.error.samlSigninInitiateFail' });
          break;
        case AuthErrorCode.ssoUserActivationMailSent:
          alertStatus = AlertStatus.PRIMARY;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.alert.activationMailSent' });
          break;
        case AuthErrorCode.ssoUserUnactivated:
          alertStatus = AlertStatus.DANGER;
          alertMessage = (
            <AlertContentWithAction>
              <p>{intl.formatMessage({ id: 'common.authentication.sso.error.unactivatedAccount' })}</p>
              <ResendButton type="button" onClick={onResendButtonClick}>
                {intl.formatMessage({ id: 'common.authentication.button.resend' })}
              </ResendButton>
            </AlertContentWithAction>
          );
          break;
        case AuthErrorCode.ssoOrganizationJitProvisioningDisabled:
          alertStatus = AlertStatus.DANGER;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.error.jitProvisioningDisabled' });
          break;
        case AuthErrorCode.ssoUserMemberOfOtherOrganization:
          alertStatus = AlertStatus.DANGER;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.error.jitProvisioningEmailInUse' });
          break;
        case AuthErrorCode.ssoEmailAddressNotFound:
          alertStatus = AlertStatus.DANGER;
          alertMessage = intl.formatMessage({ id: 'common.authentication.sso.error.emailNotFoundInSamlResponse' });
          break;
        default:
          alertStatus = AlertStatus.DANGER;
          alertMessage = samlSigninInitiateError.message;
      }
    } else if (sanitize(location.query['activation']) === 'done') {
      alertStatus = AlertStatus.SUCCESS;
      alertMessage = intl.formatMessage({ id: 'common.authentication.sso.alert.accountActivated' });
    }

    const isAlertVisible = !!alertMessage;
    const alertStyles = alertMessage
      ? {
          CONTAINER: css`
            margin-bottom: 24px;
          `,
        }
      : undefined;

    return (
      <AuthWrapper>
        <ScrollBar>
          <AuthBox>
            <AuthTopBar />
            <AuthBoxCenter>
              <AuthBoxBody>
                <AuthBoxHeader>
                  <AuthBoxTitle>{intl.formatMessage({ id: 'common.authentication.sso.title' })}</AuthBoxTitle>
                  <AuthBoxDescription>
                    {intl.formatMessage({ id: 'common.authentication.sso.description' })}
                  </AuthBoxDescription>
                </AuthBoxHeader>
                <AuthFormWrapper>
                  <Alert
                    show={isAlertVisible}
                    status={alertStatus}
                    message={alertMessage}
                    align={AlertMessageAlign.LEFT}
                    styles={alertStyles}
                  />
                  <AuthAlready />
                  <form name="signIn" onSubmit={form.onSubmit}>
                    {/* eslint-disable */}
                    <FormInput
                      id="sso-slug-name"
                      type="text"
                      innerRef={field.ref}
                      size={FormInputSize.MEDIUM}
                      name="slug_name"
                      label={intl.formatMessage({ id: 'common.authentication.sso.label.organizationKey' })}
                      value={field.value}
                      placeholder={field.placeholder}
                      labelComponent={
                        <InputInform
                          content={intl.formatMessage({ id: 'common.authentication.sso.tooltip.organizationKey' })}
                        />
                      }
                      autoFocus={true}
                      required={true}
                      error={field.error}
                      disabled={form.disabled}
                      onChange={field.onChange}
                    />
                    {/* eslint-disable */}
                    <AuthButton
                      id="id_button_submit"
                      buttonType="primary"
                      type="submit"
                      size="large"
                      disabled={form.disabled}
                      isLoading={isFetching}
                    >
                      {intl.formatMessage({ id: 'common.authentication.button.signin' })}
                    </AuthButton>
                  </form>
                </AuthFormWrapper>
                <HistoryBackText
                  text={intl.formatMessage({ id: 'common.authentication.sso.signinWithSendbird' })}
                  href="/auth/signin"
                  onClick={form.reset}
                />
              </AuthBoxBody>
              <AuthFooter />
            </AuthBoxCenter>
          </AuthBox>
        </ScrollBar>
      </AuthWrapper>
    );
  },
);

export const SignInWithSso = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
)(SignInWithSsoConnectable);
