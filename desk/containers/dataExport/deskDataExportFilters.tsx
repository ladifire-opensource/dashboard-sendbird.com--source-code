import React, { useContext, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  Dropdown,
  DateRangePickerValue,
  DateRange,
  TreeSelect,
  TreeData,
  cssVariables,
  Subtitles,
  Icon,
} from 'feather';
import moment from 'moment-timezone';

import {
  ISO_DATE_FORMAT,
  DeskDataExportRequestType,
  DeskDataExportStatus,
  DeskTicketExportRequestType,
  DeskViewsExportRequestType,
  DeskSummaryExportRequestType,
  DeskAgentExportRequestType,
  DeskBotExportRequestType,
  DeskTeamExportRequestType,
} from '@constants';
import { LocalizedDateRangePicker } from '@ui/components';
import { convertDateRangePickerValueToDateRange } from '@utils/convertDateRangePickerValueToDateRange';

import {
  AGENT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  ALL_EXPORT_TYPE_DROPDOWN_ITEMS,
  BOT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  STATUS_LIST,
  SUMMARY_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  TEAM_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  TICKET_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  VIEWS_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
} from './constants';
import { DeskDataExportContext } from './deskDataExportContext';

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const FilterWrapper = styled.div`
  margin-right: 4px;
`;

const PrefixItem = styled.div<{ isChecked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 14px 16px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  color: ${({ isChecked }) => (isChecked ? cssVariables('purple-7') : cssVariables('neutral-10'))};
  cursor: pointer;
  ${Subtitles['subtitle-01']}
  white-space: nowrap;
`;

const AllTypesText = styled.span`
  display: flex;
  align-items: center;
  padding-left: 8px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const DataTypeFilter: React.FC = () => {
  const flatDataTypes = (selectedItems: TreeData[]) => {
    return selectedItems.reduce((acc, cur) => {
      switch (cur.value) {
        case DeskTicketExportRequestType.TICKETS:
          return acc.concat(TICKET_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        case DeskViewsExportRequestType.VIEWS:
          return acc.concat(VIEWS_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        case DeskSummaryExportRequestType.REPORT_SUMMARY:
          return acc.concat(SUMMARY_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        case DeskAgentExportRequestType.REPORT_AGENT:
          return acc.concat(AGENT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        case DeskBotExportRequestType.REPORT_BOT:
          return acc.concat(BOT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        case DeskTeamExportRequestType.REPORT_TEAM:
          return acc.concat(TEAM_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS.map((item) => item.value));
        default:
          return acc.concat(cur.value);
      }
    }, [] as string[]) as DeskDataExportRequestType[];
  };

  const intl = useIntl();
  const { searchParams, state } = useContext(DeskDataExportContext);
  const { updateParams, dataType } = searchParams;
  const { isFetching } = state;
  const [selectedDataTypes, setSelectedDataTypes] = useState<DeskDataExportRequestType[]>(dataType ?? []);
  const [isAllTypesSelected, setIsAllTypesSelected] = useState(true);
  const allDropdownItemList = ALL_EXPORT_TYPE_DROPDOWN_ITEMS.reduce((acc, cur) => {
    acc.push({
      ...cur,
      label: intl.formatMessage({ id: cur.label }),
      tooltipContent: cur.tooltipContent && intl.formatMessage({ id: cur.tooltipContent }),
      children: cur.children?.map((child) => ({
        ...child,
        label: intl.formatMessage({ id: child.label }),
        tooltipContent: child.tooltipContent && intl.formatMessage({ id: child.tooltipContent }),
      })),
    });
    return acc;
  }, [] as TreeData[]);

  const selectedDropdownItems = useMemo(
    () =>
      allDropdownItemList.reduce((acc, cur) => {
        const hasChildren = Object.prototype.hasOwnProperty.call(cur, 'children');
        if (hasChildren) {
          const isAllChildrenSelected = cur.children?.every((child) =>
            selectedDataTypes.includes(child.value as DeskDataExportRequestType),
          );
          if (isAllChildrenSelected) {
            acc.push(cur);
          } else {
            const selectedChildren = cur.children?.filter((child) =>
              selectedDataTypes.includes(child.value as DeskDataExportRequestType),
            );
            return acc.concat(selectedChildren ?? []);
          }
        } else {
          acc.push(cur);
        }
        return acc;
      }, [] as TreeData[]),
    [allDropdownItemList, selectedDataTypes],
  );

  const prefixItem = useMemo(
    () => ({
      value: 'all',
      label: intl.formatMessage({ id: 'desk.dataExport.filters.dataType.all' }),
    }),
    [intl],
  );

  const handlePrefixItemClick = useCallback(() => {
    if (!isAllTypesSelected) {
      setSelectedDataTypes([]);
      setIsAllTypesSelected(true);
      updateParams({
        dataType: [],
      });
    }
  }, [isAllTypesSelected, updateParams]);

  const handleSelect = (selectedItems: TreeData[], isAllNodesSelected: boolean) => {
    const selectedDataTypes = flatDataTypes(selectedItems);
    setSelectedDataTypes(selectedDataTypes);
    if (selectedDataTypes.length === 0 || isAllNodesSelected) {
      setSelectedDataTypes([]);
      updateParams({
        dataType: undefined,
      });
    } else {
      setSelectedDataTypes(selectedDataTypes);
      updateParams({
        dataType: selectedDataTypes,
      });
    }
    setIsAllTypesSelected(isAllNodesSelected);
  };

  const renderToggleContent = () => (
    <AllTypesText>{intl.formatMessage({ id: 'desk.dataExport.filters.dataType.all' })}</AllTypesText>
  );

  return (
    <FilterWrapper data-test-id="DataTypeFilter">
      <TreeSelect
        treeData={allDropdownItemList}
        onSelect={handleSelect}
        selectedNodes={selectedDataTypes.length > 0 ? selectedDropdownItems : allDropdownItemList}
        toggleRenderer={selectedDataTypes.length === 0 ? renderToggleContent : undefined}
        disabled={isFetching}
        width={selectedDataTypes.length > 0 ? 260 : 150}
        prefixItem={
          <PrefixItem isChecked={isAllTypesSelected} onClick={handlePrefixItemClick}>
            {prefixItem.label}
            {isAllTypesSelected && <Icon icon="done" size={20} color={cssVariables('purple-7')} />}
          </PrefixItem>
        }
      />
    </FilterWrapper>
  );
};

const DateFilter: React.FC = () => {
  const { searchParams, state } = useContext(DeskDataExportContext);
  const { dateRangeValue, startDate, endDate, updateParams } = searchParams;
  const { isFetching } = state;

  const dateRange = useMemo(() => {
    switch (dateRangeValue) {
      case DateRangePickerValue.Custom: {
        if (startDate && endDate) {
          return {
            startDate: moment(startDate, ISO_DATE_FORMAT),
            endDate: moment(endDate, ISO_DATE_FORMAT),
          };
        }
        return undefined;
      }
      case DateRangePickerValue.AllDates:
      case null:
        return undefined;
      default: {
        const range = dateRangeValue && convertDateRangePickerValueToDateRange(dateRangeValue);
        return range;
      }
    }
  }, [dateRangeValue, endDate, startDate]);

  const handleChangeDateRange = useCallback(
    (value: DateRangePickerValue, dateRange: DateRange | undefined) => {
      const isSelectedAllDate = value === DateRangePickerValue.AllDates;
      const isSelectedCustomDate = value === DateRangePickerValue.Custom;

      if (dateRange && isSelectedCustomDate) {
        updateParams({
          dateRangeValue: value,
          startDate: dateRange?.startDate.format(ISO_DATE_FORMAT),
          endDate: dateRange?.endDate.format(ISO_DATE_FORMAT),
          page: 1,
        });
        return;
      }

      updateParams({
        dateRangeValue: isSelectedAllDate ? undefined : value,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      });
    },

    [updateParams],
  );

  return (
    <FilterWrapper data-test-id="DateRangeFilter">
      <LocalizedDateRangePicker
        value={dateRangeValue || DateRangePickerValue.AllDates}
        dateRange={dateRange}
        onChange={handleChangeDateRange}
        maxDate={moment()}
        disabled={isFetching}
        size="small"
      />
    </FilterWrapper>
  );
};

const StatusFilter: React.FC = () => {
  const intl = useIntl();
  const { searchParams, state } = useContext(DeskDataExportContext);
  const { updateParams, status } = searchParams;
  const { isFetching } = state;
  const statusList = STATUS_LIST.map((item) => ({ ...item, label: intl.messages[item.label] }));
  const selectedStatus = useMemo(() => statusList.find((item) => item.value === status) || statusList[0], [
    status,
    statusList,
  ]);

  const handleItemSelected = useCallback(
    (dropdownItem: DropdownItem<DeskDataExportStatus> | null) => {
      if (dropdownItem) {
        updateParams({
          status: dropdownItem.value ?? undefined,
        });
      }
    },
    [updateParams],
  );

  return (
    <FilterWrapper data-test-id="StatusFilter">
      <Dropdown
        placement="bottom-start"
        items={statusList}
        selectedItem={selectedStatus}
        size="small"
        itemToString={(item) => item.label as string}
        onItemSelected={handleItemSelected}
        disabled={isFetching}
      />
    </FilterWrapper>
  );
};

export const DeskDataExportFilters = () => {
  return (
    <FilterContainer data-test-id="DeskDataExportFilter">
      <DataTypeFilter />
      <DateFilter />
      <StatusFilter />
    </FilterContainer>
  );
};
