import { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { sanitize } from 'dompurify';
import { cssVariables, Checkbox, toast, InputText, Dropdown, FormGroup } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { commonActions } from '@actions';
import { EMAIL_REGEX, COUNTRY_LIST } from '@constants';
import { QueryInjectedLocation } from '@interfaces';
import { PasswordValidation, GoogleLoginButton, CarouselSlick } from '@ui/components';
import { PASSWORD_VALIDATION_REGEXS } from '@ui/components/validation/passwordValidation';
import { triggerGAEvent, parseUTMParameters } from '@utils';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthLeft,
  AuthRight,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxBody,
  AuthButton,
  SocialDivider,
  AuthBoxCenter,
  SocialDividerText,
  AuthBoxDescription,
  AuthFormWrapper,
} from './components';
import { CustomerQuote } from './customerQuote';

const ConsensusWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
`;

const AgreeMessage = styled.div`
  flex: 1;
  color: ${cssVariables('neutral-6')};
  font-size: 14px;
  line-height: 1.43;
  margin-left: 4px;
  font-weight: 400;
`;

const NameFormGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 8px;
  > div + div {
    margin-top: 0 !important;
  }
  margin-bottom: 16px;
`;

const CountryFormGroup = styled(FormGroup)`
  > div {
    flex: 1;
  }
`;

type SignUpForm = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_name: string;
  organization_name?: string;
};

export const SignUp: FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory<{ email: string } | undefined>();
  const { query } = history.location as QueryInjectedLocation;

  const isAuthFetching = useSelector<RootState, boolean>((state) => state.auth.isFetching);

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [invitation, setInvitation] = useState<Invitation>();
  const handleCountrySearchChange = (value: string) => {
    setCountryQuery(value);
  };
  const [isAgreed, setIsAgreed] = useState(false);

  const { control, errors, handleSubmit, register, setValue, watch, formState } = useForm<SignUpForm>({
    mode: 'onChange',
  });

  useEffect(() => {
    if (!query) {
      return;
    }

    if (query.email) {
      setValue('email', query.email, { shouldValidate: true });
    }

    if (query.invite_hash) {
      dispatch(
        commonActions.fetchInvitationRequest({
          invite_hash: sanitize(query.invite_hash),
          onSuccess: (response) => {
            setInvitation(response);
            setValue('email', response.email, { shouldValidate: true });
            setValue('organization_name', response.organization.name, { shouldValidate: true });
          },
        }),
      );
    }

    if (query.sso_token) {
      const { state } = history.location;
      if (state?.email) {
        setValue('email', state.email, { shouldValidate: true });
      } else {
        toast.error({ message: "We can't find email." });
      }
    }

    if (query.error === 'social_already_exist') {
      const { provider } = query;
      if (provider === 'SendBird') {
        toast.warning({
          message: intl.formatMessage({ id: 'common.authentication.signup.error.emailRegistered' }),
        });
      } else {
        toast.warning({
          message: intl.formatMessage({ id: 'common.authentication.error.alreadyExistWithProvider' }),
        });
      }
    }
  }, [dispatch, history.location, intl, query, setValue]);

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  const onSubmit = (data, e) => {
    e.preventDefault();

    const utmParameters = parseUTMParameters();
    let payload = {
      ...data,
      agreed_user_consensus: isAgreed,
    };
    if (query.invite_hash) {
      payload['invite_hash'] = query.invite_hash;
    }
    if (query.sso_token) {
      payload['token'] = query.sso_token;
    }
    if (!isEmpty(utmParameters)) {
      payload = {
        ...payload,
        ...utmParameters,
      };
    }
    dispatch(commonActions.signupRequest(payload));
    if (!query.invite_hash && query.sso_type !== 'saml') {
      /**
       * Send signup event to GA when it is initial signup not the member case
       */
      triggerGAEvent({ category: 'form submission', action: 'free trial', label: 'success' });
    }
  };

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

  const password = watch('password', '');
  const isInvited = !!query.invite_hash;
  const isSSO = !!query.sso_token;

  const getDescription = useMemo(() => {
    if (isSSO) {
      return intl.formatMessage({ id: 'common.authentication.signup.description.sso' });
    }
    if (isInvited && invitation) {
      return intl.formatMessage(
        { id: 'common.authentication.signup.description.invited' },
        {
          nickname: invitation.inviter?.nickname,
          email: invitation.inviter?.email,
          b: (text) => <b>{text}</b>,
        },
      );
    }
    return intl.formatMessage({ id: 'common.authentication.signup.description' }, { b: (text) => <b>{text}</b> });
  }, [intl, invitation, isInvited, isSSO]);

  return (
    <AuthWrapper>
      <AuthLeft>
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
            <AuthBoxBody style={{ marginBottom: '104px' }}>
              <AuthBoxHeader>
                <AuthBoxTitle>
                  {isInvited || isSSO
                    ? intl.formatMessage({ id: 'common.authentication.signup.title.welcome' })
                    : intl.formatMessage({ id: 'common.authentication.signup.title' })}
                </AuthBoxTitle>
                <AuthBoxDescription>{getDescription}</AuthBoxDescription>
              </AuthBoxHeader>
              <AuthFormWrapper>
                <AuthAlready isSigningUp={true} />
                <form name="signUp" onSubmit={handleSubmit(onSubmit)}>
                  {isInvited && (
                    <InputText
                      ref={register}
                      type="text"
                      name="organization_name"
                      label="Organization name"
                      readOnly={true}
                      styles="margin-bottom: 16px;"
                    />
                  )}
                  <NameFormGroup>
                    <InputText
                      ref={register({
                        required: intl.formatMessage({
                          id: 'common.authentication.signup.field_firstName.error.empty',
                        }),
                      })}
                      name="first_name"
                      type="text"
                      label="First name"
                      error={errorProcessor('first_name')}
                      required={true}
                    />
                    <InputText
                      ref={register({
                        required: intl.formatMessage({
                          id: 'common.authentication.signup.field_lastName.error.empty',
                        }),
                      })}
                      name="last_name"
                      type="text"
                      label="Last name"
                      error={errorProcessor('last_name')}
                      required={true}
                    />
                  </NameFormGroup>
                  <CountryFormGroup label="Country">
                    <Controller
                      name="country_name"
                      control={control}
                      rules={{ required: true }}
                      defaultValue=""
                      render={({ onChange, value }) => {
                        return (
                          <Dropdown
                            selectedItem={value}
                            onChange={onChange}
                            placeholder={intl.formatMessage({ id: 'common.authentication.signup.placeholder.country' })}
                            items={
                              countryQuery.trim()
                                ? COUNTRY_LIST.filter((country) =>
                                    country.toLowerCase().includes(countryQuery.trim().toLowerCase()),
                                  )
                                : COUNTRY_LIST
                            }
                            width="100%"
                            useSearch={true}
                            onSearchChange={handleCountrySearchChange}
                            hasError={errorProcessor('country_name')?.hasError}
                          />
                        );
                      }}
                    />
                  </CountryFormGroup>
                  <InputText
                    ref={register({
                      required: intl.formatMessage({ id: 'common.authentication.signup.field_email.error.empty' }),
                      pattern: {
                        value: EMAIL_REGEX,
                        message: intl.formatMessage({ id: 'common.authentication.signup.field_email.error.invalid' }),
                      },
                    })}
                    name="email"
                    type="email"
                    label="Email"
                    error={errorProcessor('email')}
                    required={true}
                    readOnly={isInvited || isSSO}
                    data-test-id="emailInput"
                  />
                  {!isSSO && (
                    <>
                      <InputText
                        ref={register({
                          required: intl.formatMessage({
                            id: 'common.authentication.signup.field_password.error.empty',
                          }),
                          validate: (value) => {
                            const validateArray = PASSWORD_VALIDATION_REGEXS.map(({ regex }) => {
                              return new RegExp(regex).test(value);
                            });
                            return (
                              validateArray.every((result) => {
                                return result;
                              }) ||
                              intl.formatMessage({
                                id: 'common.authentication.signup.field_password.error.invalid',
                              })
                            );
                          },
                        })}
                        type="password"
                        name="password"
                        label="Password"
                        required={true}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                        data-test-id="passwordInput"
                      />
                      <PasswordValidation password={password} focused={passwordFocused} hasError={!!errors.password} />
                    </>
                  )}
                  <ConsensusWrapper data-test-id="consensus">
                    <Checkbox
                      id="agreeConsensus"
                      label={
                        <AgreeMessage>
                          {intl.formatMessage(
                            { id: 'common.authentication.signup.description.consensus' },
                            {
                              termslink: (text: string) => (
                                <a href="https://sendbird.com/terms-of-service" target="_blank">
                                  {text}
                                </a>
                              ),
                              privacylink: (text: string) => (
                                <a href="https://sendbird.com/privacy" target="_blank">
                                  {text}
                                </a>
                              ),
                            },
                          )}
                        </AgreeMessage>
                      }
                      onChange={(e) => {
                        setIsAgreed(e.target.checked);
                      }}
                    />
                  </ConsensusWrapper>
                  <AuthButton
                    id="id_button_submit"
                    data-test-id="SubmitButton"
                    buttonType="primary"
                    type="submit"
                    size="large"
                    disabled={isAuthFetching || !(formState.isValid && isAgreed)}
                    isLoading={isAuthFetching}
                    styles={{ height: '48px', marginTop: '24px' }}
                  >
                    <FormattedMessage id="common.authentication.signup.button.submit" />
                  </AuthButton>
                </form>
                {!(isInvited || isSSO) && (
                  <>
                    <SocialDivider data-test-id="socialLoginButtons">
                      <SocialDividerText style={{ color: cssVariables('neutral-7') }}>Or</SocialDividerText>
                    </SocialDivider>
                    <GoogleLoginButton />
                  </>
                )}
              </AuthFormWrapper>
            </AuthBoxBody>
          </AuthBoxCenter>
        </AuthBox>
      </AuthLeft>
      <AuthRight>
        <CarouselSlick
          settings={{
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            pauseOnHover: true,
          }}
          styles={{
            DOT_CONTAINER: css`
              position: absolute;
              bottom: 36px;
              left: 0;
              right: 0;
            `,
          }}
        >
          <CustomerQuote
            logoFilename="img-virginmobile-logo"
            quote="“My advice to anyone who is digitizing their customer service would be to consider Sendbird as a strategic partner. With Sendbird, we saw huge success, increasing our number of digital contacts, which was already high, by another 25%.”"
            quoteBy="Ozgur Gemici,<br />Senior Manager at Virgin Mobile"
          />
          <CustomerQuote
            logoFilename="img-eden-logo"
            quote="“We use Sendbird's webhooks and API quite a bit to build features and facilitate great customer-vendor communication. And we were actually able to build some neat features really easily. It's just really, really quick.”"
            quoteBy="Kyle Wilkinson, CTO at Eden"
          />
          <CustomerQuote
            logoFilename="img-ralali-logo"
            quote="“Sendbird provides a very sophisticated solution for us. Instead of building chat ourselves, why reinvent the wheel? That is one question that always pops up in my mind.”"
            quoteBy="Irwan Suryady, CTO at Ralali"
          />
        </CarouselSlick>
      </AuthRight>
    </AuthWrapper>
  );
};
