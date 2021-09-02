import React, { ComponentProps, useCallback } from 'react';

import { cssColors, typeface } from 'feather';

import { BarChart, LineChart } from '@ui/components/chart';

interface ChartDataSetProps {
  datasets: Chart.ChartData['datasets'];
}

interface HourlyBarChartProps extends ChartDataSetProps {
  /**
   * selectedDateRange
   * @description e.g.) Aug 14, 2019 - Aug 28, 2019
   */
  selectedDateRange?: string;
}

interface DailyLineChartProps extends ChartDataSetProps {
  tooltipValueFormatter?: ComponentProps<typeof LineChart>['tooltipValueFormatter'];
  useArea?: boolean;
  chartOptions?: Partial<Chart.ChartOptions>;
}

const yTickCallback = (val) => (Number.isInteger(val) ? val : null);
const tooltipValueFormatter = ({ value }: Chart.ChartTooltipItem) => {
  return value ? Number.parseFloat(value).toFixed(2) : '0';
};

const HourlyBarChart: React.FC<HourlyBarChartProps> = React.memo(({ datasets = [], selectedDateRange = '' }) => {
  const tooltipXLabelFormatter = useCallback(
    (tooltipItem: Chart.ChartTooltipItem) => (
      <>
        {selectedDateRange}
        <br />
        {tooltipItem.label}
      </>
    ),
    [selectedDateRange],
  );
  const chartOptions: Partial<Chart.ChartOptions> = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'hour',
            tooltipFormat: 'H:mm',
            displayFormats: {
              hour: 'H:mm',
            },
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 8,
            maxRotation: 0,
            minRotation: 0,
            fontColor: cssColors('neutral-10'),
            fontFamily: typeface.system,
            fontSize: 11,
          },
          offset: true,
        },
      ],
      yAxes: [
        {
          gridLines: {
            color: cssColors('neutral-2'),
            display: true,
            drawBorder: false,
          },
          type: 'linear',
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 6,
            min: 0,
            callback: yTickCallback,
            fontColor: cssColors('neutral-10'),
            fontFamily: typeface.system,
            fontSize: 11,
            padding: 10,
          },
        },
      ],
    },
  };

  return (
    <BarChart
      height="225px"
      datasets={datasets.map((dataset) => ({
        categoryPercentage: 0.6,
        maxBarThickness: 6,
        ...dataset,
      }))}
      options={chartOptions}
      tooltipXLabelFormatter={tooltipXLabelFormatter}
      tooltipValueFormatter={tooltipValueFormatter}
      noPadding={true}
    />
  );
});

const DailyLineChart: React.FC<DailyLineChartProps> = React.memo(
  ({ datasets = [], tooltipValueFormatter = undefined, useArea = false, chartOptions }) => {
    return (
      <LineChart
        height="225px"
        datasets={datasets}
        options={{
          ...chartOptions,
          scales: {
            ...chartOptions?.scales,
            xAxes: [
              {
                time: {
                  unit: 'day',
                  tooltipFormat: 'll',
                  displayFormats: { day: 'MMM Do' },
                },
              },
            ],
          },
        }}
        tooltipValueFormatter={tooltipValueFormatter}
        noPadding={true}
        useArea={useArea || datasets.length === 1}
      />
    );
  },
);

export { HourlyBarChart, DailyLineChart };
