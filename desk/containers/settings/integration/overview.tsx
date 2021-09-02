import React, { useEffect, useMemo, useCallback, useContext, FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, Button, Icon, Subtitles, Body, InlineNotification, toast, Lozenge } from 'feather';
import qs from 'qs';

import { deskActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { getProjectNexmoAccounts } from '@desk/api';
import { IntegrationContext } from '@desk/contexts/integrationContext';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { isAllowedToUseIframe } from '@desk/utils/iframeUtils';
import { isAllowedToUseSocial, isAllowedToUseInstagram, isAllowedToUseWhatsApp } from '@desk/utils/socialUtils';
import { generateBadRequest } from '@epics';
import { useIframeAppIntegration, useAsync, useAppId } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';
import { TabMenu } from '@ui/components';

import { ContentWrapper } from './components';

const IntegrationCard = styled.div`
  position: relative;
  grid-column: span 5;
  border: 1px solid ${cssVariables('neutral-3')};
  padding: 24px;
  border-radius: 4px;

  .IntegrationCardIcon {
    margin-bottom: 16px;
  }

  .IntegrationCardName {
    display: flex;
    align-items: center;
    ${Subtitles['subtitle-03']}
    color: ${cssVariables('neutral-10')};
    margin-bottom: 8px;

    ${Lozenge} {
      margin-left: 8px;
    }
  }

  .IntegrationCardDescription {
    ${Body['body-short-01']}
    color: ${cssVariables('neutral-7')};
    margin-bottom: 16px;
  }

  .IntegratedMark {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .CardAction {
    margin-left: -12px;
  }
`;

const ErrorNotification = styled(InlineNotification)`
  margin: 0 -20px -20px -20px;
`;

type Props = {
  handleAddFacebookPageClick: React.MouseEventHandler<HTMLButtonElement>;
  handleAddTwitterAccountClick: (twitterCallbackPathname: string) => React.MouseEventHandler<HTMLButtonElement>;
  handleAddInstagramClick: React.MouseEventHandler<HTMLButtonElement>;
  onIframeButtonClick: React.MouseEventHandler<HTMLButtonElement>;
};

const FacebookCard = React.memo<Pick<Props, 'handleAddFacebookPageClick'>>(({ handleAddFacebookPageClick }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const match = useRouteMatch();
  const {
    facebookPages,
    isAddingFacebookPages,
    fetchFacebookActivePages: { isFetching: isFetchingFacebookPages, error: fetchFacebookPagesError },
  } = useSelector((state: RootState) => state.integrations);

  const fetchFacebookActivePages = useCallback(() => {
    dispatch(deskActions.facebookActivePagesRequest());
  }, [dispatch]);

  useEffect(() => {
    fetchFacebookActivePages();
  }, [fetchFacebookActivePages]);

  const handleClickButton = useCallback(() => {
    history.push(`${match?.url}/facebook`);
  }, [history, match]);

  const facebookButton =
    facebookPages.length > 0 ? (
      <Button className="CardAction" buttonType="primary" variant="ghost" onClick={handleClickButton}>
        <FormattedMessage id="desk.settings.integration.facebook.btn.manage" values={{ count: facebookPages.length }} />
      </Button>
    ) : (
      <Button
        className="CardAction"
        buttonType="primary"
        variant="ghost"
        icon="plus"
        onClick={handleAddFacebookPageClick}
        disabled={isAddingFacebookPages || isFetchingFacebookPages}
        isLoading={isAddingFacebookPages || isFetchingFacebookPages}
      >
        <FormattedMessage id="desk.settings.integration.facebook.btn.add" />
      </Button>
    );

  return (
    <IntegrationCard>
      <Icon className="IntegrationCardIcon" icon="facebook-colored" size={24} />
      <h4 className="IntegrationCardName">
        <FormattedMessage id="desk.settings.integration.facebook.title" />
      </h4>
      {facebookPages.length > 0 && (
        <Icon className="IntegratedMark" icon="success" size={20} color={cssVariables('green-5')} />
      )}
      <p className="IntegrationCardDescription">
        <FormattedMessage id="desk.settings.integration.facebook.lbl.description" />
      </p>
      {fetchFacebookPagesError ? (
        <ErrorNotification
          type="error"
          message={fetchFacebookPagesError}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.integration.btn.retry' }),
            onClick: () => {
              fetchFacebookActivePages();
            },
          }}
        />
      ) : (
        facebookButton
      )}
    </IntegrationCard>
  );
});

const TwitterCard = React.memo<Pick<Props, 'handleAddTwitterAccountClick'>>(({ handleAddTwitterAccountClick }) => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();
  const url = match?.url ?? ''; // To add this url at deps of useEffect, to prevent infinite loop
  const {
    twitterReducer: {
      state: {
        twitterUsers,
        isFetchingTwitterUsers,
        isFetchingSubscribeTwitter,
        isFetchingTwitterOauthToken,
        fetchTwitterUsersError,
      },
      actions: { fetchTwitterUsers, subscribeTwitterRequest },
    },
  } = useContext(IntegrationContext);

  const handleClickButton = useCallback(() => {
    history.push(`${url}/twitter`);
  }, [history, url]);

  useEffect(() => {
    fetchTwitterUsers();
  }, [fetchTwitterUsers]);

  useEffect(() => {
    const { oauth_token, oauth_verifier } = qs.parse(location.search.slice(1));
    if (oauth_token && oauth_verifier) {
      subscribeTwitterRequest({ oauth_token, oauth_verifier })
        .then(() => {
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.integration.twitter.noti.add.success' }),
          });
          history.push(`${url}/twitter`);
        })
        .catch((error) => {
          generateBadRequest(error);

          // clear search to prevent duplicated requests when user refreshes the page
          history.replace(location.pathname.replace(location.search, ''));
        });
    }
  }, [intl, location.pathname, location.search, history, subscribeTwitterRequest, url]);

  const twitterButton =
    twitterUsers.length > 0 ? (
      <Button className="CardAction" buttonType="primary" variant="ghost" onClick={handleClickButton}>
        <FormattedMessage id="desk.settings.integration.twitter.btn.manage" values={{ count: twitterUsers.length }} />
      </Button>
    ) : (
      <Button
        className="CardAction"
        buttonType="primary"
        variant="ghost"
        icon="plus"
        onClick={handleAddTwitterAccountClick(location.pathname)}
        disabled={isFetchingTwitterUsers || isFetchingSubscribeTwitter || isFetchingTwitterOauthToken}
        isLoading={isFetchingTwitterUsers || isFetchingSubscribeTwitter || isFetchingTwitterOauthToken}
      >
        <FormattedMessage id="desk.settings.integration.twitter.btn.add" />
      </Button>
    );

  return (
    <IntegrationCard>
      <Icon className="IntegrationCardIcon" icon="twitter-colored" size={24} />
      <h4 className="IntegrationCardName">
        <FormattedMessage id="desk.settings.integration.twitter.title" />
      </h4>
      {twitterUsers.length > 0 && (
        <Icon className="IntegratedMark" icon="success" size={20} color={cssVariables('green-5')} />
      )}
      <p className="IntegrationCardDescription">
        <FormattedMessage id="desk.settings.integration.twitter.lbl.description" />
      </p>
      {fetchTwitterUsersError ? (
        <ErrorNotification
          type="error"
          message={fetchTwitterUsersError}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.integration.btn.retry' }),
            onClick: () => {
              fetchTwitterUsers();
            },
          }}
        />
      ) : (
        twitterButton
      )}
    </IntegrationCard>
  );
});

const InstagramCard = React.memo<Pick<Props, 'handleAddInstagramClick'>>(({ handleAddInstagramClick }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const history = useHistory();

  const handleClickButton = useCallback(() => {
    history.push(`${match?.url}/instagram`);
  }, [history, match]);

  const {
    instagramReducer: {
      state: {
        instagramAccounts,
        isFetchingInstagramAccounts,
        isPatchingInstagramAccounts,
        fetchInstagramAccountsError,
      },
      actions: { fetchInstagramAccounts },
    },
  } = useContext(IntegrationContext);

  useEffect(() => {
    fetchInstagramAccounts();
  }, [fetchInstagramAccounts]);

  const activeInstagramAccounts = instagramAccounts.filter((account) => account.status === 'ACTIVE');
  const instagramButton =
    activeInstagramAccounts.length > 0 ? (
      <Button className="CardAction" buttonType="primary" variant="ghost" onClick={handleClickButton}>
        <FormattedMessage
          id="desk.settings.integration.instagram.btn.manage"
          values={{ count: instagramAccounts.length }}
        />
      </Button>
    ) : (
      <Button
        className="CardAction"
        buttonType="primary"
        variant="ghost"
        icon="plus"
        onClick={handleAddInstagramClick}
        disabled={isFetchingInstagramAccounts || isPatchingInstagramAccounts}
        isLoading={isFetchingInstagramAccounts || isPatchingInstagramAccounts}
      >
        <FormattedMessage id="desk.settings.integration.instagram.btn.add" />
      </Button>
    );

  return (
    <IntegrationCard>
      <Icon className="IntegrationCardIcon" icon="instagram-colored" size={24} />
      <h4 className="IntegrationCardName">
        <FormattedMessage id="desk.settings.integration.instagram.title" />
      </h4>
      {activeInstagramAccounts.length > 0 && (
        <Icon className="IntegratedMark" icon="success" size={20} color={cssVariables('green-5')} />
      )}
      <p className="IntegrationCardDescription">
        <FormattedMessage id="desk.settings.integration.instagram.lbl.description" />
      </p>
      {fetchInstagramAccountsError ? (
        <ErrorNotification
          type="error"
          message={fetchInstagramAccountsError}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.integration.btn.retry' }),
            onClick: () => {
              fetchInstagramAccounts();
            },
          }}
        />
      ) : (
        instagramButton
      )}
    </IntegrationCard>
  );
});

const WhatsAppCard: FC = () => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const history = useHistory();
  const appId = useAppId();

  const [{ status, data: response }, loadProjectNexmoAccounts] = useAsync(
    () => getProjectNexmoAccounts(pid, region, { offset: 0, limit: 1 }),
    [pid, region],
  );
  const hasAccount = (response?.data.count ?? 0) > 0;

  const redirectToDetailPage = useCallback(() => {
    if (status === 'success' && response?.data != null && hasAccount) {
      history.push(`/${appId}/desk/settings/integration/whatsapp/${response.data.results[0].id}`);
      return;
    }
    history.push(`/${appId}/desk/settings/integration/whatsapp`);
  }, [appId, hasAccount, history, response, status]);

  useEffect(() => {
    loadProjectNexmoAccounts();
  }, [loadProjectNexmoAccounts]);

  const cardFooter = useMemo(() => {
    if (status === 'error') {
      return (
        <ErrorNotification
          type="error"
          message={intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.error.unexpected' })}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.error.btn.retry' }),
            onClick: loadProjectNexmoAccounts,
          }}
        />
      );
    }
    if (status === 'success' && hasAccount) {
      return (
        <Button className="CardAction" buttonType="primary" variant="ghost" onClick={redirectToDetailPage}>
          {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.btn.manage' })}
        </Button>
      );
    }
    return (
      <Button
        className="CardAction"
        buttonType="primary"
        variant="ghost"
        icon="plus"
        onClick={redirectToDetailPage}
        disabled={status === 'init' || status === 'loading'}
        isLoading={status === 'init' || status === 'loading'}
      >
        {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.btn.add' })}
      </Button>
    );
  }, [status, hasAccount, redirectToDetailPage, intl, loadProjectNexmoAccounts]);

  return (
    <IntegrationCard>
      <Icon className="IntegrationCardIcon" icon="whatsapp-colored" size={24} />
      <h4 className="IntegrationCardName">
        {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.title' })}
      </h4>
      {status === 'success' && hasAccount && (
        <Icon className="IntegratedMark" icon="success" size={20} color={cssVariables('green-5')} />
      )}
      <p className="IntegrationCardDescription">
        {intl.formatMessage({ id: 'desk.settings.integration.whatsapp.card.desc' })}
      </p>
      {cardFooter}
    </IntegrationCard>
  );
};

const IframeSidebarCard = React.memo<Pick<Props, 'onIframeButtonClick'>>(({ onIframeButtonClick }) => {
  const intl = useIntl();
  const { isInstalled, error, load, isFetching, isEnabled } = useIframeAppIntegration();

  const iframeButton = useMemo(
    () => (
      <Button
        className="CardAction"
        buttonType="primary"
        variant="ghost"
        icon={isInstalled ? 'settings' : 'plus'}
        onClick={onIframeButtonClick}
        isLoading={isFetching}
      >
        <FormattedMessage
          id={
            isInstalled
              ? 'desk.settings.integration.iframe.btn.settings'
              : 'desk.settings.integration.iframe.btn.install'
          }
        />
      </Button>
    ),
    [onIframeButtonClick, isFetching, isInstalled],
  );

  return (
    <IntegrationCard>
      <Icon className="IntegrationCardIcon" icon="iframe-colored" size={24} />
      <h4 className="IntegrationCardName">
        {intl.formatMessage({ id: 'desk.settings.integration.iframe.title' })}
        {isInstalled && !isEnabled && (
          <Lozenge color="neutral">
            {intl.formatMessage({ id: 'desk.settings.integration.iframe.badge.disabled' })}
          </Lozenge>
        )}
      </h4>
      {isInstalled && <Icon className="IntegratedMark" icon="success" size={20} color={cssVariables('green-5')} />}
      <p className="IntegrationCardDescription">
        {intl.formatMessage({ id: 'desk.settings.integration.iframe.desc' })}
      </p>
      {error ? (
        <ErrorNotification
          type="error"
          message={intl.formatMessage({ id: 'desk.settings.integration.iframe.error.notification' })}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.integration.iframe.error.btn.retry' }),
            onClick: load,
          }}
        />
      ) : (
        iframeButton
      )}
    </IntegrationCard>
  );
});

enum TabMenuItem {
  ALL = 'all',
  SOCIAL = 'social',
  APPS = 'apps',
}

const tabItems: TabMenuItem[] = [TabMenuItem.ALL, TabMenuItem.SOCIAL, TabMenuItem.APPS];

type SearchParams = {
  tab: TabMenuItem | undefined;
};

export const IntegrationOverview = ({
  handleAddFacebookPageClick,
  handleAddTwitterAccountClick,
  handleAddInstagramClick,
  onIframeButtonClick,
}: Props) => {
  const intl = useIntl();
  const uid = useSelector((state: RootState) => state.organizations.current.uid);
  const isShownTab = (isAllowedToUseSocial(uid) || isAllowedToUseInstagram(uid)) && isAllowedToUseIframe(uid);
  const { tab, updateParams } = useQueryString<SearchParams>(
    { tab: isShownTab ? TabMenuItem.ALL : undefined },
    {
      tab: (tab) => tabItems.filter(() => isShownTab).some((item) => item === tab),
    },
  );

  const activeTabIndex = tab ? tabItems.indexOf(tab) : 0;

  const handleTabClick = useCallback(
    (index: number) => {
      updateParams({ tab: tabItems[index] ?? TabMenuItem.ALL });
    },
    [updateParams],
  );

  const renderIntegrationCards = useMemo(() => {
    const socialIntegrationCards = [
      isAllowedToUseSocial(uid) && (
        <FacebookCard key="facebook" handleAddFacebookPageClick={handleAddFacebookPageClick} />
      ),
      isAllowedToUseSocial(uid) && (
        <TwitterCard key="twitter" handleAddTwitterAccountClick={handleAddTwitterAccountClick} />
      ),
      isAllowedToUseInstagram(uid) && (
        <InstagramCard key="instagram" handleAddInstagramClick={handleAddInstagramClick} />
      ),
      isAllowedToUseWhatsApp(uid) && <WhatsAppCard key="whatsapp" />,
    ];
    const appsIntegrationCards = [
      isAllowedToUseIframe(uid) && <IframeSidebarCard key="iframe" onIframeButtonClick={onIframeButtonClick} />,
    ];
    const allIntegrationCards = [...socialIntegrationCards, ...appsIntegrationCards];

    switch (tab) {
      case TabMenuItem.SOCIAL:
        return socialIntegrationCards;
      case TabMenuItem.APPS:
        return appsIntegrationCards;
      case TabMenuItem.ALL:
      default:
        return allIntegrationCards;
    }
  }, [
    handleAddFacebookPageClick,
    onIframeButtonClick,
    handleAddInstagramClick,
    handleAddTwitterAccountClick,
    tab,
    uid,
  ]);

  return (
    <AppSettingsContainer
      css={css`
        ${AppSettingPageHeader} + * {
          margin-top: 0;
        }
      `}
    >
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.integration.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      {isShownTab && (
        <TabMenu
          tabs={[
            {
              label: intl.formatMessage({ id: 'desk.settings.integration.tab.all' }),
              value: 'ALL',
            },
            {
              label: intl.formatMessage({ id: 'desk.settings.integration.tab.social' }),
              value: 'SOCIAL',
            },
            {
              label: intl.formatMessage({ id: 'desk.settings.integration.tab.apps' }),
              value: 'APPS',
            },
          ]}
          activeTab={activeTabIndex}
          hasBorder={false}
          handleTabClick={handleTabClick}
          css={css`
            margin-bottom: 24px;
          `}
        />
      )}
      <ContentWrapper isGrid={true}>{renderIntegrationCards}</ContentWrapper>
    </AppSettingsContainer>
  );
};
