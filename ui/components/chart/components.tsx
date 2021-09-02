import React, { useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, elevation, Headings, Icon, Subtitles, Tooltip, transitionDefault } from 'feather';
import numbro from 'numbro';

import { Stars } from '@ui/components/stars';

export const ChartTitle = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
`;

const StyledChartValue = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  padding-left: 16px;
  position: relative;
  height: 24px;
  &:before {
    position: absolute;
    content: '';
    top: 8px;
    right: 0;
    left: 0;
    bottom: 0;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: ${({ color }) => color};
  }
  .chartValue {
    &__label {
      font-size: 14px;
      line-height: 20px;
      margin-right: 4px;
      letter-spacing: -0.1px;
      color: ${cssVariables('neutral-7')};
    }
    &__value {
      ${Subtitles['subtitle-03']}
      color: ${cssVariables('neutral-10')};
    }
  }
`;

const ChartValueDiff = styled.div<{ isUp: boolean }>`
  display: flex;
  align-items: center;
  ${({ isUp }) =>
    isUp
      ? css`
          color: ${cssVariables('blue-5')};
          svg {
            fill: ${cssVariables('blue-5')};
          }
        `
      : css`
          color: ${cssVariables('red-5')};
          svg {
            fill: ${cssVariables('red-5')};
          }
        `}
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  line-height: 20px;
  margin-left: 4px;
  svg {
    margin-right: 4px;
  }
`;

type ChartValueProps = PropsWithTestId<{
  label?: string;
  value?: number | string;
  previousValue?: number;
  tooltipMessage?: string;
  format?: string | Function;
  color?: string;
}>;

const getPercentage = (previous, current) => {
  return parseInt(Math.abs(((current - previous) / previous) * 100).toFixed(1), 10);
};

export const ChartValue: React.FC<ChartValueProps> = ({
  label = '',
  value,
  format = '',
  color = cssVariables('purple-7'),
  previousValue,
  tooltipMessage,
  testId,
}) => {
  const getDiff = () => {
    if (value && previousValue) {
      const percentage = getPercentage(previousValue, value);
      if (percentage > 0) {
        const isUp = previousValue <= value;
        const icon = isUp ? 'arrow-up' : 'arrow-down';
        const diff = (value as number) - previousValue;
        const formattedDiff = typeof format === 'string' ? numbro(diff).format(format) : format(diff);

        const content = (
          <ChartValueDiff isUp={isUp}>
            <Icon icon={icon} size={16} />
            {formattedDiff} ({Math.abs(percentage)}%)
          </ChartValueDiff>
        );

        if (tooltipMessage) {
          return (
            <Tooltip
              content={tooltipMessage}
              placement="bottom-start"
              tooltipContentStyle={css`
                display: flex;
                align-items: center;
              `}
            >
              {content}
            </Tooltip>
          );
        }
        return content;
      }
    }
    return '';
  };
  return (
    <StyledChartValue color={color}>
      {label && <div className="chartValue__label">{label}</div>}
      {value && (
        <div className="chartValue__value" data-test-id={`${testId}__value`}>
          {typeof format === 'string' ? numbro(value).format(format) : format(value)}
        </div>
      )}
      {getDiff()}
    </StyledChartValue>
  );
};

const StyledChartValueTotal = styled.div`
  position: absolute;
  top: -14px;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  .cvt {
    &__header {
      font-size: 12px;
      line-height: 16px;
      color: ${cssVariables('neutral-7')};
    }
    &__value {
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      letter-spacing: -0.1px;
      color: ${cssVariables('neutral-10')};
    }
  }
`;

type ChartValueTotalProps = {
  value: number;
};

export const ChartValueTotal: React.FC<ChartValueTotalProps> = ({ value }) => {
  const intl = useIntl();

  return (
    <StyledChartValueTotal>
      <div className="cvt__header">{intl.formatMessage({ id: 'desk.statistics.overview.messageCount.lbl.total' })}</div>
      <div className="cvt__value">{numbro(value).format('0,')}</div>
    </StyledChartValueTotal>
  );
};

const StyledChartCSATValue = styled.div`
  display: flex;
  align-items: center;
  .chartValue {
    &__value {
      margin-left: 8px;
      ${Subtitles['subtitle-03']}
      color: ${cssVariables('neutral-10')};
    }
  }
`;

type ChartCSATValueProps = {
  value: number;
};

export const ChartCSATValue: React.FC<ChartCSATValueProps> = ({ value }) => {
  return (
    <StyledChartCSATValue>
      <Stars current={value} />
      <div className="chartValue__value">{value > 0 ? value.toFixed(1) : ''}</div>
    </StyledChartCSATValue>
  );
};

export const ChartValues = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  ${StyledChartValue} + ${StyledChartValue} {
    margin-left: 24px;
  }
`;

export const ChartWrapper = styled.div`
  padding: 20px 12px;
  margin-top: 15px;
`;

const StyledTooltip = styled.div`
  position: absolute;
  z-index: 999;
  min-width: 160px;
  padding: 12px 16px;
  border-radius: 4px;
  background-color: white;
  ${elevation.popover}
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ${transitionDefault};
  transition-property: top, left;
`;

const TooltipLabel = styled.div<{ $color?: string }>`
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
  white-space: nowrap;
  display: flex;
  align-items: center;

  &:before {
    content: '';
    margin-right: 8px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: ${({ $color }) => $color || cssVariables('purple-7')};
  }
`;

const TooltipValue = styled.div`
  ${Headings['heading-04']}
  height: 28px;
  padding-left: 16px;
`;

const TooltipHeader = styled.div<{ init?: boolean }>`
  ${Subtitles['subtitle-01']}
  margin-bottom: 16px;
  ${({ init }) => init && 'opacity: 0;'}
  white-space: nowrap;
`;

const TooltipPoint = styled.div`
  & + & {
    margin-top: 12px;
  }
`;

type TooltipProps = {
  canvas: HTMLCanvasElement | null;
  tooltip: Chart.ChartTooltipModel; // typing missing
  datasets: Chart.ChartDataSets[];
  xLabelFormatter?(tooltipItem: Chart.ChartTooltipItem): React.ReactNode;
  valueFormatter?(tooltipItem: Chart.ChartTooltipItem): React.ReactNode;
  colors: readonly string[];
};

export const CustomTooltip: React.FC<TooltipProps> = ({
  canvas,
  tooltip,
  datasets,
  xLabelFormatter,
  valueFormatter,
  colors,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  if (tooltip && canvas) {
    const position = canvas.getBoundingClientRect() as DOMRect;
    let tooltipWidth = 160;
    let tooltipHeight = 86;
    if (tooltipRef.current) {
      tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
      tooltipHeight = tooltipRef.current.getBoundingClientRect().height;
    }
    return (
      <StyledTooltip
        ref={tooltipRef}
        style={{
          opacity: tooltip.opacity,
          top: tooltip.caretY - (tooltipHeight + 48) < 0 ? 48 : tooltip.caretY - (tooltipHeight + 48),
          left: tooltip.caretX > position.width / 2 ? tooltip.caretX - tooltipWidth - 10 : tooltip.caretX + 10,
        }}
      >
        {tooltip.dataPoints && tooltip.dataPoints.length > 0 ? (
          <TooltipHeader>{xLabelFormatter?.(tooltip.dataPoints[0]) ?? tooltip.dataPoints[0].label}</TooltipHeader>
        ) : (
          <TooltipHeader init={true} />
        )}
        {tooltip && tooltip.dataPoints
          ? tooltip.dataPoints.map((point: Chart.ChartTooltipItem) => {
              const { value, datasetIndex } = point;
              if (datasetIndex == null) {
                return (
                  <TooltipPoint key={datasetIndex}>
                    <TooltipValue>
                      {valueFormatter?.(point) ?? numbro(value).format({ thousandSeparated: true, mantissa: 0 })}
                    </TooltipValue>
                  </TooltipPoint>
                );
              }
              return (
                <TooltipPoint key={datasetIndex}>
                  <TooltipLabel $color={colors[datasetIndex]}>{datasets[datasetIndex].label}</TooltipLabel>
                  <TooltipValue>
                    {valueFormatter?.(point) ?? numbro(value).format({ thousandSeparated: true, mantissa: 0 })}
                  </TooltipValue>
                </TooltipPoint>
              );
            })
          : ''}
      </StyledTooltip>
    );
  }
  return null;
};

type DoughnutTooltipProps = {
  canvas: HTMLCanvasElement | null;
  chart: Chart | undefined;
  labels: string[];
  values: readonly number[];
  tooltipItems?: {
    label: string;
    valueFormatter?: (value: number, values: readonly number[], hiddenLegends?: number[]) => number | string;
    color?: string;
  }[];
  tooltip: any;
  hiddenLegends?: number[];
};

export const DoughnutCustomTooltip: React.FC<DoughnutTooltipProps> = ({
  canvas,
  chart,
  tooltip,
  tooltipItems,
  labels,
  values,
  hiddenLegends,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  if (tooltip && tooltip.dataPoints && canvas && chart) {
    const position = canvas.getBoundingClientRect() as DOMRect;
    let tooltipWidth = 160;
    let tooltipHeight = 86;
    if (tooltipRef.current) {
      tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
      tooltipHeight = tooltipRef.current.getBoundingClientRect().height;
    }
    const dataIndex = tooltip.dataPoints[0].index;
    const value = values[dataIndex];
    return (
      <StyledTooltip
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: tooltip.opacity,
          top: tooltip.caretY - (tooltipHeight + 48) < 0 ? 48 : tooltip.caretY - (tooltipHeight + 48),
          left: tooltip.caretX < position.width / 2 ? tooltip.caretX - tooltipWidth : tooltip.caretX,
        }}
      >
        <TooltipHeader>{labels[dataIndex]}</TooltipHeader>
        {tooltipItems &&
          tooltipItems.map(({ label, valueFormatter, color }, index) => {
            return (
              <TooltipPoint key={index}>
                <TooltipLabel $color={color}>{label}</TooltipLabel>
                <TooltipValue>{valueFormatter ? valueFormatter(value, values, hiddenLegends) : value}</TooltipValue>
              </TooltipPoint>
            );
          })}
      </StyledTooltip>
    );
  }
  return null;
};
