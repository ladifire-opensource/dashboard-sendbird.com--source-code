import { FC, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { css } from 'styled-components';

import { sanitize } from 'dompurify';
import { Alert, AlertMessageAlign, AlertStatus, toast, InputText } from 'feather';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import qs from 'qs';

import { commonActions } from '@actions';
import { useGoogleOneTap } from '@hooks/useGoogleOneTap';
import { GoogleLoginButton, AuthFooter } from '@ui/components';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxCenter,
  AuthBoxBody,
  AuthBoxOptions,
  AuthBoxOption,
  AuthBoxOptionLink,
  AuthButton,
  SocialDivider,
  SocialDividerText,
  AuthFormWrapper,
} from './components';

export const SignIn: FC = () => {
  useGoogleOneTap();
  const intl = useIntl();
  const history = useHistory<{ isVerifyingEmail: boolean } | undefined>();
  const { isFetching, authenticated, alert } = useSelector((state: RootState) => ({
    isFetching: state.auth.isFetching,
    alert: state.alert,
    authenticated: state.auth.authenticated,
  }));
  const dispatch = useDispatch();
  const { register, handleSubmit, errors } = useForm({ mode: 'onChange' });

  useEffect(() => {
    dispatch(
      commonActions.initAlert({
        status: AlertStatus.DANGER,
        message: intl.formatMessage({ id: 'common.authentication.signin.error.failed' }),
      }),
    );

    const { location } = history;
    const query = qs.parse(location.search.slice(1));

    if (query.error && query.error === 'social_already_exist') {
      toast.warning({
        message: intl.formatMessage({ id: 'common.authentication.error.alreadyExistWithProvider' }),
      });
    } else if (query.error && query.error !== 'social_already_exist') {
      toast.warning({
        message: sanitize(query.error),
      });
    }
  }, [history]);

  useEffect(() => {
    if (authenticated) {
      dispatch(commonActions.pushHistory('/'));
    }
  }, [authenticated]);

  const onSubmit = (data) => {
    const email = trim(data.email).toLowerCase();
    const { password } = data;
    if (isEmpty(errors)) {
      if (alert.show) {
        dispatch(commonActions.hideAlert());
      }

      const { next = '' } = qs.parse(location.search.slice(1));
      dispatch(
        commonActions.signinRequest({
          email,
          password,
          next,
        }),
      );
      return;
    }
    dispatch(
      commonActions.showAlert({ message: intl.formatMessage({ id: 'common.authentication.signin.error.failed' }) }),
    );
  };

  const SigninAlert = (() => {
    let { show, status, message } = alert;
    const { state } = history.location;

    if (state && state.isVerifyingEmail) {
      show = true;
      status = AlertStatus.INFO;
      message = intl.formatMessage({ id: 'common.authentication.signin.alert.signinAgainToVerifyEmail' });
    }

    return (
      <Alert
        show={show}
        status={status}
        message={message}
        align={AlertMessageAlign.LEFT}
        styles={{
          CONTAINER: css`
            margin-bottom: ${show ? 24 : 0}px;
          `,
        }}
      />
    );
  })();

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

  return (
    <AuthWrapper>
      <AuthBox
        // "perfect-scrollbar" has issue with "Google One Tap" feature, so it has changed to browser default scrollbar instead.
        // If above issue resolved, you feel free to reuse "perfect-scrollbar".
        // Reference: https://github.com/sendbird/sbdashboard/issues/2125
        css={css`
          overflow-y: auto;
        `}
      >
        <AuthTopBar />
        <AuthBoxCenter>
          <AuthBoxBody>
            <AuthBoxHeader>
              <AuthBoxTitle>{intl.formatMessage({ id: 'common.authentication.signin.title' })}</AuthBoxTitle>
            </AuthBoxHeader>
            <AuthFormWrapper>
              {SigninAlert}
              <AuthAlready />
              <form name="signIn" onSubmit={handleSubmit(onSubmit)}>
                <InputText
                  ref={register({
                    validate: (value) =>
                      trim(value) !== '' ||
                      intl.formatMessage({ id: 'common.authentication.signin.error.required.email' }),
                  })}
                  id="email"
                  name="email"
                  label="Email"
                  type="text"
                  required={true}
                  error={errorProcessor('email')}
                />
                <InputText
                  ref={register({
                    validate: (value) =>
                      trim(value) !== '' ||
                      intl.formatMessage({ id: 'common.authentication.signin.error.required.password' }),
                  })}
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  required={true}
                  error={errorProcessor('password')}
                />
                <AuthButton
                  id="id_button_submit"
                  buttonType="primary"
                  type="submit"
                  size="large"
                  disabled={isFetching}
                  isLoading={isFetching}
                >
                  {intl.formatMessage({ id: 'common.authentication.button.signin' })}
                </AuthButton>
                <SocialDivider>
                  <SocialDividerText>Or</SocialDividerText>
                </SocialDivider>
                <GoogleLoginButton />
              </form>
            </AuthFormWrapper>
            <AuthBoxOptions>
              <AuthBoxOption>
                <AuthBoxOptionLink href="/auth/sso">
                  {intl.formatMessage({ id: 'common.authentication.button.signinWithSSO' })}
                </AuthBoxOptionLink>
              </AuthBoxOption>
              <AuthBoxOption>
                <AuthBoxOptionLink href="/auth/forgot">
                  {intl.formatMessage({ id: 'common.authentication.button.forgotPassword' })}
                </AuthBoxOptionLink>
              </AuthBoxOption>
            </AuthBoxOptions>
          </AuthBoxBody>
          <AuthFooter />
        </AuthBoxCenter>
      </AuthBox>
    </AuthWrapper>
  );
};
