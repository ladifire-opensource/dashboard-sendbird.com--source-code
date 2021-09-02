import { FC, ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { TooltipTargetIcon, cssVariables, Tooltip, TooltipVariant, Spinner } from 'feather';

type Props = {
  count: number;
  showPlusSign?: boolean;
  max?: number;
  isLoading?: boolean;
  /**
   * When error is true, the color of the badge is red.
   * When error is an object, the color is red and a tooltip icon is displayed.
   */
  error?: { icon: 'warning'; message: ReactNode } | boolean;
  className?: string;
};

const ErrorIcon = {
  warning: <TooltipTargetIcon icon="warning-filled" color={cssVariables('red-5')} role="alert" />,
  error: <TooltipTargetIcon icon="error-filled" color={cssVariables('red-5')} role="alert" />,
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  cursor: initial;
`;

const Badge = styled.div<{ $color: 'neutral' | 'red' }>`
  border-radius: 10px;
  padding: 4px 8px;
  background: ${({ $color }) => ($color === 'red' ? cssVariables('red-2') : cssVariables('neutral-2'))};
  color: ${({ $color }) => ($color === 'red' ? cssVariables('red-6') : cssVariables('neutral-7'))};
  line-height: 0;

  [role='progressbar'] {
    margin: 0 6px;
  }
`;

const Count = styled.span`
  line-height: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const CountWithMax = styled.span<{ $color: 'neutral' | 'red' }>`
  line-height: 12px;
  letter-spacing: 0.25;
  font-size: 11px;
  font-weight: 400;

  b {
    font-weight: 600;
    color: ${({ $color }) => ($color === 'red' ? 'inherit' : cssVariables('neutral-9'))};
  }
`;

export const UserListCountBadge: FC<Props> = ({ count = 0, error, isLoading, className, showPlusSign, max }) => {
  const intl = useIntl();
  const errorNode =
    typeof error === 'object' ? (
      <Tooltip
        variant={TooltipVariant.Light}
        content={error.message}
        placement="bottom-end"
        tooltipContentStyle="max-width: 256px;"
        portalId="portal_tooltip"
        popperProps={{ modifiers: { offset: { offset: '21, 6' } } }}
      >
        {ErrorIcon[error.icon]}
      </Tooltip>
    ) : null;

  const color = isLoading || !error ? 'neutral' : 'red';

  const badgeContent = useMemo(() => {
    if (isLoading) {
      return <Spinner stroke="currentColor" size={12} />;
    }

    const countPart = intl.formatNumber(count) + (showPlusSign ? '+' : '');

    if (!max) {
      return <Count>{countPart}</Count>;
    }

    return (
      <CountWithMax $color={color}>
        <b>{countPart}</b> / {intl.formatNumber(max)}
      </CountWithMax>
    );
  }, [color, count, intl, isLoading, max, showPlusSign]);

  return (
    <Container
      className={className}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <Badge $color={color}>{badgeContent}</Badge>
      {errorNode}
    </Container>
  );
};
