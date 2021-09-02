import React, { useCallback, useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import Chart, { ChartTooltipModel } from 'chart.js';
import { cssColors, cssVariables, typeface } from 'feather';
import isEqual from 'lodash/isEqual';
import max from 'lodash/max';
import numbro from 'numbro';
import { rgba } from 'polished';

import { StyledProps } from '@ui';
import { DATA_VIZ_COLORS } from '@ui/colors';
import { logException, PropOf } from '@utils';

import { CustomTooltip } from './components';
import { lineChartOptions } from './options';
import { svgRoundRect } from './utils';

const StyledLineChart = styled.div<{ noPadding: boolean }>`
  position: relative;
  padding: ${(props) => (props.noPadding ? '0' : '24px')};
`;

const LineChartWrapper = styled.div<StyledProps>`
  flex: 1;
  padding: 0;
  canvas {
    max-width: 100%;
  }
`;

const defaultDataSetsOption = {
  borderWidth: 2,
  borderCapStyle: 'round',
  pointBorderColor: '#fff',
  pointHoverBorderColor: '#fff',
  pointHitRadius: 3,
  lineTension: 0,
};

type LineChartProps = {
  height?: string;
  colors?: readonly string[];
  noPadding?: boolean;
  useArea?: boolean;
  showHighest?: boolean;
  renderLegend?: (onLegendClick: (index) => (e) => void, checkIsHidden: (index) => boolean) => React.ReactNode;

  tooltipXLabelFormatter?: PropOf<typeof CustomTooltip, 'xLabelFormatter'>;
  tooltipValueFormatter?: PropOf<typeof CustomTooltip, 'valueFormatter'>;

  datasets: Chart.ChartDataSets[];

  options?: Partial<Chart.ChartOptions>;
};

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw(ease) {
    /**
     * this: chart instance
     */
    if (this.chart['tooltip']._active && this.chart['tooltip']._active.length > 0) {
      const { ctx } = this.chart;
      const activePoint = this.chart['tooltip']._active[0];
      const { x } = activePoint.tooltipPosition();
      const topY = this.chart['scales']['y-axis-0'].top;
      const bottomY = this.chart['scales']['y-axis-0'].bottom;

      // draw line
      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = String(cssColors('neutral-3'));
        ctx.stroke();
        ctx.restore();
      }
    }
    Chart.controllers.line.prototype.draw.call(this, ease);
  },
});

export const LineChart: React.FC<LineChartProps> = React.memo(
  ({
    height = 0,
    colors = DATA_VIZ_COLORS,
    noPadding = false,
    useArea = false,
    showHighest = false,
    renderLegend = undefined,
    tooltipXLabelFormatter = undefined,
    tooltipValueFormatter = undefined,
    datasets = [],
    options = {},
  }) => {
    const chart = useRef<Chart>();
    const canvas = useRef<HTMLCanvasElement>(null);

    const [hiddenLegends, setHiddenLegends] = useState<number[]>([]);

    const [tooltipModel, setTooltipModel] = useState<ChartTooltipModel | null>(null);

    const getDataSets = useCallback(
      (originalDatasets) =>
        originalDatasets.map((data, index) => {
          const mergedDefault = Object.assign(
            {},
            defaultDataSetsOption,
            index >= 0 && datasets.length <= colors.length
              ? {
                  backgroundColor: useArea ? rgba(colors[index], 0.08) : 'transparent',
                  borderColor: colors[index],
                  pointBackgroundColor: colors[index],
                  pointHoverBackgroundColor: colors[index],
                }
              : {},
          );
          return Object.assign({}, mergedDefault, {
            label: data.label,
            data: data.data,
          });
        }),
      [colors, datasets.length, useArea],
    );

    const createChart = useCallback(() => {
      const context = canvas.current && canvas.current.getContext('2d');

      const defaultOptions = lineChartOptions;
      if (defaultOptions.tooltips) {
        defaultOptions.tooltips.custom = (tooltip) => {
          setTooltipModel(tooltip || null);
          return;
        };
      }

      if (context) {
        const chartInstance = new Chart(context, {
          type: 'LineWithLine',
          data: {
            datasets: getDataSets(datasets),
          },
          options: Chart.helpers.configMerge(defaultOptions, options),
          plugins: [
            {
              afterDraw: (chart, easing) => {
                if (chart && showHighest) {
                  const { ctx } = chart;
                  if (ctx) {
                    ctx.font = `normal 600 11px ${typeface.system}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    if (chart.data.datasets) {
                      chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        if (dataset.data) {
                          const dataArray = (dataset.data as { x: string; y: string }[]).map((data) => data.y);
                          const maxValue = max(dataArray);
                          const indices: any[] = dataArray.reduce((prev: any[], curr, currIndex) => {
                            if (curr === maxValue) {
                              prev.push(currIndex);
                            }
                            return prev;
                          }, []);
                          indices.forEach((idx, index) => {
                            const data = meta.data[idx];
                            if (data && parseFloat(easing) === 1) {
                              const { width } = ctx.measureText(maxValue as string);
                              if (index === indices.length - 1) {
                                /**
                                 * Rect context
                                 * padding: 0 4px;
                                 * height: 16px;
                                 * top: -23 (9+height);
                                 */
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                                const isLastIdx = idx === dataArray.length - 1; // to prevent clampping on the last
                                const rect = {
                                  x: data._model.x - (isLastIdx ? width : Math.round(width / 2)) - 5,
                                  y: data._model.y - 23,
                                };
                                svgRoundRect(ctx, rect.x, rect.y, width + 9, 16, 4);
                                ctx.fillStyle = `${cssVariables('neutral-9')}`;
                                ctx.fillText(
                                  numbro(maxValue).format({ thousandSeparated: true, mantissa: 0 }),
                                  data._model.x - (isLastIdx ? Math.round(width / 2) : 0),
                                  data._model.y - 9,
                                );
                              }
                              ctx.beginPath();
                              ctx.arc(data._model.x, data._model.y, 3, 0, 2 * Math.PI); // width 11
                              ctx.fillStyle = colors[datasetIndex];
                              ctx.fill();
                            }
                          });
                        }
                      });
                    }
                  }
                }
              },
            },
          ],
        });
        chart.current = chartInstance;
      }
    }, [datasets, getDataSets, showHighest, colors, options]);

    useEffect(() => {
      createChart();
      return () => {
        chart.current && chart.current.destroy();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (chart.current) {
        chart.current.data.datasets = getDataSets(datasets);
        chart.current.update();
      }
    }, [getDataSets, datasets]);

    const onLegendClick = (index) => () => {
      if (chart.current) {
        try {
          const meta = chart.current.getDatasetMeta(index);
          let isHidden = false;
          if (meta.dataset) {
            isHidden = !meta.hidden;
            meta.hidden = isHidden;
          } else {
            isHidden = !meta.data[index].hidden;
            meta.data[index].hidden = isHidden;
          }

          if (!hiddenLegends.includes(index) && isHidden) {
            setHiddenLegends((prev) => prev.concat([index]));
          } else if (hiddenLegends.includes(index) && !isHidden) {
            setHiddenLegends((prev) => prev.filter((legendIndex) => legendIndex !== index));
          }

          chart.current.update();
        } catch (error) {
          logException({ error });
        }
      }
    };

    const checkIsHidden = (index) => hiddenLegends.includes(index);

    return (
      <StyledLineChart noPadding={noPadding}>
        {renderLegend ? renderLegend(onLegendClick, checkIsHidden) : ''}
        <LineChartWrapper style={{ height }}>
          <canvas ref={canvas} height={height || '80'} />
        </LineChartWrapper>
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
      </StyledLineChart>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);
