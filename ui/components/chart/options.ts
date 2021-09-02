import { cssColors, typeface } from 'feather';

import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from '@constants';

export const lineChartOptions: Chart.ChartOptions = {
  hover: {
    mode: 'index',
    intersect: false,
    animationDuration: 0,
  },
  maintainAspectRatio: false,
  tooltips: {
    enabled: false,
    mode: 'index',
    intersect: false,
    position: 'average',
  },
  layout: {
    padding: {
      left: 0,
      right: 24,
      top: 24,
      bottom: 0,
    },
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
          fontFamily: typeface.system,
          fontSize: 11,
        },
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
          fontFamily: typeface.system,
          fontSize: 11,
          padding: 10,
        },
      },
    ],
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4.5,
      hoverBorderWidth: 3,
    },
  },
  legend: {
    display: false,
  },
};
