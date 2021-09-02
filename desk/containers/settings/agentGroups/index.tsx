import { useState, useCallback, useEffect, HTMLAttributes } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  TableProps,
  TableColumnProps,
  Table,
  Button,
  cssVariables,
  OverflowMenu,
  Lozenge,
  Link as LinkText,
  LinkVariant,
  Tooltip,
  Icon,
} from 'feather';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { AGENT_GROUP_LIST_LIMIT, EMPTY_TEXT } from '@constants';
import { useAuthorization } from '@hooks';
import { Paginator, NewSearchInput, CopyButton, TextWithOverflowTooltip } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { getIsDefaultTeam, sortToDefaultTeamFirst } from '@utils';

const SearchInput = styled(NewSearchInput)`
  flex: none;
`;

const AgentGroupName = styled.b`
  font-weight: 500;
`;

const DefaultTeamLozenge = styled(Lozenge)`
  margin-left: 8px;
`;

const DescriptionWrapper = styled.div`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DescriptionTooltip = styled(Tooltip)`
  max-width: 100%;
`;

const MemberCountColumnWrapper = styled.div`
  display: flex;
  align-items: center;

  & > svg {
    margin-right: 6px;
  }
`;

const CopyKeyButton = styled(CopyButton)`
  margin: -3px 0;
  margin-left: 4px;
`;

const AgentTeamTable = styled((props: TableProps<AgentGroup<'listItem'>>) => Table(props))`
  height: 100%;
  border-right: 0;
  border-left: 0;
  border-bottom: 0;
`;

export const AgentGroupsPagination = styled(Paginator)`
  margin-left: auto;
`;

const getColumns: GetColumns = ({ intl, linkToAgentGroupDetail }) => {
  return [
    {
      dataIndex: 'name',
      title: intl.formatMessage({ id: 'desk.team.table.column.name' }),
      flex: 1.8,
      sorter: true,
      render: ({ id, name, key }) => {
        const handleLinkTextClick = () => {
          linkToAgentGroupDetail(id);
        };

        return (
          <>
            <LinkText variant={LinkVariant.Neutral} onClick={handleLinkTextClick}>
              <AgentGroupName>{name}</AgentGroupName>
            </LinkText>
            {getIsDefaultTeam(key) && (
              <DefaultTeamLozenge color="neutral">
                {intl.formatMessage({ id: 'desk.team.lozenge.defaultTeam' })}
              </DefaultTeamLozenge>
            )}
          </>
        );
      },
    },
    {
      dataIndex: 'key',
      title: intl.formatMessage({ id: 'desk.team.table.column.key' }),
      flex: 1.3,
      sorter: true,
      onCell: () => ({ 'data-test-id': 'KeyCell' } as HTMLAttributes<HTMLElement>),
      render: ({ key }) => {
        if (!key) {
          return EMPTY_TEXT;
        }
        return (
          <>
            <TextWithOverflowTooltip tooltipDisplay="inline-block">{key}</TextWithOverflowTooltip>
            <CopyKeyButton size="xsmall" copyableText={key} />
          </>
        );
      },
    },
    {
      dataIndex: 'description',
      title: intl.formatMessage({ id: 'desk.team.table.column.description' }),
      flex: 3,
      sorter: true,
      onCell: () => ({ 'data-test-id': 'DescriptionCell' } as HTMLAttributes<HTMLElement>),
      render: ({ description }) => {
        if (!description) {
          return EMPTY_TEXT;
        }
        return (
          <DescriptionTooltip content={description} placement="bottom">
            <DescriptionWrapper>{description}</DescriptionWrapper>
          </DescriptionTooltip>
        );
      },
    },
    {
      dataIndex: 'memberCount',
      title: intl.formatMessage({ id: 'desk.team.table.column.agents' }),
      flex: 0.8,
      sorter: true,
      render: ({ memberCount }) => (
        <MemberCountColumnWrapper>
          <Icon icon="user" size={16} color={cssVariables('neutral-6')} />
          {memberCount}
        </MemberCountColumnWrapper>
      ),
    },
  ];
};

interface GetColumns {
  (parameters: {
    intl: IntlShape;
    linkToAgentGroupDetail: (groupId: AgentGroup<'listItem'>['id']) => void;
  }): TableColumnProps<AgentGroup<'listItem'>>[];
}

export const AgentGroups: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();
  const agentGroups = useSelector((state: RootState) => state.agentGroups);

  const [limit, setLimit] = useState<PerPage>(AGENT_GROUP_LIST_LIMIT);
  const { isPermitted } = useAuthorization();

  const deleteAgentGroup = useCallback(
    (group: AgentGroup<'listItem'>) => {
      if (!group) {
        return;
      }
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.DeleteAgentGroup,
          dialogProps: {
            groupId: group.id,
            groupName: group.name,
          },
        }),
      );
    },
    [dispatch],
  );

  const linkToAgentGroupDetail = (groupId: AgentGroup<'listItem'>['id']) => {
    history.push(`teams/form/${groupId}`);
  };

  const handleSearchChange = useCallback(
    (query) => {
      dispatch(deskActions.updateAgentGroupQuery({ query: query || '' }));
    },
    [dispatch],
  );

  const handleSearchClear = useCallback(() => {
    if (agentGroups.query !== '') {
      dispatch(
        deskActions.fetchAgentGroupsRequest({
          offset: 0,
          limit: AGENT_GROUP_LIST_LIMIT,
          query: '',
        }),
      );
    }
    dispatch(deskActions.updateAgentGroupQuery({ query: '' }));
  }, [agentGroups.query, dispatch]);

  const handleSearchSubmit = useCallback(
    (query) => {
      dispatch(
        deskActions.fetchAgentGroupsRequest({
          offset: 0,
          limit: AGENT_GROUP_LIST_LIMIT,
          query,
        }),
      );
    },
    [dispatch],
  );

  const handleEditTeam = (group: AgentGroup<'listItem'>) => {
    linkToAgentGroupDetail(group.id);
  };

  const handlePaginatorChange = (page: number, pageSize: PerPage) => {
    setLimit(pageSize);
    dispatch(
      deskActions.fetchAgentGroupsRequest({
        offset: (page - 1) * pageSize,
        limit: pageSize,
        query: agentGroups.query,
      }),
    );
  };

  useEffect(() => {
    dispatch(deskActions.fetchAgentGroupsRequest({ offset: 0, limit: AGENT_GROUP_LIST_LIMIT }));

    return () => {
      dispatch(deskActions.resetAgentGroups());
    };
  }, [dispatch]);

  return (
    <>
      <AppSettingsContainer isTableView={true}>
        <AppSettingPageHeader
          css={`
            * + ${AppSettingPageHeader.Description} {
              margin-top: 24px;
            }
          `}
        >
          <AppSettingPageHeader.Title>
            {intl.formatMessage({ id: 'desk.team.setting.title' })}
          </AppSettingPageHeader.Title>
          <AppSettingPageHeader.Actions
            css={`
              & > * + * {
                margin-left: 8px;
              }
            `}
          >
            <SearchInput
              handleChange={handleSearchChange}
              handleSearchClear={handleSearchClear}
              value={agentGroups.query}
              ph={intl.formatMessage({ id: 'desk.team.setting.header.search.ph' })}
              handleSubmit={handleSearchSubmit}
              styles={{
                SearchInput: css`
                  width: 224px;
                `,
              }}
            />
            {isPermitted(['desk.admin']) && (
              <Link to="teams/form">
                <Button buttonType="primary" size="small" icon="plus">
                  {intl.formatMessage({ id: 'desk.team.setting.header.create.btn' })}
                </Button>
              </Link>
            )}
          </AppSettingPageHeader.Actions>
          <AppSettingPageHeader.Description>
            {intl.formatMessage({ id: 'desk.team.setting.description' })}
          </AppSettingPageHeader.Description>
        </AppSettingPageHeader>
        <AgentTeamTable
          loading={agentGroups.isFetching}
          showScrollbars={true}
          css={`
            tr:not(:hover) ${CopyKeyButton} {
              display: none;
            }
          `}
          columns={getColumns({ intl, linkToAgentGroupDetail })}
          rowActions={(record) => [
            <OverflowMenu
              key={record.id}
              items={
                getIsDefaultTeam(record.key)
                  ? [
                      {
                        label: intl.formatMessage({ id: 'desk.team.edit.button' }),
                        onClick: () => handleEditTeam(record),
                      },
                    ]
                  : [
                      {
                        label: intl.formatMessage({ id: 'desk.team.edit.button' }),
                        onClick: () => handleEditTeam(record),
                      },
                      {
                        label: intl.formatMessage({ id: 'desk.team.delete.button' }),
                        onClick: () => deleteAgentGroup(record),
                      },
                    ]
              }
              stopClickEventPropagation={true}
            />,
          ]}
          dataSource={agentGroups.query === '' ? agentGroups.items.sort(sortToDefaultTeamFirst) : agentGroups.items}
          emptyView={
            agentGroups.query !== '' && (
              <CenteredEmptyState
                icon="no-search"
                title={intl.formatMessage({ id: 'desk.team.table.body.noMatch.header' })}
                description={intl.formatMessage(
                  { id: 'desk.team.table.body.noMatch.description' },
                  { query: agentGroups.query },
                )}
              />
            )
          }
          footer={
            agentGroups.items.length > 0 && (
              <AgentGroupsPagination
                current={agentGroups.pagination.page || 1}
                total={agentGroups.pagination.count || 0}
                pageSize={limit}
                pageSizeOptions={[10, 20, 50, 100] as ReadonlyArray<PerPage>}
                onChange={handlePaginatorChange}
                onItemsPerPageChange={handlePaginatorChange}
              />
            )
          }
        />
      </AppSettingsContainer>
    </>
  );
};
