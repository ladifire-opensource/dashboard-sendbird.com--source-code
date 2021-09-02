import { useRef, useEffect, useState } from 'react';

import styled from 'styled-components';

import Chart, { ChartOptions, ChartTooltipModel } from 'chart.js';
import 'chartjs-plugin-annotation';
import { typeface, cssColors } from 'feather';

import { DEFAULT_TIME_FORMAT, DEFAULT_DATE_FORMAT } from '@constants';
import { getTransformedUsage } from '@utils';

import { CustomTooltip } from './components';

const MixedChartWrapper = styled.div`
  position: relative;
`;

Chart.defaults.global.defaultFontFamily = typeface.system;
Chart.defaults.global.defaultFontColor = cssColors('neutral-7') as string;

const chartOptions: ChartOptions = {
  hover: {
    animationDuration: 0,
  },
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 4,
      hoverRadius: 4,
      hoverBorderWidth: 0,
    },
  },
  layout: {
    padding: {
      left: 0,
      right: 8,
      top: 24,
      bottom: 0,
    },
  },
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: DEFAULT_DATE_FORMAT,
          displayFormats: {
            hour: DEFAULT_TIME_FORMAT,
          },
        },
        gridLines: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
          fontColor: cssColors('neutral-10'),
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
          callback: (val) => (Number.isInteger(Number(val)) ? val : null),
          min: 0,
          fontColor: cssColors('neutral-10'),
          fontSize: 11,
          padding: 8,
        },
        offset: true,
      },
    ],
  },
  tooltips: {
    enabled: false,
    mode: 'index',
    intersect: false,
    position: 'average',
  },
};

const beforeDraw = (chart) => {
  if (chart) {
    const { ctx } = chart;
    /**
     * Draw crosshair
     */
    if (chart['tooltip']._active && chart['tooltip']._active.length > 0) {
      const activePoint = chart['tooltip']._active[0];
      const { x } = activePoint.tooltipPosition();
      const topY = chart['scales']['y-axis-0'].top;
      const bottomY = chart['scales']['y-axis-0'].bottom;

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
  }
};

const assignAnnotation = (value, label) => ({
  drawTime: 'afterDatasetsDraw', // (default)
  events: ['click'],
  dblClickSpeed: 350, // ms (default)
  annotations: [
    {
      drawTime: 'afterDraw',
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y-axis-0',
      value,
      borderColor: cssColors('neutral-6') as string,
      borderWidth: 1,
      label: {
        // Background color of label, default below
        backgroundColor: 'transparent',
        fontFamily: typeface.system,
        fontSize: 12,
        fontStyle: 'normal',
        fontColor: cssColors('neutral-7') as string,
        xPadding: 0,
        yPadding: 0,
        cornerRadius: 0,
        position: 'right',
        xAdjust: 0,
        yAdjust: -10,
        enabled: true,
        content: label,
      },
    },
  ],
});

export const MixedChart = ({ height, datasets, labels, annotation }) => {
  const chartRef = useRef<Chart>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tooltipModel, setTooltipModel] = useState<ChartTooltipModel | null>(null);

  if (chartOptions.tooltips && !tooltipModel) {
    chartOptions.tooltips.custom = (tooltip) => {
      setTooltipModel(tooltip || null);
      return;
    };
  }

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');

    if (context) {
      const chartInstance = new Chart(context, {
        type: 'bar',
        data: {
          datasets,
          labels,
        },
        options: {
          ...chartOptions,
          annotation: assignAnnotation(annotation.value, annotation.label),
        } as any,
        plugins: [
          {
            beforeDraw,
          },
        ],
      });

      chartRef.current = chartInstance;
    }
  }, [annotation.label, annotation.value, datasets, labels]);

  return (
    <MixedChartWrapper>
      <canvas ref={canvasRef} height={height || 80} />
      {tooltipModel && (
        <CustomTooltip
          canvas={canvasRef.current}
          tooltip={tooltipModel}
          datasets={datasets}
          colors={[cssColors('purple-7'), cssColors('blue-5')]}
          valueFormatter={({ value }) => getTransformedUsage(Number(value))}
        />
      )}
    </MixedChartWrapper>
  );
};
