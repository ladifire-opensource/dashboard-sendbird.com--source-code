import React, { useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';

import styled from 'styled-components';

import {
  Button,
  useForm,
  useField,
  InputText,
  Table,
  OverflowMenu,
  cssVariables,
  TableProps,
  toast,
  TableColumnProps,
} from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { deskApi } from '@api';
import { useDeskAuth } from '@authorization/useDeskAuth';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { QuickRepliesAvailableType } from '@constants';
import { usePagination, useAuthorization } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { Paginator, TableMenu } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AddQuickReplyButton = styled(Button)`
  margin-left: auto;
`;

const SearchInput = styled(InputText)`
  width: 216px;
`;

const TableContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  padding-bottom: 0;
`;

const TextShorten = styled.span`
  display: inline-block;
  width: 98%;
  max-width: 98%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const QuickReplyTable = styled((props: TableProps<QuickReply>) => Table<QuickReply>(props))`
  width: 100%;
  height: 100%;
`;

const QuickReplyTitle = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  width: 100%;
`;

const QuickReplyPagination = styled(Paginator)`
  margin-left: auto;
`;

export const QuickReplies = React.memo<RCProps<{}>>(({ match }) => {
  useDeskAuth();
  const { isPermitted } = useAuthorization();
  const isAdmin = isPermitted(['desk.admin']);

  const intl = useIntl();
  const history = useHistory();
  const { page, pageSize, setPagination } = usePagination(1, 20);
  const { getErrorMessage } = useDeskErrorHandler();
  const dir = useCharDirection();

  const pid = useSelector<RootState, Project['pid']>((state) => state.desk.project.pid);
  const region = useSelector<RootState, Application['app_id']>((state) => state.applicationState.data?.region ?? '');

  const dispatch = useDispatch();
  const showDialogsRequest = (payload) => dispatch(commonActions.showDialogsRequest(payload));

  const [total, setTotal] = useState(0);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState<string | undefined>(undefined);

  const availableType = useMemo(() => {
    if (isAdmin) {
      return [QuickRepliesAvailableType.ALL, QuickRepliesAvailableType.GROUP, QuickRepliesAvailableType.AGENT];
    }

    return [QuickRepliesAvailableType.AGENT];
  }, [isAdmin]);

  const fetchQuickRepliesData = async ({
    offset,
    limit,
    q,
  }: Omit<FetchQuickRepliesRequestPayload, 'availableType'>) => {
    setIsFetching(true);
    try {
      const { data } = await deskApi.fetchQuickReplies(pid, region, { offset, limit, q, availableType });
      setQuickReplies(data.results);
      setTotal(data.count);
      setIsFetching(false);
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
      setIsFetching(false);
    }
  };

  const deleteQuickReplyData = async (quickReply: QuickReply, query: string) => {
    setIsSearched(false);
    setSearchedQuery(undefined);
    setIsFetching(true);
    try {
      await deskApi.deleteQuickReply(pid, region, { id: quickReply.id });
      setIsFetching(false);
      fetchQuickRepliesData({ offset: (page - 1) * pageSize, limit: pageSize, q: query });
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
      setIsFetching(false);
    }
  };

  const form = useForm({
    onSubmit: async ({ query }) => {
      if (query === '') {
        setIsSearched(false);
        setSearchedQuery(undefined);
      } else {
        setSearchedQuery(query);
      }

      if (page === 1) {
        fetchQuickRepliesData({ offset: 0, limit: pageSize, q: query });
      } else {
        setPagination(1, pageSize);
      }
    },
  });

  const queryField = useField('query', form, {
    defaultValue: '',
    placeholder: intl.formatMessage({ id: 'desk.settings.quickReplies.ph.search' }),
  });

  useEffect(() => {
    fetchQuickRepliesData({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      q: queryField.getValue(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleCreateClick = () => {
    history.push(`${match.url}/create`);
  };

  const handleSearchCancel: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsSearched(false);
    setSearchedQuery(undefined);
    await queryField.reset();
    if (page === 1) {
      fetchQuickRepliesData({ offset: 0, limit: pageSize });
    } else {
      setPagination(1, pageSize);
    }
  };

  const handleSearchSubmit = (e) => {
    setIsSearched(true);
    form.onSubmit(e);
  };

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e && e.preventDefault();
      setIsSearched(true);
      form.onSubmit(e as any);
    }
  };

  const handleEditClick = (id) => () => {
    history.push(`${match.url}/${id}/edit`);
  };

  const handleDuplicateClick = (id) => () => {
    history.push(`${match.url}/${id}/duplicate`);
  };

  const handleDeleteClick = (quickReply) => () => {
    showDialogsRequest({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.title' }),
        description: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.desc' }),
        confirmText: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.confirm' }),
        cancelText: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.cancel' }),
        onDelete: async () => {
          await deleteQuickReplyData(quickReply, queryField.value);
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.toast.success.delete' }),
          });
        },
      },
    });
  };

  const handleItemsPerPageChange = (_, pageSize) => {
    setPagination(1, pageSize);
  };

  const columns: TableColumnProps<QuickReply>[] = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'desk.settings.quickReplies.th.title' }),
        dataIndex: 'name',
        flex: 2,
        sorter: true,
        render: ({ id, name }) => (
          <QuickReplyTitle dir={dir} to={`${match.url}/${id}/edit`}>
            {name}
          </QuickReplyTitle>
        ),
      },
      {
        title: intl.formatMessage({ id: 'desk.settings.quickReplies.th.message' }),
        dataIndex: 'message',
        flex: 4,
        sorter: true,
        render: ({ message }) => <TextShorten dir={dir}>{message}</TextShorten>,
      },
      {
        title: intl.formatMessage({ id: 'desk.settings.quickReplies.th.updatedAt' }),
        dataIndex: 'updatedAt',
        flex: 2,
        sorter: true,
        render: ({ updatedAt }) => moment(updatedAt).format('lll'),
      },
    ],
    [dir, intl, match.url],
  );

  if (isAdmin && !columns.some((column) => column.dataIndex === 'availableType')) {
    columns.splice(2, 0, {
      title: intl.formatMessage({ id: 'desk.settings.quickReplies.th.availability' }),
      dataIndex: 'availableType',
      flex: 1,
      sorter: true,
      render: ({ availableType, groups }) => {
        switch (availableType) {
          case QuickRepliesAvailableType.GROUP:
            return intl.formatMessage(
              { id: 'desk.settings.quickReplies.td.availability.teams' },
              { teams: groups.length },
            );

          case QuickRepliesAvailableType.AGENT:
            return intl.formatMessage({ id: 'desk.settings.quickReplies.td.availability.myself' });

          default:
            return intl.formatMessage({ id: 'desk.settings.quickReplies.td.availability.allAgents' });
        }
      },
    });
  }

  return (
    <AppSettingsContainer isTableView={true}>
      <Container>
        <AppSettingPageHeader
          css={`
            & + * {
              margin-top: 32px;
            }

            * + ${AppSettingPageHeader.Description} {
              margin-top: 2px;
            }
          `}
        >
          <AppSettingPageHeader.Title>Quick replies</AppSettingPageHeader.Title>
          <AppSettingPageHeader.Actions>
            <AddQuickReplyButton buttonType="primary" size="small" icon="plus" onClick={handleCreateClick}>
              {intl.formatMessage({ id: 'desk.settings.quickReplies.button.add' })}
            </AddQuickReplyButton>
          </AppSettingPageHeader.Actions>
          <AppSettingPageHeader.Description $textOnly={true}>
            {intl.formatMessage({ id: 'desk.settings.quickReplies.desc' })}
          </AppSettingPageHeader.Description>
        </AppSettingPageHeader>
        <TableMenu>
          <SearchInput
            size="small"
            ref={queryField.ref}
            name={queryField.name}
            placeholder={queryField.placeholder}
            icons={
              queryField.getValue().trim().length > 0
                ? [
                    {
                      icon: 'close',
                      size: 'xsmall',
                      disabled: isFetching,
                      onClick: handleSearchCancel,
                    },
                  ]
                : [
                    {
                      icon: 'search',
                      size: 'xsmall',
                      disabled: isFetching,
                      isLoading: isFetching,
                      onClick: handleSearchSubmit,
                    },
                  ]
            }
            onChange={queryField.onChange}
            onKeyDown={handleSearchKeyDown}
          />
        </TableMenu>
        <TableContent data-test-id="QuickReplyTable">
          <QuickReplyTable
            rowKey="id"
            loading={isFetching}
            dataSource={quickReplies}
            showScrollbars={true}
            columns={columns}
            rowActions={(record) => [
              <OverflowMenu
                key="quickRepliesOverflow"
                items={[
                  {
                    label: intl.formatMessage({ id: 'desk.settings.quickReplies.label.edit' }),
                    onClick: handleEditClick(record.id),
                  },
                  {
                    label: intl.formatMessage({ id: 'desk.settings.quickReplies.label.duplicate' }),
                    onClick: handleDuplicateClick(record.id),
                  },
                  {
                    label: intl.formatMessage({ id: 'desk.settings.quickReplies.label.delete' }),
                    onClick: handleDeleteClick(record),
                  },
                ]}
                stopClickEventPropagation={true}
              />,
            ]}
            footer={
              <QuickReplyPagination
                current={page}
                total={total}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={setPagination}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            }
            emptyView={
              isSearched ? (
                <CenteredEmptyState
                  icon="no-search"
                  title={intl.formatMessage({ id: 'desk.settings.quickReplies.noMatch.title' })}
                  description={intl.formatMessage(
                    { id: 'desk.settings.quickReplies.noMatch.desc' },
                    { query: searchedQuery },
                  )}
                />
              ) : (
                <CenteredEmptyState
                  icon="no-data"
                  title={intl.formatMessage({ id: 'desk.settings.quickReplies.noResult.title' })}
                  description={intl.formatMessage(
                    { id: 'desk.settings.quickReplies.noResult.desc' },
                    { break: <br /> },
                  )}
                />
              )
            }
          />
        </TableContent>
      </Container>
    </AppSettingsContainer>
  );
});
