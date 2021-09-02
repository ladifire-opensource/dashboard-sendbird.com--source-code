import moment from 'moment-timezone';
import { createSelector } from 'reselect';

const getSorted = (parsed) =>
  parsed.sort((a, b) => {
    const aDate = moment(a.x);
    if (aDate.isBefore(b.x)) {
      return -1;
    }
    if (aDate.isAfter(b.x)) {
      return 1;
    }
    return 0;
  });

const refinedStatistics = createSelector(
  (state: OverviewState['statistics']['messages']) => state,
  (statistics) => {
    let count = 0;
    let max = 0;
    const parsed: ChartPoint[] = Object.entries(statistics).map(([key, value]) => {
      max = value > max ? value : max;
      count += value;
      return {
        x: moment(key).tz('UTC').valueOf(),
        y: value,
      };
    });

    return { series: getSorted(parsed), max, count };
  },
);

export const refinedDAU = createSelector(
  (state: OverviewState['statistics']['dau']) => state,
  (state) => {
    let count = 0;
    let max = 0;
    const parsed: ChartPoint[] = state.map((data) => {
      max = data.dau > max ? data.dau : max;
      count += data.dau;
      return {
        x: moment(data.period).tz('UTC').valueOf(),
        y: data.dau,
      };
    });
    return {
      series: parsed,
      max,
      count,
    };
  },
);

export const refinedMAU = createSelector(
  (state: OverviewState['statistics']['mau']) => state,
  (state) => {
    let count = 0;
    let max = 0;
    const parsed: ChartPoint[] = state.map((data) => {
      max = data.mau > max ? data.mau : max;
      count += data.mau;
      return {
        x: data.period,
        y: data.mau,
      };
    });

    return {
      series: parsed,
      max,
      count,
    };
  },
);

export const refinedMessages = createSelector(
  (state: OverviewState['statistics']['messages']) => state,
  (state) => {
    return refinedStatistics(state);
  },
);

const refinedCCUStatistics = createSelector(
  (state: PeakConnection[]) => state,
  (statistics) => {
    let count = 0;
    let max = 0;
    let parsed: ChartPoint[] = [];

    parsed = statistics.map(({ date: key, peak_connections: value }) => {
      max = value > max ? value : max;
      count += value;
      return {
        x: moment(key).tz('UTC').valueOf(),
        y: value,
      };
    });
    return { series: getSorted(parsed), max, count };
  },
);

export const refinedMonthlyConnections = createSelector(
  (state: PeakConnection[]) => state,
  (state) => {
    return refinedCCUStatistics(state);
  },
);

export const refinedDailyConnections = createSelector(
  (state: PeakConnection[]) => state,
  (state) => {
    return refinedCCUStatistics(state);
  },
);

export const refinedHourlyCCU = createSelector(
  (state: OverviewState['statistics']['hourlyCCU'], selectedHourlyDate: OverviewState['selectedHourlyDate']) => {
    let count = 0;
    let max = 0;
    const parsed: ChartPoint[] = Object.entries(state).map(([key, value]) => {
      max = value > max ? value : max;
      count += value;
      return {
        x: moment(selectedHourlyDate)
          .set('hour', parseInt(key, 10))
          .set('minute', 0)
          .set('second', 0)
          .tz('UTC')
          .valueOf(),
        y: value,
      };
    });
    return {
      series: parsed,
      max,
      count,
    };
  },
  (refined) => refined,
);
