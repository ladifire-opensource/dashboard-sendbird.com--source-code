import { cssColors } from 'feather';

// WILL BE DEPRECRATED
export const colors_old = {
  primary: {
    purple: {
      dark: '#5c47b3',
    },
    skyBlue: {
      core: '#3a9ee6',
    },
  },
  background: {
    gray: '#eceff1',
  },
};

export const DATA_VIZ_COLORS = [
  cssColors('data-viz-1'),
  cssColors('data-viz-2'),
  cssColors('data-viz-3'),
  cssColors('data-viz-4'),
  cssColors('data-viz-5'),
  cssColors('data-viz-6'),
  cssColors('data-viz-7'),
  cssColors('data-viz-8'),
];

export const DATA_VIZ_HOVER_COLORS = [
  cssColors('data-viz-1-hover'),
  cssColors('data-viz-2-hover'),
  cssColors('data-viz-3-hover'),
  cssColors('data-viz-4-hover'),
  cssColors('data-viz-5-hover'),
  cssColors('data-viz-6-hover'),
  cssColors('data-viz-7-hover'),
  cssColors('data-viz-8-hover'),
];

export const getDataVizColors = ({ dataSize }: { dataSize: number }) => {
  const maxSize = DATA_VIZ_COLORS.length;
  if (dataSize > maxSize) {
    throw new Error(`The "dataSize" cannot be bigger than ${maxSize}`);
  }
  return DATA_VIZ_COLORS.slice(0, dataSize);
};

export const getDataVizHoverColors = ({ dataSize }: { dataSize: number }) => {
  const maxSize = DATA_VIZ_HOVER_COLORS.length;
  if (dataSize > maxSize) {
    throw new Error(`The "dataSize" cannot be bigger than ${maxSize}`);
  }
  return DATA_VIZ_HOVER_COLORS.slice(0, dataSize);
};

export const getDoughnutChartColors = ({ dataSize }: { dataSize: number }) => {
  const maxSize = DATA_VIZ_COLORS.length;
  if (dataSize > maxSize) {
    throw new Error(`The "dataSize" cannot be bigger than ${maxSize}`);
  }
  return {
    background: getDataVizColors({ dataSize }),
    hover: getDataVizHoverColors({ dataSize }),
    size: dataSize,
  };
};
