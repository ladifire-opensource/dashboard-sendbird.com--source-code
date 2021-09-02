import React, { useRef, useEffect, useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { Toggle, HTMLToggleElement, useField, useForm } from 'feather';

import { SettingsCardGroup, SettingsCard, AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { IntegrationContext } from '@desk/contexts/integrationContext';

import { IntegrationEditWrapper } from './components';

type Props = RouteComponentProps<{ id: string }>;

export const IntegrationInstagramEdit: React.FC<Props> = ({ match }) => {
  const history = useHistory();
  const {
    instagramReducer: {
      state: { instagramAccounts, isFetchingInstagramAccounts },
      actions: { fetchInstagramAccounts, patchInstagramAccountRequest },
    },
  } = useContext(IntegrationContext);

  const intl = useIntl();
  const componentDidMount = useRef(false);
  const account = instagramAccounts.find((account) => account.id === Number(match.params.id));
  const backButtonHref = match.url.substring(0, match.url.lastIndexOf('/'));

  const form = useForm({
    onSubmit: async ({ isCommentEnabled }) => {
      if (!account) {
        return;
      }

      await patchInstagramAccountRequest({
        instagramUserId: account.id,
        isCommentEnabled,
        onSuccess: () => {
          history.push(backButtonHref);
        },
      });
    },
  });
  const isCommentEnabledField = useField<boolean, HTMLToggleElement>('isCommentEnabled', form, {
    defaultValue: (account && account.isCommentEnabled) || false,
    isControlled: true,
  });

  const navigateTo = useCallback(
    (URL: string) => () => {
      history.push(URL);
    },
    [history],
  );

  const handleSubmit = (e) => {
    form.onSubmit(e);
  };

  useEffect(() => {
    if (account) {
      isCommentEnabledField.updateValue(account.isCommentEnabled || false);
    }
  }, [account]);

  useEffect(() => {
    if (instagramAccounts.length === 0) {
      if (componentDidMount.current) {
        // If this is an update after the mount, navigate back to overview page
        history.replace(match.url.substring(0, match.url.lastIndexOf('/')));
      } else {
        // on mount, try reloading accounts
        componentDidMount.current = true;
        fetchInstagramAccounts();
      }
    }
  }, [instagramAccounts, history, match.url, fetchInstagramAccounts]);

  if (!account) {
    return null;
  }

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={backButtonHref} />
        <AppSettingPageHeader.Title>{`@${account.username}`}</AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <IntegrationEditWrapper>
        <SettingsCardGroup className="IntegrationCommentEdit__card">
          <SettingsCard
            title={intl.formatMessage({ id: 'desk.settings.integration.edit.instagram.header.comments' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.edit.instagram.body.comments' })}
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
                disabled: isFetchingInstagramAccounts,
                isLoading: isFetchingInstagramAccounts,
                onClick: handleSubmit,
              },
            ]}
          >
            <Toggle
              name={isCommentEnabledField.name}
              checked={isCommentEnabledField.value}
              onChange={isCommentEnabledField.updateValue}
            />
          </SettingsCard>
        </SettingsCardGroup>
      </IntegrationEditWrapper>
    </AppSettingsContainer>
  );
};
