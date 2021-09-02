import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import copy from 'copy-to-clipboard';
import { Body, Button, cssVariables, IconButton, InputText, Link, toast, useField, useForm } from 'feather';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';

import { commonActions, coreActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridCard, SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { SettingsInputTextGrid } from '@common/containers/layout/settingsGrid/settingsTextGrid';
import { RATE_LIMIT_VERSION_TIMESTAMP, REGION_STATUS_PAGES, TIME_DATE_FORMAT } from '@constants';
import { createAPITokens, fetchAPITokens, revokeAPITokens } from '@core/api';
import { getErrorMessage } from '@epics';
import { Unsaved, useAuthorization } from '@hooks';
import { selectApplication_DEPRECATED } from '@selectors';
import { ALERT_COPY_SUCCESS } from '@utils/text';

const SecondaryAPIToken = styled.div`
  position: relative;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.13px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 76px 0 16px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const SecondaryAPITokenValue = styled.div`
  color: ${cssVariables('neutral-9')};
`;

const SecondaryAPITokenActions = styled.div`
  position: absolute;
  right: 8px;
  button + button {
    margin-left: 4px;
  }
`;

const SecondaryAPITokens = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  .secondary-empty {
    width: 100%;
    font-size: 14px;
    color: ${cssVariables('neutral-6')};
    line-height: 20px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const SecondaryAPITokensTitle = styled(SecondaryAPIToken)`
  border-top: none;
  font-weight: 500;
  height: 40px;
  color: ${cssVariables('neutral-10')};
`;

const SecondaryAPITokensHeader = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
`;

const ServerText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 40px;
`;

const ServerName = styled.div`
  margin-right: 12px;
  ${Body['body-short-01']};
`;

const AppCreatedOnText = styled.p`
  padding-top: 10px;
  padding-bottom: 10px;
  ${Body['body-short-01']};
`;

const RateLimitSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  display: grid;
  grid-template-columns: 59px 1fr 135px;
  grid-column-gap: 24px;
  font-size: 14px;
  align-items: center;
`;

const RateLimitLabel = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
  application: selectApplication_DEPRECATED(state),
  isSSO: state.auth.is_social || state.auth.is_sso,
  isFetchingAppName: state.settings.isFetchingAppName,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  changeAppNameRequest: coreActions.changeAppNameRequest,
  getAPITokenRequest: coreActions.getAPITokenRequest,
};

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

export const GeneralSettingsConnectable: React.FC<Props> = ({
  organization,
  application,
  isSSO,
  isFetchingAppName,
  setUnsaved,
  showDialogsRequest,
  changeAppNameRequest,
  getAPITokenRequest,
}) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const history = useHistory();

  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [apiToken, setAPIToken] = useState('');
  const [apiTokens, setAPITokens] = useState<{ token: string; created_at: number }[]>([]);

  const appId = application.app_id;
  const apiURL = `https://api-${application.app_id}.sendbird.com`;

  const appNameForm = useForm({
    onSubmit: ({ appName }) => {
      changeAppNameRequest({ app_id: application.app_id, app_name: appName, onSuccess: appNameForm.onSuccess });
    },
  });

  const appNameField = useField<string>('appName', appNameForm, {
    defaultValue: application.app_name,
    validate: (value) => {
      let errorMessage = '';
      if (value.trim().length === 0) {
        errorMessage = intl.formatMessage({ id: 'core.settings.general.app.error_required' });
      }

      return errorMessage;
    },
  });

  const showApiToken = () => {
    setIsTokenVisible(true);
  };

  const copyAppId = useCallback(() => {
    copy(application.app_id);
    toast.info({ message: ALERT_COPY_SUCCESS });
  }, [application]);

  const copyMasterAPIToken = useCallback(() => {
    copy(apiToken);
    toast.info({ message: ALERT_COPY_SUCCESS });
  }, [apiToken]);

  const copyAPIToken = (apiToken) => () => {
    copy(apiToken);
    toast.info({ message: ALERT_COPY_SUCCESS });
  };

  const copyAPIUrl = useCallback(() => {
    copy(apiURL);
    toast.info({ message: ALERT_COPY_SUCCESS });
  }, [apiURL]);

  const handleAPITokenClick = useCallback(() => {
    if (isSSO) {
      getAPITokenRequest({
        password: '',
        onSuccess: (apiToken: string) => {
          setAPIToken(apiToken);
          showApiToken();
        },
      });
      return;
    }
    showDialogsRequest({
      dialogTypes: DialogType.GetApiToken,
      dialogProps: {
        onSuccess: (apiToken: string) => {
          setAPIToken(apiToken);
          showApiToken();
        },
      },
    });
  }, [getAPITokenRequest, isSSO, showDialogsRequest]);

  const handleRevokeAPITokenClick = (apiToken) => () => {
    showDialogsRequest({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage({ id: 'core.settings.general.apiToken_title.revokeDialog' }),
        description: intl.formatMessage({ id: 'core.settings.general.apiToken_desc.revokeDialog' }),
        confirmText: intl.formatMessage({ id: 'core.settings.general.apiToken_title.btn.revoke' }),
        onDelete: () => {
          revokeAPITokens({ appId: application.app_id, apiToken })
            .then(() => {
              setAPITokens((prevTokens) => prevTokens.filter(({ token }) => token !== apiToken));
            })
            .catch((error) => {
              toast.error({ message: getErrorMessage(error) });
            });
        },
      },
    });
  };

  const createAPIToken = useCallback(
    (masterAPIToken) => {
      createAPITokens({ appId: application.app_id, apiToken: masterAPIToken })
        .then((res) => setAPITokens((prevAPITokens) => [...prevAPITokens, res.data]))
        .catch((error) => {
          if (error && error.data && error.data.code) {
            if (error.data.code === 400203) {
              toast.warning({ message: intl.formatMessage({ id: 'core.settings.general.apiToken_toast.maximum' }) });
            }
            return;
          }
          toast.error({ message: getErrorMessage(error) });
        });
    },
    [application.app_id, intl],
  );

  const handleGenerateAPITokenClick = () => {
    if (isSSO) {
      getAPITokenRequest({
        password: '',
        onSuccess: (masterAPIToken: string) => {
          createAPIToken(masterAPIToken);
        },
      });
      return;
    }
    showDialogsRequest({
      dialogTypes: DialogType.GetApiToken,
      dialogProps: {
        description: intl.formatMessage({ id: 'core.settings.general.apiToken_desc.confirmDialog' }),
        onSuccess: (masterAPIToken: string) => {
          createAPIToken(masterAPIToken);
        },
      },
    });
  };

  const handleDeleteAppClick = useCallback(() => {
    showDialogsRequest({
      dialogTypes: DialogType.DeleteApplication,
      dialogProps: {
        application,
        onSuccess: () => {
          history.push('/');
        },
      },
    });
  }, [application, history, showDialogsRequest]);

  const handleViewStatusClick = () => {
    window.open(
      Object.keys(REGION_STATUS_PAGES).includes(application.region)
        ? REGION_STATUS_PAGES[application.region]
        : 'https://status.sendbird.com',
    );
  };

  useEffect(() => {
    setUnsaved(appNameField.updatable);
  }, [appNameField.updatable, setUnsaved]);

  useEffect(() => {
    fetchAPITokens({ appId: application.app_id })
      .then(({ data }) => setAPITokens(data.api_tokens))
      .catch((error) => {
        toast.error({ message: getErrorMessage(error) });
      });
  }, [application.app_id]);

  const masterAPITokenAction = isTokenVisible ? 'copy' : 'show';
  const isRateLimitV2 = moment(organization.created_at).valueOf() >= RATE_LIMIT_VERSION_TIMESTAMP;

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'core.settings.application.tab.general' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <SettingsGridGroup>
        <SettingsGridCard title={intl.formatMessage({ id: 'core.settings.general.appId.title' })}>
          <InputText
            name="app_id"
            value={appId}
            readOnly={true}
            icons={[
              {
                icon: 'copy',
                title: 'Copy',
                onClick: copyAppId,
              },
            ]}
            data-test-id="AppIdField"
          />
        </SettingsGridCard>
        <SettingsInputTextGrid
          title={intl.formatMessage({ id: 'core.settings.general.app.title' })}
          titleColumns={6}
          form={appNameForm}
          field={appNameField}
          isFetching={isFetchingAppName}
          readOnly={!isPermitted(['application.settings.all'])}
        />
        <SettingsGridCard title={intl.formatMessage({ id: 'core.settings.general.app.createdOn' })}>
          <AppCreatedOnText>{moment(application.created_at).format(TIME_DATE_FORMAT)}</AppCreatedOnText>
        </SettingsGridCard>
        <SettingsGridCard title={intl.formatMessage({ id: 'core.settings.general.server.title' })}>
          <ServerText>
            <ServerName>
              {Object.prototype.hasOwnProperty.call(organization.regions, application.region)
                ? organization.regions[application.region].name
                : application.region}
            </ServerName>
            <Button buttonType="tertiary" size="small" icon="open-in-new" onClick={handleViewStatusClick}>
              {intl.formatMessage({ id: 'core.settings.general.server.viewStatus' })}
            </Button>
          </ServerText>
        </SettingsGridCard>
      </SettingsGridGroup>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.settings.general.apiRequestUrl.title' })}
          titleColumns={6}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <InputText
            name="api_url"
            value={apiURL}
            readOnly={true}
            icons={[
              {
                icon: 'copy',
                title: 'Copy',
                onClick: copyAPIUrl,
              },
            ]}
            data-test-id="APIRequestURLField"
          />
          <RateLimitSection>
            <RateLimitLabel>{intl.formatMessage({ id: 'core.settings.general.rateLimit.label' })}</RateLimitLabel>
            {isRateLimitV2 ? 'V2' : 'V1'}
            <Link
              href={
                isRateLimitV2
                  ? 'https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits'
                  : 'https://sendbird.com/docs/chat/v3/platform-api/guides/application#-3-default-settings'
              }
              target="_blank"
              iconProps={{
                size: 16,
                icon: 'open-in-new',
              }}
            >
              {intl.formatMessage({ id: 'core.settings.general.rateLimit.docs' })}
            </Link>
          </RateLimitSection>
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.settings.general.apiToken_title' })}
          description={intl.formatMessage({ id: 'core.settings.general.apiToken_desc' })}
          titleColumns={6}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <InputText
            label={intl.formatMessage({ id: 'core.settings.general.apiToken.label.masterAPIToken' })}
            value={isTokenVisible ? apiToken : '●●●●●●●●●●●●●●●'}
            icons={
              isPermitted(['application.settings.all'])
                ? [
                    {
                      icon: masterAPITokenAction,
                      title: upperFirst(masterAPITokenAction),
                      onClick: isTokenVisible ? copyMasterAPIToken : handleAPITokenClick,
                    },
                  ]
                : []
            }
            readOnly={true}
            data-test-id="MasterAPITokenField"
          />
          <SecondaryAPITokensHeader>
            {intl.formatMessage({ id: 'core.settings.general.apiToken.label.secondaryAPIToken' })}
          </SecondaryAPITokensHeader>
          <SecondaryAPITokens>
            <SecondaryAPITokensTitle>
              {intl.formatMessage({ id: 'core.settings.general.apiToken.label.tokens' })}
            </SecondaryAPITokensTitle>
            {apiTokens.length > 0 ? (
              apiTokens.map((apiToken, index) => (
                <SecondaryAPIToken key={`apiToken_${index}`} data-test-id="SecondaryAPIToken">
                  <SecondaryAPITokenValue>{apiToken.token}</SecondaryAPITokenValue>
                  <SecondaryAPITokenActions>
                    <IconButton
                      icon="copy"
                      buttonType="tertiary"
                      size="small"
                      title="Copy"
                      onClick={copyAPIToken(apiToken.token)}
                    />
                    {isPermitted(['application.settings.all']) && (
                      <IconButton
                        icon="delete"
                        buttonType="tertiary"
                        size="small"
                        title={intl.formatMessage({ id: 'core.settings.general.apiToken_title.btn.revoke' })}
                        onClick={handleRevokeAPITokenClick(apiToken.token)}
                        data-test-id="DeleteButton"
                      />
                    )}
                  </SecondaryAPITokenActions>
                </SecondaryAPIToken>
              ))
            ) : (
              <div className="secondary-empty">
                {intl.formatMessage({ id: 'core.settings.general.apiToken_desc.empty' })}
              </div>
            )}
          </SecondaryAPITokens>
          {isPermitted(['application.settings.all']) && (
            <Button buttonType="primary" variant="ghost" size="small" icon="plus" onClick={handleGenerateAPITokenClick}>
              {intl.formatMessage({ id: 'core.settings.general.apiToken_btn.generateSecondaryAPIToken' })}
            </Button>
          )}
        </SettingsGridCard>
      </SettingsGridGroup>
      {isPermitted(['application.settings.all']) && (
        <SettingsGridGroup>
          <SettingsGridCard title={intl.formatMessage({ id: 'core.settings.general.delete.title' })} titleColumns={6}>
            <Button
              buttonType="danger"
              styles={css`
                width: 96px;
              `}
              onClick={handleDeleteAppClick}
              data-test-id="DeleteApplicationButton"
            >
              {intl.formatMessage({ id: 'core.settings.general.delete.button' })}
            </Button>
          </SettingsGridCard>
        </SettingsGridGroup>
      )}
    </AppSettingsContainer>
  );
};

export const GeneralSettings = connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsConnectable);
