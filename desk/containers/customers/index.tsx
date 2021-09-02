import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { LIST_LIMIT } from '@constants';
import { usePagination } from '@hooks';

import { ProactiveChatViewDrawer } from '../ProactiveChatViewDrawer/ProactiveChatViewDrawer';
import { CustomerList } from './customerList';
import { CustomersPaginationContext } from './customerPaginationContext';
import { CustomersDetail } from './detail';

export const Customers: React.SFC<RCProps<any>> = ({ match }) => {
  const { page, pageSize, setPagination } = usePagination(1, LIST_LIMIT);
  return (
    <CustomersPaginationContext.Provider value={{ page, pageSize, setPagination }}>
      <Switch>
        <Route path={`${match.url}/:customerId`} component={CustomersDetail} />
        <Route path={`${match.url}`} component={CustomerList} />
      </Switch>
      <ProactiveChatViewDrawer />
    </CustomersPaginationContext.Provider>
  );
};
