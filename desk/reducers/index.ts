import { agentGroupsReducer } from './agentGroups';
import { conversationReducer } from './conversation';
import { customerFieldsReducer } from './customerFields';
import { customersReducer } from './customers';
import { deskReducer } from './desk';
import { deskSettingsReducer } from './deskSettings';
import { integrationsReducer } from './integrations';
import { macrosReducer } from './macros';
import { statsReducer } from './stats';
import { ticketDetailReducer } from './ticketDetail';
import { ticketFieldsReducer } from './ticketFields';
import { ticketHistoryReducer } from './ticketHistory';
import { ticketsReducer } from './tickets';
import { twitterReducer } from './twitter';
import { webhooksReducer } from './webhooks';

export const deskReducers = {
  desk: deskReducer,
  ticketDetail: ticketDetailReducer,
  conversation: conversationReducer,
  ticketHistory: ticketHistoryReducer,
  tickets: ticketsReducer,
  agentGroups: agentGroupsReducer,
  customers: customersReducer,
  ticketFields: ticketFieldsReducer,
  customerFields: customerFieldsReducer,
  stats: statsReducer,
  deskSettings: deskSettingsReducer,
  macros: macrosReducer,
  integrations: integrationsReducer,
  webhooks: webhooksReducer,
  twitter: twitterReducer,
};
