import React, { useState, useContext } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  transitionDefault,
  Button,
  DateRangePickerValue,
  Typography,
  ScrollBar,
  Icon,
  IconButton,
} from 'feather';

import { TicketStatus } from '@constants';
import { DateRange } from '@interfaces/desk/actions/stats';
import { Dropdown, TicketChannelTypesFilter, LocalizedDateRangePicker } from '@ui/components';

import { AgentOrTeamDropdown } from '../AgentOrTeamDropdown';
import { DeskChatLayoutContext } from '../DeskChatLayout';
import { TicketPriorityFilter } from '../TicketPriorityFilter';
import { TicketTagMultiSelectDropdown } from './TicketTagMultiSelectDropdown';
import { TicketsContext } from './ticketsContext';

type Assignee = { agent?: Agent; team?: AgentGroup };

interface HandleFilterOpen {
  (params: { filterName: 'status' | 'assignee' | 'channelType' | 'date'; isOpen: boolean }): () => void;
}

export interface FilterProps {
  isFilterOpen: boolean;
  handleFilterOpen: HandleFilterOpen;
}

interface CTLStatusFilterProps extends FilterProps {
  currentStatus: TicketStatus;
  selectStatus: React.Dispatch<React.SetStateAction<TicketStatus>>;
}

interface CTLAssigneeFilterProps {
  currentAssignee: Assignee | undefined;
  selectAssignee: React.Dispatch<React.SetStateAction<Assignee | undefined>>;
}

interface CTLChannelTypeFilterProps {
  currentChannelTypes: TicketChannelType[];
  selectChannelType: (values: TicketChannelType[]) => void;
}

interface CTLDateFilterProps extends FilterProps {
  currentDate: { range: DateRange; value: DateRangePickerValue } | undefined;
  selectDate: React.Dispatch<React.SetStateAction<{ range: DateRange; value: DateRangePickerValue } | undefined>>;
}

type Props = {
  handleClose: () => void;
};

const Header = styled.p`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

const FilterTitle = styled.p`
  margin-top: 22px;
  margin-bottom: 6px;
  ${Typography['label-02']};
  color: ${cssVariables('neutral-7')};
`;

const FilteredItem = styled.div<{ isFilterOpen: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${(props) => (props.isFilterOpen ? cssVariables('purple-7') : cssVariables('neutral-10'))};
  transition: color 0.3s ${transitionDefault};
`;

const FilterLabelWrapper = styled.div<{ isSelectedItem: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 32px;
  padding: 4px 20px;

  ${(props) =>
    props.isSelectedItem
      ? css`
          background: ${cssVariables('neutral-1')};
        `
      : ''}
`;

const FilterLabel = styled.span<{ isSelectedItem: boolean }>`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.14;
  color: ${(props) => (props.isSelectedItem ? cssVariables('purple-7') : cssVariables('neutral-10'))};
`;

const UpdateButton = styled(Button)`
  flex: none;
  margin-top: 32px;
  margin-bottom: 16px;
`;

const ctlFilterDropdownTargetStyle = css`
  height: 32px;
  display: flex;
  flex-direction: row;
  padding: 6px 8px 6px 12px;
  align-items: center;
  height: 32px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  outline: none;
  transition: 0.3s ${transitionDefault};

  ${(props: { isOpen: boolean }) =>
    props.isOpen
      ? css`
          background: ${cssVariables('purple-2')};
          border-color: ${cssVariables('purple-7')};
          color: ${cssVariables('purple-7')};
        `
      : ''}

  &:hover {
    border-color: ${cssVariables('purple-7')};

    > div {
      color: ${cssVariables('purple-7')};
    }
  }
`;

const CTLChannelTypeFilterWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

const ticketStatus = [
  {
    label: 'All tickets',
    value: TicketStatus.ALL,
  },
  {
    label: 'Pending',
    value: TicketStatus.PENDING,
  },
  {
    label: 'Active',
    value: TicketStatus.ACTIVE,
  },
  {
    label: 'Idle',
    value: TicketStatus.IDLE,
  },
  {
    label: 'In progress',
    value: TicketStatus.WIP,
  },
  {
    label: 'Closed',
    value: TicketStatus.CLOSED,
  },
] as ReadonlyArray<TicketStatusFilterValues>;

const CTLStatusFilter: React.FC<CTLStatusFilterProps> = React.memo(
  ({ currentStatus, selectStatus, isFilterOpen, handleFilterOpen }) => {
    const intl = useIntl();
    const selectedStatus = ticketStatus.find((item) => item.value === currentStatus);

    return (
      <>
        <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.status' })}</FilterTitle>
        <Dropdown
          placement="bottom-start"
          items={ticketStatus.map((item) => {
            const isSelectedItem = item.value === currentStatus;
            return {
              label: (
                <FilterLabelWrapper key={item.value} isSelectedItem={isSelectedItem}>
                  <FilterLabel isSelectedItem={isSelectedItem}>
                    {intl.formatMessage({ id: `desk.tickets.filter.status.${item.value}` })}
                  </FilterLabel>
                  {isSelectedItem ? <Icon icon="done" size={16} color={cssVariables('purple-6')} /> : ''}
                </FilterLabelWrapper>
              ),
              onClick: () => {
                selectStatus(item.value);
              },
            };
          })}
          target={
            <FilteredItem isFilterOpen={isFilterOpen}>
              {intl.formatMessage({ id: `desk.tickets.filter.status.${selectedStatus?.value}` })}
            </FilteredItem>
          }
          showArrow={true}
          onOpen={handleFilterOpen({ filterName: 'status', isOpen: true })}
          onClose={handleFilterOpen({ filterName: 'status', isOpen: false })}
          styles={{
            DropdownTarget: ctlFilterDropdownTargetStyle,
            DropdownItem: css`
              padding: 0;

              &:hover {
                background: ${cssVariables('neutral-1')};
              }

              > div {
                width: 100%;
              }
            `,
          }}
        />
      </>
    );
  },
);

const CTLAssigneeFilter: React.FC<CTLAssigneeFilterProps> = ({ currentAssignee, selectAssignee }) => {
  const intl = useIntl();

  return (
    <>
      <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.assignee' })}</FilterTitle>
      <AgentOrTeamDropdown
        isBlock={true}
        selectedItem={currentAssignee?.agent || currentAssignee?.team || null}
        onChange={(selectedItem, itemType) => {
          if (selectedItem == null) {
            selectAssignee(undefined);
            return;
          }
          if (itemType === 'agent') {
            selectAssignee({ agent: selectedItem as Agent });
            return;
          }
          selectAssignee({ team: selectedItem as AgentGroup<'listItem'> });
        }}
      />
    </>
  );
};

const CTLChannelTypeFilter: React.FC<CTLChannelTypeFilterProps> = React.memo(
  ({ currentChannelTypes, selectChannelType }) => {
    const intl = useIntl();

    const handleSelect = (values) => {
      selectChannelType(values);
    };

    return (
      <CTLChannelTypeFilterWrapper>
        <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.channelType' })}</FilterTitle>
        <TicketChannelTypesFilter channelTypes={currentChannelTypes} width="100%" onSelect={handleSelect} />
      </CTLChannelTypeFilterWrapper>
    );
  },
);

const CTLDateFilter: React.FC<CTLDateFilterProps> = ({ currentDate, selectDate }) => {
  const intl = useIntl();
  const handleFilterChange = (value: DateRangePickerValue, range: DateRange | undefined) => {
    if (range) {
      selectDate({
        range,
        value,
      });
    }
  };

  return (
    <>
      <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.date' })}</FilterTitle>
      <LocalizedDateRangePicker
        placement="bottom-start"
        value={currentDate?.value || DateRangePickerValue.AllDates}
        dateRange={currentDate?.range}
        onChange={handleFilterChange}
        fullWidth={true}
        maximumNights={92}
        size="small"
        dayPickerProps={{
          positionFixed: true,
          modifiers: {
            preventOverflow: {
              enabled: false,
            },
            hide: {
              enabled: false,
            },
          },
        }}
      />
    </>
  );
};

export const ContractedTicketFilter: React.FC<Props> = ({ handleClose }) => {
  const { TicketSidebarHeaderGridItem, TicketSidebarFooterlessBodyGridItem } = useContext(DeskChatLayoutContext);
  const {
    assignee,
    channelTypes,
    dateRange,
    ticketStatus,
    tags,
    priority,
    setTags,
    setPriority,
    setChannelTypes,
    setAssignee,
    setTicketStatus,
    setDateRange,
  } = useContext(TicketsContext);

  const [isStatusFilterOpen, openStatusFilter] = useState(false);
  const [isDateFilterOpen, openDateFilter] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticketStatus);
  const [currentAssignee, setCurrentAssignee] = useState(assignee);
  const [currentChannelTypes, setCurrentChannelTypes] = useState(channelTypes);
  const [currentTags, setCurrentTags] = useState(tags);
  const [currentPriority, setCurrentPriority] = useState(priority);
  const [currentDate, setCurrentDate] = useState(dateRange);

  const intl = useIntl();

  const handleFilterOpen: HandleFilterOpen = ({ filterName, isOpen }) => () => {
    switch (filterName) {
      case 'status':
        openStatusFilter(isOpen);
        break;
      case 'date':
        openDateFilter(isOpen);
        break;
      default:
        break;
    }
  };

  const handleUpdateButtonClick = () => {
    setTicketStatus(currentStatus);
    setChannelTypes(currentChannelTypes);
    setAssignee(currentAssignee);
    setDateRange(currentDate);
    setTags(currentTags);
    setPriority(currentPriority);
    handleClose();
  };

  return (
    <>
      <TicketSidebarHeaderGridItem
        styles={css`
          z-index: 1000;
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        `}
      >
        <Header>{intl.formatMessage({ id: 'desk.tickets.contractedTicketList.filter.title' })}</Header>
        <IconButton
          icon="close"
          buttonType="secondary"
          size="small"
          onClick={handleClose}
          css="transform: translateX(8px);"
        />
      </TicketSidebarHeaderGridItem>
      <TicketSidebarFooterlessBodyGridItem styles="z-index: 1000;">
        <ScrollBar
          css={`
            display: flex;
            position: relative;
            flex-direction: column;
            padding: 4px 16px;
          `}
        >
          <CTLStatusFilter
            currentStatus={currentStatus}
            selectStatus={setCurrentStatus}
            isFilterOpen={isStatusFilterOpen}
            handleFilterOpen={handleFilterOpen}
          />
          <CTLChannelTypeFilter currentChannelTypes={currentChannelTypes} selectChannelType={setCurrentChannelTypes} />
          <CTLAssigneeFilter currentAssignee={currentAssignee} selectAssignee={setCurrentAssignee} />

          <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.priority' })}</FilterTitle>
          <TicketPriorityFilter selectedItem={currentPriority} onChange={setCurrentPriority} width="100%" />

          <FilterTitle>{intl.formatMessage({ id: 'desk.tickets.filter.tag' })}</FilterTitle>
          <TicketTagMultiSelectDropdown selectedItems={currentTags} onChange={setCurrentTags} />

          <CTLDateFilter
            currentDate={currentDate}
            selectDate={setCurrentDate}
            isFilterOpen={isDateFilterOpen}
            handleFilterOpen={handleFilterOpen}
          />
          <UpdateButton buttonType="primary" size="small" onClick={handleUpdateButtonClick}>
            {intl.formatMessage({ id: 'desk.tickets.contractedTicketList.filter.btn.apply' })}
          </UpdateButton>
        </ScrollBar>
      </TicketSidebarFooterlessBodyGridItem>
    </>
  );
};
