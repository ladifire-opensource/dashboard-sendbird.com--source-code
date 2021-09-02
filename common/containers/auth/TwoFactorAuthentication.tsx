import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { css } from 'styled-components';

import { Alert, AlertMessageAlign, AlertStatus, ScrollBar, InputText } from 'feather';
import qs from 'qs';

import { commonActions } from '@actions';
import { commonApi, setSBAuthToken } from '@api';
import normalize2FAVerificationCode from '@common/utils/normalize2FAVerificationCode';
import { getErrorMessage } from '@epics';
import { useTypedSelector } from '@hooks';
import { HistoryBackText, AuthFooter } from '@ui/components';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxDescription,
  AuthBoxBody,
  AuthBoxOptionLink,
  AuthButton,
  AuthBoxCenter,
  AuthFormWrapper,
  AuthBoxAttached,
} from './components';

export const TwoFactorAuthentication = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLoadingAuth = useTypedSelector((state) => state.auth.isFetching);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register, errors, setError } = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: { code: '' },
  });

  const validateCode = (value: string) => {
    const code = normalize2FAVerificationCode(value);
    const emptyValue = code.length === 0;
    if (emptyValue) {
      return intl.formatMessage({ id: 'common.authentication.twoFactor.error.minimumLength' });
    }
    if (code.length !== 6) {
      return intl.formatMessage({ id: 'common.authentication.twoFactor.error.lengthMismatch' });
    }

    return true;
  };

  const onSubmit = async ({ code }) => {
    const { next = '/' } = qs.parse(location.search.slice(1));
    const refinedCode = normalize2FAVerificationCode(code);

    try {
      setIsLoading(true);
      const response = await commonApi.verifyTwoFactor(refinedCode);
      setSBAuthToken(response.data.token);
      dispatch(commonActions.verifyAuthenticationRequest({ next }));
    } catch (error) {
      setError('code', { type: 'manual', message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleBackToSignInClick
   *
   * @description If login success and two factor authentication remains, token exist
   * If user wants to go back to sign-in, token has to be removed.
   * Also authenticated value in reducer has to be changed to false
   * so just simply call signout request
   */
  const handleBackToSignInClick = () => {
    dispatch(commonActions.signoutRequest());
  };

  const hasError = Object.keys(errors).length > 0;

  return (
    <AuthWrapper>
      <ScrollBar>
        <AuthBox>
          <AuthTopBar />
          <AuthBoxCenter>
            <AuthBoxBody>
              <AuthBoxHeader>
                <AuthBoxTitle>{intl.formatMessage({ id: 'common.authentication.twoFactor.title' })}</AuthBoxTitle>
                <AuthBoxDescription>
                  {intl.formatMessage({ id: 'common.authentication.twoFactor.description' })}
                </AuthBoxDescription>
              </AuthBoxHeader>
              <AuthFormWrapper>
                {hasError && (
                  <Alert
                    show={true}
                    status={AlertStatus.DANGER}
                    align={AlertMessageAlign.LEFT}
                    styles={{
                      CONTAINER: css`
                        margin-bottom: ${errors ? 24 : 0}px;
                      `,
                    }}
                    message={errors.code?.message}
                  />
                )}
                <AuthAlready />
                <form name="twoFactor" onSubmit={handleSubmit(onSubmit)}>
                  <InputText
                    ref={register({ validate: validateCode })}
                    type="text"
                    name="code"
                    label={intl.formatMessage({ id: 'common.authentication.twoFactor.label.code' })}
                    placeholder={intl.formatMessage({ id: 'common.authentication.twoFactor.placeholder.code' })}
                    required={true}
                  />
                  <AuthButton
                    id="id_button_submit"
                    buttonType="primary"
                    type="submit"
                    size="large"
                    disabled={isLoading || isLoadingAuth}
                    isLoading={isLoading || isLoadingAuth}
                  >
                    {intl.formatMessage({ id: 'common.authentication.twoFactor.button.submit' })}
                  </AuthButton>
                </form>
                <AuthBoxAttached>
                  <AuthBoxOptionLink
                    href="/auth/two_factor_recovery"
                    styles={css`
                      display: block;
                      margin: 0 auto 8px;
                    `}
                  >
                    {intl.formatMessage({ id: 'common.authentication.twoFactor.haveRecovery' })}
                  </AuthBoxOptionLink>
                </AuthBoxAttached>
              </AuthFormWrapper>
              <HistoryBackText text="Back to Sign in" href="/auth/signin" onClick={handleBackToSignInClick} />
            </AuthBoxBody>
            <AuthFooter />
          </AuthBoxCenter>
        </AuthBox>
      </ScrollBar>
    </AuthWrapper>
  );
};
