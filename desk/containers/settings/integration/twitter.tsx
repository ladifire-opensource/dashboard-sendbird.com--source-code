import React, { useEffect, useRef, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { Icon, Button, IconButton, toast } from 'feather';
import qs from 'qs';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { IntegrationContext } from '@desk/contexts/integrationContext';
import { generateBadRequest } from '@epics';

import { ContentWrapper, IntegrationTable, IntegrationHeader } from './components';
import { IntegrationThumbnail } from './integrationPicture';
import { IntegrationStatusItem } from './integrationStatusItem';

type Props = {
  onAddAccountButtonClick: (twitterCallbackPathname: string) => React.MouseEventHandler<HTMLButtonElement>;
} & RouteComponentProps;

export const IntegrationTwitter: React.FC<Props> = ({ location, match, onAddAccountButtonClick }) => {
  const intl = useIntl();
  const history = useHistory();
  const componentDidMount = useRef(false);

  const dispatch = useDispatch();
  const showDialogsRequest: DialogsActionCreators['showDialogsRequest'] = (dialogProps) =>
    dispatch(commonActions.showDialogsRequest(dialogProps));

  const {
    twitterReducer: {
      state: { twitterUsers, isFetchingSubscribeTwitter, isFetchingTwitterOauthToken, pendingUnsubscribeTwitterIDs },
      actions: { fetchTwitterUsers, subscribeTwitterRequest, removeTwitterAccount },
    },
  } = useContext(IntegrationContext);

  useEffect(() => {
    if (twitterUsers.length === 0) {
      if (componentDidMount.current) {
        // If this is an update after the mount, navigate back to overview page
        history.replace(match.url.substring(0, match.url.lastIndexOf('/')));
      } else {
        // on mount, try reloading facebook pages
        componentDidMount.current = true;
        fetchTwitterUsers();
      }
    }
  }, [twitterUsers, history, match.url, fetchTwitterUsers]);

  useEffect(() => {
    const { oauth_token, oauth_verifier } = qs.parse(location.search.slice(1));

    if (oauth_token && oauth_verifier) {
      subscribeTwitterRequest({ oauth_token, oauth_verifier })
        .then(() => {
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.integration.twitter.noti.add.success' }),
          });
        })
        .catch((error) => {
          generateBadRequest(error);
        })
        .finally(() => {
          // clear search to prevent duplicated requests when user refreshes the page
          history.replace(location.pathname.replace(location.search, ''));
        });
    }
  }, [location.pathname, location.search, history, subscribeTwitterRequest, intl]);

  useEffect(() => {
    // On unmount, reset componentDidMount
    return () => {
      componentDidMount.current = false;
    };
  }, []);

  const onDeleteAccountButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const targetTwitterUserID = Number(e.currentTarget.dataset.id);
    const targetAccount = twitterUsers.find((page) => page.id === targetTwitterUserID);
    const name = e.currentTarget.dataset.screenName;
    if (!targetAccount) {
      return;
    }

    showDialogsRequest({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: intl.formatMessage(
          { id: 'desk.settings.integration.removeAlert.twitter.title' },
          { accountName: `@${name}` },
        ),
        description: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.twitter.body' }),
        confirmText: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.btn.remove' }),
        onConfirm: async () => {
          if (Number.isNaN(targetTwitterUserID)) {
            fetchTwitterUsers();
            return;
          }

          try {
            await removeTwitterAccount(targetTwitterUserID);
            toast.success({
              message: intl.formatMessage({ id: 'desk.settings.integration.twitter.noti.remove.success' }),
            });
          } catch (error) {
            generateBadRequest(error);
          }
        },
      },
    });
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={match.url.substring(0, match.url.lastIndexOf('/'))} />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.integration.twitter.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <ContentWrapper>
        <IntegrationHeader>
          <Icon className="SocialMediaIcon" icon="twitter-colored" size={24} />
          <h4 className="SocialMediaName">
            <FormattedMessage id="desk.settings.integration.list.twitter.title" />
          </h4>

          <p className="SocialMediaDescription">
            <FormattedMessage id="desk.settings.integration.list.twitter.description" />
          </p>
          <Button
            className="CardAction"
            buttonType="primary"
            icon="plus"
            onClick={onAddAccountButtonClick(location.pathname)}
            disabled={isFetchingSubscribeTwitter || isFetchingTwitterOauthToken}
            isLoading={isFetchingSubscribeTwitter || isFetchingTwitterOauthToken}
          >
            <FormattedMessage id="desk.settings.integration.list.twitter.btn.add" />
          </Button>
        </IntegrationHeader>
        <IntegrationTable>
          <thead>
            <tr>
              <th className="IntegrationTable__column--pageName">
                <FormattedMessage id="desk.settings.integration.list.twitter.column.lbl.accounts" />
              </th>
              <th className="IntegrationTable__column--settings">
                <FormattedMessage id="desk.settings.integration.list.twitter.column.lbl.permissions" />
              </th>
            </tr>
          </thead>
          <tbody>
            {twitterUsers.map(({ id, profileImageUrl, screenName, isDirectMessageEventEnabled, isStatusEnabled }) => (
              <tr key={id}>
                <td className="IntegrationTable__column--pageName">
                  <IntegrationThumbnail
                    thumbnail={profileImageUrl ? { url: profileImageUrl, name: screenName } : undefined}
                  />
                  <a href={`https://twitter.com/${screenName}`} target="_blank">
                    @{screenName}
                  </a>
                </td>
                <td className="IntegrationTable__column--settings">
                  <IntegrationStatusItem
                    isEnabled={isStatusEnabled}
                    label={intl.formatMessage({ id: 'desk.settings.integration.list.twitter.lbl.tweets' })}
                  />
                  <IntegrationStatusItem
                    isEnabled={isDirectMessageEventEnabled}
                    label={intl.formatMessage({ id: 'desk.settings.integration.list.twitter.lbl.messages' })}
                  />
                  <IconButton
                    buttonType="secondary"
                    size="small"
                    title={intl.formatMessage({ id: 'desk.settings.integration.list.button.tooltip.edit' })}
                    icon="edit"
                    onClick={() => history.push(`${match.url}/${id}`)}
                    css={`
                      margin-left: auto;
                    `}
                  />
                  <IconButton
                    buttonType="secondary"
                    size="small"
                    title={intl.formatMessage({ id: 'desk.settings.integration.list.button.tooltip.delete' })}
                    icon="remove"
                    data-id={id}
                    data-screen-name={screenName}
                    onClick={onDeleteAccountButtonClick}
                    disabled={pendingUnsubscribeTwitterIDs.includes(id)}
                    isLoading={pendingUnsubscribeTwitterIDs.includes(id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </IntegrationTable>
      </ContentWrapper>
    </AppSettingsContainer>
  );
};
