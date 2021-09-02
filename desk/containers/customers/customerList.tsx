import { useEffect, useCallback, useRef, useContext, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { TableProps, Table, OverflowMenu, OverflowMenuItem, cssVariables } from 'feather';
import moment from 'moment-timezone';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { LIST_LIMIT, CLOUD_FRONT_URL, EMPTY_TEXT } from '@constants';
import { Paginator, SearchInput, TablePageContainer, PageHeader } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { getRandomNumber } from '@utils';

import { CustomersPaginationContext } from './customerPaginationContext';

const CustomerListTable = styled((props: TableProps<Customer>) => Table(props))`
  flex: 1;
  border-right: none;
  border-left: none;
`;

const CustomerListContainer = styled(TablePageContainer)`
  ${PageHeader} + * {
    margin-top: 24px;
  }
`;

const CustomerProfile = styled.div<{ url: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-top: -6px;
  margin-bottom: -6px;
  margin-right: 12px;
  ${(props) => (props.url ? `background-image: url(${props.url})` : '')};
  background-position: center;
  background-size: cover;
`;

const DisplayName = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

const CustomerListPaginator = styled(Paginator)`
  margin-left: auto;
`;

const mapStateToProps = (state: RootState) => ({
  application: state.applicationState.data,
  customers: state.customers,
  proactiveChatEnabled: state.desk.project.proactiveChatEnabled,
});

const mapDispatchToProps = {
  showDialogRequest: commonActions.showDialogsRequest,
  fetchCustomersRequest: deskActions.fetchCustomersRequest,
  fetchCustomersCancel: deskActions.fetchCustomersCancel,
  setCustomersSearchQuery: deskActions.setCustomersSearchQuery,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionsProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionsProps;

const CustomerListConnectable: React.FC<Props> = ({
  application,
  customers,
  fetchCustomersRequest,
  fetchCustomersCancel,
  setCustomersSearchQuery,
  showDialogRequest,
  proactiveChatEnabled,
}) => {
  const { isFetching, query, items, pagination } = customers;
  const { page, pageSize, setPagination } = useContext(CustomersPaginationContext);
  const { push: pushHistory } = useHistory();

  const [searchedQuery, setSearchedQuery] = useState<string | undefined>(query);
  const intl = useIntl();
  const fetchCustomersRef = useRef<(params: { limit?: number; offset?: number; query?: string }) => void>(() => {});

  useEffect(() => {
    fetchCustomersRef.current = ({ limit = LIST_LIMIT, offset = 0, query = customers.query }) => {
      // params = customers.parameters,
      if (isFetching) {
        fetchCustomersCancel();
      }

      fetchCustomersRequest({
        offset,
        limit,
        query,
      });
      setSearchedQuery(query || undefined);
    };
  }, [customers.query, fetchCustomersCancel, fetchCustomersRequest, isFetching, setSearchedQuery]);

  useEffect(() => {
    fetchCustomersRef.current({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }, [page, pageSize]);

  const handleCustomerClick = (customer) => () => {
    if (application) {
      pushHistory(`/${application.app_id}/desk/customers/${customer.id}`);
    }
  };

  const handleSearchChange = useCallback(
    (query) => {
      setCustomersSearchQuery(query);
    },
    [setCustomersSearchQuery],
  );

  const handleSearchClear = useCallback(() => {
    setCustomersSearchQuery('');
    fetchCustomersRef.current({ query: '' });
  }, [setCustomersSearchQuery]);

  /**
   * Search customer
   */
  const handleSearchSubmit = useCallback((query) => {
    fetchCustomersRef.current({
      query,
    });
  }, []);

  const onRow = (record) => ({
    onClick: handleCustomerClick(record),
    style: {
      cursor: 'pointer',
    },
  });

  return (
    <CustomerListContainer>
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'desk.customers.title' })}</PageHeader.Title>
      </PageHeader>
      <SearchInput
        styles={{
          SearchInput: css`
            width: 194px;
            height: 32px;
          `,
        }}
        ph={intl.formatMessage({ id: 'desk.customers.customerList.table.search.placeholder' })}
        value={query}
        handleChange={handleSearchChange}
        handleSearchClear={handleSearchClear}
        handleSubmit={handleSearchSubmit}
      />
      <CustomerListTable
        columns={[
          {
            dataIndex: 'displayName',
            title: intl.formatMessage({ id: 'desk.customers.customerList.table.label.name' }),
            flex: '30%',
            render: ({ photoThumbnailUrl, displayName }) => {
              return (
                <>
                  <CustomerProfile
                    url={
                      photoThumbnailUrl ||
                      `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(displayName, 3)}.svg`
                    }
                  />
                  <DisplayName>{displayName || EMPTY_TEXT}</DisplayName>
                </>
              );
            },
          },
          {
            dataIndex: 'sendbirdId',
            title: intl.formatMessage({ id: 'desk.customers.customerList.table.label.id' }),
            flex: '45%',
          },
          {
            dataIndex: 'createdAt',
            title: intl.formatMessage({ id: 'desk.customers.customerList.table.label.created' }),
            render: ({ createdAt }) => moment(createdAt).format('lll'),
            flex: '15%',
          },
        ]}
        dataSource={items}
        loading={isFetching}
        showScrollbars={true}
        emptyView={
          <CenteredEmptyState
            icon="no-data"
            title={intl.formatMessage({
              id: searchedQuery ? 'desk.customers.search.header.noResult' : 'desk.customers.search.header.noItem',
            })}
            description={
              searchedQuery
                ? intl.formatMessage(
                    {
                      id: 'desk.customers.search.desc.noResult',
                    },
                    { query: searchedQuery },
                  )
                : intl.formatMessage({ id: 'desk.customers.search.desc.noItem' })
            }
          />
        }
        onRow={onRow}
        footer={
          <CustomerListPaginator
            current={page}
            total={pagination.count}
            pageSize={pageSize}
            onChange={setPagination}
            onItemsPerPageChange={setPagination}
          />
        }
        rowActions={(customer) => {
          const isEnabledSendAction = proactiveChatEnabled && customer.channelType === 'SENDBIRD';
          const actions: OverflowMenuItem[] = [
            {
              label: intl.formatMessage({ id: 'desk.customers.customerList.table.menu.proactiveChatStart' }),
              onClick: () => {
                showDialogRequest({
                  dialogTypes: DialogType.CreateProactiveChat,
                  dialogProps: {
                    targetCustomer: customer,
                  },
                });
              },
              tooltip: isEnabledSendAction
                ? undefined
                : {
                    content: proactiveChatEnabled
                      ? intl.formatMessage({ id: 'desk.customers.detail.proactiveChat.button.tooltip.disabled.by.sns' })
                      : intl.formatMessage({
                          id: 'desk.customers.detail.proactiveChat.button.tooltip.disabled.by.setting.off',
                        }),
                  },
              disabled: !isEnabledSendAction,
            },
          ];

          return [<OverflowMenu key="customerListOverflow" items={actions} stopClickEventPropagation={true} />];
        }}
      />
    </CustomerListContainer>
  );
};

export const CustomerList = connect(mapStateToProps, mapDispatchToProps)(CustomerListConnectable);
