import React from 'react';

import { PageContainer, PageHeader } from '@ui/components';

import { MessageSearch } from './messageSearch';

export const Messages: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Title>Messages</PageHeader.Title>
      </PageHeader>
      <MessageSearch />
    </PageContainer>
  );
};
