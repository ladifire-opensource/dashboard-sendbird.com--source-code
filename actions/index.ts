import { AnalyticsActions, ChannelsActions, MessagesActions, ModerationsActions } from '@chat/actions';
import {
  AccountActions,
  AlertActions,
  AuthenticationActions,
  BillingActions,
  ConfigurationsActions,
  DialogsActions,
  FilesActions,
  HistoryActions,
  ImagePreviewActions,
  NotificationsActions,
  OrganizationsActions,
  SendBirdActions,
  LNBActions,
} from '@common/actions';
import { ApplicationActions, OverviewActions, SDKUserActions, SettingsActions } from '@core/actions';
import {
  AgentGroupsActions,
  CustomersActions,
  TicketFieldsActions,
  ConversationActions,
  DeskActions,
  TicketDetailActions,
  TicketHistoryActions,
  TicketsActions,
  IntegrationsActions,
  TwitterActions,
} from '@desk/actions';
import { CustomerFieldsActions } from '@desk/actions/customerFields';
import { WebhooksActions } from '@desk/actions/webhooks';

export * from './createAction';

export const commonActions = {
  ...AccountActions,
  ...AlertActions,
  ...AuthenticationActions,
  ...BillingActions,
  ...ConfigurationsActions,
  ...DialogsActions,
  ...FilesActions,
  ...HistoryActions,
  ...ImagePreviewActions,
  ...NotificationsActions,
  ...OrganizationsActions,
  ...SendBirdActions,
  ...LNBActions,
};

export const coreActions = {
  ...ApplicationActions,
  ...OverviewActions,
  ...SDKUserActions,
  ...SettingsActions,
};

export const chatActions = {
  ...AnalyticsActions,
  ...ChannelsActions,
  ...MessagesActions,
  ...ModerationsActions,
};

export const deskActions = {
  ...AgentGroupsActions,
  ...CustomersActions,
  ...TicketFieldsActions,
  ...CustomerFieldsActions,
  ...ConversationActions,
  ...DeskActions,
  ...TicketDetailActions,
  ...TicketHistoryActions,
  ...TicketsActions,
  ...IntegrationsActions,
  ...WebhooksActions,
  ...TwitterActions,
};

type ActionCreators = typeof commonActions & typeof coreActions & typeof chatActions & typeof deskActions;

export type Actions = ReturnType<ActionCreators[keyof ActionCreators]>;

/**
 * as far as possible, use RORO pattern in action parameter
 * e.g. createFeedSuccess = (payload: { feed: FacebookFeedType, message: FacebookMessage })
 * */
