import { useContext } from 'react';

import { LastUpdatedAt, PageHeader } from '@ui/components';

import { EmailAlert } from './EmailAlert';
import { UsageContext } from './UsageContext';
import { UsageTable } from './UsageTable';

export const UsageList = () => {
  const { monthlyUsage } = useContext(UsageContext);
  // TODO: what if we don't have any updated date information

  return (
    <>
      <PageHeader>
        <PageHeader.Title>Usage</PageHeader.Title>
        <PageHeader.Actions>
          {monthlyUsage?.updated_dt && <LastUpdatedAt timestamp={monthlyUsage.updated_dt} />}
        </PageHeader.Actions>
      </PageHeader>

      <EmailAlert />
      <UsageTable />
    </>
  );
};
