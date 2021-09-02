import React, { useRef, useState, useEffect, useMemo } from 'react';

import styled, { css } from 'styled-components';

import Chart, { ChartTooltipModel } from 'chart.js';
import { cssColors, cssVariables } from 'feather';
import isEqual from 'lodash/isEqual';
import numbro from 'numbro';

import { getDoughnutChartColors } from '@ui/colors';
import { logException } from '@utils';

import { DoughnutCustomTooltip } from './components';

const DoughnutChartWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  canvas {
    max-width: 100%;
  }
`;
const DoughnutChartLeft = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  max-height: 300px;
  min-height: 220px;
`;
const DoughnutChartRight = styled.div`
  padding-left: 10px;
`;

const CustomLegends = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CustomLegendPoint = styled.div<{ background: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
  background: ${({ background }) => background};
`;

const CustomLegend = styled.div<{ isHidden: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-7')};
  cursor: pointer;

  & + & {
    margin-top: 8px;
  }

  ${({ isHidden }) =>
    isHidden &&
    css`
      color: ${cssVariables('neutral-5')};
      ${CustomLegendPoint} {
        background: ${cssVariables('neutral-3')};
      }
    `}
`;

const DoughnutCanvas = styled.canvas`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 100;
`;

const DoughnutCenter = styled.div`
  position: absolute;
  z-index: 50;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DoughnutCenterValue = styled.div`
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
`;

const DoughnutCenterLabelTop = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 2px;
`;

const DoughnutCenterLabel = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};
`;

type DoughnutChartProps = {
  labels: string[];
  values: readonly number[];
  colors?: {
    backgroundColors: string[];
    hoverBorderColors: string[];
  };
  tooltip?: {
    items: {
      label: string;
      valueFormatter?: (value: number, values: number[], hiddenLegends: number[]) => number | string;
      color?: string;
    }[];
  };
  centerLabelTop?: string;
  centerLabelBottom?: string;
  options?: Partial<Chart.ChartOptions>;
};

const { background: doughnutChartBackground, hover: doughnutChartHover } = getDoughnutChartColors({ dataSize: 5 });

const initialColors = {
  backgroundColors: doughnutChartBackground,
  hoverBorderColors: doughnutChartHover,
};

export const DoughnutChart: React.FC<DoughnutChartProps> = React.memo(
  ({
    colors = initialColors,
    labels = [],
    values = [],
    tooltip = {
      items: [],
    },
    centerLabelTop,
    centerLabelBottom,
    options = {},
  }) => {
    const chart = useRef<Chart>();
    const canvas = useRef<HTMLCanvasElement>(null);
    const container = useRef<HTMLDivElement>(null);

    const [hiddenLegends, setHiddenLegends] = useState<number[]>([]);

    const [tooltipModel, setTooltipModel] = useState<ChartTooltipModel | null>(null);

    const dataset = useMemo(() => {
      const sumOfValues = values.reduce((prev, curr) => prev + curr, 0);
      const existings: number[] = [];
      values.forEach((value, index) => {
        if (value > 0) {
          existings.push(index);
        }
      });
      return {
        data: values as number[],
        borderWidth: sumOfValues === 0 || existings.length <= 1 ? 0 : 2,
        hoverBorderWidth: 4,
        backgroundColor: colors.backgroundColors,
        hoverBackgroundColor: colors.backgroundColors,
        hoverBorderColor: colors.hoverBorderColors,
      };
    }, [colors.backgroundColors, colors.hoverBorderColors, values]);

    const createChart = useRef<(() => void) | null>(null);

    useEffect(() => {
      createChart.current = () => {
        const defaultOptions: Chart.ChartOptions = {
          // doughnut
          cutoutPercentage: 68,
          responsive: true,
          maintainAspectRatio: false,
          tooltips: {
            enabled: false,
            custom: (tooltip) => {
              setTooltipModel(tooltip || null);
              return;
            },
          },
          legend: {
            display: false,
          },
        };
        const context = canvas.current && canvas.current.getContext('2d');

        /**
         * Draw
         * draw default gray stroke
         * @param chart
         */
        const draw = (chart) => {
          if (chart) {
            const x = chart.canvas.clientWidth / 2;
            const y = chart.canvas.clientHeight / 2;
            const { ctx } = chart;

            ctx.beginPath();
            ctx.arc(x, y, chart.outerRadius - chart.radiusLength / 2, 0, 2 * Math.PI);
            ctx.lineWidth = chart.radiusLength - 4;
            ctx.strokeStyle = cssColors('bg-3') as string;
            ctx.stroke();
          }
        };

        if (context) {
          const chartInstance = new Chart(context, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [dataset],
            },
            options: Chart.helpers.configMerge(defaultOptions, options),
            plugins: [
              {
                beforeDatasetsDraw: draw as Chart.PluginServiceRegistrationOptions['beforeDatasetsDraw'],
                resize: draw as Chart.PluginServiceRegistrationOptions['resize'],
              },
            ],
          });
          chart.current = chartInstance;
        }
      };
    });

    useEffect(() => {
      createChart.current?.();
      return () => {
        chart.current?.destroy();
      };
    }, []);

    useEffect(() => {
      if (chart.current) {
        chart.current.data.datasets = [dataset];
        chart.current.update();
        setHiddenLegends([]);
      }
    }, [dataset]);

    const handleLegendClick = (index) => () => {
      if (chart.current) {
        try {
          const meta = chart.current.getDatasetMeta(0);
          const isHidden = !meta.data[index].hidden;
          meta.data[index].hidden = isHidden;
          chart.current.update();

          if (!hiddenLegends.includes(index) && isHidden) {
            setHiddenLegends((prev) => prev.concat([index]));
          } else if (hiddenLegends.includes(index) && !isHidden) {
            setHiddenLegends((prev) => prev.filter((legendIndex) => legendIndex !== index));
          }
        } catch (error) {
          logException({ error });
        }
      }
    };

    const centerValue = values.reduce((prev, curr, index) => {
      return hiddenLegends.includes(index) ? prev : prev + curr;
    }, 0);

    return (
      <DoughnutChartWrapper>
        <DoughnutChartLeft ref={container}>
          <DoughnutCanvas ref={canvas} />
          <DoughnutCenter>
            <DoughnutCenterLabelTop>{centerLabelTop}</DoughnutCenterLabelTop>
            <DoughnutCenterValue>
              {numbro(centerValue).format({ thousandSeparated: true, mantissa: 0 })}
            </DoughnutCenterValue>
            <DoughnutCenterLabel>{centerLabelBottom}</DoughnutCenterLabel>
          </DoughnutCenter>
          <DoughnutCustomTooltip
            canvas={canvas.current}
            chart={chart.current}
            labels={labels}
            values={values}
            tooltip={tooltipModel}
            tooltipItems={tooltip.items}
            hiddenLegends={hiddenLegends}
          />
        </DoughnutChartLeft>
        <DoughnutChartRight>
          {labels && labels.length > 0 ? (
            <CustomLegends>
              {labels.map((label, index) => (
                <CustomLegend onClick={handleLegendClick(index)} isHidden={hiddenLegends.includes(index)} key={index}>
                  <CustomLegendPoint background={colors.backgroundColors[index]} />
                  {label}
                </CustomLegend>
              ))}
            </CustomLegends>
          ) : (
            ''
          )}
        </DoughnutChartRight>
      </DoughnutChartWrapper>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);
