import React from 'react';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';

import { getTicketSocialType } from '@utils';

Icon.displayName = 'Icon';

const IconWrapper = styled.i`
  display: inline-block;
  width: 16px;
  height: 16px;

  & > svg {
    flex: none;
  }
`;

type Props = {
  ticket: Ticket;
  className?: string;
};

export const SocialIntegrationIcon = React.memo<Props>(({ ticket, className }) => {
  let iconNode: React.ReactElement | null;

  switch (getTicketSocialType(ticket.channelType)) {
    case 'facebook':
      iconNode = <Icon icon="facebook" size={16} color={cssVariables('neutral-6')} data-test-id="FacebookIcon" />;
      break;
    case 'twitter':
      iconNode = <Icon icon="twitter" size={16} color={cssVariables('neutral-6')} data-test-id="TwitterIcon" />;
      break;
    case 'instagram':
      iconNode = <Icon icon="instagram" size={16} color={cssVariables('neutral-6')} data-test-id="InstagramIcon" />;
      break;
    case 'whatsapp':
      iconNode = <Icon icon="whatsapp" size={16} color={cssVariables('neutral-7')} data-test-id="WhatsAppIcon" />;
      break;
    default:
      iconNode = null;
      break;
  }
  return iconNode ? <IconWrapper className={className}>{iconNode}</IconWrapper> : null;
});
