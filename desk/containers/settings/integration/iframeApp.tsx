import { memo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { Icon, Button, cssVariables, InputText, toast, Headings, Body, Toggle } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  SettingsGridGroup,
  SettingsGridCard,
  AppSettingsContainer,
  AppSettingPageHeader,
} from '@common/containers/layout';
import { URL_REGEX, DEFAULT_IFRAME_WIDTH } from '@constants';
import { useIframeAppSetting, useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

const IFRAME_MIN_WIDTH = 288;
const IFRAME_MAX_WIDTH = 800;

const IntegrationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${cssVariables('neutral-2')};
  border-radius: 4px;
  padding: 24px;

  & > div:first-child {
    display: flex;
  }
`;

const IntegrationDescription = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  margin-left: 24px;

  & > h4 {
    ${Headings['heading-03']};
    color: ${cssVariables('neutral-10')};
  }

  & > p {
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-10')};
  }
`;

const SettingsSection = styled(SettingsGridCard)`
  border: none;
`;

const Container = styled(SettingsGridGroup)`
  margin-top: 16px;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};

  ${SettingsSection} + ${SettingsSection} {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const SecretKeyMessage = styled.p`
  display: flex;
  align-items: center;
  height: 40px;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-6')};
`;

const SettingFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;

  button + button {
    margin-left: 8px;
  }
`;

type FormValues = {
  title: string;
  url: string;
  width: number;
};

const uninstallVerifyText = 'DELETE';

export const IntegrationIframe = memo(() => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();
  const showDialog = useShowDialog();
  const { getErrorMessage } = useDeskErrorHandler();
  const { register, handleSubmit, setValue, errors, trigger } = useForm<FormValues>();
  const {
    iframeAppDetail,
    createIframeApp,
    updateIframeAppDetail,
    toggleIframeApp,
    uninstallIframeApp,
    isFetching,
    isUpdating,
    isCreating,
    isToggling,
  } = useIframeAppSetting();

  const isInstalled = iframeAppDetail !== undefined;
  const isLoading = isFetching || isUpdating || isCreating || isToggling;
  const isFormEditable = !isLoading && (!isInstalled || iframeAppDetail?.isEnabled);
  const backButtonHref = match?.url.substring(0, match.url.lastIndexOf('/')) ?? '';

  const handleUninstall = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Uninstall,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'desk.settings.integration.iframe.dialog.uninstall.title' }),
        description: intl.formatMessage(
          { id: 'desk.settings.integration.iframe.dialog.uninstall.desc' },
          { div: () => <br />, b: (text) => <b css="font-weight: 600;">{text}</b> },
        ),
        confirmText: intl.formatMessage({ id: 'desk.settings.integration.iframe.dialog.uninstall.btn.uninstall' }),
        cancelText: intl.formatMessage({ id: 'desk.settings.integration.iframe.dialog.uninstall.btn.cancel' }),
        placeholder: intl.formatMessage(
          { id: 'desk.settings.integration.iframe.dialog.uninstall.placeholder' },
          { verifyText: uninstallVerifyText },
        ),
        verifyText: uninstallVerifyText,
        onUninstall: async () => {
          try {
            await uninstallIframeApp();
            history.push(backButtonHref);
          } catch (err) {
            toast.error({ message: getErrorMessage(err) });
          }
        },
      },
    });
  }, [backButtonHref, getErrorMessage, history, intl, showDialog, uninstallIframeApp]);

  const handleValidate = useCallback(
    (key: keyof FormValues) => () => {
      trigger(key);
    },
    [trigger],
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      iframeAppDetail
        ? updateIframeAppDetail({ ...data, width: Number(data.width) })
        : createIframeApp({ ...data, width: Number(data.width) });
    },
    [createIframeApp, iframeAppDetail, updateIframeAppDetail],
  );

  const errorProcessor = useCallback(
    (key: keyof FormValues) => {
      return errors[key]
        ? {
            hasError: true,
            message: String(errors[key]?.message) || '',
          }
        : undefined;
    },
    [errors],
  );

  const copySecretKey = useCallback(
    (key: string) => () => {
      copy(key);
      toast.success({
        message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.copiedSecretKey' }),
      });
    },
    [intl],
  );

  useEffect(() => {
    if (iframeAppDetail) {
      [
        { name: 'title' as const, value: iframeAppDetail.title },
        { name: 'url' as const, value: iframeAppDetail.url },
        { name: 'width' as const, value: iframeAppDetail.width },
      ].forEach(({ name, value }) => setValue(name, value));
    }
  }, [iframeAppDetail, setValue]);

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={backButtonHref} />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.integration.iframe.form.header' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          {iframeAppDetail && (
            <Button
              className="CardAction"
              buttonType="tertiary"
              variant="ghost"
              icon="delete"
              onClick={handleUninstall}
              data-test-id="DeleteButton"
            >
              {intl.formatMessage({ id: 'desk.settings.integration.iframe.form.btn.uninstall' })}
            </Button>
          )}
        </AppSettingPageHeader.Actions>
      </AppSettingPageHeader>
      <IntegrationHeader>
        <div>
          <Icon icon="iframe-colored" size={60} />
          <IntegrationDescription>
            <h4>{intl.formatMessage({ id: 'desk.settings.integration.iframe.title' })}</h4>
            <p>{intl.formatMessage({ id: 'desk.settings.integration.iframe.desc' })}</p>
          </IntegrationDescription>
        </div>
        {iframeAppDetail && (
          <Toggle data-test-id="ToggleButton" checked={iframeAppDetail.isEnabled} onChange={toggleIframeApp} />
        )}
      </IntegrationHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <SettingsSection
            title={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.secretKey.lbl' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.secretKey.desc' })}
          >
            {iframeAppDetail ? (
              <InputText
                name="secretKey"
                data-test-id="SecretKeyInput"
                readOnly={true}
                icons={[
                  {
                    icon: 'copy',
                    title: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.secretKey.copy' }),
                    onClick: copySecretKey(iframeAppDetail.secretKey),
                  },
                ]}
                disabled={!iframeAppDetail.isEnabled}
                defaultValue={iframeAppDetail.secretKey}
              />
            ) : (
              <SecretKeyMessage data-test-id="SecretKeyMessage">
                {intl.formatMessage({ id: 'desk.settings.integration.iframe.form.secretKey.placeholder' })}
              </SecretKeyMessage>
            )}
          </SettingsSection>
          <SettingsSection title={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.title.lbl' })}>
            <InputText
              name="title"
              data-test-id="TitleInput"
              ref={register({
                required: {
                  value: true,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.title.error.empty' }),
                },
                maxLength: {
                  value: 25,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.title.error.maxLength' }),
                },
              })}
              disabled={!isFormEditable}
              onChange={handleValidate('title')}
              error={errorProcessor('title')}
            />
          </SettingsSection>
          <SettingsSection
            title={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.lbl' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.desc' })}
          >
            <InputText
              name="url"
              data-test-id="UrlInput"
              ref={register({
                required: {
                  value: true,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.error.empty' }),
                },
                maxLength: {
                  value: 190,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.error.maxLength' }),
                },
                pattern: {
                  value: URL_REGEX,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.error.invalid' }),
                },
              })}
              disabled={!isFormEditable}
              placeholder={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.url.placeholder' })}
              onChange={handleValidate('url')}
              error={errorProcessor('url')}
            />
          </SettingsSection>
          <SettingsSection
            title={intl.formatMessage({ id: 'desk.settings.integration.iframe.form.width.lbl' })}
            description={intl.formatMessage(
              { id: 'desk.settings.integration.iframe.form.width.desc' },
              { min: IFRAME_MIN_WIDTH, max: IFRAME_MAX_WIDTH },
            )}
          >
            <InputText
              name="width"
              data-test-id="WidthInput"
              type="number"
              ref={register({
                required: {
                  value: true,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.width.error.invalid' }),
                },
                min: {
                  value: IFRAME_MIN_WIDTH,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.width.error.invalid' }),
                },
                max: {
                  value: IFRAME_MAX_WIDTH,
                  message: intl.formatMessage({ id: 'desk.settings.integration.iframe.form.width.error.invalid' }),
                },
              })}
              disabled={!isFormEditable}
              defaultValue={DEFAULT_IFRAME_WIDTH}
              onChange={handleValidate('width')}
              error={errorProcessor('width')}
            />
          </SettingsSection>
        </Container>
        <SettingFooter>
          <Button
            buttonType="tertiary"
            type="button"
            onClick={() => {
              history.push(backButtonHref);
            }}
          >
            {intl.formatMessage({ id: 'desk.settings.integration.iframe.form.btn.cancel' })}
          </Button>
          <Button buttonType="primary" type="submit" disabled={!isEmpty(errors)} isLoading={isUpdating || isCreating}>
            {intl.formatMessage({ id: 'desk.settings.integration.iframe.form.btn.save' })}
          </Button>
        </SettingFooter>
      </form>
    </AppSettingsContainer>
  );
});
