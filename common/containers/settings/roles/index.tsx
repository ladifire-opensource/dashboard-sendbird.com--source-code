import React from 'react';
import { Switch, RouteComponentProps, Route } from 'react-router-dom';

import { RolesDetail } from './rolesDetail';
import { RolesForm } from './rolesForm';
import { RolesList } from './rolesList';
import { RolesContext, useRolesReducer } from './rolesReducer';

export const Roles: React.FC<RouteComponentProps> = ({ match }) => {
  return (
    <RolesContext.Provider value={useRolesReducer()}>
      <Switch>
        <Route path={`${match.url}/create`} component={RolesForm} />
        <Route path={`${match.url}/:roleId/edit`} component={RolesForm} />
        <Route path={`${match.url}/:roleId`} component={RolesDetail} />
        <Route path={match.url} component={RolesList} />
      </Switch>
    </RolesContext.Provider>
  );
};
