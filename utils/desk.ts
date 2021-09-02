import { cssVariables } from 'feather';

import { TicketStatus, AgentConnection, SortOrder } from '@constants';

import { TicketPriority } from '../constants/desk';
import { AgentActivationStatusValue } from './../constants/desk';

export type TicketStatusString = 'PENDING' | 'ACTIVE' | 'IDLE' | 'IN PROGRESS' | 'CLOSED' | 'PROACTIVE' | 'INITIALIZED';

export const getTicketStatus2 = (ticketStatus: TicketStatus) => {
  const allTicketStatus = [
    TicketStatus.PENDING,
    TicketStatus.ACTIVE,
    TicketStatus.IDLE,
    TicketStatus.WIP,
    TicketStatus.CLOSED,
  ];
  switch (ticketStatus) {
    case TicketStatus.ALL: {
      return allTicketStatus;
    }

    default:
      return ticketStatus;
  }
};

export const getColorByConnection = (connection) => {
  switch (connection) {
    case AgentConnection.ONLINE:
      return cssVariables('green-5');

    case AgentConnection.OFFLINE:
      return cssVariables('neutral-5');

    case AgentConnection.AWAY:
      return cssVariables('orange-6');

    default:
      return cssVariables('neutral-10');
  }
};

export const getTicketStatusLabelKey = (ticketStatus: Ticket['status2']) => {
  switch (ticketStatus) {
    case TicketStatus.PENDING:
      return 'ui.ticketStatus.pending';
    case TicketStatus.ACTIVE:
      return 'ui.ticketStatus.active';
    case TicketStatus.IDLE:
      return 'ui.ticketStatus.idle';
    case TicketStatus.WIP:
      return 'ui.ticketStatus.wip';
    case TicketStatus.CLOSED:
      return 'ui.ticketStatus.closed';
    case TicketStatus.PROACTIVE:
      return 'ui.ticketStatus.proactive';
    default:
      return 'ui.ticketStatus.init';
  }
};

export const getTicketPriorityLabelKey = (priority: Priority) => {
  switch (priority) {
    case TicketPriority.URGENT:
      return 'ui.priority.urgent';
    case TicketPriority.HIGH:
      return 'ui.priority.high';
    case TicketPriority.MEDIUM:
      return 'ui.priority.medium';
    case TicketPriority.LOW:
      return 'ui.priority.low';
    default:
      return undefined;
  }
};

export const getAgentStatusLabelKey = (status: AgentActivationStatusValue) => {
  switch (status) {
    case AgentActivationStatusValue.ACTIVE:
      return 'desk.agent.status.label.active';
    case AgentActivationStatusValue.PAUSED:
      return 'desk.agent.status.label.paused';
    case AgentActivationStatusValue.PENDING:
      return 'desk.agent.status.label.pending';
    case AgentActivationStatusValue.INACTIVE:
      return 'desk.agent.status.label.inactive';
    case AgentActivationStatusValue.DELETED:
    default:
      return 'desk.agent.status.label.deleted';
  }
};

export const getIsDefaultTeam = (key: AgentGroup['key']) => {
  // The team with the "null" team key is default team
  return key == null;
};

export const sortToDefaultTeamFirst = (x: AgentGroup<'listItem'>, y: AgentGroup<'listItem'>) => {
  if (getIsDefaultTeam(x.key)) {
    return -1;
  }
  if (getIsDefaultTeam(y.key)) {
    return 1;
  }
  return 0;
};

export const getTicketSocialType = (channelType: TicketChannelType) => {
  switch (channelType) {
    case 'FACEBOOK_CONVERSATION':
    case 'FACEBOOK_FEED':
      return 'facebook';
    case 'TWITTER_DIRECT_MESSAGE_EVENT':
    case 'TWITTER_STATUS':
      return 'twitter';
    case 'INSTAGRAM_COMMENT':
      return 'instagram';
    case 'WHATSAPP_MESSAGE':
      return 'whatsapp';
    default:
      return 'sendbird';
  }
};

export const getSorterParams = (sorter: string, sortOrder: SortOrder) =>
  sortOrder === SortOrder.ASCEND ? sorter : `-${sorter}`;

export const getTicketURL = (ticketId: Ticket['id'], isAdmin: boolean) => {
  const appId = window.location.pathname.split('/')[1];
  return isAdmin
    ? `${window.location.origin}/${appId}/desk/tickets/${ticketId}`
    : `${window.location.origin}/${appId}/desk/conversation/${ticketId}`;
};

export const createGoogleMapLink = (lat: number, long: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat}%2C${long}`;

export const attachPlusSignToPhoneNumber = (number: string | number) => {
  // Already attached
  if (typeof number === 'string' && number.charAt(0) === '+') return number;
  return `+${number}`;
};

export const checkIsMediaTypeWAMessageContent = ({ contentType }: WhatsAppMessageType) =>
  contentType === 'file' || contentType === 'image' || contentType === 'audio' || contentType === 'video';

export const getWorkingHourVerticalLineColor = (index: number) =>
  index === 0
    ? cssVariables('red-5') // Primary color
    : cssVariables('blue-6'); // Secondary color
