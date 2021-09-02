import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  KeyboardEventHandler,
  ComponentProps,
} from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useRouteMatch, useHistory, useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, ScrollBar, ScrollBarRef, Dropdown, SortOrderIndicator, IconButton } from 'feather';
import qs from 'qs';

import { deskActions } from '@actions';
import { TicketSortBy, TicketStatus, IS_INTEGER_REGEX } from '@constants';
import { Paginator, SpinnerFull, AutoRefreshDropdown } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { SortOrder } from '../../../constants/desk';
import { DeskChatLayoutContext } from '../DeskChatLayout';
import {
  TicketSearchInput,
  TicketSearchQuery,
  TicketSearchInputType,
  TicketSearchURLQuery,
} from '../TicketSearchInput';
import { ContractedTicketFilter } from './contractedTicketFilter';
import { ContractedTicketItem } from './contractedTicketItem';
import { TicketsContext } from './ticketsContext';

const CTLHeaderContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  position: relative;
  height: 100%;
`;

const CTLBackFilter = styled.div`
  display: flex;
  align-items: center;
`;

const CTLRefresh = styled.div`
  padding-right: 8px;
`;

const CTLRefreshWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  border-radius: 4px;
`;

const CTLFilter = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin-right: 8px;
`;

const CTLFilterWrapper = styled(IconButton)``;

const Sorter = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  margin-left: -8px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  padding: 0 16px;

  button[type='button'] {
    & > div {
      font-weight: 500;
    }
  }
`;

const SortIndicatorWrapper = styled.div`
  cursor: pointer;
`;

const HeaderDropdown = styled.div`
  button[type='button'] {
    & > div {
      font-size: 16px;
      font-weight: 600;
    }
  }
`;

const LeftArrow = styled(IconButton)``;

const TicketSearchWrapper = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  height: 100%;
  padding-top: 12px;
  background: white;
`;

const mapStateToProps = (state: RootState) => ({
  currentTicketId: state.ticketDetail.ticket && state.ticketDetail.ticket.id,
  refresh: state.tickets.refresh,
});

const mapDispatchToProps = {
  setTicketsRefreshAutomatic: deskActions.setTicketsRefreshAutomatic,
  setTicketsRefreshAutomaticItem: deskActions.setTicketsRefreshAutomaticItem,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type OwnProps = {
  initialSearchQuery: ComponentProps<typeof TicketSearchInput>['initialSearchQuery'];
  onSearch: (queries: TicketSearchQuery[]) => void;
  onResetSearch: () => void;
  handleTicketItemActionChange: (payload: { action: TicketHeaderActionType; ticket: Ticket; agent?: Agent }) => void;
  handleTicketClick: (ticket) => (e) => void;
  handleRefresh: () => void;
};

type Props = StoreProps & ActionProps & OwnProps;

const ContractedTicketListConnectable: React.FC<Props> = ({
  currentTicketId,
  refresh,
  initialSearchQuery,
  setTicketsRefreshAutomatic,
  setTicketsRefreshAutomaticItem,
  onSearch,
  onResetSearch,
  handleRefresh,
  handleTicketClick,
  handleTicketItemActionChange,
}) => {
  const {
    ticketSorter,
    setTicketSorter,
    tickets,
    isFetching,
    pagination,
    ticketCount,
    ticketStatus,
    isSearchMode,
    isSearched,
    searchQuery,
    setTicketStatus,
    setPagination,
    setSearchQuery,
    setIsSearchMode,
    resetSearch,
  } = useContext(TicketsContext);
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();
  const csbComponent = useRef<ScrollBarRef>(null);
  const ticketSearchInputRef = useRef<HTMLInputElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<TicketSearchURLQuery[keyof TicketSearchURLQuery][] | string>([]);

  const sorterItems = useMemo(
    () => [
      { label: intl.formatMessage({ id: 'label.status' }), value: TicketSortBy.STATUS },
      { label: intl.formatMessage({ id: 'label.priority' }), value: TicketSortBy.PRIORITY },
      { label: intl.formatMessage({ id: 'label.subject' }), value: TicketSortBy.SUBJECT },
      { label: intl.formatMessage({ id: 'label.customer' }), value: TicketSortBy.CUSTOMER },
      { label: intl.formatMessage({ id: 'label.team' }), value: TicketSortBy.TEAM },
      { label: intl.formatMessage({ id: 'label.assignee' }), value: TicketSortBy.ASSIGNEE },
      { label: intl.formatMessage({ id: 'label.csat' }), value: TicketSortBy.CSAT },
      { label: intl.formatMessage({ id: 'label.created' }), value: TicketSortBy.CREATED },
    ],
    [intl],
  );

  const ticketStatusItems = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.ALL' }),
        value: TicketStatus.ALL,
      },
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.PENDING' }),
        value: TicketStatus.PENDING,
      },
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.ACTIVE' }),
        value: TicketStatus.ACTIVE,
      },
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.IDLE' }),
        value: TicketStatus.IDLE,
      },
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.WORK_IN_PROGRESS' }),
        value: TicketStatus.WIP,
      },
      {
        label: intl.formatMessage({ id: 'desk.tickets.filter.status.CLOSED' }),
        value: TicketStatus.CLOSED,
      },
    ],
    [intl],
  );

  useEffect(() => {
    csbComponent.current?.scrollToTop();
  }, [tickets]);

  const getSelectedSorter = useCallback(() => sorterItems.find((item) => item.value === ticketSorter.sortBy), [
    ticketSorter,
    sorterItems,
  ]);
  const getSelectedStatus = useCallback(() => ticketStatusItems.find((item) => item.value === ticketStatus), [
    ticketStatus,
    ticketStatusItems,
  ]);

  const handleChangeSelectedSorter = useCallback(
    (dropdownItem: { label: string; value: TicketSortBy } | null) => {
      if (dropdownItem) {
        setTicketSorter({ sortBy: dropdownItem.value, order: SortOrder.ASCEND });
      }
    },
    [setTicketSorter],
  );

  const handleChangeTicketStatus = useCallback(
    (dropdownItem: { label: string; value: TicketStatus } | null) => {
      if (dropdownItem) {
        setTicketStatus(dropdownItem.value);
      }
    },
    [setTicketStatus],
  );

  const handleBackClick = useCallback(() => {
    resetSearch();
    if (match) {
      history.push(`${match.path.replace('/:ticketId', '')}`);
    }
  }, [resetSearch, match, history]);

  const handleFilterOpen = useCallback(
    (isFilterOpen: boolean) => () => {
      setIsFilterOpen(isFilterOpen);
    },
    [],
  );

  const handleSortIndicator = useCallback(() => {
    setTicketSorter({
      sortBy: ticketSorter.sortBy,
      order: ticketSorter.order === SortOrder.ASCEND ? SortOrder.DESCEND : SortOrder.ASCEND,
    });
  }, [ticketSorter, setTicketSorter]);

  const handleSearchClick = useCallback(
    (searchMode: boolean) => () => {
      setIsSearchMode(searchMode);
    },
    [setIsSearchMode],
  );

  const handleIsAutoRefreshActiveChange: ComponentProps<
    typeof AutoRefreshDropdown
  >['onIsAutoRefreshActiveChange'] = useCallback(
    (isAutoRefreshEnabled) => {
      setTicketsRefreshAutomatic(isAutoRefreshEnabled);
    },
    [setTicketsRefreshAutomatic],
  );

  const handleSelectedIntervalChange: ComponentProps<
    typeof AutoRefreshDropdown
  >['onSelectedIntervalChange'] = useCallback(
    (intervalItem) => {
      setTicketsRefreshAutomaticItem(intervalItem);
    },
    [setTicketsRefreshAutomaticItem],
  );

  const ticketItemList = useMemo(
    () =>
      tickets.map((ticket, index) => (
        <ContractedTicketItem
          key={`tid_${index}`}
          ticket={ticket}
          isActive={ticket.id === currentTicketId}
          handleTicketClick={handleTicketClick}
          handleTicketItemActionChange={handleTicketItemActionChange}
          selectedFilter={ticketSorter.sortBy}
        />
      )),
    [tickets, ticketSorter.sortBy, currentTicketId, handleTicketClick, handleTicketItemActionChange],
  );

  const getNoMatchDescription = useCallback(() => {
    if (!isSearched) {
      return intl.formatMessage({ id: 'desk.tickets.ticketList.search.empty.desc' });
    }
    if (typeof currentQuery === 'string') {
      return intl.formatMessage({ id: 'desk.tickets.search.manual.noMatch.description' }, { query: currentQuery });
    }
    if (currentQuery.length === 1) {
      return intl.formatMessage({ id: 'desk.tickets.search.singleFilter.noMatch.description' });
    }
    return intl.formatMessage({ id: 'desk.tickets.search.multiFilters.noMatch.description' });
  }, [currentQuery, intl, isSearched]);

  const noResult = useMemo(() => {
    if (isSearchMode) {
      return isSearched ? (
        <CenteredEmptyState
          icon="tickets"
          title={intl.formatMessage({ id: 'desk.tickets.search.noMatch.title' })}
          description={getNoMatchDescription()}
        />
      ) : (
        <CenteredEmptyState
          icon="tickets"
          title={intl.formatMessage({ id: 'desk.tickets.search.title' })}
          description={intl.formatMessage({ id: 'desk.tickets.search.description' }, { break: <br /> })}
        />
      );
    }
    return (
      <CenteredEmptyState
        icon="tickets"
        title={intl.formatMessage({ id: 'desk.tickets.contractedTicketList.list.empty.title' })}
        description={intl.formatMessage({ id: 'desk.tickets.contractedTicketList.list.empty.desc' }, { break: <br /> })}
      />
    );
  }, [getNoMatchDescription, intl, isSearchMode, isSearched]);

  const handleItemsPerPageChange = useCallback(
    (page: number, pageSize: PerPage) => {
      setPagination({
        offset: 0,
        limit: pageSize,
        page,
      });
    },
    [setPagination],
  );

  const handlePageChange = useCallback(
    (page: number, pageSize: PerPage) => {
      const offset = page === 1 ? 0 : page - 1;
      setPagination({
        offset: offset * pageSize,
        limit: pageSize,
        page,
      });
    },
    [setPagination],
  );

  const handleSearchIconClick = () => {
    setIsSearchMode(true);
    ticketSearchInputRef.current?.focus();
  };

  const handleSearchBackButtonClick = () => {
    setIsSearchMode(false);
    onResetSearch();
    resetSearch();
  };

  const handleSearchKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value.trim();
      setSearchQuery(query);
    }
  };

  const handleResetButtonClick = () => {
    onResetSearch();
    resetSearch();
  };

  useEffect(() => {
    if (location.search !== '') {
      const { q } = qs.parse(location.search, { ignoreQueryPrefix: true });
      const urlQuery: TicketSearchURLQuery = qs.parse(q);
      if (Object.keys(urlQuery).some((queryId) => IS_INTEGER_REGEX.test(queryId.trim()))) {
        setCurrentQuery(Object.values(urlQuery));
      } else {
        setCurrentQuery(q);
      }
    }
  }, [location.search]);

  return (
    <DeskChatLayoutContext.Consumer>
      {({ TicketSidebarHeaderGridItem, TicketSidebarBodyGridItem, TicketSidebarFooterGridItem }) => (
        <>
          {isFilterOpen && <ContractedTicketFilter handleClose={handleFilterOpen(false)} />}
          <TicketSidebarHeaderGridItem
            styles={css`
              padding: 0 8px;
            `}
          >
            <CTLHeaderContainer>
              <CTLBackFilter>
                <LeftArrow icon="arrow-left" size="small" buttonType="secondary" onClick={handleBackClick} />
              </CTLBackFilter>
              <HeaderDropdown>
                <Dropdown
                  placement="bottom-start"
                  size="small"
                  variant="inline"
                  items={ticketStatusItems}
                  itemToString={(item) => item.label}
                  itemToElement={(item) => item.label}
                  selectedItem={getSelectedStatus()}
                  onItemSelected={handleChangeTicketStatus}
                />
              </HeaderDropdown>
              <CTLRefresh>
                <CTLRefreshWrapper>
                  <AutoRefreshDropdown
                    defaultIsAutoRefreshEnabled={refresh.isAutomatic}
                    selectedInterval={refresh.automaticItem}
                    onRefreshTriggered={handleRefresh}
                    onIsAutoRefreshActiveChange={handleIsAutoRefreshActiveChange}
                    onSelectedIntervalChange={handleSelectedIntervalChange}
                  />
                </CTLRefreshWrapper>
              </CTLRefresh>
              <CTLFilter>
                <CTLFilterWrapper
                  icon="filter"
                  type="button"
                  buttonType="secondary"
                  size="small"
                  onClick={handleFilterOpen(true)}
                  disabled={isSearchMode}
                />
              </CTLFilter>
              {isSearchMode ? (
                <TicketSearchWrapper>
                  <TicketSearchInput
                    placeholder={intl.formatMessage({ id: 'desk.tickets.search.placeholder.collapsed' })}
                    showResetButton={searchQuery.length > 0}
                    inputType={TicketSearchInputType.Inline}
                    initialSearchQuery={initialSearchQuery}
                    backButtonProps={{ icon: 'list-back', onClick: handleSearchBackButtonClick }}
                    onClick={handleSearchClick(true)}
                    onSearch={onSearch}
                    onKeyDown={handleSearchKeyDown}
                    onResetButtonClick={handleResetButtonClick}
                  />
                </TicketSearchWrapper>
              ) : (
                <IconButton icon="search" buttonType="secondary" size="small" onClick={handleSearchIconClick} />
              )}
            </CTLHeaderContainer>
          </TicketSidebarHeaderGridItem>
          <TicketSidebarBodyGridItem
            styles={css`
              position: relative;
              display: flex;
              flex-direction: column;
            `}
          >
            {isFetching ? <SpinnerFull transparent={true} /> : ''}
            <Sorter>
              <Dropdown
                placement="bottom-start"
                variant="inline"
                items={sorterItems}
                size="small"
                itemToString={(item) => item.label}
                itemToElement={(item) => item.label}
                selectedItem={getSelectedSorter()}
                onItemSelected={handleChangeSelectedSorter}
              />
              <SortIndicatorWrapper onClick={handleSortIndicator}>
                <SortOrderIndicator order={ticketSorter.order} />
              </SortIndicatorWrapper>
            </Sorter>
            <ScrollBar ref={csbComponent}>{tickets.length > 0 ? ticketItemList : noResult}</ScrollBar>
          </TicketSidebarBodyGridItem>
          <TicketSidebarFooterGridItem
            styles={css`
              display: flex;
              justify-content: flex-end;
              padding: 15px;
            `}
          >
            <Paginator
              current={pagination.page}
              total={ticketCount}
              pageSize={pagination.limit as PerPage}
              pageSizeOptions={[10, 20, 50, 100] as ReadonlyArray<PerPage>}
              onChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              isHiddenPerPage={true}
            />
          </TicketSidebarFooterGridItem>
        </>
      )}
    </DeskChatLayoutContext.Consumer>
  );
};

export const ContractedTicketList = connect(mapStateToProps, mapDispatchToProps)(ContractedTicketListConnectable);
