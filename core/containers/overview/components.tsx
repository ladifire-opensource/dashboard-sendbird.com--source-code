import { ComponentProps, FC, MouseEventHandler, useRef } from 'react';
import { useIntl } from 'react-intl';
import { PopperProps } from 'react-popper';

import styled, { css, SimpleInterpolation } from 'styled-components';

import {
  Body,
  Button,
  cssVariables,
  Headings,
  Icon,
  Tooltip,
  TooltipProps,
  TooltipRef,
  TooltipVariant,
  transitionDefault,
} from 'feather';

import { DATA_VIZ_COLORS } from '@ui';

const Title = styled.div<{ $color?: string; $isHidden: boolean }>`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
  transition: color 0.2s ${transitionDefault};
  display: flex;
  align-items: center;

  &:before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 4px;
    margin-right: 8px;
    background: ${({ $color, $isHidden }) =>
      $isHidden ? cssVariables('neutral-5') : $color || cssVariables('purple-7')};
  }
`;

const Value = styled.div`
  ${Headings['heading-05']}
  padding: 0 0 0 16px;
  height: 32px;
`;

const Metric = styled.div<{ isHidden: boolean; isLegend: boolean }>`
  min-width: 144px;
  transition: background 0.2s ${transitionDefault};

  & + & {
    margin-left: 32px;
  }
  ${({ isLegend }) => (isLegend ? 'cursor: pointer;' : '')}
  ${({ isHidden }) =>
    isHidden
      ? css`
          ${Value} {
            color: ${cssVariables('neutral-5')};
            &:before {
              background: ${cssVariables('neutral-5')};
            }
          }
        `
      : ''}

  .metric__tooltip {
    display: inline-flex;
    width: 100%;

    & + div[role='tooltip'] {
      left: 12px !important;
    }
  }
`;

type OverviewTooltipProps = {
  className?: string;
  tooltipContent: string;
  tooltipContentStyle?: SimpleInterpolation;
  popperProps?: TooltipProps['popperProps'];
  placement?: PopperProps['placement'];
};

const TooltipTargetWrapper = styled.div``;

export const OverviewTooltip: FC<OverviewTooltipProps> = ({
  children,
  className,
  tooltipContent,
  tooltipContentStyle,
  popperProps,
  placement = 'bottom-start',
}) => {
  const tooltipRef = useRef<TooltipRef>(null);
  const onTextMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    tooltipRef.current?.hide();
  };
  return (
    <Tooltip
      variant={TooltipVariant.Light}
      ref={tooltipRef}
      className={className}
      content={tooltipContent}
      popperProps={popperProps}
      tooltipContentStyle={css`
        max-width: 256px;
        ${Body['body-short-01']}
        ${tooltipContentStyle}
      `}
      placement={placement}
    >
      <TooltipTargetWrapper onMouseLeave={onTextMouseLeave}>{children}</TooltipTargetWrapper>
    </Tooltip>
  );
};

const StyledStatisticsMetrics = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

type Props = {
  metrics: { title: string; value: string; color?: string }[];
  onLegendClick?: (index: number) => ComponentProps<typeof Metric>['onClick'];
  checkIsHidden?: (index) => boolean;
};

export const StatisticsMetrics: FC<Props> = ({ metrics, onLegendClick, checkIsHidden }) => {
  const intl = useIntl();
  return (
    <StyledStatisticsMetrics role="list">
      {metrics.map(({ title, value, color }, index) => {
        const handleClick = onLegendClick ? onLegendClick(index) : undefined;
        const isHidden = checkIsHidden ? checkIsHidden(index) : false;
        return (
          <Metric
            key={`statistics_metric_${title}`}
            onClick={handleClick}
            isLegend={!!(onLegendClick || checkIsHidden)}
            isHidden={isHidden}
            role="listitem"
          >
            <Title role="term" $color={color ?? DATA_VIZ_COLORS[index]} $isHidden={isHidden}>
              {title}
            </Title>
            <OverviewTooltip
              className="metric__tooltip"
              tooltipContent={intl.formatMessage({
                id: isHidden ? 'core.overview.statistics_tooltip.show' : 'core.overview.statistics_tooltip.hide',
              })}
              placement="bottom"
            >
              <Value role="definition">{value}</Value>
            </OverviewTooltip>
          </Metric>
        );
      })}
    </StyledStatisticsMetrics>
  );
};

const ErrorViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 16px;
`;

export const ErrorView: FC<{ onRetry: () => void; isRetrying: boolean }> = ({ onRetry, isRetrying }) => {
  const intl = useIntl();
  return (
    <ErrorViewWrapper data-test-id="ErrorView">
      <ErrorMessage>{intl.formatMessage({ id: 'core.overview.errorView_title' })}</ErrorMessage>
      <Button buttonType="tertiary" icon="refresh" size="small" onClick={onRetry} isLoading={isRetrying}>
        {intl.formatMessage({ id: 'core.overview.errorView_btn.retry' })}
      </Button>
    </ErrorViewWrapper>
  );
};

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-height: 52px;

  > span {
    ${Headings['heading-05']}
    color: ${cssVariables('neutral-10')};
  }
`;

const Caption = styled.small<{ $direction: 'up' | 'down' }>`
  display: flex;
  align-items: center;
  line-height: 1.43;
  letter-spacing: -0.1px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $direction: direction }) => {
    return {
      up: cssVariables('blue-5'),
      down: cssVariables('red-5'),
    }[direction];
  }};

  svg {
    margin-right: 4px;
    fill: currentColor;
  }
`;

export const Ticker: FC<{ current: number; previous?: number }> = ({ current, previous }) => {
  const intl = useIntl();

  const renderCaption = () => {
    if (!previous) return null;

    const diff = current - previous;
    if (!diff) return null;

    const direction = diff > 0 ? 'up' : 'down';
    const percentage = diff / previous;

    const content = `${intl.formatNumber(Math.abs(diff))} (${intl.formatNumber(Math.abs(percentage), {
      style: 'percent',
    })})`;
    const label = { up: `Increased by ${content}`, down: `Decreased by ${content}` }[direction];

    return (
      <Caption $direction={direction} aria-label={label} data-test-id="TickerCaption">
        <Icon icon={{ up: 'arrow-up' as const, down: 'arrow-down' as const }[direction]} size={16} />
        {content}
      </Caption>
    );
  };

  return (
    <ValueContainer data-test-id="Ticker">
      <span data-test-id="TickerValue">{intl.formatNumber(current)}</span>
      {renderCaption()}
    </ValueContainer>
  );
};
