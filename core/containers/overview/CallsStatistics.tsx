import { ComponentProps, FC, memo, ReactNode, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, DateRangePicker, Dropdown, Headings, SpinnerFull, TabbedInterface, Typography } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { fetchDailyUsage, fetchMonthlyUsage } from '@calls/api';
import { fetchCreditRates } from '@common/api';
import { DEFAULT_DATE_FORMAT } from '@constants';
import { useAppId, useAsync, useErrorToast } from '@hooks';
import { InfoTooltip, MonthRangePicker } from '@ui/components';
import { LineChart } from '@ui/components/chart';
import { ClientStorage } from '@utils';
import { getDateRangePickerValue } from '@utils/date';

import { StatisticsMetrics } from './components';

type Resolution = 'daily' | 'monthly';
type Range = { start: string; end: string };
type Filter = { resolution: Resolution; range: Range };

type PickerProps = {
  range: Range;
  onChange: (range: Range) => void;
};
type DailyPickerProps = Omit<ComponentProps<typeof DateRangePicker>, 'dateRange' | 'onChange' | 'value'> & PickerProps;

type UsageChartPoint = {
  x: string;
  y: number;
  tooltip: { credits: number; seconds: number };
};

type UsageChart = { label: string; data: UsageChartPoint[]; total: number }[];

type DateUsage = { date: string; seconds: number; credits: number };

type UsageChartProps = {
  chart: UsageChart;
} & Omit<ComponentProps<typeof LineChart>, 'datasets'>;

/* constants */
const types: CallType[] = [
  'audio',
  'video',
  'p2p_audio',
  'p2p_video',
  'small_room_for_audio_only',
  'large_room_for_audio_only',
  'small_room_for_video',
  'large_room_for_video',
];

const chartLegends = {
  direct: {
    audio: 'core.overview.calls.statistics.chart.legends.audio',
    video: 'core.overview.calls.statistics.chart.legends.video',
    p2p_audio: 'core.overview.calls.statistics.chart.legends.p2pAudio',
    p2p_video: 'core.overview.calls.statistics.chart.legends.p2pVideo',
  },
  group: {
    audio: 'core.overview.calls.statistics.chart.legends.audioRoom',
    video: 'core.overview.calls.statistics.chart.legends.videoRoom',
  },
};

const format: Record<Resolution, string> = {
  daily: 'YYYY-MM-DD',
  monthly: 'YYYY-MM',
};

/* utils */
const formatDate = (moment: Moment) => moment.format(format.daily);
const formatMonth = (moment: Moment) => moment.format(format.monthly);

const addUsage = (a: DateUsage, b: DateUsage): DateUsage => ({
  date: a.date,
  seconds: a.seconds + b.seconds,
  credits: a.credits + b.credits,
});

const addUsages = (a: DateUsage[], b: DateUsage[]) => a.map((usage, i) => addUsage(usage, b[i]));

const toChartData = (label: string, usage: DateUsage[]) => {
  return {
    label,
    total: usage.reduce((acc, cur) => acc + cur.credits, 0),
    data: usage.map(({ date, credits, seconds }) => ({
      x: date,
      y: credits,
      tooltip: { credits, seconds },
    })),
  };
};

type Tab = 'direct' | 'group';

const getInitialTab = (appId: string) => ClientStorage.getObject('overviewCallsSummarySelectedTab')?.[appId];
const setInitialTab = (appId: string, tab: Tab) =>
  ClientStorage.upsertObject('overviewCallsSummarySelectedTab', { [appId]: tab });

const TooltipNumber = styled.span`
  ${Headings['heading-04']}

  small {
    margin-left: 4px;
    ${Typography['label-02']}
  }
`;

const FilterContainer = styled.div`
  display: grid;
  grid-column-gap: 8px;
  grid-template-columns: auto auto;
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;

  > h3 {
    display: flex;
    align-items: center;
    ${Headings['heading-02']}
    color: ${cssVariables('neutral-10')};
  }
`;

const ChartContainer = styled.div`
  position: relative;
  min-height: 360px;

  > [role='progressbar'] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;

const Container = styled.section`
  padding: 24px;
  border: 1px solid ${cssVariables('neutral-3')};

  ${HeaderContainer} {
    margin-bottom: 4px;
  }

  [role='tablist'] {
    margin-bottom: 24px;
  }
`;

const Header: FC<{ right?: ReactNode }> = ({ right }) => {
  const intl = useIntl();

  return (
    <HeaderContainer>
      <h3>
        {intl.formatMessage({ id: 'core.overview.calls.statistics.title' })}
        <InfoTooltip content={intl.formatMessage({ id: 'core.overview.calls.statistics.title.tooltip' })} />
      </h3>
      {right}
    </HeaderContainer>
  );
};

const ResolutionDropdown: FC<{
  value: Resolution;
  onChange: (resolution: Resolution) => void;
}> = ({ value, onChange }) => {
  const intl = useIntl();

  const resolutionToString = (resolution: Resolution) => {
    return intl.formatMessage({
      id: {
        daily: 'core.overview.calls.statistics.chart.filter.daily',
        monthly: 'core.overview.calls.statistics.chart.filter.monthly',
      }[resolution],
    });
  };

  return (
    <Dropdown<Resolution>
      size="small"
      items={['daily', 'monthly']}
      itemToString={resolutionToString}
      selectedItem={value}
      onChange={onChange}
    />
  );
};

const DailyPicker: FC<DailyPickerProps> = ({ range, onChange, ...props }) => {
  const value = getDateRangePickerValue(range.start, range.end);
  const dateRange = { startDate: moment(range.start), endDate: moment(range.end) };

  const handleChangeDate: ComponentProps<typeof DateRangePicker>['onChange'] = (_, range) => {
    if (!range) return;

    const { startDate, endDate } = range;
    onChange({ start: formatDate(startDate), end: formatDate(endDate) });
  };

  return (
    <DateRangePicker
      minimumNights={7}
      maximumNights={92}
      placement="bottom-end"
      size="small"
      value={value}
      dateRange={dateRange}
      onChange={handleChangeDate}
      {...props}
    />
  );
};

const MonthlyPicker: FC<PickerProps> = ({ range, onChange }) => {
  const handleChangeMonth = ({ start, end }: { start: Moment; end: Moment }) => {
    onChange({ start: formatMonth(start), end: formatMonth(end) });
  };

  return <MonthRangePicker start={moment(range.start)} end={moment(range.end)} onApply={handleChangeMonth} />;
};

const Filter: FC<{
  resolution: Resolution;
  range: Range;
  onChangeResolution: (resolution: Resolution) => void;
  onChangeRange: (range: Range) => void;
}> = ({ resolution, range, onChangeResolution, onChangeRange }) => {
  return (
    <FilterContainer data-test-id="Filter">
      <ResolutionDropdown value={resolution} onChange={onChangeResolution} />
      {resolution === 'daily' && <DailyPicker range={range} onChange={onChangeRange} />}
      {resolution === 'monthly' && <MonthlyPicker range={range} onChange={onChangeRange} />}
    </FilterContainer>
  );
};

const UsageChart: FC<UsageChartProps> = ({ chart, ...props }) => {
  const intl = useIntl();

  return (
    <LineChart
      datasets={chart}
      renderLegend={(onLegendClick, checkIsHidden) => {
        return (
          <StatisticsMetrics
            metrics={chart.map(({ label, total }) => ({
              title: label,
              value: total.toLocaleString(),
            }))}
            onLegendClick={onLegendClick}
            checkIsHidden={checkIsHidden}
          />
        );
      }}
      tooltipValueFormatter={(tooltipItem) => {
        const { datasetIndex, index } = tooltipItem;
        if (datasetIndex == null || index == null) return null;

        const { data } = chart[datasetIndex];
        if (!data?.[index].tooltip) return null;

        const { credits, seconds } = data[index].tooltip;
        const minutes = Math.floor(seconds / 60);

        return (
          <TooltipNumber>
            {intl.formatMessage(
              { id: 'core.overview.calls.statistics.chart.tooltip.value' },
              {
                credits: intl.formatNumber(credits),
                minutes: intl.formatNumber(minutes),
                small: (children: ReactNode) => <small>{children}</small>,
              },
            )}
          </TooltipNumber>
        );
      }}
      height="280px"
      noPadding={true}
      {...props}
    />
  );
};

const DailyChart: FC<UsageChartProps> = memo(({ chart }) => {
  return (
    <UsageChart
      chart={chart}
      options={{ scales: { xAxes: [{ time: { unit: 'day', tooltipFormat: DEFAULT_DATE_FORMAT } }] } }}
    />
  );
});

const MonthlyChart: FC<UsageChartProps> = memo(({ chart }) => {
  return (
    <UsageChart
      chart={chart}
      options={{ scales: { xAxes: [{ time: { unit: 'month', tooltipFormat: 'MMM, YYYY' } }] } }}
    />
  );
});

const useFilter = () => {
  const defaultRange = {
    daily: { start: formatDate(moment().subtract(13, 'days')), end: formatDate(moment()) },
    monthly: { start: formatMonth(moment().subtract(6, 'months')), end: formatMonth(moment()) },
  };
  const [filter, setFilter] = useState<Filter>({ resolution: 'daily', range: defaultRange.daily });

  const updateResolution = (resolution: Resolution) => {
    setFilter({ resolution, range: defaultRange[resolution] });
  };

  const updateRange = (range: Range) => {
    setFilter((filter) => ({ ...filter, range }));
  };

  return { filter, updateResolution, updateRange };
};

const fetchUsage = async (appId: string, { resolution, range }: Filter) => {
  const { start, end } = range;

  if (resolution === 'daily') {
    const { data } = await fetchDailyUsage(appId, { start, end });
    return data.daily_usage;
  }

  if (resolution === 'monthly') {
    const { data } = await fetchMonthlyUsage(appId, { date_start: start, date_end: end });
    return data.monthly_usage;
  }

  throw new Error('invalid resolution');
};

const fetchUsageChart = async (appId: string, params: Filter) => {
  const { data: rates } = await fetchCreditRates();
  const usage = await fetchUsage(appId, params);
  const dates = Object.keys(usage).sort(); // ['2020-10-01', '2020-10-02', ...]

  return types.reduce((acc, type) => {
    acc[type] = dates.map((date) => {
      const seconds = usage[date][type];
      const minutes = seconds / 60;
      const rate = rates[type].user;
      const credits = minutes * rate;

      return { date, seconds, rate, credits };
    });

    return acc;
  }, {} as Record<CallType, { date: string; seconds: number; credits: number }[]>);
};

const useChart = (filter: Filter) => {
  const appId = useAppId();
  const [{ data: usages, error, status }, load] = useAsync(() => fetchUsageChart(appId, filter), [appId, filter]);
  const intl = useIntl();

  const isLoading = status === 'loading';

  const chart = useMemo(() => {
    if (!usages || isLoading) return null;
    const { small_room_for_audio_only, large_room_for_audio_only, small_room_for_video, large_room_for_video } = usages;

    return {
      direct: ['audio', 'video', 'p2p_audio', 'p2p_video'].map((type) => {
        return toChartData(intl.formatMessage({ id: chartLegends.direct[type] }), usages[type]);
      }),
      group: [
        { type: 'audio', usage: addUsages(small_room_for_audio_only, large_room_for_audio_only) },
        { type: 'video', usage: addUsages(small_room_for_video, large_room_for_video) },
      ].map(({ type, usage }) => {
        return toChartData(intl.formatMessage({ id: chartLegends.group[type] }), usage);
      }),
    };
  }, [intl, isLoading, usages]);

  return { chart, isLoading, error, load };
};

export const useInitialTab = () => {
  const appId = useAppId();
  const initialTab: Tab = useMemo(() => getInitialTab(appId) ?? 'direct', [appId]);

  const updateInitialTab = (tab: Tab) => setInitialTab(appId, tab);

  return [initialTab, updateInitialTab] as const;
};

export const CallsStatistics = () => {
  const intl = useIntl();
  const { filter, updateResolution, updateRange } = useFilter();
  const { chart, isLoading, error, load } = useChart(filter);

  const tabs: { title: string; id: Tab }[] = [
    { title: intl.formatMessage({ id: 'core.overview.calls.statistics.tabs.direct' }), id: 'direct' },
    { title: intl.formatMessage({ id: 'core.overview.calls.statistics.tabs.group' }), id: 'group' },
  ];
  const [initialTab, updateInitialTab] = useInitialTab();
  const defaultTabIndex = tabs.findIndex((tab) => tab.id === initialTab);

  useEffect(() => {
    load();
  }, [load]);

  useErrorToast(error);

  const { resolution, range } = filter;

  return (
    <Container>
      <Header
        right={
          <Filter
            resolution={resolution}
            range={range}
            onChangeResolution={updateResolution}
            onChangeRange={updateRange}
          />
        }
      />
      <TabbedInterface
        hasBorder={true}
        tabs={tabs}
        initialActiveTabIndex={defaultTabIndex}
        onActiveTabChange={({ tab }) => updateInitialTab(tab.id as Tab)}
      >
        {(tab) => {
          const selectedChart = chart?.[tab.id as Tab] ?? [];
          return (
            <ChartContainer>
              {(() => {
                if (isLoading) return <SpinnerFull />;
                if (resolution === 'daily') return <DailyChart chart={selectedChart} />;
                if (resolution === 'monthly') return <MonthlyChart chart={selectedChart} />;
              })()}
            </ChartContainer>
          );
        }}
      </TabbedInterface>
    </Container>
  );
};
