import React, { FC, useMemo, useRef, ReactNode, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { Manager, Reference, Popper } from 'react-popper';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  transitionDefault,
  Lozenge,
  LozengeVariant,
  Body,
  Headings,
  Subtitles,
  Typography,
  CSSVariableKey,
} from 'feather';
import merge from 'lodash/merge';

import { getTransformedUsage, transformBytesToGigaByte } from '@utils';

import { UsageAlertIcon } from './UsageAlertIcon';
import { UsagePercent } from './UsagePercent';
import { Availability, AvailabilityColor, UsageNumbers, UsageVariant } from './types';
import { UsageTooltip } from './usageTooltip';
import { useUsageTooltipPosition } from './useUsageTooltipPosition';
import {
  getAvailabilityColor,
  getCalculatedUsageData,
  getUsageUnitAndSuffixIntlData,
  useAvailabilityTooltipMessages,
} from './utils';

type UsageProps = {
  mainColor: AvailabilityColor;
  backgroundColor: CSSVariableKey;
  variant: UsageVariant;
  showPercent: boolean;
};
type UsageTooltipItems = ComponentProps<typeof UsageTooltip>['items'];

const STYLE_EXCEPTION_COLORS = ['data-viz-1', 'content-1'];

const UsageWrapper = styled.div`
  position: relative;
`;

const UsageLabel = styled.div`
  display: flex;
  align-items: center;
`;

const UsageLabelText = styled.label`
  margin: 0;
  display: flex;
  align-items: center;
`;

const UsageLabelNumber = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const UsageBarWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 4px;
`;

const UsageBackground = styled.div`
  width: 100%;
  background: ${cssVariables('neutral-2')};

  * {
    pointer-events: none;
  }
`;

const UsageBar = styled.div<{ color: string; usage: number; isOthers?: boolean }>`
  position: absolute;
  top: 0;
  width: ${({ usage }) => (usage > 0 && usage < 0.2 ? 0.2 : usage)}%;
  background: ${({ color }) => color};
  transition: width 0.2s ${transitionDefault};
`;

const UsageMarker = styled.div<{ value: number }>`
  position: absolute;
  left: ${({ value }) => `calc(${value}% - 2.5px)`};
  width: 5px;
  height: 5px;
  border-radius: 2.5px;
`;

const UsageMarkerNumber = styled.div`
  margin-top: 4px;
`;

const LegendWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
  width: 100%;
`;

const LegendUsed = styled.div`
  display: flex;
  align-items: flex-end;
  flex: 1;
`;
const LegendUsedValue = styled.strong<{ $color: string }>`
  display: inline-block;
  margin-right: 4px;
  ${Headings['heading-06']};
  line-height: 0.9;
  color: ${({ $color }) => $color};
`;
const LegendUsedUnit = styled.span`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('content-1')};
`;

const LegendInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: auto;
`;

const LegendUsage = styled.div<{ $color: string }>`
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 16px;

  &:before {
    position: absolute;
    content: '';
    left: 0;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: ${({ $color }) => $color};
    transition: background 0.2s ${transitionDefault};
  }
  & + & {
    margin-left: 24px;
  }

  .usageLegend__label {
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-7')};
  }
  .usageLegend__value {
    margin-left: 8px;
    ${Headings['heading-01']};
    color: ${cssVariables('neutral-10')};
  }
`;

const UsageName = styled.div<{ $color: CSSVariableKey }>`
  ${Typography['label-03']};
  margin-bottom: 4px;
  font-weight: 600;
  color: ${({ $color }) =>
    STYLE_EXCEPTION_COLORS.includes($color) ? cssVariables('neutral-10') : cssVariables($color)};
`;

const UsageBarRange = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`;

const UsageBarRangeStyle = css`
  display: flex;
  font-size: 12px;
  font-weight: 400;
  color: ${cssVariables('content-3')};
`;

const UsageBarRangeStart = styled.div`
  ${UsageBarRangeStyle};
`;

const UsageBarRangeEnd = styled.div`
  ${UsageBarRangeStyle};
  justify-content: flex-end;
`;

const StyledUsage = styled.div<UsageProps>`
  & + & {
    margin-top: 16px;
    ${({ variant }) => {
      if (variant === 'compact' || variant === 'mini') {
        return css``;
      }
      return css`
        margin-top: 30px;
      `;
    }}
  }

  ${({ variant, showPercent }) => {
    if (variant === 'mini') {
      return css`
        display: grid;
        grid-template-columns: ${showPercent ? '80px 1fr' : '1fr'};
        width: 100%;
        max-width: 400px;
      `;
    }
  }}

  .qi__tooltip {
    ${({ variant }) => {
      if (variant === 'default') {
        return css`
          margin-left: 4px;
        `;
      }
    }}
  }

  /* childrens */
  ${UsageWrapper} {
    ${({ variant, showPercent }) => {
      if (variant === 'mini' && showPercent) {
        return css`
          padding: 0 16px 0 0;
        `;
      }
    }}
  }

  ${UsageLabel} {
    ${({ backgroundColor, variant }) => {
      if (variant === 'mini') {
        return css`
          color: ${cssVariables(backgroundColor)};
          font-size: 11px;
          line-height: 11px;
          margin-bottom: 4px;
        `;
      }
      return css`
        color: ${cssVariables('neutral-10')};
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      `;
    }}
  }

  ${UsageLabelText} {
    ${({ backgroundColor, variant }) => {
      if (variant === 'mini') {
        return css`
          color: ${STYLE_EXCEPTION_COLORS.includes(backgroundColor)
            ? cssVariables('neutral-10')
            : cssVariables(backgroundColor)};
          font-size: 11px;
          line-height: 11px;
          font-weight: ${STYLE_EXCEPTION_COLORS.includes(backgroundColor) ? 400 : 600};
        `;
      }
      return css`
        color: ${cssVariables('neutral-10')};
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      `;
    }}
  }
  ${UsageLabelNumber} {
    ${({ variant }) => {
      if (variant === 'mini') {
        return css`
          font-size: 11px;
          line-height: 11px;
          color: ${cssVariables('neutral-7')};
        `;
      }
      return css`
        color: ${cssVariables('neutral-10')};
        font-size: 12px;
        font-weight: 500;
        line-height: 24px;
        height: 24px;
      `;
    }}
  }

  ${UsageBarWrapper} {
    ${({ variant }) => {
      if (variant === 'mini' || variant === 'medium') {
        return css``;
      }

      if (variant === 'compact') {
        return css`
          height: 38px;
        `;
      }

      return css`
        height: 63px;
      `;
    }}
  }
  ${UsageBackground}, ${UsageBar} {
    ${({ variant }) => {
      if (variant === 'mini' || variant === 'compact') {
        return css`
          height: 6px;
        `;
      }

      if (variant === 'medium') {
        return css`
          height: 20px;
        `;
      }

      return css`
        height: 32px;
      `;
    }}
  }

  ${UsageBarRange} {
    ${({ variant }) => {
      if (variant === 'mini' || variant === 'compact') {
        return css`
          margin-top: 0px;
        `;
      }

      return css`
        margin-top: 8px;
      `;
    }}
  }

  ${UsageMarker} {
    top: ${({ variant }) => (variant === 'compact' ? 10 : 34)}px;
    background: ${({ mainColor }) => cssVariables([mainColor, 5])};
    &:before {
      position: absolute;
      content: '';
      width: 1px;
      height: ${({ variant }) => (variant === 'compact' ? 10 : 36)}px;
      top: -${({ variant }) => (variant === 'compact' ? 10 : 34)}px;
      left: 2px;
      background: ${({ backgroundColor }) => cssVariables(backgroundColor)};
    }
  }
`;

const TooltipNumber = styled.span`
  ${Headings['heading-04']}

  small {
    margin-left: 4px;
    ${Typography['label-02']}
  }
`;

type UsageLegendLabel = {
  usage?: string;
  others?: string;
  remains?: string;
};

type UsageLegendValue = {
  usage: number;
  others?: number;
  quota: number;
  limit?: number;
  remains: number;
};

type UsagePercentage = {
  usage: number;
  others: number;
  remains: number;
};

type UsageColor = ReturnType<typeof getAvailabilityColor>;

type Props = UsageNumbers & {
  className?: string;
  /**
   * If unit='gigabyte', usages values (defined in `UsageNumbers` type) are converted into gigabytes and appended with
   * GB unit to be displayed on UI.
   */
  usageField?: FeatureUsageField;
  unitType?: 'gigabyte' | '';
  name?: string;
  label: React.ReactNode;
  labelNumber?: React.ReactNode | 'default';
  labelNumberSuffix?: string;
  quotaLabel?: string;
  variant?: UsageVariant;
  availabilityTooltips?: Partial<{
    warning: ReactNode;
    over: ReactNode;
    willStop: ReactNode;
    stopped: ReactNode;
  }>;
  color?: UsageColor;
  showTooltip?: boolean;
  tooltipLabels?: {
    usage: string;
    others?: string;
    remains: string;
  };
  tooltipMantissa?: number;
  markerSuffix?: string;
  showLegends?: boolean;
  legendLabels?: UsageLegendLabel;
  showPercent?: boolean;
  showAlert?: boolean;
  showMarker?: boolean;
  showBarChartRange?: boolean;
  showUsedValueLegend?: boolean;
  description?: ReactNode;
};

const defaultLegendLabels = {
  usage: 'Usage',
  others: 'Others',
  remains: 'Remains',
};

const Legend: FC<{
  usageField?: FeatureUsageField;
  labels: UsageLegendLabel;
  percentages: UsagePercentage;
  values: UsageLegendValue;
  colors: UsageColor;
  showUsedValue?: boolean;
}> = ({ usageField, labels, percentages, values, colors, showUsedValue = false }) => {
  const intl = useIntl();
  const { usage, others, remains } = values;
  const { usage: usagePercent, others: othersPercent, remains: remainsPercent } = percentages;
  const { usage: usageLabel, others: othersLabel, remains: remainsLabel } = labels;
  const usedValue = getTransformedUsage(usage, Math.floor, 1);

  const { unit: unitIntlKey, suffix: suffixIntlKey } = getUsageUnitAndSuffixIntlData({
    usageField,
  });
  const valueWithUnitLabel = unitIntlKey
    ? intl.formatMessage(
        { id: unitIntlKey },
        {
          strong: () => <LegendUsedValue $color={cssVariables(colors.background)}>{usedValue}</LegendUsedValue>,
          value: parseInt(usedValue.toString()),
        },
      )
    : null;
  const suffixLabel = suffixIntlKey ? intl.formatMessage({ id: suffixIntlKey }) : null;

  return (
    <LegendWrapper className="UsageLegends" data-test-id="UsageLegend">
      {showUsedValue && (
        <LegendUsed>
          <LegendUsedUnit>
            {valueWithUnitLabel} {suffixLabel}
          </LegendUsedUnit>
        </LegendUsed>
      )}
      <LegendInfo>
        <LegendUsage $color={cssVariables(colors.background)}>
          <dt className="usageLegend__label">{usageLabel}</dt>
          <dd className="usageLegend__value">
            {getTransformedUsage(usage, Math.floor)} ({getTransformedUsage(usagePercent, Math.floor, 1)}%)
          </dd>
        </LegendUsage>
        {!!others && (
          <LegendUsage $color={cssVariables(colors.secondaryBackground)}>
            <dt className="usageLegend__label">{othersLabel}</dt>
            <dd className="usageLegend__value">
              {getTransformedUsage(others, Math.floor)} ({getTransformedUsage(othersPercent, Math.floor, 1)}%)
            </dd>
          </LegendUsage>
        )}
        <LegendUsage $color={cssVariables('neutral-2')}>
          <dt className="usageLegend__label">{remainsLabel}</dt>
          <dd className="usageLegend__value">
            {getTransformedUsage(remains, Math.ceil)} ({getTransformedUsage(remainsPercent, Math.ceil, 1)}%)
          </dd>
        </LegendUsage>
      </LegendInfo>
    </LegendWrapper>
  );
};

export const Usage: FC<Props> = ({
  className,
  usageField,
  unitType: unit,
  name = '',
  label = '',
  labelNumber,
  labelNumberSuffix,
  usage = 0,
  others,
  quota = 0,
  limit,
  variant = 'default',
  markerSuffix = '',
  availabilityTooltips: definedAvailabilityTooltips,
  showTooltip = false,
  tooltipLabels,
  tooltipMantissa,
  showLegends = false,
  legendLabels = defaultLegendLabels,
  showPercent = false,
  showAlert = false,
  showMarker = false,
  showBarChartRange = false,
  description,
  color: customColor,
  showUsedValueLegend = false,
}) => {
  const { remains, usagePercent, othersPercent, remainsPercent, totalPercent, availability } = getCalculatedUsageData({
    usage,
    others,
    quota,
    limit,
  });
  const availabilityTooltips = useAvailabilityTooltipMessages(definedAvailabilityTooltips);

  const colors = customColor ?? getAvailabilityColor(availability);
  const {
    main: mainColor,
    content: contentColor,
    background: backgroundColor,
    secondaryBackground: secondaryBackgroundColor,
  } = colors;
  const usageColor = cssVariables(backgroundColor);
  const othersColor = cssVariables(secondaryBackgroundColor);

  const unitConvertedValues = useMemo(() => {
    if (unit === 'gigabyte') {
      return {
        usage: transformBytesToGigaByte(usage),
        others: others && transformBytesToGigaByte(others),
        quota: transformBytesToGigaByte(quota),
        limit: limit && transformBytesToGigaByte(limit),
        remains: transformBytesToGigaByte(remains),
      };
    }
    return { usage, others, quota, limit, remains };
  }, [limit, others, quota, remains, unit, usage]);

  const { chartElementProps, containerRef, tooltipRef, setScheduleUpdate } = useUsageTooltipPosition();

  const drawLegend = useMemo(() => {
    const mergedLegendLabels = merge(defaultLegendLabels, legendLabels);
    return (
      <Legend
        usageField={usageField}
        values={unitConvertedValues}
        labels={mergedLegendLabels}
        percentages={{ usage: usagePercent, others: othersPercent, remains: remainsPercent }}
        colors={colors}
        showUsedValue={showUsedValueLegend}
      />
    );
  }, [
    legendLabels,
    usageField,
    unitConvertedValues,
    usagePercent,
    othersPercent,
    remainsPercent,
    colors,
    showUsedValueLegend,
  ]);

  const renderUsageTooltip = () => {
    const { usage, others, remains } = unitConvertedValues;
    const usageTooltipItems = [
      {
        label: tooltipLabels?.usage || '',
        content: (
          <TooltipNumber>
            {getTransformedUsage(usage, undefined, tooltipMantissa)}
            <small>({getTransformedUsage(usagePercent)}%)</small>
          </TooltipNumber>
        ),
        color: usageColor,
      },
      others != null && {
        label: tooltipLabels?.others || '',
        content: (
          <TooltipNumber>
            {getTransformedUsage(others, undefined, tooltipMantissa)}
            <small>({getTransformedUsage(othersPercent)}%)</small>
          </TooltipNumber>
        ),
        color: othersColor,
      },
      {
        label: tooltipLabels?.remains || '',
        content: (
          <TooltipNumber>
            {getTransformedUsage(remains, Math.ceil, tooltipMantissa)}
            <small>({getTransformedUsage(remainsPercent, Math.ceil)}%)</small>
          </TooltipNumber>
        ),
        color: cssVariables('neutral-3'),
      },
    ].filter(Boolean) as UsageTooltipItems;

    return (
      <Popper
        placement="right"
        positionFixed={true}
        modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false }, flip: { enabled: false } }}
        innerRef={tooltipRef}
      >
        {({ ref, style, placement, scheduleUpdate }) => {
          setScheduleUpdate(scheduleUpdate);
          return (
            <UsageTooltip
              ref={ref}
              style={{ ...style, opacity: 0 }}
              data-placement={placement}
              data-is-tooltip="true"
              items={usageTooltipItems}
            />
          );
        }}
      </Popper>
    );
  };

  const drawUsage = useMemo(() => {
    return <UsageBar color={usageColor} usage={Math.min(usagePercent, 100)} />;
  }, [usagePercent, usageColor]);

  const drawOthers = useMemo(() => {
    if (typeof others !== 'undefined') {
      return <UsageBar color={othersColor} usage={Math.min(totalPercent, 100)} isOthers={true} />;
    }
    return null;
  }, [others, othersColor, totalPercent]);

  const markerPlacement = useMemo(() => {
    if (usagePercent === 0) {
      return 'bottom-start';
    }
    if (usagePercent >= 100) {
      return 'bottom-end';
    }
    return 'bottom';
  }, [usagePercent]);

  const markerBoundaryRef = useRef<HTMLDivElement>(null);

  const drawMarker = useMemo(
    () => (
      <Manager>
        <Reference>{({ ref }) => <UsageMarker ref={ref} value={Math.min(usagePercent, 100)} />}</Reference>
        <Popper
          placement={markerPlacement}
          positionFixed={false}
          modifiers={{
            hide: { enabled: false },
            preventOverflow: { enabled: true, padding: 0, boundariesElement: markerBoundaryRef.current ?? undefined },
            flip: { enabled: false },
          }}
        >
          {({ ref, style }) => (
            <UsageMarkerNumber ref={ref} style={style} data-test-id="UsageMarker">
              <Lozenge color={mainColor} variant={LozengeVariant.Dark}>
                {`${getTransformedUsage(Math.round(unitConvertedValues.usage))}${markerSuffix}`}
              </Lozenge>
            </UsageMarkerNumber>
          )}
        </Popper>
      </Manager>
    ),
    [mainColor, markerPlacement, markerSuffix, unitConvertedValues.usage, usagePercent],
  );

  const shouldShowAlert = showAlert && availability !== Availability.available;

  return (
    <StyledUsage
      className={className}
      mainColor={mainColor}
      backgroundColor={contentColor}
      variant={variant}
      showPercent={showPercent}
      ref={containerRef}
      data-test-id="Usage"
    >
      {variant === 'mini' && showPercent && (
        <div
          css={css`
            display: flex;
            justify-content: flex-end;
            margin-right: 16px;
          `}
        >
          <UsagePercent
            usage={usage}
            others={others}
            quota={quota}
            limit={limit}
            variant={variant}
            availabilityTooltips={availabilityTooltips}
            showAlert={showAlert}
          />
        </div>
      )}
      {showLegends && drawLegend}
      <UsageWrapper ref={markerBoundaryRef}>
        {name && <UsageName $color={backgroundColor}>{name}</UsageName>}
        {(!!label || !!labelNumber) && (
          <UsageLabel>
            <UsageLabelText data-test-id="UsageLabel">{label}</UsageLabelText>
            {!!labelNumber && (
              <UsageLabelNumber data-test-id="UsageChartCaption">
                {labelNumber === 'default' ? getTransformedUsage(unitConvertedValues.quota) : labelNumber}
                {labelNumberSuffix && ` ${labelNumberSuffix}`}
                {(variant === 'default' || variant === 'compact') && shouldShowAlert && (
                  <UsageAlertIcon
                    color={backgroundColor}
                    tooltip={availabilityTooltips[availability]}
                    placement="bottom-end"
                  />
                )}
              </UsageLabelNumber>
            )}
          </UsageLabel>
        )}
        <Manager>
          <UsageBarWrapper>
            <Reference>
              {({ ref }) => (
                <UsageBackground ref={ref} {...(showTooltip ? chartElementProps : null)}>
                  {drawOthers}
                  {drawUsage}
                  {showMarker && drawMarker}
                </UsageBackground>
              )}
            </Reference>
          </UsageBarWrapper>
          {showBarChartRange && (
            <UsageBarRange>
              <UsageBarRangeStart data-test-id="UsageBarRangeStart">0</UsageBarRangeStart>
              <UsageBarRangeEnd data-test-id="UsageBarRangeEnd">
                {getTransformedUsage(unitConvertedValues.quota)}
              </UsageBarRangeEnd>
            </UsageBarRange>
          )}
          {showTooltip && renderUsageTooltip()}
        </Manager>
        {description}
      </UsageWrapper>
    </StyledUsage>
  );
};
