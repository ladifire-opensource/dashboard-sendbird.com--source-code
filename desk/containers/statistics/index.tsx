import { memo, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Switch, Route, Redirect, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import { PageContainer, TabMenu, PageHeader } from '@ui/components';
import { clearfix } from '@ui/styles';

import { StatsAgents } from './StatsAgents';
import { StatsBots } from './StatsBots';
import { StatsOverview } from './StatsOverview';
import { StatsTeams } from './StatsTeams';

const StyledStatistics = styled(PageContainer)`
  ${clearfix()};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Statistics = memo(() => {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  const activeTabIndex = useMemo(() => {
    if (location.pathname.startsWith(`${match?.url}/overview`)) {
      return 0;
    }
    if (location.pathname.startsWith(`${match?.url}/agents`)) {
      return 1;
    }
    if (location.pathname.startsWith(`${match?.url}/teams`)) {
      return 2;
    }
    if (location.pathname.startsWith(`${match?.url}/bots`)) {
      return 3;
    }
    return 0;
  }, [location.pathname, match]);

  const handleTabClick = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          return history.push(`${match?.url}/overview`);
        case 1:
          return history.push(`${match?.url}/agents`);
        case 2:
          return history.push(`${match?.url}/teams`);
        case 3:
          return history.push(`${match?.url}/bots`);
        default:
          return history.push(`${match?.url}/overview`);
      }
    },
    [history, match],
  );

  return (
    <StyledStatistics>
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'desk.statistics.title' })}</PageHeader.Title>
      </PageHeader>

      <TabMenu
        tabs={[
          {
            label: intl.formatMessage({ id: 'desk.statistics.tab.overview' }),
            value: 'OVERVIEW',
          },
          {
            label: intl.formatMessage({ id: 'desk.statistics.tab.agents' }),
            value: 'AGENTS',
          },
          {
            label: intl.formatMessage({ id: 'desk.statistics.tab.teams' }),
            value: 'TEAMS',
          },
          {
            label: intl.formatMessage({ id: 'desk.statistics.tab.bots' }),
            value: 'BOTS',
          },
        ]}
        activeTab={activeTabIndex}
        handleTabClick={handleTabClick}
      />

      <Switch>
        <Route path={`${match?.url}/overview`} component={StatsOverview} />
        <Route path={`${match?.url}/agents`} component={StatsAgents} />
        <Route path={`${match?.url}/teams`} component={StatsTeams} />
        <Route path={`${match?.url}/bots`} component={StatsBots} />
        <Redirect to={`${match?.url}/overview`} />
      </Switch>
    </StyledStatistics>
  );
});
