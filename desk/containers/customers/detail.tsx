import { useEffect, useCallback, useState, createRef, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  Button,
  cssVariables,
  Table,
  Icon,
  TableProps,
  Tag,
  Dropdown,
  ScrollBar,
  ScrollBarRef,
  Typography,
  Tooltip,
  transitionDefault,
  IconButton,
} from 'feather';
import moment from 'moment-timezone';
import { compose } from 'redux';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { LIST_LIMIT, TicketType } from '@constants';
import { TicketStatus, EMPTY_TEXT } from '@constants';
import DeskCustomerAvatar from '@desk/components/DeskCustomerAvatar';
import { usePagination, useAuthorization, useAppId } from '@hooks';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import {
  CustomerSideProfile,
  CollapsibleSection,
  CustomFieldList,
  EditingField,
  Paginator,
  TicketStatusLozenge,
  ContentContainer,
  PageHeader,
} from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { ProactiveChatMessageCountBadge } from '@ui/components/ProactiveChatMessageCountBadge';
import { useDrawer } from '@ui/components/drawer/useDrawer';
import { getTicketSocialType } from '@utils';

import { TicketAgentNameForAgent } from '../../../ui/components/deskTicketResources/TicketAgentNameForAgent';
import { drawerId } from '../ProactiveChatViewDrawer/ProactiveChatViewDrawer';
import { DefaultFilterItemId, getDefaultTicketSearchQueryParam } from '../TicketSearchInput';
import { withSocial, SocialComponentProps } from './withSocial';

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  padding: 0 32px;
  width: 100%;
  height: 80px;

  > * {
    width: 100%;
  }

  /* 
    onMouseLeave is not called on a disabled button without this workaround.
    https://github.com/facebook/react/issues/4251 
  */
  button[disabled] {
    pointer-events: none;
  }
`;

const StyledCustomersDetail = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 0;
`;

const CustomerInformation = styled.div``;

const DropdownWrapper = styled.div`
  margin-bottom: 16px;
`;

const CustomerDetailTable = styled((props: TableProps<Ticket>) => Table(props))`
  flex: 1;
  border-right: none;
  border-left: none;

  tbody tr > td {
    padding-top: 16px;
    padding-bottom: 16px;
  }
`;

const TicketSocialIcon = styled.div`
  margin-right: 8px;
  height: 16px;
`;

const CustomerTicketsPaginator = styled(Paginator)`
  margin-left: auto;
`;

const CustomerContainer = styled.div`
  display: flex;
  max-width: 100%;
  height: calc(100% - 81px);
`;

const CustomerContainerLeft = styled.div`
  width: 25%;
  min-width: 288px;
  max-width: 336px;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  border-right: 1px solid ${cssVariables('neutral-3')};
`;

const CustomerContainerRight = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 800px;
  height: 100%;
  max-height: 100%;
  padding: 24px 32px 0 32px;
  overflow-x: auto;
`;

const CollapsibleSectionWrapper = styled(CollapsibleSection)`
  border-bottom: none;
  padding: 0 32px;
`;

const DisplayName = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  margin-left: 8px;
  word-break: break-word;
`;

const LastMessage = styled.div`
  color: ${cssVariables('neutral-7')};
  width: 100%;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const LastAt = styled.div`
  display: flex;
  align-items: center;
  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']}

  > span {
    margin-left: 4px;
  }
`;

const IssuedAtDate = styled.div`
  color: ${cssVariables('neutral-10')};
`;

const RelatedTicket = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const TicketHeader = styled.div`
  display: flex;
  align-items: center;
`;

const TicketHeaderDisplayName = styled.div`
  color: ${cssVariables('neutral-10')};
  font-weight: 500;
  display: flex;
`;

const AvatarWrapper = styled.div`
  flex: none;
`;

const mapStateToProps = (state: RootState) => ({
  customers: state.customers,
  customerFields: state.customerFields,
  twitter: state.twitter,
});

const mapDispatchToProps = {
  pushHistory: commonActions.pushHistory,
  showDialogsRequest: commonActions.showDialogsRequest,
  fetchCustomerRequest: deskActions.fetchCustomerRequest,
  fetchCustomerTicketsRequest: deskActions.fetchCustomerTicketsRequest,
  fetchCustomerTicketsCancel: deskActions.fetchCustomerTicketsCancel,
  addCustomerFieldData: deskActions.addCustomerFieldDataRequest,
  updateCustomerFieldData: deskActions.updateCustomerFieldDataRequest,
  getCustomerFieldDataList: deskActions.getCustomerFieldDataListRequest,
  fetchCustomerFields: deskActions.fetchCustomerFieldsRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionsProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionsProps & RCProps<StoreProps & ActionsProps> & SocialComponentProps;

const ticketTypeItems: DropdownItem<TicketType | undefined>[] = [
  { label: 'desk.customers.detail.typeFilter.all', value: undefined },
  { label: 'desk.customers.detail.typeFilter.normal', value: TicketType.CUSTOMER_CHAT },
  { label: 'desk.customers.detail.typeFilter.proactiveChat', value: TicketType.PROACTIVE_CHAT },
];

const CustomersDetailConnectable: React.FC<Props> = ({
  match,
  customers,
  customerFields,
  fetchCustomerRequest,
  fetchCustomerTicketsRequest,
  fetchCustomerTicketsCancel,
  pushHistory,
  addCustomerFieldData,
  updateCustomerFieldData,
  getCustomerFieldDataList,
  fetchCustomerFields,
  twitter,
  socialReducer,
  showDialogsRequest,
}) => {
  const intl = useIntl();
  const appId = useAppId();
  const { isPermitted, role } = useAuthorization();
  const { openDrawer } = useDrawer();

  const [currentEditingField, setEditingField] = useState<EditingField>({});
  const [selectedTicketType, setSelectedTicketType] = useState<DropdownItem<TicketType | undefined>>(
    ticketTypeItems[0],
  );
  const scrollBar = createRef<ScrollBarRef>();
  const isProactiveChatEnabled = useSelector((state: RootState) => state.desk.project.proactiveChatEnabled);

  const { current: currentCustomer, customerTickets, customerTicketsPagination } = customers;
  const { customerId: paramsCustomerId } = match.params as any;
  const isFetchingCustomerTickets = useRef(customers.isFetchingCustomerTickets);

  const { page, pageSize, setPagination } = usePagination(1, LIST_LIMIT);
  const agentTwitterUser = socialReducer.twitter.state.twitterUsers[0];
  const isAgent = isPermitted(['desk.agent']);

  const handleAddOrEditButtonClick = (id: EditingField['id']) => () => setEditingField({ id });
  const handleCancelButtonClick = () => setEditingField({});

  useEffect(() => {
    isFetchingCustomerTickets.current = customers.isFetchingCustomerTickets;
  }, [customers.isFetchingCustomerTickets]);

  useEffect(() => {
    fetchCustomerFields({ offset: 0, limit: 50 });
    fetchCustomerRequest(paramsCustomerId);
  }, [fetchCustomerFields, fetchCustomerRequest, paramsCustomerId]);

  useEffect(() => {
    if (currentCustomer.id) {
      getCustomerFieldDataList({ id: currentCustomer.id });
    }
  }, [getCustomerFieldDataList, currentCustomer.id]);

  const fetchCustomerTickets = useCallback(
    ({
      offset = 0,
      limit = LIST_LIMIT,
      ticketStatus = TicketStatus.ALL,
      ticketType = selectedTicketType.value,
      // params = customers.parameters,
    }) => {
      if (isFetchingCustomerTickets.current) {
        fetchCustomerTicketsCancel();
      }
      fetchCustomerTicketsRequest({
        offset,
        limit,
        customerId: paramsCustomerId,
        ticketStatus,
        ticketType,
      });
    },
    [paramsCustomerId, fetchCustomerTicketsRequest, fetchCustomerTicketsCancel, selectedTicketType],
  );

  useEffect(() => {
    fetchCustomerTickets({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }, [fetchCustomerTickets, page, pageSize]);

  const handleTicketClick = (ticket: Ticket) => () => {
    const isDisabledRow = ticket.status2 === TicketStatus.PROACTIVE;
    if (isDisabledRow) {
      return;
    }
    const queryParam = getDefaultTicketSearchQueryParam(DefaultFilterItemId.TicketID, ticket.id.toString());
    if (isAgent) {
      pushHistory(`/${appId}/desk/conversation/${ticket.id}?${queryParam}`);
    } else {
      pushHistory(`/${appId}/desk/tickets/${ticket.id}?${queryParam}`);
    }
  };

  const onRow = (ticket: Ticket) => {
    return {
      onClick: handleTicketClick(ticket),
    };
  };

  const renderSocialIcon = (ticket: Ticket) => {
    let iconNode: React.ReactNode;
    switch (getTicketSocialType(ticket.channelType)) {
      case 'facebook':
        iconNode = <Icon icon="facebook" size={16} color={cssVariables('neutral-7')} />;
        break;
      case 'twitter':
        iconNode = <Icon icon="twitter" size={16} color={cssVariables('neutral-7')} />;
        break;
      case 'instagram':
        iconNode = <Icon icon="instagram" size={16} color={cssVariables('neutral-7')} />;
        break;
      case 'whatsapp':
        iconNode = <Icon icon="whatsapp" size={16} color={cssVariables('neutral-7')} />;
        break;
      default:
        break;
    }
    return iconNode && <TicketSocialIcon>{iconNode}</TicketSocialIcon>;
  };

  const getTicketSubject = useCallback(
    (channelName: string, ticket: Ticket) => {
      switch (getTicketSocialType(ticket.channelType)) {
        case 'facebook':
        case 'twitter':
        case 'instagram':
          return currentCustomer.displayName;
        default:
          return channelName;
      }
    },
    [currentCustomer],
  );

  const handleSelectedTicketTypeItem = useCallback((item?: DropdownItem<TicketType>) => {
    if (item) {
      setSelectedTicketType(item);
      return;
    }
  }, []);

  const handleProactiveClick = useCallback(() => {
    showDialogsRequest({
      dialogTypes: DialogType.CreateProactiveChat,
      dialogProps: {
        targetCustomer: currentCustomer,
        onSuccess: () =>
          setTimeout(() => {
            fetchCustomerTickets({
              offset: (page - 1) * pageSize,
              limit: pageSize,
            });
          }, 100),
      },
    });
  }, [showDialogsRequest, currentCustomer, fetchCustomerTickets, page, pageSize]);

  const renderHeaderRight = useMemo(() => {
    const isSendBirdType = currentCustomer.channelType === 'SENDBIRD';
    const isShownTooltip = !isSendBirdType || !isProactiveChatEnabled;

    const sendButton = (
      <Button buttonType="primary" size="small" icon="send" onClick={handleProactiveClick} disabled={isShownTooltip}>
        {intl.formatMessage({ id: 'desk.customers.detail.proactiveChat.button.label' })}
      </Button>
    );

    if (isShownTooltip) {
      return (
        <Tooltip
          content={
            isProactiveChatEnabled
              ? intl.formatMessage({ id: 'desk.customers.detail.proactiveChat.button.tooltip.disabled.by.sns' })
              : intl.formatMessage({ id: 'desk.customers.detail.proactiveChat.button.tooltip.disabled.by.setting.off' })
          }
        >
          {sendButton}
        </Tooltip>
      );
    }
    return sendButton;
  }, [intl, currentCustomer.channelType, isProactiveChatEnabled, handleProactiveClick]);

  const handleItemToString = (item: DropdownItem<TicketType | undefined>) => intl.formatMessage({ id: item.label });
  const formatTimeAgo = useFormatTimeAgo();

  return (
    <StyledCustomersDetail>
      <HeaderWrapper>
        <PageHeader
          css={`
            ${PageHeader.BackButton} {
              left: 0;
              margin-right: 8px;
            }
          `}
        >
          <PageHeader.BackButton href={`/${appId}/desk/customers`} />
          <PageHeader.Title>
            {currentCustomer.displayName == null || currentCustomer.displayName.trim() === ''
              ? EMPTY_TEXT
              : currentCustomer.displayName}
          </PageHeader.Title>
          <PageHeader.Actions>{renderHeaderRight}</PageHeader.Actions>
        </PageHeader>
      </HeaderWrapper>
      <CustomerContainer>
        <CustomerContainerLeft>
          <ScrollBar style={{ height: '100%' }} ref={scrollBar}>
            <CustomerInformation>
              <CustomerSideProfile
                agentTwitter={agentTwitterUser}
                customerTwitter={twitter.twitterUser}
                customer={currentCustomer}
                hasLinkToDetail={false}
                styles={css`
                  padding: 24px 32px;
                `}
              >
                <CollapsibleSectionWrapper
                  title={intl.formatMessage({ id: 'desk.customers.detail.customerInformation.label' })}
                  isCollapsible={false}
                  styles={css`
                    height: 64px;
                  `}
                  scrollBarRef={scrollBar}
                >
                  <CustomFieldList
                    id={currentCustomer.id}
                    fields={customerFields}
                    currentEditingField={currentEditingField}
                    addFieldData={addCustomerFieldData}
                    updateFieldData={updateCustomerFieldData}
                    onAddOrEditButtonClick={handleAddOrEditButtonClick}
                    onCancelButtonClick={handleCancelButtonClick}
                    settingLink={isAgent ? undefined : `/${appId}/desk/settings/customer-fields`}
                    role={role}
                  />
                </CollapsibleSectionWrapper>
              </CustomerSideProfile>
            </CustomerInformation>
          </ScrollBar>
        </CustomerContainerLeft>
        <ScrollBar style={{ width: '100%' }}>
          <CustomerContainerRight>
            <DropdownWrapper>
              <Dropdown
                items={ticketTypeItems}
                size="small"
                itemToString={handleItemToString}
                selectedItem={selectedTicketType}
                initialSelectedItem={ticketTypeItems[0]}
                onItemSelected={handleSelectedTicketTypeItem}
              />
            </DropdownWrapper>
            <CustomerDetailTable
              columns={[
                {
                  dataIndex: 'status',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.status' }),
                  flex: 1,
                  width: 98,
                  render: (ticket) => <TicketStatusLozenge ticketStatus={ticket.status2} />,
                },
                {
                  dataIndex: 'channelName',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.subject' }),
                  flex: 3,
                  width: 200,
                  render: (ticket) => {
                    return (
                      <RelatedTicket>
                        <TicketHeader>
                          {renderSocialIcon(ticket)}
                          <TicketHeaderDisplayName>
                            {getTicketSubject(ticket.channelName, ticket)}
                            {ticket.status2 === TicketStatus.PROACTIVE && (
                              <ProactiveChatMessageCountBadge
                                messageCount={ticket.proactiveChatTicketMessageCount ?? 0}
                                css={css`
                                  margin-left: 4px;
                                `}
                              />
                            )}
                          </TicketHeaderDisplayName>
                        </TicketHeader>
                        {ticket.lastMessage && <LastMessage>{ticket.lastMessage}</LastMessage>}
                        {ticket.lastMessageAt && (
                          <LastAt>
                            <Icon icon="time" size={12} color={cssVariables('neutral-7')} />
                            <span>{formatTimeAgo(new Date(ticket.lastMessageAt))}</span>
                          </LastAt>
                        )}
                      </RelatedTicket>
                    );
                  },
                },
                {
                  width: 48,
                  render: (ticket) =>
                    ticket.status2 === TicketStatus.PROACTIVE && (
                      <IconButton
                        data-test-id="SendFollowUpMessageButton"
                        icon="proactive-chat"
                        buttonType="tertiary"
                        size="small"
                        title={intl.formatMessage({
                          id: 'desk.customers.detail.ticketList.table.button.sendMessage.tooltip',
                        })}
                        tooltipPlacement="top"
                        css={css`
                          margin-top: -6px;
                        `}
                        onClick={() =>
                          openDrawer(drawerId, {
                            ticket,
                            onClose: () => {
                              fetchCustomerTickets({
                                offset: (page - 1) * pageSize,
                                limit: pageSize,
                              });
                            },
                          })
                        }
                      />
                    ),
                },
                {
                  dataIndex: 'customer',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.customer' }),
                  flex: 1,
                  width: 127,
                  render: (ticket) => (
                    <>
                      <AvatarWrapper>
                        <DeskCustomerAvatar
                          size="small"
                          profileID={ticket.customer.id}
                          imageUrl={ticket.customer.photoThumbnailUrl || ''}
                        />
                      </AvatarWrapper>
                      <DisplayName>{ticket.customer.displayName}</DisplayName>
                    </>
                  ),
                },
                {
                  dataIndex: 'team',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.team' }),
                  flex: 1,
                  width: 90,
                  render: (ticket) => {
                    if (ticket.group) {
                      const isDefaultGroup = ticket.group.key == null;
                      return (
                        <Tag maxWidth={120}>
                          {isDefaultGroup ? intl.formatMessage({ id: 'desk.team.defaultTeam' }) : ticket.group.name}
                        </Tag>
                      );
                    }
                    return <span>{EMPTY_TEXT}</span>;
                  },
                },
                {
                  dataIndex: 'recentAssignment',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.assignee' }),
                  flex: 1,
                  width: 146,
                  render: (ticket) => <TicketAgentNameForAgent agent={ticket.recentAssignment?.agent} />,
                },
                {
                  dataIndex: 'issuedAt',
                  title: intl.formatMessage({ id: 'desk.customers.detail.ticketList.table.label.created' }),
                  flex: 1,
                  width: 160,
                  render: ({ issuedAt, createdAt }) => (
                    <IssuedAtDate>{moment(issuedAt || createdAt).format('lll')}</IssuedAtDate>
                  ),
                },
              ]}
              dataSource={customerTickets}
              loading={customers.isFetchingCustomerTickets}
              emptyView={
                <CenteredEmptyState
                  icon="no-data"
                  title={intl.formatMessage({
                    id: 'desk.customers.detail.ticketList.table.noResult.title',
                  })}
                  description={intl.formatMessage({
                    id: 'desk.customers.detail.ticketList.table.noResult.desc',
                  })}
                />
              }
              showScrollbars={true}
              onRow={onRow}
              rowStyles={(ticket: Ticket) => {
                const isDisabledRow = ticket.status2 === TicketStatus.PROACTIVE;
                return css`
                  cursor: pointer;
                  ${isDisabledRow &&
                  css`
                    cursor: inherit;
                  `}

                  ${!isDisabledRow &&
                  css`
                    ${TicketHeaderDisplayName} {
                      transition: color 0.2s ${transitionDefault};
                    }

                    &:hover {
                      ${TicketHeaderDisplayName} {
                        color: ${cssVariables('purple-7')};
                        text-decoration: underline;
                      }
                    }
                  `}
                `;
              }}
              footer={
                <CustomerTicketsPaginator
                  current={page}
                  total={customerTicketsPagination.count}
                  pageSize={pageSize}
                  onChange={setPagination}
                  onItemsPerPageChange={setPagination}
                />
              }
            />
          </CustomerContainerRight>
        </ScrollBar>
      </CustomerContainer>
    </StyledCustomersDetail>
  );
};

export const CustomersDetail = compose(
  withSocial,
  connect(mapStateToProps, mapDispatchToProps),
)(CustomersDetailConnectable);
