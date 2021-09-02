import { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { PageContainer } from '@ui/components';

import { AnalyticsDetail } from './AnalyticsDetail';
import { AnalyticsOverview } from './overview';

export const Analytics: FC = () => {
  const match = useRouteMatch();
  return (
    <PageContainer>
      <Switch>
        <Route exact={true} path={match?.url} component={AnalyticsOverview} />
        <Route exact={true} path={`${match?.url}/:metricType`} component={AnalyticsDetail} />
      </Switch>
    </PageContainer>
  );
};
