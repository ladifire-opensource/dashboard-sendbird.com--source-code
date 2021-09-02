import { FC, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Button,
  DateRangePicker,
  Dropdown,
  IconButton,
  Headings,
  Body as BodyTypography,
  DateRangePickerValue,
  SpinnerFull,
  toast,
  Tooltip,
  ContextualHelpContent,
  Subtitles,
} from 'feather';
import sortBy from 'lodash/sortBy';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';
import numbro from 'numbro';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  ISO_DATE_FORMAT,
  DEFAULT_DATE_FORMAT,
  StatisticsMetrics,
  StatisticsTimeDimension,
  StatisticsSegments,
  MONTH_DATE_FORMAT,
} from '@constants';
import { StyledProps } from '@ui';
import { MonthRangePicker, Table, Header, Body, Row, ColumnFlex, LastUpdatedAt, PageHeader } from '@ui/components';
import { LineChart } from '@ui/components/chart';
import { onDropdownChangeIgnoreNull } from '@utils';

import { transitionDate } from './converters';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { useAnalyticsIntl } from './useAnalyticsIntl';

const StyledAnalyticsDetail = styled.div`
  padding-bottom: 40px;
  ${Table} {
    flex: 1;
    box-shadow: none;
    ${Row} {
      padding: 0 8px;
    }
    ${Header} {
      ${Row} {
        height: 40px;
        background: white;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid ${cssVariables('neutral-3')};
        ${ColumnFlex} {
          color: ${cssVariables('neutral-10')};
          font-weight: 600;
          text-transform: none;
          padding-right: 8px;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
    ${Body} {
      ${Row} {
        height: 35px;
        ${ColumnFlex} {
          ${BodyTypography['body-short-01']}
          color: ${cssVariables('neutral-10')};
        }
      }
    }
  }
  .aaDatePicker {
    margin-left: 8px;
  }
`;

const DetailMetricTitle = styled.div`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
  margin-bottom: 12px;
  > div:first-child {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const DetailMetricValue = styled.div<{ color: string }>`
  ${Headings['heading-05']}
  font-weight: 600;
  color: ${({ color }) => color};
`;

const DetailMetric = styled.div<StyledProps>`
  padding: 16px;
  position: relative;
  border: 1px solid ${cssVariables('neutral-3')};
  border-left: none;
  height: 128px;
  &:first-child {
    width: 176px;
    border-left: 1px solid ${cssVariables('neutral-3')};
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  ${(props) =>
    props.isLast
      ? css`
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        `
      : ''};
  &:focus {
    outline: none;
  }
`;

const DetailMetricControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 48px;
`;

const DetailMetrics = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 175px 1fr 1fr 1fr 1fr 1fr;
  margin-top: 12px;
`;

const DetailMetricLabel = styled.div<StyledProps>`
  ${BodyTypography['body-short-01']}
  color: ${cssVariables('neutral-7')};
  ${DetailMetricTitle} + & {
    padding-top: 6px;
  }
  & + & {
    margin-top: 12px;
  }
`;

const MetricControl = styled(IconButton)``;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  height: 47px;
  padding: 0;
  border-top: 1px solid ${cssVariables('neutral-3')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  & > div + div {
    margin-left: 8px;
  }
`;

type ADDropdownItem = {
  value: string;
  label: string;
};

const blockSize = 5;

const defaultSegment = {
  label: 'Selected date',
  value: '',
};

const segmentItems = {
  [StatisticsMetrics.created_channels]: [
    {
      value: StatisticsSegments.custom_channel_type,
      label: 'Custom channel types',
    },
  ],
  [StatisticsMetrics.messages]: [
    {
      value: StatisticsSegments.custom_message_type,
      label: 'Custom message types',
    },
    {
      value: StatisticsSegments.custom_channel_type,
      label: 'Custom channel types',
    },
    {
      value: `${StatisticsSegments.custom_channel_type},${StatisticsSegments.custom_message_type}`,
      label: 'Both custom message & channel types',
    },
  ],
};

const defaultMessageCustomTypeItem: ADDropdownItem = {
  label: 'All message types',
  value: '',
};

const defaultChannelCustomTypeItem: ADDropdownItem = {
  label: 'All channel types',
  value: '',
};

// charts types
const customTypeCharts = [StatisticsMetrics.created_channels, StatisticsMetrics.messages];
const timeDimensionCharts = [
  StatisticsMetrics.active_channels,
  StatisticsMetrics.message_senders,
  StatisticsMetrics.message_viewers,
];

const timeDimensions = Object.keys(StatisticsTimeDimension);

const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

export const AnalyticsDetail: FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const match = useRouteMatch();
  const { metricType } = match?.params as any;

  const { getMetricMessages } = useAnalyticsIntl();
  const intlMap = getMetricMessages(metricType);

  const [segmentItem, setSegmentItem] = useState<ADDropdownItem>(defaultSegment);
  const [channelCustomType, setChannelCustomType] = useState(defaultChannelCustomTypeItem);
  const [messageCustomType, setMessageCustomType] = useState(defaultMessageCustomTypeItem);
  const [metricsBlock, setMetricsBlock] = useState(1);
  const [timeDimension, setTimeDimension] = useState<StatisticsTimeDimension>(StatisticsTimeDimension.daily);
  const [date, setDate] = useState(DateRangePickerValue.Last14Days);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(14, 'day'),
    endDate: moment(),
  });

  const { isLoading, data, fetchedAt } = useAdvancedAnalytics({
    metricType,
    timeDimension,
    dateRange,
    segments: segmentItem.value,
  });

  const handleDatePickerChange = (value, { startDate, endDate }) => {
    if (startDate.isBefore(transitionDate) && endDate.diff(startDate, 'days') > 92) {
      toast.warning({
        message: intl.formatMessage({ id: 'chat.analyticsDetail.errors.92days' }),
      });
      return;
    }
    setDate(value);
    setDateRange({ startDate, endDate });
    setChannelCustomType(defaultChannelCustomTypeItem);
    setMessageCustomType(defaultMessageCustomTypeItem);
  };

  const handleMonthPickerChange = ({ start, end }) => {
    if (start.isBefore(transitionDate) && end.diff(start, 'months') > 12) {
      toast.warning({
        message: intl.formatMessage({ id: 'chat.analyticsDetail.errors.12months' }),
      });
      return;
    }
    setDate(DateRangePickerValue.Custom);
    setDateRange({
      startDate: start,
      endDate: end,
    });
  };

  const handleTimeDimensionSelected = (timeDimension) => {
    setTimeDimension(timeDimension);
  };

  const handleSegmentItemSelected = (option) => {
    setSegmentItem(option);
    setChannelCustomType(defaultChannelCustomTypeItem);
    setMessageCustomType(defaultMessageCustomTypeItem);
    setMetricsBlock(1);
  };

  const handleChannelCustomTypeChange = (channelCustomType) => {
    setChannelCustomType(channelCustomType);
    setMessageCustomType(defaultMessageCustomTypeItem);
    setMetricsBlock(1);
  };

  const handleMessageCustomTypeChange = (messageCustomType) => {
    setMessageCustomType(messageCustomType);
    setMetricsBlock(1);
  };

  const handleClickExport = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.AnalyticsExport,
        dialogProps: {
          metricType,
          ...dateRange,
        },
      }),
    );
  };

  const renderDatePicker = () => {
    switch (timeDimension) {
      case StatisticsTimeDimension.daily:
        return (
          <DateRangePicker
            size="small"
            value={date}
            dateRange={dateRange}
            onChange={handleDatePickerChange}
            minimumNights={7}
            maximumNights={92}
            dropdownProps={{
              size: 'small',
              tooltipProps: { placement: 'bottom' },
              className: 'aaDatePicker',
            }}
          />
        );
      case StatisticsTimeDimension.monthly:
        return (
          <MonthRangePicker
            start={dateRange.startDate}
            end={dateRange.endDate}
            onChange={handleMonthPickerChange}
            targetStyles={css`
              margin-left: 8px;
            `}
          />
        );
      default:
        return null;
    }
  };

  const getTooltipDateFormat = () => {
    switch (timeDimension) {
      case StatisticsTimeDimension.monthly:
        return MONTH_DATE_FORMAT;
      case StatisticsTimeDimension.daily:
      default:
        return DEFAULT_DATE_FORMAT;
    }
  };

  const showMessageCustomTypes =
    metricType === StatisticsMetrics.messages && segmentItem.value === StatisticsSegments.custom_message_type;
  const showChannelCustomTypes =
    (metricType === StatisticsMetrics.messages || metricType === StatisticsMetrics.created_channels) &&
    segmentItem.value === StatisticsSegments.custom_channel_type;
  const showBothCustomTypes =
    StatisticsMetrics.messages && segmentItem.value === 'custom_channel_type,custom_message_type';
  const anyCustomTypes = showMessageCustomTypes || showChannelCustomTypes || showBothCustomTypes;

  const getDatasets = useCallback(() => {
    if (isLoading) {
      return [] as number[];
    }
    if (channelCustomType.value && messageCustomType.value) {
      return sortBy(
        data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData[messageCustomType.value],
        'x',
      );
    }
    if (channelCustomType.value) {
      return sortBy(data.channelCustomTypeData[channelCustomType.value].statistics, 'x');
    }
    if (messageCustomType.value) {
      return sortBy(data.messageCustomTypeData[messageCustomType.value].statistics, 'x');
    }
    return sortBy(data.statistics, 'x');
  }, [
    channelCustomType.value,
    data.channelCustomTypeData,
    data.messageCustomTypeData,
    data.statistics,
    isLoading,
    messageCustomType.value,
  ]);

  const metricsItems: {
    label: string;
    total: string;
    average: string;
  }[] = [];

  metricsItems.push({
    label: upperFirst(intlMap?.unit),
    total: formatNumber(data.total),
    average: formatNumber(data.average),
  });
  if (showChannelCustomTypes || showBothCustomTypes) {
    Object.keys(data.channelCustomTypeData).forEach((customType) => {
      const { statistics } = data.channelCustomTypeData[customType];
      const total = statistics.map((stat) => stat.y as number).reduce((sum, value) => sum + value, 0);
      metricsItems.push({
        label: customType,
        total: formatNumber(total),
        average: formatNumber(total / statistics.length || 0),
      });
    });
  }
  if (showMessageCustomTypes) {
    Object.keys(data.messageCustomTypeData).forEach((customType) => {
      const { statistics } = data.messageCustomTypeData[customType];
      const total = statistics.map((stat) => stat.y as number).reduce((sum, value) => sum + value, 0);
      metricsItems.push({
        label: customType,
        total: formatNumber(total),
        average: formatNumber(total / statistics.length || 0),
      });
    });
  }
  if (showBothCustomTypes && channelCustomType.value) {
    Object.keys(data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData).forEach((customType) => {
      const statistics = data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData[customType];
      const total = statistics.map((stat) => stat.y as number).reduce((sum, value) => sum + value, 0);
      metricsItems.push({
        label: customType,
        total: formatNumber(total),
        average: formatNumber(total / statistics.length || 0),
      });
    });
  }

  const isPrevExist = metricsBlock > 1;
  const isNextExist = metricsItems.length / blockSize > metricsBlock;

  const handlePrevClick = () => {
    if (isPrevExist) {
      setMetricsBlock(metricsBlock - 1);
    }
  };
  const handleNextClick = () => {
    if (isNextExist) {
      setMetricsBlock(metricsBlock + 1);
    }
  };

  return (
    <StyledAnalyticsDetail>
      <PageHeader
        css={`
          & + * {
            margin-top: 24px;
          }

          ${PageHeader.Description} {
            display: flex;
            flex-direction: row;
            align-items: baseline;
            justify-content: space-between;
            margin-top: 12px;
            color: inherit;
            ${Subtitles['subtitle-01']};
          }
        `}
      >
        <PageHeader.BackButton href="../analytics" />
        <PageHeader.Title>{intlMap?.header}</PageHeader.Title>
        <PageHeader.Actions>
          {timeDimensionCharts.includes(metricType) && (
            <Dropdown
              size="small"
              selectedItem={timeDimension}
              items={timeDimensions}
              itemToString={(item) => upperFirst(item)}
              onChange={onDropdownChangeIgnoreNull(handleTimeDimensionSelected)}
            />
          )}
          {renderDatePicker()}
          <Button
            buttonType="secondary"
            size="small"
            icon="download"
            onClick={handleClickExport}
            styles="margin-left: 8px;"
          >
            Export
          </Button>
        </PageHeader.Actions>
        <PageHeader.Description>
          <p>{intlMap?.detail}</p>
          <LastUpdatedAt timestamp={fetchedAt} />
        </PageHeader.Description>
      </PageHeader>

      {customTypeCharts.includes(metricType) && (
        <ChartHeader>
          <Dropdown
            size="small"
            variant="inline"
            selectedItem={segmentItem}
            items={[defaultSegment, ...segmentItems[metricType]]}
            itemToString={(item) => item.label}
            onChange={onDropdownChangeIgnoreNull(handleSegmentItemSelected)}
          />
          {showChannelCustomTypes && (
            <Dropdown
              size="small"
              variant="inline"
              selectedItem={channelCustomType}
              initialSelectedItem={defaultChannelCustomTypeItem}
              items={[
                defaultChannelCustomTypeItem,
                ...Object.keys(data.channelCustomTypeData).map((customType) => ({
                  value: customType,
                  label: customType,
                })),
              ]}
              itemToString={(item) => item.label}
              onChange={onDropdownChangeIgnoreNull(handleChannelCustomTypeChange)}
            />
          )}
          {showMessageCustomTypes && (
            <Dropdown
              size="small"
              variant="inline"
              selectedItem={messageCustomType}
              initialSelectedItem={defaultMessageCustomTypeItem}
              items={[
                defaultMessageCustomTypeItem,
                ...Object.keys(data.messageCustomTypeData).map((customType) => ({
                  value: customType,
                  label: customType,
                })),
              ]}
              itemToString={(item) => item.label}
              onChange={onDropdownChangeIgnoreNull(handleMessageCustomTypeChange)}
            />
          )}
          {showBothCustomTypes && (
            <>
              <Dropdown
                size="small"
                variant="inline"
                selectedItem={channelCustomType}
                initialSelectedItem={defaultChannelCustomTypeItem}
                items={[
                  defaultChannelCustomTypeItem,
                  ...Object.keys(data.channelCustomTypeData).map((customType) => ({
                    value: customType,
                    label: customType,
                  })),
                ]}
                itemToString={(item) => item.label}
                onChange={onDropdownChangeIgnoreNull(handleChannelCustomTypeChange)}
              />
              <Dropdown
                size="small"
                variant="inline"
                selectedItem={messageCustomType}
                initialSelectedItem={defaultMessageCustomTypeItem}
                items={[
                  defaultMessageCustomTypeItem,
                  ...(channelCustomType.value === ''
                    ? []
                    : Object.keys(data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData).map(
                        (customType) => ({
                          value: customType,
                          label: customType,
                        }),
                      )),
                ]}
                itemToString={(item) => item.label}
                onChange={onDropdownChangeIgnoreNull(handleMessageCustomTypeChange)}
              />
            </>
          )}
          {anyCustomTypes && (
            <Tooltip
              placement="bottom"
              popperProps={{
                modifiers: {
                  offset: {
                    offset: '0, 12',
                  },
                },
              }}
              content={
                <>
                  <ContextualHelpContent.Header>SENDBIRD:DEFAULT</ContextualHelpContent.Header>
                  <ContextualHelpContent.Body>
                    {intl.formatMessage({ id: 'chat.analyticsDetail.tooltip.sendbirdDefault' })}
                  </ContextualHelpContent.Body>
                  <ContextualHelpContent.Header>SENDBIRD:AUTO_EVENT_MESSAGE</ContextualHelpContent.Header>
                  <ContextualHelpContent.Body style={{ whiteSpace: 'pre-wrap' }}>
                    {intl.formatMessage({ id: 'chat.analyticsDetail.tooltip.sendbirdAutoEventMessage' })}
                  </ContextualHelpContent.Body>
                </>
              }
              tooltipContentStyle={css`
                word-break: break-all;
              `}
            >
              <IconButton buttonType="tertiary" icon="info" size="xsmall" />
            </Tooltip>
          )}
        </ChartHeader>
      )}
      <>
        {isLoading && <SpinnerFull transparent={true} />}
        <LineChart
          key={`aaDetailChart_${metricType}`}
          height="375px"
          useArea={true}
          datasets={[
            {
              label: intlMap?.header,
              data: getDatasets(),
            },
          ]}
          options={{
            scales: {
              xAxes: [
                {
                  time: {
                    unit: timeDimension === StatisticsTimeDimension.daily ? 'day' : 'month',
                    tooltipFormat: getTooltipDateFormat(),
                  },
                },
              ],
            },
          }}
        />
        <DetailMetrics>
          <DetailMetric>
            <DetailMetricTitle>&nbsp;</DetailMetricTitle>
            <DetailMetricLabel>{intl.formatMessage({ id: 'chat.analyticsDetail.label.total' })}</DetailMetricLabel>
            <DetailMetricLabel>{intl.formatMessage({ id: 'chat.analyticsDetail.label.average' })}</DetailMetricLabel>
          </DetailMetric>
          {metricsItems.slice((0 + (metricsBlock - 1)) * blockSize, blockSize * metricsBlock).map((item, index) => {
            return (
              <DetailMetric
                isFirst={index === 0}
                isLast={index === metricsItems.length - 1}
                key={`detailMetric_${item.label}_${index}`}
              >
                <DetailMetricTitle>
                  <Tooltip
                    content={item.label}
                    popperProps={{
                      modifiers: {
                        offset: {
                          offset: '0, 12',
                        },
                      },
                    }}
                    placement="top"
                    tooltipContentStyle={css`
                      word-break: break-all;
                    `}
                  >
                    {item.label}
                  </Tooltip>
                </DetailMetricTitle>
                <DetailMetricValue color={cssVariables('purple-8')}>{item.total}</DetailMetricValue>
                <DetailMetricValue color={cssVariables('purple-4')}>{item.average}</DetailMetricValue>
              </DetailMetric>
            );
          })}
        </DetailMetrics>
        <DetailMetricControls>
          {metricsItems.length > blockSize && (
            <>
              <MetricControl
                icon="chevron-left"
                buttonType="secondary"
                size="small"
                onClick={handlePrevClick}
                disabled={!isPrevExist}
              />
              <MetricControl
                icon="chevron-right"
                buttonType="secondary"
                size="small"
                onClick={handleNextClick}
                disabled={!isNextExist}
              />
            </>
          )}
        </DetailMetricControls>
        <Table>
          <Header>
            <Row>
              <ColumnFlex flex="125px">{intl.formatMessage({ id: 'chat.analyticsDetail.label.date' })}</ColumnFlex>
              <ColumnFlex>{upperFirst(intlMap?.unit)}</ColumnFlex>
              {(showChannelCustomTypes || showBothCustomTypes) &&
                Object.keys(data.channelCustomTypeData).map((customType, index) => (
                  <ColumnFlex key={`messageCustomTypeHeader_${customType}_${index}`}>{customType}</ColumnFlex>
                ))}
              {showMessageCustomTypes &&
                Object.keys(data.messageCustomTypeData).map((customType, index) => (
                  <ColumnFlex key={`messageCustomTypeHeader_${customType}_${index}`}>{customType}</ColumnFlex>
                ))}
              {showBothCustomTypes &&
                channelCustomType.value &&
                Object.keys(
                  data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData,
                ).map((customType, index) => (
                  <ColumnFlex key={`messageCustomTypeHeader_${customType}_${index}`}>{customType}</ColumnFlex>
                ))}
            </Row>
          </Header>
          <Body>
            {data.statistics.map((stats, index) => {
              return (
                <Row key={`detail_table_stats_${channelCustomType || messageCustomType}${index}`}>
                  <ColumnFlex flex="125px">{moment(stats.x).format(ISO_DATE_FORMAT)}</ColumnFlex>
                  <ColumnFlex>{formatNumber(stats.y)}</ColumnFlex>
                  {(showChannelCustomTypes || showBothCustomTypes) &&
                    Object.keys(data.channelCustomTypeData).map((customType) => (
                      <ColumnFlex key={`channelCustomType${customType}`}>
                        {formatNumber(data.channelCustomTypeData[customType].statistics[index].y)}
                      </ColumnFlex>
                    ))}
                  {showMessageCustomTypes &&
                    Object.keys(data.messageCustomTypeData).map((customType) => (
                      <ColumnFlex key={`messageCustomType${customType}`}>
                        {formatNumber(data.messageCustomTypeData[customType].statistics[index].y)}
                      </ColumnFlex>
                    ))}
                  {showBothCustomTypes &&
                    channelCustomType.value &&
                    Object.keys(
                      data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData,
                    ).map((customType) => (
                      <ColumnFlex key={`messageNchannelCustomType${customType}`}>
                        {formatNumber(
                          data.channelCustomTypeData[channelCustomType.value].messageCustomTypeData[customType][index]
                            .y,
                        )}
                      </ColumnFlex>
                    ))}
                </Row>
              );
            })}
          </Body>
        </Table>
      </>
    </StyledAnalyticsDetail>
  );
};
