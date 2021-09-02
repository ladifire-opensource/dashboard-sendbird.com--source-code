import { FC, useState, useRef, useCallback, MouseEventHandler, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useRouteMatch, useHistory, useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import PhoneNumber from 'awesome-phonenumber';
import copy from 'copy-to-clipboard';
import {
  Icon,
  cssVariables,
  Body,
  Headings,
  Dropdown,
  InputText,
  DropdownProps,
  Button,
  toast,
  transitionDefault,
  InlineNotification,
  Tooltip,
  TooltipTargetIcon,
  Spinner,
  Link,
} from 'feather';
import escapeRegExp from 'lodash/escapeRegExp';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  SettingsGridGroup,
  SettingsGridCard,
  AppSettingsContainer,
  AppSettingPageHeader,
} from '@common/containers/layout';
import { Countries } from '@constants/countries';
import { verifyNexmoApp, getNexmoAccountDetail, createNexmoAccount } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAppId } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useShowDialog } from '@hooks/useShowDialog';
import { getCountryCodeWidth } from '@utils/generals';

const guideLinkURL =
  'https://www.notion.so/sendbirddesk/Upcoming-Whatsapp-Business-Account-integration-fb44867f9ee8410fa4518eed297c66f5';

type CountryItem = { code: string; name: string };

const IntegrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  border-radius: 4px;
  background: ${cssVariables('neutral-2')};
  padding: 24px;

  > div:first-child {
    display: flex;
  }
`;

const IntegrationDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin-left: 24px;

  > h4 {
    ${Headings['heading-03']};
    color: ${cssVariables('neutral-10')};
  }

  > p {
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-10')};
  }
`;

const FormDivider = styled.hr`
  margin: 24px 0;
  border-width: 0;
  background-color: ${cssVariables('neutral-3')};
  height: 1px;
`;

const ContactInputContainer = styled.div`
  margin-top: 16px;
`;

const FormLabel = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const VerificationFooter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  margin-bottom: -8px;
`;

const VerificationStatusDot = styled.span`
  margin-right: 8px;
  border-radius: 50%;
  width: 8px;
  height: 8px;
`;

const VerificationStatusText = styled.span`
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
`;

const VerificationStatusWrapper = styled.div<{ isVerified: boolean }>`
  ${({ isVerified }) =>
    isVerified
      ? css`
          ${VerificationStatusDot} {
            background-color: ${cssVariables('green-5')};
          }
          ${VerificationStatusText} {
            color: ${cssVariables('green-5')};
          }
        `
      : css`
          ${VerificationStatusDot} {
            background-color: ${cssVariables('red-5')};
          }
          ${VerificationStatusText} {
            color: ${cssVariables('red-5')};
          }
        `};
`;

const ContactInputLabel = styled.div`
  display: flex;
  align-items: center;
  transition: 0.2s ${transitionDefault};
  transition-property: height, color;
  height: 12px;
  color: ${cssVariables('neutral-10')};
  font-size: 12px;
  font-weight: 500;
`;

const ContactInput = styled.div`
  display: grid;
  position: relative;
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

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 24px;

  button + button {
    margin-left: 8px;
  }
`;

const FormFieldsWrapper = styled.div<{ isLoading: boolean }>`
  ${({ isLoading }) =>
    isLoading &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;
    `}
`;

const VerificationFieldsWrapper = styled(FormFieldsWrapper)`
  min-height: 206px;
`;

const OtherFieldsWrapper = styled(FormFieldsWrapper)`
  min-height: 138px;
`;

const getContactInputCSS = ({ hasError, country }: { hasError: boolean; country?: CountryItem }) => css`
  ${hasError &&
  css`
    border-color: ${cssVariables('red-5')};
  `}
  ${country &&
  css`
    padding-left: ${getCountryCodeWidth(PhoneNumber.getCountryCodeForRegionCode(country.code))}px;
  `}
`;

type VerificationFormValues = {
  apiKey: string;
  apiSecret: string;
  applicationId: string;
};

type OthersFormValues = {
  signatureSecret: string;
  whatsappNumber: string;
};

export const IntegrationWhatsApp: FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<{ id: string }>();
  const showDialog = useShowDialog();
  const { pid, region } = useProjectIdAndRegion();
  const appId = useAppId();
  const { getErrorMessage } = useDeskErrorHandler();
  const contactInputRef = useRef<HTMLInputElement | null>(null);
  const isGetNexmoAccountCalled = useRef(false);
  const verifiedValues = useRef<VerificationFormValues | null>(null);

  const [nexmoAccount, setNexmoAccount] = useState<NexmoAccount | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  // verification form
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<{
    message: string | null;
    values: VerificationFormValues;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  // contact input
  const [country, setCountry] = useState<CountryItem>();
  const [countryQuery, setCountryQuery] = useState('');

  const othersForm = useForm<OthersFormValues>({
    defaultValues: {
      signatureSecret: '',
      whatsappNumber: '',
    },
  });

  const verificationForm = useForm<VerificationFormValues>({
    defaultValues: { apiKey: '', apiSecret: '', applicationId: '' },
  });

  // Currently, inbound webhook URL and status webhook URL is same.
  const webhookURL = `https://desk-api-${appId}.sendbird.com/whatsapp/webhook`;
  const shouldVerifyNexmoApp = !isLoadingAccount && (!nexmoAccount || verificationForm.formState.isDirty);
  const canSubmit = isVerified && othersForm.formState.isDirty;

  const backToIntegrationSettingPage = useCallback(() => {
    history.push(`/${appId}/desk/settings/integration`);
  }, [appId, history]);

  const showConfirmationDialog = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.dialog.confirmationDialog.title' }),
        description: intl.formatMessage({
          id: 'desk.settings.integration.whatsapp.form.dialog.confirmationDialog.desc',
        }),
        negativeButtonProps: {
          text: intl.formatMessage({
            id: 'desk.settings.integration.whatsapp.form.dialog.confirmationDialog.btn.cancel',
          }),
        },
        positiveButtonProps: {
          text: intl.formatMessage({
            id: 'desk.settings.integration.whatsapp.form.dialog.confirmationDialog.btn.submit',
          }),
          onClick: backToIntegrationSettingPage,
        },
      },
    });
  }, [backToIntegrationSettingPage, intl, showDialog]);

  const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    !!nexmoAccount &&
      showDialog({
        dialogTypes: DialogType.DeleteNexmoAccount,
        dialogProps: { id: nexmoAccount.id },
      });
  };

  const handleCountrySelected: DropdownProps<CountryItem>['onItemSelected'] = (country) => {
    if (country) {
      setCountry(country);
      contactInputRef.current?.focus();
    }
  };

  const handleBackButtonClick = useCallback(() => {
    if (verificationForm.formState.isDirty || othersForm.formState.isDirty) {
      showConfirmationDialog();
      return;
    }
    backToIntegrationSettingPage();
  }, [
    backToIntegrationSettingPage,
    othersForm.formState.isDirty,
    showConfirmationDialog,
    verificationForm.formState.isDirty,
  ]);

  const onVerificationFormSubmit: SubmitHandler<VerificationFormValues> = async (formData) => {
    try {
      setIsVerifying(true);
      const { data } = await verifyNexmoApp(pid, region, formData);

      if (data.verify) {
        setIsVerified(true);
        setVerificationError(null);
        verifiedValues.current = formData;
        verificationForm.reset(formData);
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.toast.success.verification' }),
        });
      }
    } catch (error) {
      setIsVerified(false);
      if (error && error.data && error.data.code) {
        let message;
        switch (error.data.code) {
          case 'desk400123':
            message = intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.inline.error.alreadySub' });
            break;
          case 'desk400124':
            message = intl.formatMessage({
              id: 'desk.settings.integration.whatsapp.form.inline.error.alreadySubOtherProject',
            });
            break;
          case 'desk400125':
            message = intl.formatMessage({
              id: 'desk.settings.integration.whatsapp.form.inline.error.verificationFailed',
            });
            break;
          default:
            break;
        }
        setVerificationError({ message, values: formData });
        return;
      }
      toast.error({ message: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.error.unexpected' }) });
      setVerificationError({
        message: null,
        values: formData,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onOthersFormSubmit: SubmitHandler<OthersFormValues> = useCallback(
    async (formData) => {
      try {
        setIsCreatingAccount(true);
        const { signatureSecret, whatsappNumber } = formData;
        const phoneNumber = new PhoneNumber(whatsappNumber, country?.code);
        const { data } = await createNexmoAccount(pid, region, {
          ...verificationForm.getValues(),
          signatureSecret,
          // get phone number without '+' country code prefix
          whatsappNumber: phoneNumber.getNumber().substring(1),
        });

        if (nexmoAccount) {
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.toast.success.changeWBA' }),
          });
        } else {
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.toast.success.addWBA' }),
          });
        }

        if (data) {
          const { apiKey, apiSecret, applicationId } = data;
          setNexmoAccount(data);
          verificationForm.reset({ apiKey, apiSecret, applicationId });
          othersForm.reset(
            { signatureSecret, whatsappNumber: phoneNumber.getNumber('significant') },
            { errors: false },
          );
          window.history.pushState({}, '', `${location.pathname}/${data.id}`);
        } else {
          // FIXME: error handling
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      } finally {
        setIsCreatingAccount(false);
      }
    },
    [country?.code, getErrorMessage, intl, location.pathname, nexmoAccount, othersForm, pid, region, verificationForm],
  );

  useEffect(() => {
    if (match?.params && match.params.id != null && !isGetNexmoAccountCalled.current) {
      const initialize = async () => {
        try {
          isGetNexmoAccountCalled.current = true;
          setIsLoadingAccount(true);
          const { data } = await getNexmoAccountDetail(pid, region, { id: Number(match.params.id) });
          if (data != null) {
            const { apiKey, apiSecret, applicationId, signatureSecret, whatsappNumber } = data;
            const phoneNumber = new PhoneNumber(`+${whatsappNumber}`);
            verificationForm.reset({ apiKey, apiSecret, applicationId });
            othersForm.reset({ signatureSecret, whatsappNumber: phoneNumber.getNumber('significant') });

            const phoneNumberCountry = Countries.find((country) => country.code === phoneNumber.getRegionCode());
            phoneNumberCountry && setCountry(phoneNumberCountry);
            setNexmoAccount(data);
            !isVerified && setIsVerified(true);
            return;
          }
        } catch (error) {
          history.push(`/${appId}/desk/settings/integration`);
          toast.error({
            message: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.toast.error.retrieve' }),
          });
        } finally {
          setIsLoadingAccount(false);
        }
      };
      initialize();
    }
  }, [match, nexmoAccount, isVerified, history, appId, intl, verificationForm, othersForm, pid, region]);

  useEffect(() => {
    if (isVerified && verificationForm.formState.isDirty) {
      setIsVerified(false);
      return;
    }
    if (isEqual(verifiedValues.current, verificationForm.getValues())) {
      setIsVerified(true);
      setVerificationError(null);
    }
  }, [isVerified, verificationForm]);

  useEffect(() => {
    !shouldVerifyNexmoApp && setVerificationError(null);
  }, [shouldVerifyNexmoApp]);

  const isVerifyButtonDisabled =
    !Object.values(verificationForm.watch()).every((value) => value !== '') || !verificationForm.formState.isDirty;

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton
          href={`/${appId}/desk/settings/integration`}
          onClick={(event) => {
            event.preventDefault();
            handleBackButtonClick();
          }}
          data-test-id="BackButton"
        />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          {!!nexmoAccount && (
            <Button
              className="CardAction"
              buttonType="tertiary"
              variant="ghost"
              icon="delete"
              onClick={handleDeleteButtonClick}
              data-test-id="DeleteButton"
            >
              {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.header.btn.uninstall' })}
            </Button>
          )}
        </AppSettingPageHeader.Actions>
      </AppSettingPageHeader>

      <IntegrationHeader>
        <div>
          <Icon icon="whatsapp-colored" size={60} />
          <IntegrationDescription>
            <h4>{intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.header.title' })}</h4>
            <p>
              {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.header.desc' })}
              <Link
                href={guideLinkURL}
                target="_blank"
                iconProps={{
                  icon: 'open-in-new',
                  size: 16,
                }}
                css={css`
                  margin-left: 8px;
                `}
              >
                {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.header.guideLink' })}
              </Link>
            </p>
          </IntegrationDescription>
        </div>
      </IntegrationHeader>
      <SettingsGridGroup
        css={css`
          margin-bottom: 24px;
        `}
      >
        <SettingsGridCard
          title={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.webhook.title' })}
          description={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.webhook.desc' })}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <InputText
            value={webhookURL}
            name="inboundWebhookURL"
            label={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.webhook.lbl.inbound' })}
            labelHelperText={intl.formatMessage({
              id: 'desk.settings.integration.whatsapp.form.field.webhook.tooltip.inbound',
            })}
            readOnly={true}
            icons={[
              {
                icon: 'copy',
                title: intl.formatMessage({
                  id: 'desk.settings.integration.whatsapp.form.field.webhook.inbound.btn.copy.tooltip',
                }),
                'data-test-id': 'InboundWebhookURLCopyButton',
                onClick: () => {
                  copy(webhookURL);
                  toast.success({
                    message: intl.formatMessage({
                      id: 'desk.settings.integration.whatsapp.form.field.webhook.status.copy.success',
                    }),
                  });
                },
              },
            ]}
            data-test-id="InboundWebhookURL"
          />
          <InputText
            value={webhookURL}
            name="statusWebhookURL"
            label={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.webhook.lbl.status' })}
            labelHelperText={intl.formatMessage({
              id: 'desk.settings.integration.whatsapp.form.field.webhook.tooltip.status',
            })}
            readOnly={true}
            icons={[
              {
                icon: 'copy',
                title: intl.formatMessage({
                  id: 'desk.settings.integration.whatsapp.form.field.webhook.status.btn.copy.tooltip',
                }),
                'data-test-id': 'StatusWebhookURLCopyButton',
                onClick: () => {
                  copy(webhookURL);
                  toast.success({
                    message: intl.formatMessage({
                      id: 'desk.settings.integration.whatsapp.form.field.webhook.inbound.copy.success',
                    }),
                  });
                },
              },
            ]}
            data-test-id="StatusWebhookURL"
          />
        </SettingsGridCard>
      </SettingsGridGroup>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.account.title' })}
          description={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.account.desc' })}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <VerificationFieldsWrapper isLoading={isLoadingAccount}>
            {isLoadingAccount ? (
              <Spinner />
            ) : (
              <form
                id="verificationForm"
                onSubmit={verificationForm.handleSubmit(onVerificationFormSubmit)}
                data-test-id="VerificationForm"
              >
                {verificationError && verificationError.message != null && (
                  <InlineNotification
                    type="error"
                    message={verificationError.message}
                    css={css`
                      margin-bottom: 16px;
                    `}
                    data-test-id="VerificationFormErrorInlineNotificatiion"
                  />
                )}
                <InputText
                  ref={verificationForm.register({ required: true })}
                  name="apiKey"
                  label={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.lbl.apiKey' })}
                  data-test-id="ApiKeyFieldInput"
                />
                <InputText
                  ref={verificationForm.register({ required: true })}
                  name="apiSecret"
                  label={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.lbl.apiSecret' })}
                  data-test-id="ApiSecretFieldInput"
                />
                <InputText
                  ref={verificationForm.register({ required: true })}
                  name="applicationId"
                  label={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.lbl.appId' })}
                  readOnly={!!nexmoAccount}
                  data-test-id="AppIdFieldInput"
                />
                {shouldVerifyNexmoApp && (
                  <VerificationFooter>
                    <VerificationStatusWrapper isVerified={isVerified}>
                      <VerificationStatusDot />
                      <VerificationStatusText>
                        {isVerified
                          ? intl.formatMessage({
                              id: 'desk.settings.integration.whatsapp.form.verificationStatus.verified',
                            })
                          : intl.formatMessage({
                              id: 'desk.settings.integration.whatsapp.form.verificationStatus.unverified',
                            })}
                      </VerificationStatusText>
                    </VerificationStatusWrapper>
                    <Button
                      type="submit"
                      form="verificationForm"
                      buttonType="primary"
                      variant="ghost"
                      icon="done"
                      disabled={isVerifyButtonDisabled}
                      isLoading={isVerifying}
                      data-test-id="VerifySubmitButton"
                    >
                      {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.btn.verify' })}
                    </Button>
                  </VerificationFooter>
                )}
              </form>
            )}
          </VerificationFieldsWrapper>
          <FormDivider />
          <OtherFieldsWrapper isLoading={isLoadingAccount}>
            {isLoadingAccount ? (
              <Spinner />
            ) : (
              <form id="othersForm" onSubmit={othersForm.handleSubmit(onOthersFormSubmit)} data-test-id="OthersForm">
                {!isEmpty(othersForm.errors) && (
                  <InlineNotification
                    type="error"
                    message={othersForm.errors.whatsappNumber?.message ?? othersForm.errors.signatureSecret?.message}
                    css={css`
                      margin-bottom: 16px;
                    `}
                  />
                )}
                <InputText
                  ref={othersForm.register({
                    required: intl.formatMessage({
                      id: 'desk.settings.integration.whatsapp.form.field.signatureSecret.error.required',
                    }),
                  })}
                  name="signatureSecret"
                  label={intl.formatMessage({
                    id: 'desk.settings.integration.whatsapp.form.field.lbl.signatureSecret',
                  })}
                  data-test-id="SignatureSecretFieldInput"
                />
                <ContactInputContainer>
                  <FormLabel>
                    <ContactInputLabel>
                      {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.lbl.phoneNumber' })}
                    </ContactInputLabel>
                    <Tooltip
                      content={intl.formatMessage({
                        id: 'desk.settings.integration.whatsapp.form.field.phoneNumber.tooltip',
                      })}
                      placement="top"
                    >
                      <TooltipTargetIcon icon="info" size={16} />
                    </Tooltip>
                  </FormLabel>
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
                      placeholder={intl.formatMessage({
                        id: 'desk.settings.integration.whatsapp.form.field.phoneNumber.ph.countrySelector',
                      })}
                      itemHeight={48}
                      disabled={!!nexmoAccount}
                    />
                    <InputText
                      ref={(element: HTMLInputElement) => {
                        othersForm.register(element, {
                          validate: (value) =>
                            new PhoneNumber(value, country?.code).isValid() ||
                            intl.formatMessage({
                              id: 'desk.settings.integration.whatsapp.form.field.phoneNumber.error.invalid',
                            }),
                        });
                        contactInputRef.current = element;
                      }}
                      name="whatsappNumber"
                      readOnly={!country || !!nexmoAccount}
                      styles={getContactInputCSS({
                        country,
                        hasError: othersForm.errors.whatsappNumber !== undefined,
                      })}
                      data-test-id="PhoneNumberFieldInput"
                    />
                    {country && (
                      <ContactDialogCodePrefix>
                        +{PhoneNumber.getCountryCodeForRegionCode(country.code)}
                      </ContactDialogCodePrefix>
                    )}
                  </ContactInput>
                </ContactInputContainer>
              </form>
            )}
          </OtherFieldsWrapper>
        </SettingsGridCard>
      </SettingsGridGroup>
      <Footer>
        <Button buttonType="tertiary" onClick={handleBackButtonClick}>
          {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.account.btn.cancel' })}
        </Button>
        <Button
          buttonType="primary"
          form="othersForm"
          type="submit"
          disabled={!canSubmit}
          isLoading={isCreatingAccount}
        >
          {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.form.field.account.btn.submit' })}
        </Button>
      </Footer>
    </AppSettingsContainer>
  );
};
