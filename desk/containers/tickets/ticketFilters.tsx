import React, { useCallback, useContext, useMemo, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, DateRange, DateRangePickerValue, Dropdown } from 'feather';
import moment from 'moment-timezone';

import { TicketStatus } from '@constants';
import { TicketChannelTypesFilter, LocalizedDateRangePicker } from '@ui/components';

import { AgentOrTeamDropdown } from '../AgentOrTeamDropdown';
import { TicketPriorityFilter } from '../TicketPriorityFilter';
import { TicketTagMultiSelectDropdown } from './TicketTagMultiSelectDropdown';
import { TicketsContext } from './ticketsContext';

const FilterWrapper = styled.div`
  margin-right: 4px;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: ${cssVariables('neutral-3')};
  margin: 0 8px;
`;

const TicketFiltersContainer = styled.div`
  display: flex;
  align-items: flex-start;
  position: relative;
  min-height: 64px;
  padding-top: 8px;
  background: white;
`;

const TicketStatusFilter: React.FC = () => {
  const intl = useIntl();
  const ticketStatusList = [
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
  ];

  const { ticketStatus, setTicketStatus, isFetching } = useContext(TicketsContext);

  const selectedStatus = useMemo(
    () => ticketStatusList.find((item) => item.value === ticketStatus) || ticketStatusList[0],
    [ticketStatusList, ticketStatus],
  );

  const handleChange = useCallback(
    (dropdownItem: { label: string; value: TicketStatus } | null) => {
      if (dropdownItem) {
        setTicketStatus(dropdownItem.value);
      }
    },
    [setTicketStatus],
  );

  return (
    <Dropdown
      placement="bottom-start"
      items={ticketStatusList}
      selectedItem={selectedStatus}
      size="small"
      itemToString={(item) => item.label}
      onItemSelected={handleChange}
      disabled={isFetching}
    />
  );
};

const TicketAssigneeFilter = React.memo(() => {
  const { assignee, setAssignee, isFetching } = useContext(TicketsContext);

  return (
    <FilterWrapper data-test-id="TicketAssigneeFilter">
      <AgentOrTeamDropdown
        disabled={isFetching}
        selectedItem={assignee?.agent || assignee?.team || null}
        onChange={(selectedItem, itemType) => {
          if (selectedItem == null) {
            setAssignee(undefined);
            return;
          }
          if (itemType === 'agent') {
            setAssignee({ agent: selectedItem as Agent });
            return;
          }
          setAssignee({ team: selectedItem as AgentGroup<'listItem'> });
        }}
      />
    </FilterWrapper>
  );
});

export const TicketsDateFilter: React.FC = () => {
  const { dateRange, setDateRange, isFetching } = useContext(TicketsContext);

  const handleChangeDateRange = useCallback(
    (value: DateRangePickerValue, dateRange: DateRange | undefined) => {
      const isSelectedAllDate = value === DateRangePickerValue.AllDates;

      if (dateRange && !isSelectedAllDate) {
        setDateRange({ range: dateRange, value });
      } else {
        setDateRange(undefined);
      }
    },
    [setDateRange],
  );

  return (
    <FilterWrapper data-test-id="TicketDateFilter">
      <LocalizedDateRangePicker
        value={dateRange?.value || DateRangePickerValue.AllDates}
        dateRange={dateRange?.range}
        onChange={handleChangeDateRange}
        maxDate={moment()}
        disabled={isFetching}
        size="small"
      />
    </FilterWrapper>
  );
};

const TicketsChannelFilter: React.FC = () => {
  const { channelTypes, setChannelTypes, isFetching } = useContext(TicketsContext);

  const handleSelect = useCallback(
    (values: TicketChannelType[]) => {
      setChannelTypes(values);
    },
    [setChannelTypes],
  );

  return (
    <FilterWrapper data-test-id="ChannelFilter">
      <TicketChannelTypesFilter
        channelTypes={channelTypes}
        onSelect={handleSelect}
        disabled={isFetching}
        css={`
          max-width: 208px;
        `}
      />
    </FilterWrapper>
  );
};

const TicketsTagFilter: FC = () => {
  const { tags, setTags, isFetching } = useContext(TicketsContext);
  return (
    <FilterWrapper data-test-id="TicketTagFilter">
      <TicketTagMultiSelectDropdown selectedItems={tags} onChange={setTags} disabled={isFetching} maxWidth={208} />
    </FilterWrapper>
  );
};

const TicketPriorityFilterWithContext: FC = () => {
  const { priority, setPriority, isFetching } = useContext(TicketsContext);
  return (
    <FilterWrapper>
      <TicketPriorityFilter selectedItem={priority} onChange={setPriority} disabled={isFetching} />
    </FilterWrapper>
  );
};

export const TicketFilters: FC = () => {
  return useMemo(
    () => (
      <TicketFiltersContainer>
        <TicketStatusFilter />
        <Divider />
        <TicketAssigneeFilter />
        <TicketPriorityFilterWithContext />
        <TicketsChannelFilter />
        <TicketsDateFilter />
        <TicketsTagFilter />
      </TicketFiltersContainer>
    ),
    [],
  );
};
