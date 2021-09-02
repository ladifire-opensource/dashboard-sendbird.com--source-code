import { memo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { getTicketPriorityLabelKey } from '@utils';

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'URGENT':
      return cssVariables('red-5');
    case 'HIGH':
      return cssVariables('orange-5');
    case 'LOW':
      return cssVariables('blue-5');
    case 'MEDIUM':
    default:
      return cssVariables('green-5');
  }
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Badge = styled.div<{ color: string }>`
  background: ${(props) => props.color};
  width: 8px;
  height: 8px;
  border-radius: 2px;
`;

const Label = styled.div`
  color: inherit;
  font-size: inherit;
  margin-left: 8px;
  letter-spacing: -0.1px;
`;

type Props = {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
};

export const PriorityBadge = memo<Props>(({ className, priority, showLabel = false }) => {
  const intl = useIntl();
  return (
    <Wrapper className={className}>
      <Badge data-test-id="Badge" color={getPriorityColor(priority)} />
      {showLabel && <Label>{intl.formatMessage({ id: getTicketPriorityLabelKey(priority) })}</Label>}
    </Wrapper>
  );
});
