import React, { useEffect, useRef, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { Icon, Button, IconButton } from 'feather';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { IntegrationContext } from '@desk/contexts/integrationContext';

import { ContentWrapper, IntegrationTable, IntegrationHeader } from './components';
import { IntegrationThumbnail } from './integrationPicture';
import { IntegrationStatusItem } from './integrationStatusItem';

type Props = { onAddAccountButtonClick: React.MouseEventHandler<HTMLButtonElement> } & RouteComponentProps;

export const IntegrationInstagram: React.FC<Props> = ({ match, onAddAccountButtonClick }) => {
  const intl = useIntl();
  const componentDidMount = useRef(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const {
    instagramReducer: {
      state: { instagramAccounts, isFetchingInstagramAccounts },
      actions: { fetchInstagramAccounts, patchInstagramAccountRequest },
    },
  } = useContext(IntegrationContext);

  useEffect(() => {
    if (instagramAccounts.length === 0) {
      if (componentDidMount.current) {
        // If this is an update after the mount, navigate back to overview page
        history.replace(match.url.substring(0, match.url.lastIndexOf('/')));
      } else {
        // on mount, try reloading Instagram accounts
        componentDidMount.current = true;
        fetchInstagramAccounts();
      }
    }
  }, [instagramAccounts, history, match.url, fetchInstagramAccounts]);

  useEffect(() => {
    // On unmount, reset componentDidMount
    return () => {
      componentDidMount.current = false;
    };
  }, []);

  const onDeleteAccountButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const targetAccount = instagramAccounts.find((account) => account.id === Number(e.currentTarget.dataset.id));
    const { name } = e.currentTarget;
    if (targetAccount) {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.Confirm,
          dialogProps: {
            title: intl.formatMessage(
              { id: 'desk.settings.integration.removeAlert.instagram.title' },
              { accountName: name },
            ),
            description: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.instagram.body' }),
            confirmText: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.btn.remove' }),
            cancelText: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.btn.cancel' }),
            onConfirm: () => {
              patchInstagramAccountRequest({
                instagramUserId: targetAccount.id,
                status: 'INACTIVE',
                onSuccess: fetchInstagramAccounts,
              });
            },
          },
        }),
      );
    }
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={match.url.substring(0, match.url.lastIndexOf('/'))} />
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.integration.instagram.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <ContentWrapper>
        <IntegrationHeader>
          <Icon className="SocialMediaIcon" icon="instagram-colored" size={24} />
          <h4 className="SocialMediaName">
            <FormattedMessage id="desk.settings.integration.list.instagram.title" />
          </h4>

          <p className="SocialMediaDescription">
            <FormattedMessage id="desk.settings.integration.list.instagram.description" />
          </p>
          <Button
            className="CardAction"
            buttonType="primary"
            icon="plus"
            onClick={onAddAccountButtonClick}
            disabled={isFetchingInstagramAccounts}
            isLoading={isFetchingInstagramAccounts}
          >
            <FormattedMessage id="desk.settings.integration.list.instagram.btn.add" />
          </Button>
        </IntegrationHeader>
        <IntegrationTable>
          <thead>
            <tr>
              <th className="IntegrationTable__column--pageName">
                <FormattedMessage id="desk.settings.integration.list.instagram.column.lbl.accounts" />
              </th>
              <th className="IntegrationTable__column--settings">
                <FormattedMessage id="desk.settings.integration.list.instagram.column.lbl.permissions" />
              </th>
            </tr>
          </thead>
          <tbody>
            {instagramAccounts
              .filter(({ status }) => status === 'ACTIVE')
              .map(({ id, username, profilePictureUrl, isCommentEnabled }) => (
                <tr key={id}>
                  <td className="IntegrationTable__column--pageName">
                    <IntegrationThumbnail
                      thumbnail={profilePictureUrl ? { url: profilePictureUrl, name: username } : undefined}
                    />
                    <a href={`https://instagram.com/${username}`} target="_blank">
                      @{username}
                    </a>
                  </td>
                  <td className="IntegrationTable__column--settings">
                    <IntegrationStatusItem
                      isEnabled={isCommentEnabled}
                      label={intl.formatMessage({ id: 'desk.settings.integration.list.instagram.lbl.comments' })}
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
                      name={username}
                      onClick={onDeleteAccountButtonClick}
                      disabled={isFetchingInstagramAccounts}
                      isLoading={isFetchingInstagramAccounts}
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
