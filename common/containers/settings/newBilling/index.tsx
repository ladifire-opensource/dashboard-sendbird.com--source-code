import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch, Route, Switch, useHistory } from 'react-router-dom';

import { OrganizationSettingMenu } from '@constants';

import { SettingsHeader } from '../../layout/settingsLayout';
import { CreditCardContextProvider } from '../billing/CreditCardContext';
import { BillingInfo } from './billingInfo';
import { Invoices } from './invoices';

export const Billing: React.FC = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const history = useHistory();

  const tabs = [
    {
      label: intl.formatMessage({ id: 'common.settings.billing.tab.billingInfo' }),
      key: 'billing_info',
    },
    {
      label: intl.formatMessage({ id: 'common.settings.billing.tab.invoices' }),
      key: 'invoices',
    },
  ];

  const activeTab = useMemo(() => {
    if (history.location.pathname === match?.url) {
      return tabs[0];
    }
    if (history.location.pathname === `${match?.url}/invoices`) {
      return tabs[1];
    }
    return tabs[0];
  }, [history.location.pathname, match?.url, tabs]);

  if (!match) {
    return null;
  }

  const availableRoutes: ReadonlyArray<{
    key: OrganizationSettingMenu;
    path?: string;
    component?: React.ComponentType<any>;
  }> = [
    {
      key: OrganizationSettingMenu.billing_invoices,
      path: `${match?.url}/invoices`,
      component: Invoices,
    },
    {
      key: OrganizationSettingMenu.billing,
      path: match?.url,
      component: BillingInfo,
    },
  ];

  const handleTabClick = (tab) => {
    history.push(`${match?.url}${tab.key === 'invoices' ? `/${tab.key}` : ''}`);
  };

  return (
    <CreditCardContextProvider>
      <SettingsHeader title="Billing" tabs={tabs} activeTab={activeTab} onTabPress={handleTabClick} showBorder={true} />
      <Switch>
        {availableRoutes.map(({ key, ...rest }) => (
          <Route key={key} {...rest} />
        ))}
      </Switch>
    </CreditCardContextProvider>
  );
};
