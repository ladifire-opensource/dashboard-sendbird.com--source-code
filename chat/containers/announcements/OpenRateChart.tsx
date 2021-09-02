import { FC, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import Chart, { ChartTooltipModel, LinearTickOptions } from 'chart.js';
import { cssVariables, cssColors, Body } from 'feather';
import numbro from 'numbro';
import { rgba } from 'polished';

import { CustomTooltip } from '@ui/components/chart';

type Props = { hours: number; cumulativeOpenRates: number[]; openCounts: number[]; className?: string };

const CHART_HEIGHT = 259;
const SCALE_LABEL_WIDTH = 252;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

const CanvasWrapper = styled.div`
  position: relative;
  height: ${CHART_HEIGHT}px;
  padding-left: 40px;
  padding-right: 24px;
`;

const YAxisScaleLabel = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  transform: rotate(-90deg);
  transform-origin: top ${({ position }) => position};
  top: ${({ position }) => (position === 'left' ? SCALE_LABEL_WIDTH : 0)}px;
  ${({ position }) => (position === 'left' ? 'left: 0' : 'right: 20px')};
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  text-align: center;
  width: ${SCALE_LABEL_WIDTH}px;
  user-select: none;
`;

const XAxisScaleLabel = styled.div`
  margin-bottom: 24px;
  user-select: none;

  ${Body['body-short-01']};
  text-align: center;
  color: ${cssVariables('neutral-10')};
`;

const Legend = styled.div`
  text-align: center;
  user-select: none;

  ul {
    display: inline-grid;
    grid-auto-flow: column;
    grid-gap: 16px;
    margin: 0 auto;
    list-style: none;

    li {
      position: relative;
      padding-left: 16px;
      color: ${cssVariables('neutral-10')};
      ${Body['body-short-01']};

      &::before {
        display: block;
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -4px;
        border-radius: 4px;
        width: 8px;
        height: 8px;
        content: '';
      }

      &:first-child::before {
        background: ${cssVariables('purple-7')};
      }

      &:last-child::before {
        background: ${cssVariables('blue-5')};
      }
    }
  }
`;

export const OpenRateChart: FC<Props> = ({ hours, cumulativeOpenRates, openCounts, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();
  const legendContainerRef = useRef<HTMLDivElement>(null);
  const [tooltipModel, setTooltipModel] = useState<ChartTooltipModel>();
  const intl = useIntl();

  const datasetsData = useMemo(
    () => ({
      cumulativeOpenRate: cumulativeOpenRates.slice(0, hours),
      openCount: openCounts.slice(0, hours),
    }),
    [cumulativeOpenRates, hours, openCounts],
  );

  const formatXAxisLabel = useCallback(
    (value: number, isNarrow?: boolean) => {
      if (hours <= 48 || value < 24) {
        return intl.formatMessage(
          {
            id: isNarrow
              ? 'chat.announcements.detail.statistics.chart.xAxisLabel.hours'
              : 'chat.announcements.detail.statistics.chart.tooltip.hours',
          },
          { hours: value },
        );
      }

      return intl.formatMessage(
        {
          id: isNarrow
            ? 'chat.announcements.detail.statistics.chart.xAxisLabel.daysAndHours'
            : 'chat.announcements.detail.statistics.chart.tooltip.daysAndHours',
        },
        { days: Math.floor(value / 24), hours: value % 24 },
      );
    },
    [hours, intl],
  );

  useEffect(() => {
    if (canvasRef.current == null) {
      return;
    }

    const { current: canvasElement } = canvasRef;

    const labels = datasetsData.cumulativeOpenRate.map((_, index) => formatXAxisLabel(index + 1, true));

    const datasets = [
      {
        label: intl.formatMessage({ id: 'chat.announcements.detail.statistics.chartLegend.openCount' }),
        backgroundColor: cssColors('purple-7'),
        borderColor: cssColors('purple-7'),
        barThickness: hours > 120 ? 3 : 6, // use thinner bars if bars are many
        data: datasetsData.openCount,
        type: 'bar' as const,
        yAxisID: 'left-y-axis',
      },
      {
        label: intl.formatMessage({ id: 'chat.announcements.detail.statistics.chartLegend.openRate' }),
        backgroundColor: 'transparent',
        borderColor: cssColors('blue-5'),
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: 'white',
        pointBackgroundColor: cssColors('blue-5'),
        borderWidth: 2,
        lineTension: 0,
        borderCapStyle: 'round' as const,
        pointHitRadius: 3,
        data: datasetsData.cumulativeOpenRate,
        yAxisID: 'right-y-axis',
      },
    ];

    const xAxisTicksCallback = (() => {
      if (hours === 24) {
        return (value) => value;
      }
      if (hours <= 48) {
        return (value, index) => ((index + 1) % 6 === 0 ? value : '');
      }
      return (value, index) => ((index + 1) % 12 === 0 ? value : '');
    })();

    const xAxes = [
      {
        // https://www.chartjs.org/docs/latest/axes/cartesian/#common-configuration
        offset: true,

        ticks: {
          // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#tick-configuration-options
          callback: xAxisTicksCallback,
          maxRotation: 0,
          autoSkip: false,

          // https://www.chartjs.org/docs/latest/axes/styling.html#tick-configuration
          fontSize: 11,
          fontColor: cssColors('neutral-7'),
          lineHeight: 12 / 11,
        },
        // https://www.chartjs.org/docs/latest/axes/styling.html#grid-line-configuration
        gridLines: { display: false },
      },
    ];

    if (chartRef.current) {
      const { current: chart } = chartRef;
      chart.data = { labels, datasets };
      if (chart.options.scales) {
        chart.options.scales.xAxes = xAxes;
      }
      chart.update();
      return;
    }

    const chart = new Chart(canvasElement, {
      type: 'line',
      data: { labels, datasets },

      options: {
        // https://www.chartjs.org/docs/latest/general/responsive.html#important-note
        maintainAspectRatio: false,

        hover: {
          mode: 'index',
          intersect: false,
          animationDuration: 0,
        },

        tooltips: {
          enabled: false,
          custom: (tooltip) => {
            setTooltipModel(tooltip);
            return;
          },
          mode: 'index',
          intersect: false,
          position: 'average',
        },

        legend: {
          display: false,
        },

        scales: {
          xAxes,
          yAxes: [
            // https://www.chartjs.org/docs/latest/axes/cartesian/#creating-multiple-axes
            {
              id: 'left-y-axis',
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                precision: 0,
                fontSize: 11,
                fontColor: cssColors('neutral-7'),
                lineHeight: 12 / 11,
              } as LinearTickOptions,
              gridLines: { display: false },
            },
            {
              id: 'right-y-axis',
              type: 'linear',
              position: 'right',
              ticks: {
                max: 1,
                min: 0,
                fontSize: 11,
                fontColor: cssColors('neutral-7'),
                lineHeight: 12 / 11,
                stepSize: 0.25,
                callback: (value: string) => {
                  return `${parseFloat(value) * 100}%`;
                },
              },
              gridLines: { display: true, color: rgba(cssColors('neutral-9'), 0.08), drawBorder: false },
            },
          ],
        },
      },
    });
    chartRef.current = chart;
    legendContainerRef.current && (legendContainerRef.current.innerHTML = chart.generateLegend() as string);

    () => {
      chart.destroy();
    };
  }, [datasetsData.cumulativeOpenRate, datasetsData.openCount, formatXAxisLabel, hours, intl]);

  return (
    <Container>
      <CanvasWrapper className={className}>
        <canvas ref={canvasRef} />
        <YAxisScaleLabel position="left">
          {intl.formatMessage({ id: 'chat.announcements.detail.statistics.chart.yAxisLabel.openCount' })}
        </YAxisScaleLabel>
        {tooltipModel && (
          <CustomTooltip
            canvas={canvasRef.current}
            tooltip={tooltipModel}
            datasets={chartRef.current?.data.datasets ?? []}
            xLabelFormatter={({ index }) => formatXAxisLabel((index ?? 0) + 1)}
            valueFormatter={({ value, datasetIndex }) => {
              return datasetIndex === 0
                ? numbro(value).format({ thousandSeparated: true })
                : numbro(value).format({ output: 'percent', mantissa: 2 });
            }}
            colors={[cssColors('blue-5'), cssColors('purple-7')]}
          />
        )}
        <YAxisScaleLabel position="right">
          {intl.formatMessage({ id: 'chat.announcements.detail.statistics.chart.yAxisLabel.openRate' })}
        </YAxisScaleLabel>
      </CanvasWrapper>
      <XAxisScaleLabel>
        {intl.formatMessage({ id: 'chat.announcements.detail.statistics.chart.xAxisLabel.title' })}
      </XAxisScaleLabel>
      <Legend ref={legendContainerRef} />
    </Container>
  );
};
