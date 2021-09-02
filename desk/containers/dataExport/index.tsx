import { useEffect, useCallback, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { AutoRefreshDropdown, PageContainer, PageHeader } from '@ui/components';

import { useDeskDataExportContext, DeskDataExportContext } from './deskDataExportContext';
import { DeskDataExportFilters } from './deskDataExportFilters';
import { DeskDataExportList } from './deskDataExportList';

const Container = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const DataExport: FC = () => {
  const intl = useIntl();
  const deskDataExportContext = useDeskDataExportContext();
  const { fetchDataExports } = deskDataExportContext;

  const handleRefresh = useCallback(() => {
    fetchDataExports();
  }, [fetchDataExports]);

  useEffect(() => {
    fetchDataExports();
  }, [fetchDataExports]);

  return (
    <DeskDataExportContext.Provider value={deskDataExportContext}>
      <Container>
        <PageHeader
          css={`
            & + * {
              margin-top: 24px;
            }
          `}
        >
          <PageHeader.Title>
            {intl.formatMessage({ id: 'desk.dataExport.title' })}
            <AutoRefreshDropdown css="margin-left: 8px;" onRefreshTriggered={handleRefresh} />
          </PageHeader.Title>
        </PageHeader>
        <DeskDataExportFilters />
        <DeskDataExportList />
      </Container>
    </DeskDataExportContext.Provider>
  );
};
