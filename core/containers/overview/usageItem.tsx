import { FC } from 'react';

import styled from 'styled-components';

import { cssVariables, TooltipTargetIcon } from 'feather';

import { OverviewTooltip, Ticker } from './components';

const UsageLabel = styled.div`
  margin-top: 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.33;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
`;

const UsageDescription = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-7')};
  margin-top: 4px;
  line-height: 1.43;
  letter-spacing: -0.1px;
`;

const ColumnItem = styled.div``;

const StyledUsageItem = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  grid-column-gap: 32px;
  flex: 1;
  padding: 20px 24px;
  position: relative;
  background-color: white;
  border: 1px solid ${cssVariables('neutral-3')};
  min-height: 96px;

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  & + & {
    border-top: 0;
    border-radius: 0;
  }
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const UsageItem: FC<Usage> = ({ label, data, tooltip, description }) => {
  const current = (() => {
    if (!data) return;
    if ('value' in data) return data.value;
    if ('current' in data) return data.current;
  })();

  const previous = data && 'previousValue' in data ? data.previousValue : undefined;

  return (
    <StyledUsageItem data-test-id="UsageItem">
      <ColumnItem>
        <UsageLabel data-test-id="UsageLabel">
          {label}
          {tooltip && (
            <OverviewTooltip className="usage__tooltip" tooltipContent={tooltip}>
              <TooltipTargetIcon icon="info" size={16} />
            </OverviewTooltip>
          )}
        </UsageLabel>
        {description && <UsageDescription>{description}</UsageDescription>}
      </ColumnItem>
      {typeof current === 'number' && <Ticker current={current} previous={previous} />}
    </StyledUsageItem>
  );
};
