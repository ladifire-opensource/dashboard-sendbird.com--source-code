import React, { FC, useCallback, useEffect, useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import PhoneNumber from 'awesome-phonenumber';
import { Headings, transitions, cssVariables, Dropdown, InputText, toast, DropdownProps } from 'feather';
import escapeRegExp from 'lodash/escapeRegExp';
import isEmpty from 'lodash/isEmpty';

import { commonActions } from '@actions';
import { commonApi } from '@api';
import { CLOUD_FRONT_URL } from '@constants';
import { Countries } from '@constants/countries';
import { CreateAppForm } from '@core/containers/app/createAppForm';
import { useCreateAppRequest } from '@core/containers/app/useCreateAppRequest';
import { getErrorMessage } from '@epics';
import {
  Dialog,
  DialogFormSet,
  DialogFormBody,
  DialogFormAction,
  ConfirmButton,
  FormInput,
  FormInputSize,
  DialogFormLabel,
} from '@ui/components';
import { PropOf, getCountryCodeWidth } from '@utils';

import { useOnboardingReducer } from './useOnboardingReducer';

type SubmitHandler = PropOf<typeof CreateAppForm, 'onSubmit'>;

const OnboardingWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  width: 480px;
  margin: 0 auto;

  form {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  ${DialogFormBody} {
    flex: 1;
  }

  ${DialogFormSet} + ${DialogFormSet} {
    margin-top: 16px;
  }

  ${DialogFormAction} {
    padding: 0 24px;
  }
`;

const OnboardingWelcomeImage = styled.img.attrs<{ step: 0 | 1 }>((props) => ({
  src: `${CLOUD_FRONT_URL}/dashboard/img-onboarding-0${props.step + 1}.png`,
  alt: 'Welcome to Sendbird',
}))<{ step: 0 | 1 }>``;

const OnboardingWelcomeWrapper = styled.div`
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OnboardingWelcome = styled.div`
  ${Headings['heading-07']};
`;

const StepIndicatorItem = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: ${(props) => (props.isActive ? cssVariables('purple-7') : cssVariables('purple-3'))};
  ${transitions({ duration: 0.2, properties: ['background'] })};

  & + & {
    margin-left: 8px;
  }
`;

const StepIndicator = styled.div`
  padding: 24px 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContactInput = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-column-gap: 8px;
`;

const ContactCountry = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ContactCountryName = styled.div`
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContactCountryDialCode = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
`;

const ContactDialogCodePrefix = styled.div`
  position: absolute;
  left: 224px;
  height: 40px;
  display: flex;
  align-items: center;
  ${Headings['heading-01']};
`;

const errorContainerStyles = css``;

const errorTextStyle = css`
  font-size: 12px;
  line-height: 1.33px;
  height: 16px;
`;

const useCreateOrganization = (onSuccess) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const createOrganization = async (payload: { organizationName: string; contact?: string }) => {
    setIsLoading(true);
    try {
      const response = await commonApi.createOrganization(payload);
      const { organizations } = response.data;
      dispatch(commonActions.verifyAuthenticationRequest());
      dispatch(commonActions.createOrganizationSuccess({ organizations }));
      onSuccess();
    } catch (error) {
      /**
       * TODO: change form to use react-hook-form and use input error message instead.
       */
      toast.warning({ message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createOrganization,
  };
};

type Props = DefaultDialogProps<OnboardingDialogProps>;

type CountryItem = { code: string; name: string };

const OnboardingDialog: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const history = useHistory();
  const contactInputRef = useRef<HTMLInputElement>(null);

  const organization = useSelector((state: RootState) => state.organizations.current);

  const [country, setCountry] = useState<CountryItem>();
  const [countryQuery, setCountryQuery] = useState('');

  const {
    state: { step, errors, organizationName, contact },
    actions: { setStep, setFieldValue, setErrors, setError },
  } = useOnboardingReducer();

  const { isLoading, createApplication, error: createAppError } = useCreateAppRequest();
  const { isLoading: isLoadingOrganization, createOrganization } = useCreateOrganization(() => {
    setStep(1);
  });

  useEffect(() => {
    window.addEventListener('popstate', () => {
      history.go(1);
    });
  }, [history]);

  useEffect(() => {
    if (step === 0 && !isEmpty(organization)) {
      setStep(1);
    }
  }, [organization, step, setStep]);

  const isValidOnSubmit = useCallback(() => {
    let errorCount = 0;
    Object.keys(errors).forEach((name) => {
      if (errors[name].hasError) {
        errorCount++;
      }
    });

    let currentErrors = errors;

    if (step === 0) {
      if (organizationName === '') {
        currentErrors = {
          ...currentErrors,
          organizationName: {
            hasError: true,
            message: intl.formatMessage({ id: 'common.onboarding.field_organizationName.error.empty' }),
          },
        };
        errorCount++;
      }
      if (country && contact.length > 0) {
        const hasError = new PhoneNumber(contact, country?.code)
          ? !new PhoneNumber(contact, country?.code).isValid()
          : false;
        currentErrors = {
          ...currentErrors,
          contact: {
            hasError,
            message: intl.formatMessage({ id: 'common.onboarding.field.contact.error.invalid' }),
          },
        };
        hasError && errorCount++;
      }
    }
    setErrors(currentErrors);
    return errorCount === 0;
  }, [errors, step, setErrors, organizationName, country, contact, intl]);

  const checkErrorWhileTyping = useCallback(
    ({ name, value }: { name: string; value: string }): FormError => {
      switch (name) {
        case 'organizationName':
          return {
            hasError: value === '',
            message: intl.formatMessage({ id: 'common.onboarding.field_organizationName.error.empty' }),
          };
        default:
          return { hasError: false, message: '' };
      }
    },
    [intl],
  );

  const handleOrganizationSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (isValidOnSubmit() && !isLoadingOrganization) {
        createOrganization({
          organizationName,
          ...(contact ? { contact: new PhoneNumber(contact, country?.code).getNumber() } : {}),
        });
      }
    },
    [isValidOnSubmit, isLoadingOrganization, createOrganization, organizationName, contact, country],
  );

  const handleInputChange = (name) => (e) => {
    const { value } = e.target;
    const error = checkErrorWhileTyping({ name, value });

    setFieldValue({ field: name, value });
    setError({ name, error });
  };

  const handleContactEvent: React.KeyboardEventHandler<HTMLInputElement> = () => {
    if (contactInputRef.current) {
      const { value } = contactInputRef.current;
      if (country) {
        let newContact = contact;
        const pn = new PhoneNumber(value, country.code).getNumber('input' as any);
        newContact = pn || value;

        setFieldValue({ field: 'contact', value: newContact });
      }
    }
  };

  const handleContactFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    e.target.value = contact;
  };

  const handleContactBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (country) {
      const pn = new PhoneNumber(contact, country.code).getNumber('international');
      e.target.value = pn ? pn.replace(`+${PhoneNumber.getCountryCodeForRegionCode(country.code)} `, '') : contact;
    }
  };

  const handleCountrySelected: DropdownProps<CountryItem>['onItemSelected'] = (item) => {
    if (item) {
      setCountry(item);
      contactInputRef.current?.focus();
    }
  };

  const renderForm = () => {
    if (step === 0) {
      return (
        <>
          <form onSubmit={handleOrganizationSubmit}>
            <DialogFormBody>
              <DialogFormSet>
                <FormInput
                  size={FormInputSize.MEDIUM}
                  type="text"
                  name="organization_name"
                  label={intl.formatMessage({ id: 'common.onboarding.field_organizationName.label' })}
                  required={true}
                  error={errors.organizationName}
                  value={organizationName}
                  onChange={handleInputChange('organizationName')}
                  styles={{
                    ERROR_MESSAGE_CONTAINER: errorContainerStyles,
                    ERROR_MESSAGE_TEXT: errorTextStyle,
                  }}
                />
              </DialogFormSet>
              <DialogFormSet>
                <DialogFormLabel>{intl.formatMessage({ id: 'common.onboarding.field_contact.label' })}</DialogFormLabel>
                <ContactInput>
                  <Dropdown<CountryItem>
                    selectedItem={country}
                    onItemSelected={handleCountrySelected}
                    items={Countries.filter(
                      (country) => !countryQuery || country.name.match(new RegExp(escapeRegExp(countryQuery), 'ig')),
                    )}
                    itemToString={(item) => item.name}
                    itemToElement={(item) =>
                      item ? (
                        <ContactCountry>
                          <ContactCountryName>{item.name}</ContactCountryName>
                          <ContactCountryDialCode>
                            +{PhoneNumber.getCountryCodeForRegionCode(item.code)}
                          </ContactCountryDialCode>
                        </ContactCountry>
                      ) : (
                        ''
                      )
                    }
                    useSearch={true}
                    onSearchChange={setCountryQuery}
                    width="200px"
                    placeholder={intl.formatMessage({ id: 'common.onboarding.field.contactCountry.ph' })}
                    itemHeight={48}
                  />
                  <InputText
                    ref={contactInputRef}
                    name="contact"
                    onKeyUp={handleContactEvent}
                    onFocus={handleContactFocus}
                    onBlur={handleContactBlur}
                    error={errors.contact}
                    readOnly={!country}
                    styles={
                      country &&
                      css`
                        padding-left: ${getCountryCodeWidth(PhoneNumber.getCountryCodeForRegionCode(country.code))}px;
                      `
                    }
                  />
                  {country && (
                    <ContactDialogCodePrefix>
                      +{PhoneNumber.getCountryCodeForRegionCode(country.code)}
                    </ContactDialogCodePrefix>
                  )}
                </ContactInput>
              </DialogFormSet>
            </DialogFormBody>
            <DialogFormAction>
              <ConfirmButton
                type="submit"
                isFetching={isLoadingOrganization}
                disabled={isLoadingOrganization}
                data-test-id="Submit"
              >
                Next
              </ConfirmButton>
            </DialogFormAction>
          </form>
        </>
      );
    }
    if (step === 1 && !isEmpty(organization)) {
      const handleSubmit: SubmitHandler = ({ name, type, region }) => {
        if (region) {
          createApplication({
            name,
            region: region.key,
            enableCalls: type === 'chat/calls',
          });
        }
      };

      return (
        <CreateAppForm
          organization={organization}
          actions={
            <DialogFormAction
              css={`
                margin-top: 32px;
              `}
            >
              <ConfirmButton type="submit" isFetching={isLoading} disabled={isLoading}>
                {intl.formatMessage({ id: 'common.onboarding.application_btn.create' })}
              </ConfirmButton>
            </DialogFormAction>
          }
          error={createAppError}
          disabled={isLoading}
          onSubmit={handleSubmit}
        />
      );
    }
  };

  return (
    <Dialog
      onClose={onClose}
      size="large"
      styles={css`
        min-height: 532px;
      `}
      title=""
      body={
        <OnboardingWrapper>
          <OnboardingWelcomeWrapper>
            <OnboardingWelcomeImage step={step} />
            <OnboardingWelcome>
              <FormattedMessage id={`common.onboarding.title.step${step}`} />
            </OnboardingWelcome>
          </OnboardingWelcomeWrapper>
          {renderForm()}
          <StepIndicator>
            <StepIndicatorItem isActive={step === 0} />
            <StepIndicatorItem isActive={step === 1} />
          </StepIndicator>
        </OnboardingWrapper>
      }
    />
  );
};

export default OnboardingDialog;
