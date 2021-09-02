import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { useIntl } from 'react-intl';
import { IntlShape } from 'react-intl';
import { PopperProps } from 'react-popper';

import styled from 'styled-components';

import {
  cssVariables,
  toast,
  TooltipTargetIcon,
  Grid,
  GridItem,
  LeftNavigationBar,
  transitions,
  IconButton,
  Tooltip,
  TooltipRef,
  transitionDefault,
} from 'feather';
import isEqual from 'lodash/isEqual';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';

import { deskApi } from '@api';
import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { EMPTY_TEXT } from '@constants';
import { LNBContext } from '@core/containers/app/lnbContext';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useInterval, usePrevious } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { getDoughnutChartColors } from '@ui/colors';
import { EasingNumber, PageContainer, PageHeader, ContentContainer } from '@ui/components';
import { DoughnutChart, HorizontalBar } from '@ui/components/chart';
import { renderTimestring, getClosedStatusesIndex } from '@utils';

const {
  background: doughnutChartBackground,
  hover: doughnutChartHover,
  size: doughnutChartSize,
} = getDoughnutChartColors({ dataSize: 6 });

type MonitoringBoxProps = {
  className?: string;
  title: string;
  titleTooltipText?: string;
  contentHeight?: number;
  contentAlignItems?: string;
  contentJustifyContent?: string;
  contentDirection?: 'column' | 'column-reverse' | 'inherit' | 'initial' | 'row' | 'row-reverse' | 'unset';
  value?: number;
  updatableChildrenValues?: (number | null)[];
  titleTooltipPlacement?: PopperProps['placement'];
  children?: React.ReactNode | React.ReactNode[];
};

type MetricLabeledValueProps = {
  value: string | number;
  label: string;
  theme?: 'online' | 'away' | 'offline';
  valueFontSize?: 56 | 36 | 24;
  valueFontColor?: string;
};

type MetricPercentileProps = {
  rowKey: string;
  percentiles: { [key: string]: number };
  intl: IntlShape;
};

const MonitoringContainer = styled(PageContainer)`
  padding-top: 88px;
  padding-bottom: 48px;
`;

const FixedSection = styled.section<{ gnbHeight: number; isCollapsed: boolean }>`
  position: fixed;
  top: ${({ gnbHeight }) => gnbHeight || 0}px;
  left: ${({ isCollapsed }) => (isCollapsed ? LeftNavigationBar.collapsedWidth : LeftNavigationBar.defaultWidth)}px;
  right: 0;
  z-index: 80;
  padding-top: 24px;
  padding-bottom: 24px;
  background: white;
  transition: ${transitions({ duration: 0.2, properties: ['top', 'left'] })};
`;

const Section = styled.section`
  & + & {
    margin-top: 32px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-7')};
`;

const MonitorTime = styled.div`
  display: inline-block;
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
`;

const MonitorRefreshButton = styled(IconButton)`
  margin-left: 8px;
`;

const MonitoringBoxContainer = styled.div<{ isUpdated: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  height: 100%;
  border-radius: 4px;
  border: solid 1px ${cssVariables('neutral-3')};
  background: ${(props) => (props.isUpdated ? cssVariables('purple-3') : 'white')};
  transition: background ${(props) => (props.isUpdated ? '0.1s' : '0.5s')} ${transitionDefault};
`;

const MonitoringBoxTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
`;

const MonitoringBoxIcon = styled.span`
  margin-left: 4px;
`;

const MonitoringBoxContent = styled.div<{
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: MonitoringBoxProps['contentDirection'];
}>`
  flex: 1;
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'flex-end'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  flex-direction: ${({ flexDirection }) => flexDirection};
  width: 100%;
`;

const MetricValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;

  & + & {
    margin-top: 16px;
  }
`;

const MonitoringValue = styled.span`
  display: inline-block;
  margin-top: 38px;
  font-size: 36px;
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.5px;
  color: ${cssVariables('purple-7')};
`;

const MetricValue = styled.span<Pick<MetricLabeledValueProps, 'valueFontSize' | 'valueFontColor'>>`
  font-size: ${({ valueFontSize }) => valueFontSize || 36}px;
  font-weight: ${({ valueFontSize }) => {
    if (valueFontSize === 56) {
      return 400;
    }
    if (valueFontSize === 24) {
      return 600;
    }
    return 500;
  }};
  color: ${({ valueFontColor }) => valueFontColor || cssVariables('purple-7')};
`;

const MetricLabel = styled.span<Pick<MetricLabeledValueProps, 'valueFontSize'>>`
  margin-top: ${({ valueFontSize }) => (valueFontSize === 56 ? 4 : 2)}px;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  text-align: center;
  color: ${cssVariables('neutral-6')};
`;

const MetricListItem = styled.div`
  display: flex;
  padding: 7px 0 6px;
`;

const MetricListItemLabel = styled.div`
  flex: 1;
  font-size: 14px;
  text-align: left;
  color: ${cssVariables('neutral-7')};
`;

const MetricListItemValue = styled.div`
  flex: 1;
  text-align: right;
  font-size: 14px;
  color: ${cssVariables('purple-7')};
`;

const MetricListHeader = styled.div`
  display: flex;
  padding: 6px 0;
  font-size: 12px;
  color: ${cssVariables('neutral-6')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const MetricListHeaderLeft = styled.div`
  flex: 1;
  text-align: left;
`;

const MetricListHeaderRight = styled.div`
  flex: 1;
  text-align: right;
`;

const MetricList = styled.div`
  width: 100%;
  margin-top: 32px;

  ${MetricListItem} + ${MetricListItem} {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const GridItemWrapper = styled(GridItem)`
  height: 325px;
`;

const GridTicketsPerAgent = styled(Grid)`
  height: 100%;
`;

const TimeGrid = styled(Grid)`
  width: 100%;
  margin-top: 40px;
`;

const TicketReportMetrics = styled.div`
  padding: 36px 0;
`;

const BarChartContainer = styled.div`
  margin-top: 40px;
  width: 100%;
  height: 192px;
`;

const funnelColors = ['#8362fb', '#806ffd', '#7d7efd', '#7a8cff'];

const MonitoringBox = React.memo<MonitoringBoxProps>(
  ({
    className,
    title,
    titleTooltipText,
    contentAlignItems,
    contentJustifyContent,
    contentDirection,
    value,
    updatableChildrenValues,
    titleTooltipPlacement,
    children,
  }) => {
    const [isUpdated, setIsUpdated] = useState(false);
    const tooltipRef = useRef<TooltipRef | null>(null);
    const previousValue = usePrevious(value);
    const previousUpdatableChildrenValues = usePrevious(updatableChildrenValues);

    const handleMouseEnter = () => {
      tooltipRef.current?.show();
    };

    const handleMouseLeave = () => {
      tooltipRef.current?.hide();
    };

    useEffect(() => {
      if (
        (previousValue && previousValue !== value) ||
        (Array.isArray(previousUpdatableChildrenValues) &&
          !isEqual(previousUpdatableChildrenValues, updatableChildrenValues))
      ) {
        setIsUpdated(true);
        setTimeout(() => {
          setIsUpdated(false);
        }, 100);
      }
    }, [previousValue, previousUpdatableChildrenValues, value, updatableChildrenValues]);

    return (
      <MonitoringBoxContainer className={className} isUpdated={isUpdated}>
        <MonitoringBoxTitle>
          {title}
          {titleTooltipText && (
            <Tooltip ref={tooltipRef} content={titleTooltipText} placement={titleTooltipPlacement || 'top'}>
              <MonitoringBoxIcon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <TooltipTargetIcon icon="info" size={16} />
              </MonitoringBoxIcon>
            </Tooltip>
          )}
        </MonitoringBoxTitle>
        <MonitoringBoxContent
          alignItems={contentAlignItems}
          justifyContent={contentJustifyContent}
          flexDirection={contentDirection}
        >
          {typeof value === 'number' ? <MonitoringValue>{value}</MonitoringValue> : null}
          {children}
        </MonitoringBoxContent>
      </MonitoringBoxContainer>
    );
  },
);

const CustomMonitoringBox = styled(MonitoringBox)`
  padding-bottom: 0;
`;

const MetricLabeledValue = React.memo<MetricLabeledValueProps>(({ value, label, theme, valueFontSize }) => {
  const getMetricNumberColor = (theme) => {
    switch (theme) {
      case 'online':
        return cssVariables('green-5');
      case 'away':
        return cssVariables('orange-5');
      case 'offline':
        return cssVariables('neutral-6');

      default:
        return cssVariables('purple-7');
    }
  };

  return (
    <MetricValueContainer>
      <MetricValue valueFontSize={valueFontSize} valueFontColor={getMetricNumberColor(theme)}>
        {typeof value === 'string' ? value : <EasingNumber value={value} speed={250} />}
      </MetricValue>
      <MetricLabel valueFontSize={valueFontSize}>{label}</MetricLabel>
    </MetricValueContainer>
  );
});

const MetricPercentile = React.memo<MetricPercentileProps>(({ rowKey, percentiles, intl }) => {
  return (
    <MetricList>
      <MetricListHeader>
        <MetricListHeaderLeft>{intl.formatMessage({ id: 'desk.monitoring.lbl.percentile' })}</MetricListHeaderLeft>
        <MetricListHeaderRight>{intl.formatMessage({ id: 'desk.monitoring.lbl.averageTime' })}</MetricListHeaderRight>
      </MetricListHeader>
      {Object.keys(percentiles).map((key) => (
        <MetricListItem key={`${rowKey}-${key}`}>
          <MetricListItemLabel>{key.replace(/\D/g, '')} %</MetricListItemLabel>
          <MetricListItemValue>{renderTimestring(percentiles[key])}</MetricListItemValue>
        </MetricListItem>
      ))}
    </MetricList>
  );
});

const initialMetricState: Readonly<Monitor> = {
  currentActiveTicketCount: 0,
  currentIdleTicketCount: 0,
  currentPendingTicketCount: 0,
  currentWipTicketCount: 0,
  currentOfflineAgent: 0,
  currentOnlineAgent: 0,
  currentAwayAgent: 0,
  currentAverageAgentLoad: 0,
  currentAverageOnlineAgentLoad: 0,
  todayAverageDurationTime: 0,
  todayAveragePendingTime: 0,
  todayAverageResponseTime: 0,
  todayAverageFirstAssignmentToCloseTime: 0,
  todayAverageConversationTime: 0,
  todayCloseStatusCounts: [],
  todayClosedTicketCount: 0,
  todayIssuedTicketCount: 0,
  todayLongestConversationTime: null,
  todayLongestDurationTime: null,
  todayLongestFirstAssignmentToCloseTime: null,
  todayLongestPendingTime: null,
  todayLongestResponseTime: null,
  todayCustomerSatisfactionScores: [],
  todayPercentilePendingTime: {
    p95: 0,
    p90: 0,
    p80: 0,
  },
  todayPercentileResponseTime: {
    p95: 0,
    p90: 0,
    p80: 0,
  },
  todayPercentileDurationTime: {
    p95: 0,
    p90: 0,
    p80: 0,
  },
  todayPercentileFirstAssignmentToCloseTime: {
    p95: 0,
    p90: 0,
    p80: 0,
  },
  todayPercentileConversationTime: {
    p95: 0,
    p90: 0,
    p80: 0,
  },
  todayTicketFunnel: {
    initialized: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  },
};

const keyMaps = {
  assigned: 'desk.monitoring.lbl.assigned',
  closed: 'desk.monitoring.lbl.closed',
  initialized: 'desk.monitoring.lbl.initialized',
  pending: 'desk.monitoring.lbl.pending',
};

const closedStatusLabel: Record<ClosedStatus, string> = {
  CLOSED_BY_CUSTOMER: 'desk.monitoring.closedStatuses.lbl.customer',
  CLOSED_BY_AGENT: 'desk.monitoring.closedStatuses.lbl.agent',
  CLOSED_BY_ADMIN: 'desk.monitoring.closedStatuses.lbl.admin',
  CLOSED_BY_SYSTEM: 'desk.monitoring.closedStatuses.lbl.system',
  CLOSED_BY_PLATFORM_API: 'desk.monitoring.closedStatuses.lbl.platform',
  CLOSED_BUT_NOT_DEFINED: 'desk.monitoring.closedStatuses.lbl.undefined',
};

export const Monitoring = React.memo(() => {
  const intl = useIntl();
  const gnbHeight = useContext(GNBHeightContext);
  const { isCollapsed, isForceCollapsed } = useContext(LNBContext);

  const [currentTime, setCurrentTime] = useState(moment().format('lll (z)'));
  const [metric, setMetric] = useState(initialMetricState);
  const [isFetching, setIsFetching] = useState(false);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetchMonitorMetricRequest = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data } = await deskApi.fetchMonitorMetric(pid, region);
      setMetric(data);
      setIsFetching(false);
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
      setIsFetching(false);
    }
  }, [getErrorMessage, pid, region]);

  const refreshMonitorMetric = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      e && e.preventDefault();
      fetchMonitorMetricRequest();
      setCurrentTime(moment().format('lll (z)'));
    },
    [fetchMonitorMetricRequest],
  );

  useEffect(() => {
    refreshMonitorMetric();

    return () => {
      setMetric(initialMetricState);
    };
  }, [refreshMonitorMetric]);

  useInterval(() => {
    refreshMonitorMetric();
  }, 30000);

  const {
    currentActiveTicketCount,
    currentIdleTicketCount,
    currentPendingTicketCount,
    currentWipTicketCount,
    currentOfflineAgent,
    currentOnlineAgent,
    currentAwayAgent,
    currentAverageAgentLoad,
    currentAverageOnlineAgentLoad,
    todayAverageDurationTime,
    todayAveragePendingTime,
    todayAverageResponseTime,
    todayAverageFirstAssignmentToCloseTime,
    todayAverageConversationTime,
    todayCloseStatusCounts,
    todayClosedTicketCount,
    todayIssuedTicketCount,
    todayPercentilePendingTime,
    todayPercentileResponseTime,
    todayPercentileDurationTime,
    todayPercentileFirstAssignmentToCloseTime,
    todayPercentileConversationTime,
    todayTicketFunnel,
    todayLongestConversationTime,
    todayLongestDurationTime,
    todayLongestFirstAssignmentToCloseTime,
    todayLongestPendingTime,
    todayLongestResponseTime,
    todayCustomerSatisfactionScores,
  } = metric;

  const closedStatusesChartData = useRef<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  useEffect(() => {
    closedStatusesChartData.current = todayCloseStatusCounts.reduce(
      (acc, cur) => {
        acc.labels[getClosedStatusesIndex(cur.closeStatus)] = intl.formatMessage({
          id: closedStatusLabel[cur.closeStatus],
        });
        acc.values[getClosedStatusesIndex(cur.closeStatus)] = cur.counts;
        return acc;
      },
      {
        labels: new Array(doughnutChartSize).fill(''),
        values: new Array(doughnutChartSize).fill(0),
      },
    );
  }, [intl, todayCloseStatusCounts]);

  const timeMetrics = [
    {
      key: 'firstAssigned',
      average: todayAveragePendingTime,
      longest: todayLongestPendingTime,
      percentiles: todayPercentilePendingTime,
    },
    {
      key: 'firstResponse',
      average: todayAverageResponseTime,
      longest: todayLongestResponseTime,
      percentiles: todayPercentileResponseTime,
    },
    {
      key: 'ticketProcessing',
      average: todayAverageFirstAssignmentToCloseTime,
      longest: todayLongestFirstAssignmentToCloseTime,
      percentiles: todayPercentileFirstAssignmentToCloseTime,
    },
    {
      key: 'ticketResolution',
      average: todayAverageDurationTime,
      longest: todayLongestDurationTime,
      percentiles: todayPercentileDurationTime,
    },
    {
      key: 'ticketMessing',
      average: todayAverageConversationTime,
      longest: todayLongestConversationTime,
      percentiles: todayPercentileConversationTime,
    },
  ];

  return (
    <MonitoringContainer>
      <FixedSection gnbHeight={gnbHeight} isCollapsed={isCollapsed || isForceCollapsed}>
        <ContentContainer>
          <PageHeader css="width: 100% !important;">
            <PageHeader.Title>{intl.formatMessage({ id: 'desk.monitoring.header.title' })}</PageHeader.Title>
            <PageHeader.Actions>
              <MonitorTime>{intl.formatMessage({ id: 'desk.monitoring.updated' }, { time: currentTime })}</MonitorTime>
              <MonitorRefreshButton
                title={intl.formatMessage({ id: 'desk.monitoring.button.refresh' })}
                tooltipPlacement="bottom"
                icon="refresh"
                size="xsmall"
                buttonType="tertiary"
                isLoading={isFetching}
                onClick={refreshMonitorMetric}
              />
            </PageHeader.Actions>
          </PageHeader>
        </ContentContainer>
      </FixedSection>
      <Section>
        <SectionTitle>{intl.formatMessage({ id: 'desk.monitoring.sectionTitle.ticketAgentActivity' })}</SectionTitle>
        <Grid gap={32} templateColumn={4}>
          <GridItemWrapper colSpan={2}>
            <Grid gap={16} templateColumn={2}>
              <GridItem colSpan={1}>
                <MonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.pending.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.pending.desc' })}
                  value={currentPendingTicketCount}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <MonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.active.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.active.desc' })}
                  value={currentActiveTicketCount}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <MonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.idle.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.idle.desc' })}
                  titleTooltipPlacement="top-start"
                  value={currentIdleTicketCount}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <MonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.wip.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.wip.desc' })}
                  titleTooltipPlacement="top-start"
                  value={currentWipTicketCount}
                />
              </GridItem>
            </Grid>
          </GridItemWrapper>
          <GridItemWrapper colSpan={1}>
            <GridTicketsPerAgent gap={16} templateColumn={2}>
              <GridItem colSpan={2}>
                <CustomMonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.ticketsPerAgent.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.ticketsPerAgent.desc' })}
                  updatableChildrenValues={[currentAverageAgentLoad]}
                  contentAlignItems="center"
                  contentJustifyContent="center"
                >
                  <MetricLabeledValue
                    value={currentAverageAgentLoad === 0 ? 0 : Number(currentAverageAgentLoad).toFixed(2)}
                    valueFontSize={36}
                    label={intl.formatMessage({ id: 'desk.monitoring.ticketsPerAgent.label' })}
                  />
                </CustomMonitoringBox>
              </GridItem>
              <GridItem colSpan={2}>
                <CustomMonitoringBox
                  title={intl.formatMessage({ id: 'desk.monitoring.ticketsPerOnlineAgent.header' })}
                  titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.ticketsPerOnlineAgent.desc' })}
                  updatableChildrenValues={[currentAverageOnlineAgentLoad]}
                  contentAlignItems="center"
                  contentJustifyContent="center"
                >
                  <MetricLabeledValue
                    value={currentAverageOnlineAgentLoad === 0 ? 0 : Number(currentAverageOnlineAgentLoad).toFixed(2)}
                    valueFontSize={36}
                    label={intl.formatMessage({ id: 'desk.monitoring.ticketsPerOnlineAgent.label' })}
                  />
                </CustomMonitoringBox>
              </GridItem>
            </GridTicketsPerAgent>
          </GridItemWrapper>
          <GridItemWrapper colSpan={1}>
            <MonitoringBox
              title={intl.formatMessage({ id: 'desk.monitoring.agentStatus.header' })}
              updatableChildrenValues={[currentOnlineAgent, currentAwayAgent, currentOfflineAgent]}
              contentAlignItems="center"
              contentJustifyContent="center"
              contentDirection="column"
            >
              <MetricLabeledValue
                value={currentOnlineAgent}
                label={intl.formatMessage({ id: 'desk.monitoring.agentStatus.label.online' })}
                theme="online"
              />
              <MetricLabeledValue
                value={currentAwayAgent}
                label={intl.formatMessage({ id: 'desk.monitoring.agentStatus.label.away' })}
                theme="away"
              />
              <MetricLabeledValue
                value={currentOfflineAgent}
                label={intl.formatMessage({ id: 'desk.monitoring.agentStatus.label.offline' })}
                theme="offline"
              />
            </MonitoringBox>
          </GridItemWrapper>
        </Grid>
      </Section>
      <Section>
        <SectionTitle>{intl.formatMessage({ id: 'desk.monitoring.sectionTitle.dailyStatistics' })}</SectionTitle>
        <Grid>
          {timeMetrics.map(({ key, average, longest, percentiles }) => (
            <GridItemWrapper colSpan={4} key={key}>
              <MonitoringBox
                title={intl.formatMessage({ id: `desk.monitoring.time.${key}.header` })}
                titleTooltipText={intl.formatMessage({ id: `desk.monitoring.time.${key}.desc` })}
                updatableChildrenValues={[average, longest]}
                contentAlignItems="center"
                contentJustifyContent="center"
                contentDirection="column"
              >
                <TimeGrid gap={0}>
                  <GridItem colSpan={6}>
                    <MetricLabeledValue
                      value={renderTimestring(average)}
                      valueFontSize={24}
                      label={intl.formatMessage({ id: 'desk.monitoring.metric.label.average' })}
                    />
                  </GridItem>
                  <GridItem colSpan={6}>
                    <MetricLabeledValue
                      value={typeof longest === 'number' ? renderTimestring(longest) : EMPTY_TEXT}
                      valueFontSize={24}
                      label={intl.formatMessage({ id: 'desk.monitoring.metric.label.longest' })}
                    />
                  </GridItem>
                </TimeGrid>
                <MetricPercentile rowKey={key} percentiles={percentiles} intl={intl} />
              </MonitoringBox>
            </GridItemWrapper>
          ))}
          <GridItemWrapper colSpan={4}>
            <MonitoringBox
              title={intl.formatMessage({ id: 'desk.monitoring.ticketFunnel.header' })}
              titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.ticketFunnel.desc' })}
              updatableChildrenValues={[
                todayTicketFunnel.initialized,
                todayTicketFunnel.pending,
                todayTicketFunnel.assigned,
                todayTicketFunnel.closed,
              ]}
              contentAlignItems="flex-end"
              contentJustifyContent="center"
            >
              <BarChartContainer>
                <HorizontalBar
                  labels={Object.keys(todayTicketFunnel).map((key) => {
                    return keyMaps[key] ? intl.formatMessage({ id: keyMaps[key] }) : upperFirst(key);
                  })}
                  datasets={[
                    {
                      label: 'funnel',
                      data: [
                        todayTicketFunnel.initialized,
                        todayTicketFunnel.pending,
                        todayTicketFunnel.assigned,
                        todayTicketFunnel.closed,
                      ],
                      backgroundColor: funnelColors,
                      hoverBackgroundColor: funnelColors,
                      borderWidth: 0,
                    },
                  ]}
                />
              </BarChartContainer>
            </MonitoringBox>
          </GridItemWrapper>
          <GridItemWrapper colSpan={4}>
            <MonitoringBox
              title={intl.formatMessage({ id: 'desk.monitoring.ticketReport.header' })}
              titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.ticketReport.desc' })}
              updatableChildrenValues={[todayIssuedTicketCount, todayClosedTicketCount]}
              contentAlignItems="center"
              contentJustifyContent="center"
              contentDirection="column"
            >
              <TicketReportMetrics>
                <MetricLabeledValue
                  value={todayIssuedTicketCount}
                  label={intl.formatMessage({ id: 'desk.monitoring.metric.label.new' })}
                />
                <MetricLabeledValue
                  value={todayClosedTicketCount}
                  label={intl.formatMessage({ id: 'desk.monitoring.metric.label.closed' })}
                />
              </TicketReportMetrics>
            </MonitoringBox>
          </GridItemWrapper>
          <GridItemWrapper colSpan={4}>
            <MonitoringBox
              title={intl.formatMessage({ id: 'desk.monitoring.closedStatuses' })}
              titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.closedStatuses.desc' })}
              contentAlignItems="center"
              contentJustifyContent="center"
              contentDirection="column"
            >
              <DoughnutChart
                key="desk_stats_chart_closedStatuses"
                labels={closedStatusesChartData.current.labels}
                values={closedStatusesChartData.current.values}
                colors={{
                  backgroundColors: doughnutChartBackground,
                  hoverBorderColors: doughnutChartHover,
                }}
                tooltip={{
                  items: [
                    {
                      label: intl.formatMessage({ id: 'desk.monitoring.closedStatuses.tooltip.responses' }),
                    },
                    {
                      label: intl.formatMessage({ id: 'desk.monitoring.closedStatuses.tooltip.percentage' }),
                      valueFormatter: (value: number, values: number[], hiddenLegends: number[]) => {
                        return `${Math.floor(
                          (value /
                            values.reduce((prev, curr, index) => {
                              return hiddenLegends.includes(index) ? prev : prev + curr;
                            }, 0)) *
                            100,
                        )}%`;
                      },
                      color: cssVariables('neutral-10'),
                    },
                  ],
                }}
                centerLabelTop={intl.formatMessage({ id: 'desk.monitoring.closedStatuses.center.label.top' })}
                centerLabelBottom={intl.formatMessage({ id: 'desk.monitoring.closedStatuses.center.label.bottom' })}
              />
            </MonitoringBox>
          </GridItemWrapper>
          <GridItemWrapper colSpan={4}>
            <MonitoringBox
              title={intl.formatMessage({ id: 'desk.monitoring.csat' })}
              titleTooltipText={intl.formatMessage({ id: 'desk.monitoring.csat.desc' })}
              contentAlignItems="center"
              contentJustifyContent="center"
              contentDirection="column"
            >
              <DoughnutChart
                key="desk_stats_chart_closedStatuses"
                labels={[
                  intl.formatMessage({ id: 'desk.monitoring.csat.5stars' }),
                  intl.formatMessage({ id: 'desk.monitoring.csat.4stars' }),
                  intl.formatMessage({ id: 'desk.monitoring.csat.3stars' }),
                  intl.formatMessage({ id: 'desk.monitoring.csat.2stars' }),
                  intl.formatMessage({ id: 'desk.monitoring.csat.1star' }),
                ]}
                values={[...todayCustomerSatisfactionScores].reverse()}
                colors={{
                  backgroundColors: doughnutChartBackground,
                  hoverBorderColors: doughnutChartHover,
                }}
                tooltip={{
                  items: [
                    {
                      label: intl.formatMessage({ id: 'desk.monitoring.csat.label.responses' }),
                    },
                    {
                      label: intl.formatMessage({ id: 'desk.monitoring.csat.label.responsesPercentage' }),
                      valueFormatter: (value: number, values: number[], hiddenLegends: number[]) => {
                        return `${Math.floor(
                          (value /
                            values.reduce((prev, curr, index) => {
                              return hiddenLegends.includes(index) ? prev : prev + curr;
                            }, 0)) *
                            100,
                        )}%`;
                      },
                      color: cssVariables('neutral-10'),
                    },
                  ],
                }}
                centerLabelTop={intl.formatMessage({ id: 'desk.monitoring.csat.label.total.top' })}
                centerLabelBottom={intl.formatMessage({ id: 'desk.monitoring.csat.label.total.bottom' })}
              />
            </MonitoringBox>
          </GridItemWrapper>
        </Grid>
      </Section>
    </MonitoringContainer>
  );
});
