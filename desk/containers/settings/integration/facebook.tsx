import React, { useEffect, useRef, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { Icon, Button, IconButton } from 'feather';
import { createSelector } from 'reselect';

import { deskActions, commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer } from '@common/containers/layout';
import { AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';

import { ContentWrapper, IntegrationTable, IntegrationHeader } from './components';
import { IntegrationThumbnail } from './integrationPicture';
import { IntegrationStatusItem } from './integrationStatusItem';

type Props = {
  onAddPageButtonClick: React.MouseEventHandler<HTMLButtonElement>;
} & RouteComponentProps;

const selectFacebookIntegration = createSelector(
  (state: RootState) => state.integrations.facebookPages,
  (state: RootState) => state.integrations.isAddingFacebookPages,
  (state: RootState) => state.integrations.isUnsubscribingFacebookPage,
  (facebookPages, isAddingFacebookPages, isUnsubscribingFacebookPage) => ({
    facebookPages,
    isAddingFacebookPages,
    isUnsubscribingFacebookPage,
  }),
);

export const IntegrationFacebook: React.FC<Props> = ({ match, onAddPageButtonClick }) => {
  const intl = useIntl();
  const history = useHistory();

  const dispatch = useDispatch();
  const { facebookPages, isAddingFacebookPages, isUnsubscribingFacebookPage } = useSelector(selectFacebookIntegration);

  const componentDidMount = useRef(false);
  useEffect(() => {
    if (facebookPages.length === 0) {
      if (componentDidMount.current) {
        // If this is an update after the mount, navigate back to overview page
        history.replace(match.url.substring(0, match.url.lastIndexOf('/')));
      } else {
        // on mount, try reloading facebook pages
        componentDidMount.current = true;
        dispatch(deskActions.facebookActivePagesRequest());
      }
    }
  }, [facebookPages, dispatch, history, match.url]);

  useEffect(() => {
    // On unmount, reset componentDidMount
    return () => {
      componentDidMount.current = false;
    };
  }, []);

  const navigateTo = useCallback(
    (URL: string) => () => {
      history.push(URL);
    },
    [history],
  );

  const onDeletePageButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const targetPage = facebookPages.find((page) => page.id === Number(e.currentTarget.dataset.id));
    const { pageName } = e.currentTarget.dataset;
    if (targetPage) {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.Confirm,
          dialogProps: {
            title: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.facebook.title' }, { pageName }),
            description: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.facebook.body' }),
            confirmText: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.btn.remove' }),
            cancelText: intl.formatMessage({ id: 'desk.settings.integration.removeAlert.btn.cancel' }),
            onConfirm: () => {
              dispatch(deskActions.facebookUnsubscribeRequest({ facebookPage: targetPage }));
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
          {intl.formatMessage({ id: 'desk.settings.integration.facebook.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>

      <ContentWrapper>
        <IntegrationHeader>
          <Icon className="SocialMediaIcon" icon="facebook-colored" size={24} />
          <h4 className="SocialMediaName">
            <FormattedMessage id="desk.settings.integration.list.facebook.title" />
          </h4>

          <p className="SocialMediaDescription">
            <FormattedMessage id="desk.settings.integration.list.facebook.description" />
          </p>
          <Button
            className="CardAction"
            buttonType="primary"
            icon="plus"
            onClick={onAddPageButtonClick}
            disabled={isAddingFacebookPages}
            isLoading={isAddingFacebookPages}
          >
            <FormattedMessage id="desk.settings.integration.facebook.btn.add" />
          </Button>
        </IntegrationHeader>
        <IntegrationTable>
          <thead>
            <tr>
              <th className="IntegrationTable__column--pageName">
                <FormattedMessage id="desk.settings.integration.list.facebook.column.lbl.pages" />
              </th>
              <th className="IntegrationTable__column--settings">
                <FormattedMessage id="desk.settings.integration.list.facebook.column.lbl.permissions" />
              </th>
            </tr>
          </thead>
          <tbody>
            {facebookPages.map((page) => (
              <tr key={page.id}>
                <td className="IntegrationTable__column--pageName">
                  <IntegrationThumbnail
                    thumbnail={page.picture ? { url: page.picture.url, name: page.name } : undefined}
                  />
                  <a href={`https://facebook.com/${page.pageId}`} target="_blank">
                    {page.name}
                  </a>
                </td>
                <td className="IntegrationTable__column--settings">
                  <IntegrationStatusItem
                    isEnabled={page.isFeedEnabled}
                    label={intl.formatMessage({ id: 'desk.settings.integration.list.facebook.lbl.post' })}
                  />
                  <IntegrationStatusItem
                    isEnabled={page.isConversationEnabled}
                    label={intl.formatMessage({ id: 'desk.settings.integration.list.facebook.lbl.messages' })}
                  />
                  <IconButton
                    buttonType="secondary"
                    size="small"
                    title={intl.formatMessage({ id: 'desk.settings.integration.list.button.tooltip.edit' })}
                    icon="edit"
                    onClick={navigateTo(`${match.url}/${page.id}`)}
                    css={`
                      margin-left: auto;
                    `}
                  />
                  <IconButton
                    buttonType="secondary"
                    size="small"
                    title={intl.formatMessage({ id: 'desk.settings.integration.list.button.tooltip.delete' })}
                    icon="remove"
                    data-id={page.id}
                    name={page.name}
                    data-page-name={page.name}
                    onClick={onDeletePageButtonClick}
                    disabled={isUnsubscribingFacebookPage}
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
