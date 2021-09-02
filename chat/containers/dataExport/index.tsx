import { FC } from 'react';
import { Route, Switch, useRouteMatch, Redirect } from 'react-router-dom';

import { useAuthorization } from '@hooks';

import { DataExportDetail } from './dataExportDetail';
import { DataExportForm } from './dataExportForm';
import { DataExportList } from './dataExportList';
import { DataExportContext, useDataExportReducer } from './useDataExport';

export const DataExport: FC = () => {
  const dataExport = useDataExportReducer();
  const match = useRouteMatch();
  const { isPermitted } = useAuthorization();

  return (
    <DataExportContext.Provider value={dataExport}>
      <Switch>
        {isPermitted(['application.dataExport.all']) ? (
          <Route path={`${match?.url}/request`} component={DataExportForm} />
        ) : (
          <Route path={`${match?.url}/request`} render={() => <Redirect to={match?.url ?? '/'} />} />
        )}
        <Route path={`${match?.url}/:requestId`} component={DataExportDetail} />
        <Route path={match?.url} component={DataExportList} />
      </Switch>
    </DataExportContext.Provider>
  );
};
