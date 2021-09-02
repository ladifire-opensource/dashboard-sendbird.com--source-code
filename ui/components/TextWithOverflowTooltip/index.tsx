import React, { useRef } from 'react';

import styled, { SimpleInterpolation } from 'styled-components';

import { Tooltip, TooltipTrigger, TooltipProps, TooltipRef } from 'feather';

const FullMessageTooltip = styled(Tooltip)<{ $display?: string; $styles?: SimpleInterpolation }>`
  display: ${({ $display }) => $display || 'block'};
  max-width: 100%;
  font-size: 0;
  overflow: hidden;
  ${({ $styles }) => $styles};
`;

const Text = styled.span`
  max-width: 100%;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TooltipContentWrapper = styled.div`
  word-break: break-word;
`;

type Props = {
  className?: string;
  tooltipDisplay?: string;
  tooltipContent?: TooltipProps['content'];
  tooltipStyle?: SimpleInterpolation;
  children?: React.ReactNode;
  testId?: string;
};

export const TextWithOverflowTooltip = React.memo<Props>(
  ({ className, tooltipDisplay, tooltipContent, tooltipStyle, children, testId }) => {
    const tooltipRef = useRef<TooltipRef>(null);

    const handleMessageMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (event) => {
      if (tooltipRef.current == null) {
        return;
      }
      const isOverflowed = event.currentTarget.clientWidth < event.currentTarget.scrollWidth;

      if (isOverflowed) {
        tooltipRef.current.show();
      }
    };

    const handleMessageMouseLeave: React.MouseEventHandler<HTMLSpanElement> = () => {
      if (tooltipRef.current == null) {
        return;
      }

      tooltipRef.current.hide();
    };

    return (
      <FullMessageTooltip
        portalId="portal_tooltip"
        trigger={TooltipTrigger.Manual}
        ref={tooltipRef}
        content={<TooltipContentWrapper>{tooltipContent || children}</TooltipContentWrapper>}
        placement="top"
        $display={tooltipDisplay}
        $styles={tooltipStyle}
      >
        <Text
          className={className}
          onMouseEnter={handleMessageMouseEnter}
          onMouseLeave={handleMessageMouseLeave}
          data-test-id={testId || 'TextInOverflowTooltip'}
        >
          {children}
        </Text>
      </FullMessageTooltip>
    );
  },
);
