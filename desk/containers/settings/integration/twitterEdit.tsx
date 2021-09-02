import React, { useRef, useEffect, useCallback, useState, useContext } from 'react';
import { useIntl } from 'react-intl';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { toast } from 'feather';

import { SettingsCardGroup, SettingsCard, AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { IntegrationContext } from '@desk/contexts/integrationContext';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { InputToggle } from '@ui/components';

import { IntegrationEditWrapper } from './components';

type Props = RouteComponentProps<{ id: string }>;

export const IntegrationTwitterEdit: React.FC<Props> = ({ match }) => {
  const intl = useIntl();
  const history = useHistory();
  const { getErrorMessage } = useDeskErrorHandler();
  const componentDidMount = useRef(false);

  const {
    twitterReducer: {
      state: { twitterUsers, isFetchingTwitterUsers, isPatchingTwitterUser },
      actions: { fetchTwitterUsers, patchTwitterAccount },
    },
  } = useContext(IntegrationContext);

  useEffect(() => {
    if (twitterUsers.length === 0) {
      if (componentDidMount.current) {
        // If this is an update after the mount, navigate back to overview page
        history.replace(match.url.substring(0, match.url.lastIndexOf('/')));
      } else {
        // on mount, try reloading accounts
        componentDidMount.current = true;
        fetchTwitterUsers();
      }
    }
  }, [twitterUsers, history, match.url, fetchTwitterUsers]);

  const navigateTo = useCallback(
    (URL: string) => () => {
      history.push(URL);
    },
    [history],
  );

  const account = twitterUsers.find((account) => account.id === Number(match.params.id));

  const [data, setData] = useState({
    isDirectMessageEventEnabled: (account && account.isDirectMessageEventEnabled) || false,
    isStatusEnabled: (account && account.isStatusEnabled) || false,
  });

  useEffect(() => {
    setData({
      isDirectMessageEventEnabled: (account && account.isDirectMessageEventEnabled) || false,
      isStatusEnabled: (account && account.isStatusEnabled) || false,
    });
  }, [account]);

  const onInputToggleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const { name, checked } = e.target;
    switch (name) {
      case 'isDirectMessageEventEnabled':
      case 'isStatusEnabled':
        setData((currentData) => ({ ...currentData, [name]: checked }));
        break;
      default:
        return;
    }
  }, []);

  const backButtonHref = match.url.substring(0, match.url.lastIndexOf('/'));

  const onSubmit = async () => {
    if (!account) {
      return;
    }

    try {
      await patchTwitterAccount(account.id, data);
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.integration.twitter.noti.update.success' }) });
      history.push(backButtonHref);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    }
  };

  if (!account) {
    return null;
  }

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={backButtonHref} />
        <AppSettingPageHeader.Title>{`@${account.screenName}`}</AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <IntegrationEditWrapper>
        <SettingsCardGroup className="IntegrationTwitterEdit__card">
          <SettingsCard
            title={intl.formatMessage({ id: 'desk.settings.integration.edit.twitter.header.tweets' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.edit.twitter.body.tweets' })}
            stretchLabel={{ width: 384, wideWidth: 384 }}
          >
            <InputToggle
              name="isStatusEnabled"
              checked={data.isStatusEnabled}
              disabled={isFetchingTwitterUsers}
              onChange={onInputToggleChange}
            />
          </SettingsCard>
          <SettingsCard
            title={intl.formatMessage({ id: 'desk.settings.integration.edit.twitter.header.messages' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.edit.twitter.body.messages' })}
            stretchLabel={{ width: 384, wideWidth: 384 }}
            showActions={true}
            actions={[
              {
                key: 'cancel',
                label: intl.formatMessage({ id: 'desk.settings.integration.edit.btn.cancel' }),
                buttonType: 'tertiary',
                onClick: navigateTo(backButtonHref),
              },
              {
                key: 'save',
                label: intl.formatMessage({ id: 'desk.settings.integration.edit.btn.save' }),
                buttonType: 'primary',
                disabled: isFetchingTwitterUsers || isPatchingTwitterUser,
                isLoading: isFetchingTwitterUsers || isPatchingTwitterUser,
                onClick: onSubmit,
              },
            ]}
          >
            <InputToggle
              name="isDirectMessageEventEnabled"
              checked={data.isDirectMessageEventEnabled}
              disabled={isFetchingTwitterUsers}
              onChange={onInputToggleChange}
            />
          </SettingsCard>
        </SettingsCardGroup>
      </IntegrationEditWrapper>
    </AppSettingsContainer>
  );
};
