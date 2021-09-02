import React, { useEffect } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { ChannelsSettings } from '@chat/containers/settings/ChannelsSettings';
import { FeaturesSettings } from '@chat/containers/settings/Features';
import { ProfanityFilterSettings } from '@chat/containers/settings/ProfanityFilterSettings';
import { MessageSettings } from '@chat/containers/settings/message';
import { NotificationSettings } from '@chat/containers/settings/notification';
import { WebhooksSettings } from '@chat/containers/settings/webhooks';
import { AppSettingsLayout } from '@common/containers/layout';
import { Page } from '@constants';
import { useAppSettingMenus, useIsProfanityFilterAvailable } from '@hooks';
import { useAuthorization } from '@hooks/useAuthorization';

import { useSettingsGlobal } from '../useSettingsGlobal';
import { GeneralSettings } from './general';
import { SecuritySettings } from './security';

export const ApplicationSettings: React.FC = () => {
  const match = useRouteMatch();
  const { isAccessiblePage, isPermitted, preparingFeatures } = useAuthorization();
  const { fallbackMenuPath } = useAppSettingMenus();
  const isProfanityFilterAvailable = useIsProfanityFilterAvailable();
  const { reloadSettingsGlobal } = useSettingsGlobal();

  useEffect(() => {
    if (isPermitted(['application.settings.view', 'application.settings.all'])) {
      reloadSettingsGlobal();
    }
  }, [isPermitted, reloadSettingsGlobal]);

  if (match == null) {
    throw new Error('ApplicationSettings must be rendered within a router.');
  }

  if (preparingFeatures) {
    // delay rendering routes until the enabled features are loaded to avoid redirecting to /general or fallbackPath too early.
    return null;
  }

  if (isAccessiblePage(Page.settings)) {
    return (
      <AppSettingsLayout
        css={`
          height: 100%;
        `}
      >
        {({ setUnsaved }) => {
          return (
            <Switch>
              <Route
                path={`${match.url}/general`}
                render={(renderProps) => <GeneralSettings setUnsaved={setUnsaved} {...renderProps} />}
              />
              <Route path={`${match.url}/notifications`} component={NotificationSettings} />
              <Route
                path={`${match.url}/features`}
                render={(renderProps) => <FeaturesSettings setUnsaved={setUnsaved} {...renderProps} />}
              />
              <Route
                path={`${match.url}/message`}
                render={(renderProps) => <MessageSettings setUnsaved={setUnsaved} {...renderProps} />}
              />
              <Route path={`${match.url}/channels`} component={ChannelsSettings} />
              {isProfanityFilterAvailable && (
                <Route path={`${match.url}/profanity-filter`} component={ProfanityFilterSettings} />
              )}
              <Route
                path={`${match.url}/security`}
                render={(renderProps) => <SecuritySettings setUnsaved={setUnsaved} {...renderProps} />}
              />
              <Route
                path={`${match.url}/webhooks`}
                render={(renderProps) => <WebhooksSettings setUnsaved={setUnsaved} {...renderProps} />}
              />
              <Redirect to={`${match.url}/general`} />
            </Switch>
          );
        }}
      </AppSettingsLayout>
    );
  }

  return <Redirect to={fallbackMenuPath || '/'} />;
};
