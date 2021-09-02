import React, { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import Chart, { ChartTooltipModel } from 'chart.js';
import { cssColors, typeface } from 'feather';
import isEqual from 'lodash/isEqual';

import { StyledProps } from '@ui';
import { DATA_VIZ_COLORS, DATA_VIZ_HOVER_COLORS } from '@ui/colors';
import { PropOf } from '@utils';

import { CustomTooltip } from './components';

const BarChartWrapper = styled.div<StyledProps>`
  position: relative;
  padding: ${(props) => (props.noPadding ? '0' : '24px')};
  flex: 1;
  canvas {
    max-width: 100%;
  }
`;

type BarChartProps = {
  height?: string;
  colors?: readonly string[];
  noPadding?: boolean;
  showLegend?: boolean;

  tooltipXLabelFormatter?: PropOf<typeof CustomTooltip, 'xLabelFormatter'>;
  tooltipValueFormatter?: PropOf<typeof CustomTooltip, 'valueFormatter'>;

  labels?: Chart.ChartData['labels'];
  datasets: Chart.ChartData['datasets'];

  options?: Partial<Chart.ChartOptions>;
};

export const BarChart: React.FC<BarChartProps> = React.memo(
  ({
    height = 0,
    colors = DATA_VIZ_COLORS,
    noPadding = false,
    showLegend = false,
    tooltipXLabelFormatter = undefined,
    tooltipValueFormatter = undefined,
    labels = undefined,
    datasets = [],
    options = {},
  }) => {
    const chart = useRef<Chart>();
    const canvas = useRef<HTMLCanvasElement>(null);

    const [tooltipModel, setTooltipModel] = useState<ChartTooltipModel | null>(null);

    const defaultDataSetsOption = {};

    const getDataSets = (originalDatasets) =>
      originalDatasets.map((data, index) => {
        const mergedDefault = Object.assign(
          {},
          defaultDataSetsOption,
          index >= 0 && datasets.length <= colors.length
            ? {
                ...data,
                backgroundColor: colors[index],
                backgroundHoverColor: DATA_VIZ_HOVER_COLORS[index],
              }
            : data,
        );
        return Object.assign({}, mergedDefault, {
          label: data.label,
          data: data.data,
        });
      });

    const createChart = () => {
      const defaultOptions: Chart.ChartOptions = {
        hover: {
          mode: 'index',
          intersect: false,
          animationDuration: 0,
        },
        maintainAspectRatio: false,
        tooltips: {
          enabled: false,
          custom: (tooltip) => {
            setTooltipModel(tooltip || null);
            return;
          },
          mode: 'index',
          intersect: false,
          position: 'average',
        },
        legend: {
          display: showLegend,
          position: 'top' as Chart.PositionType,
          onClick: (_, legendItem) => {
            const legend = legendItem;
            const { index } = legend as any;
            if (chart.current) {
              const meta = chart.current['getDatasetMeta'](index);
              meta.hidden =
                !meta.hidden && chart.current.data.datasets ? !chart.current.data.datasets[index].hidden : false;
              chart.current.update();
            }
          },
          onHover: () => {
            if (chart.current && chart.current.canvas) {
              chart.current.canvas.style.cursor = 'pointer';
            }
          },
          labels: {
            usePointStyle: true,
            fontFamily: typeface.system,
            fontColor: cssColors('neutral-7'),
            fontSize: 14,
            padding: 20,
            boxWidth: 8,
          },
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 4.5,
            hoverBorderWidth: 3,
          },
        },
      };
      const context = canvas.current && canvas.current.getContext('2d');

      if (context) {
        const chartInstance = new Chart(context, {
          type: 'bar',
          data: {
            labels,
            datasets: getDataSets(datasets),
          },
          options: Chart.helpers.configMerge(defaultOptions, options),
          plugins: [
            {
              beforeDraw: ({ ctx, chartArea }) => {
                if (ctx) {
                  ctx.fillStyle = 'transparent';
                  ctx.fillRect(
                    chartArea.left,
                    chartArea.top,
                    chartArea.right - chartArea.left,
                    chartArea.bottom - chartArea.top,
                  );
                }
              },
            },
          ],
        });
        chart.current = chartInstance;
      }
    };

    useEffect(() => {
      createChart();
      return () => {
        chart.current && chart.current.destroy();
      };
    }, []);

    useEffect(() => {
      if (chart.current) {
        chart.current.data.datasets = getDataSets(datasets);
        chart.current.update();
      }
    }, [datasets]);

    return (
      <BarChartWrapper noPadding={noPadding}>
        <canvas ref={canvas} height={height || '80'} />
        {tooltipModel && (
          <CustomTooltip
            canvas={canvas.current}
            tooltip={tooltipModel}
            datasets={datasets}
            xLabelFormatter={tooltipXLabelFormatter}
            valueFormatter={tooltipValueFormatter}
            colors={colors}
          />
        )}
      </BarChartWrapper>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);
