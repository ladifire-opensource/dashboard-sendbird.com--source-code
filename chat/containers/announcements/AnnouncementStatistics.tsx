import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Subtitles, Dropdown, Button } from 'feather';

import { onDropdownChangeIgnoreNull } from '@utils';

import { OpenRateChart } from './OpenRateChart';
import { getAnnouncementProp } from './aliasMappers';
import { downloadAsCSV } from './downloadAsCSV';
import { formatInteger, formatPercentage } from './formatters';
import { useAnnouncementVersion } from './useAnnouncementVersion';

enum ChartPeriodOption {
  OneDay = 24,
  TwoDays = 48,
  FiveDays = 120,
  Week = 168,
}

type Props = {
  announcement: AnnouncementUnknownVersion;
  stats: Omit<FetchAnnouncementOpenRateAPIResponse, 'event_id'> | null;
};

const chartPeriodLabelMap: Record<ChartPeriodOption, string> = {
  24: 'chat.announcements.detail.statistics.period.oneDay',
  48: 'chat.announcements.detail.statistics.period.twoDays',
  120: 'chat.announcements.detail.statistics.period.fiveDays',
  168: 'chat.announcements.detail.statistics.period.week',
};

const Container = styled.div`
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const SummaryContainer = styled(Container)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 16px 0;
  align-items: stretch;
  height: 56px;
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  text-align: right;
  ${Subtitles['subtitle-02']};
  color: ${cssVariables('neutral-7')};

  & + & {
    border-left: 1px solid ${cssVariables('neutral-3')};
  }
`;

const SummaryLabel = styled.div`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};
`;

const ChartContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 24px;
  margin-top: 16px;
`;

export const AnnouncementStatistics: FC<Props> = ({ announcement, stats }) => {
  const intl = useIntl();
  const announcementVersion = useAnnouncementVersion();

  const [chartPeriod, setChartPeriod] = useState(ChartPeriodOption.OneDay);

  const handleExportButtonClick = () => {
    if (stats == null) {
      return;
    }
    const { open_counts, open_rates, cumulative_open_rates, cumulative_open_counts } = stats;
    const rows = open_counts.reduce<(string | number)[][]>(
      (acc, openCount, index) => {
        acc.push([
          index + 1,
          openCount,
          cumulative_open_counts[index],
          open_rates[index],
          cumulative_open_rates[index],
        ]);
        return acc;
      },
      [['hour', 'open_count', 'cumulative_open_count', 'open_rate', 'cumulative_open_rate']],
    );
    const uniqueId = announcement ? getAnnouncementProp(announcement, 'unique_id', announcementVersion) : '';
    downloadAsCSV(rows, `announcement_stats_${uniqueId}`);
  };

  return (
    <>
      <SummaryContainer>
        <Summary>
          <SummaryLabel>
            {intl.formatMessage({ id: 'chat.announcements.detail.statistics.targetUserCount' })}
          </SummaryLabel>
          {announcement && formatInteger(announcement.target_user_count)}
        </Summary>
        <Summary>
          <SummaryLabel>
            {intl.formatMessage({ id: 'chat.announcements.detail.statistics.sentUserCount' })}
          </SummaryLabel>
          {announcement && formatInteger(announcement.sent_user_count)}
        </Summary>
        <Summary>
          <SummaryLabel>{intl.formatMessage({ id: 'chat.announcements.detail.statistics.openCount' })}</SummaryLabel>
          {announcement && formatInteger(announcement.open_count)}
        </Summary>
        <Summary>
          <SummaryLabel>{intl.formatMessage({ id: 'chat.announcements.detail.statistics.openRate' })}</SummaryLabel>
          {announcement && formatPercentage(announcement.open_rate)}
        </Summary>
      </SummaryContainer>

      <ChartContainer>
        <Dropdown<ChartPeriodOption>
          size="small"
          selectedItem={chartPeriod}
          onChange={onDropdownChangeIgnoreNull(setChartPeriod)}
          items={[
            ChartPeriodOption.OneDay,
            ChartPeriodOption.TwoDays,
            ChartPeriodOption.FiveDays,
            ChartPeriodOption.Week,
          ]}
          itemToString={(item) => intl.formatMessage({ id: chartPeriodLabelMap[item] })}
        />
        <Button
          size="small"
          buttonType="secondary"
          icon="export"
          onClick={handleExportButtonClick}
          disabled={stats == null}
          css={`
            margin-left: auto;
          `}
        >
          {intl.formatMessage({ id: 'chat.announcements.detail.statistics.btn.export' })}
        </Button>
        <OpenRateChart
          cumulativeOpenRates={stats?.cumulative_open_rates ?? []}
          openCounts={stats?.open_counts ?? []}
          hours={chartPeriod}
          css={`
            width: 100%;
            margin-top: 34px;
            ${stats == null && 'pointer-events: none;'}
          `}
        />
      </ChartContainer>
    </>
  );
};
