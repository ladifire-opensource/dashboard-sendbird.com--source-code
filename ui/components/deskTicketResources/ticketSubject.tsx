import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { Tooltip, TooltipTrigger, TooltipRef, cssVariables, transitionDefault } from 'feather';

import { SocialIntegrationIcon } from '../socialIntegrationIcon';

const MARGIN_BETWEEN_TEXT_AND_ICON = 6;

const SubjectName = styled.div`
  width: 100%;

  &:hover {
    svg {
      fill: ${cssVariables('purple-7')};
    }
  }
`;

const FullMessageTooltip = styled(Tooltip)`
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledSocialIntegrationIcon = styled(SocialIntegrationIcon)``;

const SubjectLink = styled(Link)`
  display: inline-block;
  max-width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ${transitionDefault};

  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-7')};
    text-decoration: underline;
  }

  ${StyledSocialIntegrationIcon} + & {
    margin-left: ${MARGIN_BETWEEN_TEXT_AND_ICON}px;
  }
`;

type Props = {
  ticket: Ticket;
  subjectLinkTo?: string;
  isAgent?: boolean;
};

export const TicketSubject = React.memo<Props>(({ ticket, subjectLinkTo, isAgent }) => {
  const { data: application } = useSelector((state: RootState) => state.applicationState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<TooltipRef | null>();

  const handleTooltipRef = (ref: TooltipRef) => {
    tooltipRef.current = ref;
  };

  const handleMessageMouseEnter: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (tooltipRef.current == null) {
      return;
    }
    const iconWidth = event.currentTarget.previousElementSibling?.clientWidth ?? 0;
    const containerWidth = containerRef.current?.clientWidth ?? 0;

    const maxTextWidth = containerWidth - iconWidth - MARGIN_BETWEEN_TEXT_AND_ICON;
    const currentTextWidth = event.currentTarget.clientWidth;
    const isOverflowed = currentTextWidth >= maxTextWidth;

    if (isOverflowed) {
      tooltipRef.current.show();
    }
  };

  const handleMessageMouseLeave: React.MouseEventHandler<HTMLAnchorElement> = () => {
    if (tooltipRef.current == null) {
      return;
    }
    tooltipRef.current.hide();
  };

  return (
    <SubjectName ref={containerRef}>
      <FullMessageTooltip
        trigger={TooltipTrigger.Manual}
        ref={handleTooltipRef}
        content={ticket.channelName}
        placement="top"
        popperProps={{
          modifiers: { preventOverflow: { boundariesElement: 'viewport' } },
        }}
      >
        <StyledSocialIntegrationIcon ticket={ticket} />
        <SubjectLink
          to={subjectLinkTo || `/${application?.app_id}/desk/${isAgent ? 'conversation' : 'tickets'}/${ticket.id}`}
          onMouseEnter={handleMessageMouseEnter}
          onMouseLeave={handleMessageMouseLeave}
        >
          {ticket.channelName}
        </SubjectLink>
      </FullMessageTooltip>
    </SubjectName>
  );
});
