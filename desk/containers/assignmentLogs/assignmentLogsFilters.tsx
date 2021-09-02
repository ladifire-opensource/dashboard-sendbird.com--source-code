import { memo, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { DateRangePickerValue, DateRange, Dropdown, Tooltip, TooltipTargetIcon } from 'feather';
import moment from 'moment-timezone';

import { TicketStatus, ISO_DATE_FORMAT } from '@constants';
import { useAuthorization } from '@hooks';
import { TicketChannelTypesFilter, LocalizedDateRangePicker } from '@ui/components';

import { AssignmentLogsQueryString } from '.';
import { AgentsSearchDropdown } from '../agentsSearchDropdown';

type FilterProps = {
  isFetching: boolean;
  queryString: AssignmentLogsQueryString;
};

const FilterContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

const FilterWrapper = styled.div.attrs({ 'data-test-id': 'FilterWrapper' })`
  margin-right: 4px;
`;

const TooltipWrapper = styled(Tooltip)`
  margin-top: 4px;
`;

TooltipWrapper.displayName = 'Tooltip';

const dateRangePickerValueMap = {
  7: DateRangePickerValue.Last7Days,
  14: DateRangePickerValue.Last14Days,
  30: DateRangePickerValue.Last30Days,
  90: DateRangePickerValue.Last90Days,
};

const getDateRangePickerValue = (startDate: string | undefined, endDate: string | undefined) => {
  if (!startDate || !endDate) {
    return DateRangePickerValue.AllDates;
  }

  const startDateMoment = moment(startDate);
  const endDateMoment = moment(endDate);

  const startDateFormatted = startDateMoment.format(ISO_DATE_FORMAT);
  const endDateFormatted = endDateMoment.format(ISO_DATE_FORMAT);
  const todayMoment = moment();
  const todayFormatted = todayMoment.format(ISO_DATE_FORMAT);

  if (startDateFormatted === endDateFormatted && startDateFormatted === todayFormatted) {
    return DateRangePickerValue.Today;
  }

  if (startDateFormatted === endDateFormatted && todayMoment.diff(startDateFormatted, 'days') === 1) {
    return DateRangePickerValue.Yesterday;
  }

  const pickerValue = dateRangePickerValueMap[endDateMoment.diff(startDateMoment, 'days') + 1];
  if (startDateMoment && endDateMoment && !pickerValue) {
    return DateRangePickerValue.Custom;
  }
  return pickerValue;
};

const StatusFilter = memo<FilterProps>(({ isFetching, queryString }) => {
  const intl = useIntl();

  const ticketStatusList = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'desk.assignmentLogs.list.filter.ticketStatus.dropdown.item.allTickets' }),
        value: TicketStatus.ALL,
      },
      {
        label: intl.formatMessage({ id: 'ui.ticketStatus.pending' }),
        value: TicketStatus.PENDING,
      },
      {
        label: intl.formatMessage({ id: 'ui.ticketStatus.active' }),
        value: TicketStatus.ACTIVE,
      },
      {
        label: intl.formatMessage({ id: 'ui.ticketStatus.idle' }),
        value: TicketStatus.IDLE,
      },
      {
        label: intl.formatMessage({ id: 'ui.ticketStatus.wip' }),
        value: TicketStatus.WIP,
      },
      {
        label: intl.formatMessage({ id: 'ui.ticketStatus.closed' }),
        value: TicketStatus.CLOSED,
      },
    ],
    [intl],
  );

  const { ticketStatus, updateParams } = queryString;

  const selectedStatus = useMemo(
    () => ticketStatusList.find((item) => item.value === ticketStatus) || ticketStatusList[0],
    [ticketStatusList, ticketStatus],
  );

  const handleItemSelected = useCallback(
    (dropdownItem: { label: string; value: TicketStatus } | null) => {
      if (dropdownItem) {
        updateParams({ ticketStatus: dropdownItem.value, page: 1 });
      }
    },
    [updateParams],
  );

  return (
    <FilterWrapper>
      <Dropdown
        placement="bottom-start"
        items={ticketStatusList}
        selectedItem={selectedStatus}
        size="small"
        itemToString={(item) => item.label}
        onItemSelected={handleItemSelected}
        disabled={isFetching}
      />
    </FilterWrapper>
  );
});

const ChannelFilter = memo<FilterProps>(({ isFetching, queryString }) => {
  const { channelTypes, updateParams } = queryString;

  const handleChannelTypeSelected = useCallback(
    (values) => {
      updateParams({
        channelTypes: values,
      });
    },
    [updateParams],
  );

  return (
    <FilterWrapper>
      <TicketChannelTypesFilter
        channelTypes={channelTypes}
        disabled={isFetching}
        onSelect={handleChannelTypeSelected}
        css={`
          max-width: 208px;
        `}
      />
    </FilterWrapper>
  );
});

const AgentFilter = memo<FilterProps>(({ isFetching, queryString }) => {
  const { agentId, updateParams } = queryString;

  const handleChangeAgent = useCallback(
    (agent: Agent) => {
      updateParams({ page: 1, agentId: agent.id });
    },
    [updateParams],
  );

  return (
    <FilterWrapper>
      <AgentsSearchDropdown
        selectedAgentId={agentId}
        isAllAgentOptionAvailable={true}
        dropdownProps={{
          size: 'small',
          variant: 'default',
          disabled: isFetching,
        }}
        onItemSelected={handleChangeAgent}
      />
    </FilterWrapper>
  );
});

const DateFilter = memo<FilterProps>(({ isFetching, queryString }) => {
  const { startDate, endDate, updateParams } = queryString;

  const handleDateRangeChange = useCallback(
    (_: DateRangePickerValue, dateRange: DateRange | undefined) => {
      updateParams({
        page: 1,
        startDate: dateRange?.startDate.format(ISO_DATE_FORMAT),
        endDate: dateRange?.endDate.format(ISO_DATE_FORMAT),
      });
    },
    [updateParams],
  );

  return (
    <FilterWrapper>
      <LocalizedDateRangePicker
        value={getDateRangePickerValue(startDate, endDate)}
        dateRange={startDate && endDate ? { startDate: moment(startDate), endDate: moment(endDate) } : undefined}
        onChange={handleDateRangeChange}
        maxDate={moment()}
        disabled={isFetching}
        size="small"
      />
    </FilterWrapper>
  );
});

export const AssignmentLogsFilters = memo<FilterProps>((props) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const isAdmin = isPermitted(['desk.admin']);

  return (
    <FilterContainer data-test-id="FilterContainer">
      <StatusFilter {...props} />
      <ChannelFilter {...props} />
      {isAdmin && <AgentFilter {...props} />}
      <DateFilter {...props} />
      <TooltipWrapper content={intl.messages['desk.assignmentLogs.list.info.tooltip']} placement="right">
        <TooltipTargetIcon icon="info" size={16} data-test-id="InfoIcon" />
      </TooltipWrapper>
    </FilterContainer>
  );
});
