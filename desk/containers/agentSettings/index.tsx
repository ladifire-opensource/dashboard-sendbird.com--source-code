import { memo } from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, Redirect, match } from 'react-router-dom';

import { SpinnerFull } from 'feather';

import { useDeskAuth } from '@authorization/useDeskAuth';

import { QuickReplies } from '../settings/quickReplies';
import { QuickRepliesDetail } from '../settings/quickReplies/quickRepliesDetail';
import { AgentSettingsLayout } from './AgentSettingsLayout';

type Props = {
  match: match;
};

export const AgentSettings = memo<Props>(({ match }) => {
  useDeskAuth();
  const isDeskConnected = useSelector((state: RootState) => state.desk.connected);
  const isDeskAuthenticated = useSelector((state: RootState) => state.desk.authenticated);

  return (
    <AgentSettingsLayout
      css={`
        height: 100%;
      `}
    >
      {() => {
        if (!isDeskAuthenticated) {
          return <SpinnerFull transparent={true} />;
        }

        return (
          <>
            <Switch>
              <Route path={`${match.url}/quick-replies/create`} component={QuickRepliesDetail} />
              <Route path={`${match.url}/quick-replies/:quickReplyId/edit`} component={QuickRepliesDetail} />
              <Route
                path={`${match.url}/quick-replies/:duplicateQuickReplyId/duplicate`}
                component={QuickRepliesDetail}
              />
              <Route path={`${match.url}/quick-replies`} component={QuickReplies} />
              <Redirect to={`${match.url}/quick-replies`} />
            </Switch>
            {!isDeskConnected && <SpinnerFull transparent={true} />}
          </>
        );
      }}
    </AgentSettingsLayout>
  );
});
