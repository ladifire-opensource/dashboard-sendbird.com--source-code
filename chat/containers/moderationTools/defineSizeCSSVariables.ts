import { css } from 'styled-components';

import { ZoomLevelPercentageValue } from './ModerationToolHeader/TextZoomButton';

const baseSpacing = 8;
const baseFontSize = 14;
const baseLineHeight = 20;
const baseTimeFontSize = 12;
const baseTimeLineHeight = 16;
const baseDateFontSize = 13;
const baseOperatorIconSize = 16;

const defineSizeCSSVariables = (zoomLevel: ZoomLevelPercentageValue) => {
  const ratio = zoomLevel / 100;

  return css`
    --space: ${baseSpacing * ratio}px;
    --font-size: ${baseFontSize * ratio}px;
    --line-height: ${baseLineHeight * ratio}px;
    --time-font-size: ${baseTimeFontSize * ratio}px;
    --time-line-height: ${baseTimeLineHeight * ratio}px;
    --date-font-size: ${baseDateFontSize * ratio}px;
    --operator-icon-size: ${baseOperatorIconSize * ratio}px;
  `;
};

export const cssVariables = {
  spacing: `var(--space, ${baseSpacing}px)`,
  fontSize: `var(--font-size, ${baseFontSize}px)`,
  lineHeight: `var(--line-height, ${baseLineHeight}px)`,
  timeFontSize: `var(--time-font-size, ${baseTimeFontSize}px)`,
  timeLineHeight: `var(--time-line-height, ${baseTimeLineHeight}px)`,
  dateFontSize: `var(--date-font-size, ${baseDateFontSize}px)`,
  operatorIconSize: `var(--operator-icon-size, ${baseOperatorIconSize}px)`,
};

export default defineSizeCSSVariables;
