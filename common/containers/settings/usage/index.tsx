import { useRouteMatch, Switch, Route } from 'react-router-dom';

import { useAuthentication } from '@authentication';
import { PageHeader } from '@ui/components';

import { OrganizationStatusPage } from '../OrganizationStatusPage';
import { UsageContextProvider } from './UsageContext';
import { UsageDetail } from './UsageDetail';
import { UsageList } from './UsageList';

export const Usage = () => {
  const match = useRouteMatch();
  const { isOrganizationDeactivated } = useAuthentication();
  return isOrganizationDeactivated ? (
    <OrganizationStatusPage title="Usage" />
  ) : (
    <div
      css={`
        ${PageHeader} + * {
          margin-top: 24px;
        }
      `}
    >
      <UsageContextProvider>
        <Switch>
          <Route path={`${match?.url}/:featureKey`} component={UsageDetail} />
          <Route path={`${match?.url}`} component={UsageList} />
        </Switch>
      </UsageContextProvider>
    </div>
  );
};
