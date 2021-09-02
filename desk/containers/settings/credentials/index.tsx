import { memo, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { Table, Button, IconButton, cssVariables } from 'feather';
import moment from 'moment-timezone';

import { deskActions, commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { usePagination } from '@hooks';
import { Paginator, Card, CopyButton } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

const mapStateToProps = (state: RootState) => ({
  apiTokens: state.desk.apiTokens,
});

const mapDispatchToProps = {
  fetchApiTokensRequest: deskActions.fetchApiTokensRequest,
  deleteApiTokenRequest: deskActions.deleteApiTokenRequest,
  showDialogsRequest: commonActions.showDialogsRequest,
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const GenerateButton = styled(Button)`
  margin-left: auto;
`;

const IconTableButton = styled(IconButton)`
  position: relative;
  z-index: 10;
  margin: -6px 0;
`;

const TableCard = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 24px;
  padding-bottom: 0;
`;

const TableTitle = styled.h3`
  flex: none;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 24px;
`;

const CredentialsTable = styled(Table)`
  flex: 1;
  border-right: 0;
  border-left: 0;

  td {
    position: relative;
    overflow: visible;
  }
`;

const Pagination = styled(Paginator)`
  margin-left: auto;
`;

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionsProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionsProps;

const CredentialsConnectable = memo<Props>(
  ({ apiTokens, showDialogsRequest, fetchApiTokensRequest, deleteApiTokenRequest }) => {
    const intl = useIntl();
    const { page, pageSize, setPagination } = usePagination(1, 20);

    const handleCreateClick = () => {
      showDialogsRequest({
        dialogTypes: DialogType.CreateNewToken,
      });
    };

    const handleDeleteClick = (id: Number, name: string) => () => {
      const { items } = apiTokens;

      const isLastItemOnPage = items.length === 1;
      showDialogsRequest({
        dialogTypes: DialogType.Delete,
        dialogProps: {
          title: intl.formatMessage({ id: 'desk.settings.credentials.dialog.delete.title' }, { keyName: name }),
          description: intl.formatMessage({ id: 'desk.settings.credentials.dialog.delete.description' }),
          confirmText: intl.formatMessage({ id: 'desk.settings.credentials.dialog.delete.button.confirm' }),
          cancelText: intl.formatMessage({ id: 'desk.settings.credentials.dialog.delete.button.cancel' }),
          onDelete: () => deleteApiTokenRequest({ id, isLastItemOnPage }),
        },
      });
    };

    const handleItemsPerPageChange = (_, pageSize) => {
      setPagination(1, pageSize);
    };

    useEffect(() => {
      fetchApiTokensRequest({ offset: (page - 1) * pageSize, limit: pageSize });
    }, [fetchApiTokensRequest, page, pageSize]);

    return (
      <AppSettingsContainer isTableView={true} css="padding-bottom: 32px;">
        <AppSettingPageHeader>
          <AppSettingPageHeader.Title>
            {intl.formatMessage({ id: 'desk.settings.credentials.title' })}
          </AppSettingPageHeader.Title>
          <AppSettingPageHeader.Actions>
            <GenerateButton buttonType="primary" size="small" icon="plus" onClick={handleCreateClick}>
              {intl.formatMessage({ id: 'desk.settings.credentials.button.generate' })}
            </GenerateButton>
          </AppSettingPageHeader.Actions>
        </AppSettingPageHeader>
        <Container>
          <TableCard>
            <TableTitle>{intl.formatMessage({ id: 'desk.settings.credentials.header' })}</TableTitle>
            <CredentialsTable
              rowKey="credentials-key"
              showScrollbars={true}
              loading={apiTokens.isFetching}
              dataSource={apiTokens.items}
              columns={[
                {
                  title: intl.formatMessage({ id: 'desk.settings.credentials.table.th.name' }),
                  dataIndex: 'name',
                  flex: 2,
                  sorter: true,
                },
                {
                  title: intl.formatMessage({ id: 'desk.settings.credentials.table.th.key' }),
                  dataIndex: 'token',
                  flex: 6,
                  styles: css`
                    div {
                      display: flex;
                      align-items: center;
                      margin: -6px 8px;
                    }
                  `,
                  render: ({ token }) => (
                    <>
                      {token}
                      <CopyButton copyableText={token} />
                    </>
                  ),
                },
                {
                  title: intl.formatMessage({ id: 'desk.settings.credentials.table.th.created' }),
                  dataIndex: 'createdAt',
                  flex: 3,
                  render: ({ createdAt }) => moment(createdAt).format('lll'),
                },
                {
                  title: '',
                  dataIndex: 'id',
                  sorter: true,
                  render: ({ id, name }) => (
                    <IconTableButton
                      size="small"
                      buttonType="tertiary"
                      icon="delete"
                      onClick={handleDeleteClick(id, name)}
                    />
                  ),
                  styles: css`
                    justify-content: flex-end;
                  `,
                },
              ]}
              footer={
                <Pagination
                  current={page}
                  total={apiTokens.pagination.count}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onChange={setPagination}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              }
              emptyView={
                <CenteredEmptyState
                  icon="no-data"
                  title={intl.formatMessage({ id: 'desk.settings.credentials.table.empty.title' })}
                  description={
                    <FormattedMessage id="desk.settings.credentials.table.empty.desc" values={{ break: <br /> }} />
                  }
                />
              }
            />
          </TableCard>
        </Container>
      </AppSettingsContainer>
    );
  },
);

export const Credentials = connect(mapStateToProps, mapDispatchToProps)(CredentialsConnectable);
