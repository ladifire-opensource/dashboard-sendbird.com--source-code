import React, { useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { Button, toast, InlineNotification, IconButton, DateRangePickerValue, DateRange, Tooltip } from 'feather';
import moment from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { ISO_DATE_FORMAT, LIST_LIMIT, AgentActivationStatusValue } from '@constants';
import { useShowDialog } from '@hooks';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { TicketChannelTypesFilter, LocalizedDateRangePicker } from '@ui/components';
import { ALERT_ANALYTICS_DATE_RANGE_92 } from '@utils/text';

import { BotsSearchDropdown } from '../BotsSearchDropdown';
import { AgentGroupsSearchDropdown } from '../agentGroupsSearchDropdown';
import { AgentsSearchDropdown } from '../agentsSearchDropdown';
import { SearchParams as AgentSearchParams } from './StatsAgents';
import { SearchParams as BotSearchParams } from './StatsBots';
import { SearchParams as OverViewSearchParams } from './StatsOverview';
import { SearchParams as TeamSearchParams } from './StatsTeams';
import { Report } from './reportsDataExportDialog';

export type ViewType = 'table' | 'chart';

type Props = {
  channelTypes: TicketChannelType[];
  startDate: string | null;
  endDate: string | null;
  updateParams: QueryParamsWithUpdate<
    OverViewSearchParams | AgentSearchParams | TeamSearchParams | BotSearchParams
  >['updateParams'];
  exportReports?: Report[];
  showAgents?: boolean;
  showTeams?: boolean;
  showBots?: boolean;
  selectedAgentId?: Agent['id'] | null;
  selectedGroupId?: AgentGroup['id'] | null;
  selectedBotId?: DeskBot['id'] | null;
  viewType?: ViewType;
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-top: 24px;
  margin-bottom: 32px;
`;

const NotificationWrapper = styled.div`
  margin-bottom: 24px;
`;

const Filters = styled.div`
  display: flex;
  align-items: flex-start;

  & > div {
    margin-right: 4px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ViewButtons = styled.div`
  margin-right: 16px;

  & > button {
    margin-right: 4px;
  }
`;

export const StatsFilter: React.FC<Props> = ({
  startDate: startDateString,
  endDate: endDateString,
  selectedAgentId,
  selectedGroupId,
  selectedBotId,
  showAgents = false,
  showTeams = false,
  showBots = false,
  viewType,
  channelTypes,
  updateParams,
  exportReports,
}) => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const [isShownExportNotification, setIsShownExportNotification] = useState(false);
  const startDate = useMemo(() => (startDateString ? moment(startDateString, ISO_DATE_FORMAT) : undefined), [
    startDateString,
  ]);
  const endDate = useMemo(() => (endDateString ? moment(endDateString, ISO_DATE_FORMAT) : undefined), [endDateString]);

  const handleAgentClick = useCallback(
    (agent: Agent) => {
      updateParams({ agent: agent.id < 0 ? undefined : agent.id, page: 1 });
    },
    [updateParams],
  );

  const handleTeamClick = useCallback(
    (team: AgentGroup) => {
      updateParams({ team: team.id < 0 ? undefined : team.id, page: 1 });
    },
    [updateParams],
  );

  const handleBotClick = useCallback(
    (bot: DeskBot) => {
      updateParams({ bot: bot.id < 0 ? undefined : bot.id, page: 1 });
    },
    [updateParams],
  );

  const handleDateChangeWrapper = useCallback(
    (value: DateRangePickerValue, dateRange: DateRange | undefined) => {
      if (dateRange) {
        updateParams({
          startDate: dateRange.startDate.format(ISO_DATE_FORMAT),
          endDate: dateRange.endDate.format(ISO_DATE_FORMAT),
        });

        if (Math.abs(dateRange.startDate.diff(dateRange.endDate, 'days')) > 92) {
          toast.warning({
            message: ALERT_ANALYTICS_DATE_RANGE_92,
          });
        }
      }
    },
    [updateParams],
  );

  const handleExportButtonClick = useCallback(() => {
    if (exportReports) {
      showDialog({
        dialogTypes: DialogType.ReportsExport,
        dialogProps: {
          channelTypes,
          reports: exportReports,
          onSuccess: () => {
            setIsShownExportNotification(true);
          },
        },
      });
    }
  }, [channelTypes, exportReports, showDialog]);

  const handleChannelTypeSelected = useCallback(
    (values: TicketChannelType[]) => {
      updateParams({
        channelTypes: values,
      });
    },
    [updateParams],
  );

  const handleCloseNotification = useCallback(() => {
    setIsShownExportNotification(false);
  }, []);

  const handleClickTableView = useCallback(() => {
    updateParams(
      {
        view: 'table',
        page: 1,
        pageSize: LIST_LIMIT,
      },
      true,
    );
  }, [updateParams]);

  const handleClickChartView = useCallback(() => {
    updateParams(
      {
        view: 'chart',
        page: undefined,
        pageSize: undefined,
      },
      true,
    );
  }, [updateParams]);

  const dateRangeValue = useMemo(() => {
    const now = moment();
    if (!(startDate && endDate)) {
      return DateRangePickerValue.AllDates;
    }

    if (now.diff(endDate, 'days') === 0) {
      switch (endDate.diff(startDate, 'days')) {
        case 0:
          return DateRangePickerValue.Today;
        case 6:
          return DateRangePickerValue.Last7Days;
        case 13:
          return DateRangePickerValue.Last14Days;
        case 29:
          return DateRangePickerValue.Last30Days;
        case 89:
          return DateRangePickerValue.Last90Days;
        default:
          return DateRangePickerValue.Custom;
      }
    }
    if (now.diff(endDate, 'days') === 1 && endDate.diff(startDate, 'days') === 0) {
      return DateRangePickerValue.Yesterday;
    }
    return DateRangePickerValue.Custom;
  }, [endDate, startDate]);

  const renderExportButton = useMemo(() => {
    const getDisabledTooltipId = () => {
      // FIXME: Should be updated to `displayStatus` = 'agents' | 'teams' | 'bots'
      if (showAgents) return 'desk.statistics.header.export.button.disabled.agents';
      if (showTeams) return 'desk.statistics.header.export.button.disabled.teams';
      if (showBots) return 'desk.statistics.header.export.button.disabled.bots';
      return undefined;
    };

    const disabled = !exportReports;
    const button = (
      <Button size="small" buttonType="secondary" icon="export" onClick={handleExportButtonClick} disabled={disabled}>
        {intl.formatMessage({ id: 'desk.statistics.header.export.button' })}
      </Button>
    );

    const disabledTooltipContent = getDisabledTooltipId();

    if (!!disabledTooltipContent && disabled) {
      const content = intl.formatMessage({
        id: disabledTooltipContent,
      });
      return (
        <Tooltip content={content} placement="bottom">
          {button}
        </Tooltip>
      );
    }
    return button;
  }, [exportReports, handleExportButtonClick, intl, showAgents, showBots, showTeams]);

  return (
    <>
      <Container>
        <Filters data-test-id="FilterContainer">
          <LocalizedDateRangePicker
            dateRange={startDate && endDate ? { startDate, endDate } : undefined}
            value={dateRangeValue}
            onChange={handleDateChangeWrapper}
            maxDate={moment()}
            maximumNights={92}
            size="small"
            dropdownProps={{ tooltipProps: { placement: 'top-start' } }}
          />
          {showAgents && (
            <AgentsSearchDropdown
              selectedAgentId={selectedAgentId ?? undefined}
              dropdownProps={{
                variant: 'default',
                placement: 'bottom-start',
              }}
              agentActivationStatus={[
                AgentActivationStatusValue.ACTIVE,
                AgentActivationStatusValue.INACTIVE,
                AgentActivationStatusValue.DELETED,
                AgentActivationStatusValue.PERMISSION_DENIED,
              ]}
              onItemSelected={handleAgentClick}
              isAllAgentOptionAvailable={true}
            />
          )}
          {showTeams && (
            <AgentGroupsSearchDropdown
              selectedAgentGroupId={selectedGroupId ?? undefined}
              onItemSelected={handleTeamClick}
              dropdownProps={{
                variant: 'default',
                placement: 'bottom-start',
              }}
              isAllTeamOptionAvailable={true}
            />
          )}
          {showBots && (
            <BotsSearchDropdown
              selectedBotId={selectedBotId ?? undefined}
              onItemSelected={handleBotClick}
              dropdownProps={{
                variant: 'default',
                placement: 'bottom-start',
              }}
              botStatuses={[
                AgentActivationStatusValue.ACTIVE,
                AgentActivationStatusValue.INACTIVE,
                AgentActivationStatusValue.DELETED,
              ]}
              isAllBotOptionAvailable={true}
            />
          )}
          <TicketChannelTypesFilter
            channelTypes={channelTypes}
            onSelect={handleChannelTypeSelected}
            css={`
              max-width: 208px;
            `}
          />
        </Filters>
        <ButtonContainer>
          {viewType && (
            <ViewButtons>
              <IconButton
                icon="table-view"
                buttonType={viewType === 'table' ? 'primary' : 'secondary'}
                size="small"
                aria-pressed={viewType === 'table'}
                title={intl.formatMessage({ id: 'desk.statistics.filter.btn.tableView.tooltip' })}
                onClick={handleClickTableView}
              />
              <IconButton
                icon="chart-view"
                buttonType={viewType === 'chart' ? 'primary' : 'secondary'}
                size="small"
                aria-pressed={viewType === 'chart'}
                title={intl.formatMessage({ id: 'desk.statistics.filter.btn.chartView.tooltip' })}
                onClick={handleClickChartView}
              />
            </ViewButtons>
          )}
          {renderExportButton}
        </ButtonContainer>
      </Container>
      {isShownExportNotification && (
        <NotificationWrapper>
          <InlineNotification
            type="info"
            message={intl.formatMessage(
              { id: 'desk.dataExport.notification.dataExport.start' },
              {
                link: <Link to="../data_exports">{intl.formatMessage({ id: 'desk.dataExport.title' })}</Link>,
              },
            )}
            onClose={handleCloseNotification}
          />
        </NotificationWrapper>
      )}
    </>
  );
};
