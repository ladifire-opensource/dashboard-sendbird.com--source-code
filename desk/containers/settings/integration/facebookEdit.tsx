import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { deskActions } from '@actions';
import { SettingsCardGroup, SettingsCard, AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { InputToggle } from '@ui/components';

import { IntegrationEditWrapper } from './components';

type Props = RouteComponentProps<{ id: string }>;

export const IntegrationFacebookEdit: React.FC<Props> = ({ match }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();
  const componentDidMount = useRef(false);

  const {
    facebookPages,
    isUpdatingFacebookPageSettings,
    fetchFacebookActivePages: { isFetching: isFetchingFacebookPages },
  } = useSelector((state: RootState) => state.integrations);

  useEffect(() => {
    if (!componentDidMount.current && facebookPages.length === 0) {
      // try reloading facebook pages
      dispatch(deskActions.facebookActivePagesRequest());
      componentDidMount.current = true;
    }
    return () => {
      componentDidMount.current = false;
    };
  }, [facebookPages, dispatch]);

  const navigateTo = useCallback(
    (URL: string) => () => {
      history.push(URL);
    },
    [history],
  );

  const page = facebookPages.find((page) => page.id === Number(match.params.id));

  const defaultData = useMemo(
    () =>
      page
        ? { isConversationEnabled: page.isConversationEnabled, isFeedEnabled: page.isFeedEnabled }
        : { isConversationEnabled: false, isFeedEnabled: false },
    [page],
  );

  const [data, setData] = useState(defaultData);

  useEffect(() => {
    setData(defaultData);
  }, [defaultData]);

  const onInputToggleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const { name, checked } = e.target;
    switch (name) {
      case 'isConversationEnabled':
      case 'isFeedEnabled':
        setData((currentData) => ({ ...currentData, [name]: checked }));
        break;
      default:
        return;
    }
  }, []);

  const onSubmit = () => {
    if (!page) {
      return;
    }
    dispatch(deskActions.facebookUpdatePageSettingsRequest({ facebookPage: { ...page, ...data } }));
  };

  if (!page) {
    return null;
  }

  const backButtonHref = match.url.substring(0, match.url.lastIndexOf('/'));

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={backButtonHref} />
        <AppSettingPageHeader.Title>{page.name}</AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <IntegrationEditWrapper>
        <SettingsCardGroup className="IntegrationFacebookEdit__card">
          <SettingsCard
            title={intl.formatMessage({ id: 'desk.settings.integration.edit.facebook.header.posts' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.edit.facebook.body.posts' })}
            stretchLabel={{ width: 384, wideWidth: 384 }}
          >
            <InputToggle
              name="isFeedEnabled"
              checked={data.isFeedEnabled}
              disabled={isFetchingFacebookPages}
              onChange={onInputToggleChange}
            />
          </SettingsCard>
          <SettingsCard
            title={intl.formatMessage({ id: 'desk.settings.integration.edit.facebook.header.messages' })}
            description={intl.formatMessage({ id: 'desk.settings.integration.edit.facebook.body.messages' })}
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
                disabled: isFetchingFacebookPages || isUpdatingFacebookPageSettings,
                isLoading: isUpdatingFacebookPageSettings,
                onClick: onSubmit,
              },
            ]}
          >
            <InputToggle
              name="isConversationEnabled"
              checked={data.isConversationEnabled}
              disabled={isFetchingFacebookPages}
              onChange={onInputToggleChange}
            />
          </SettingsCard>
        </SettingsCardGroup>
      </IntegrationEditWrapper>
    </AppSettingsContainer>
  );
};
