import { lazy } from 'react';

import { DirectCallsDurationLimitDialog } from '@calls/containers/DirectCalls/components';
import {
  PushAPNSVoIPEditDialog,
  PushAPNSVoIPRegisterDialog,
} from '@calls/containers/Setting/Notifications/apnsDialogs';
import {
  CallsStudioMobileAddUsersDialog,
  CallsStudioMobileCreateUserDialog,
  CallsStudioMobileEditUserDialog,
} from '@calls/containers/Studio/dialogs/CallsStudioMobileAppUserDialogs';

import { CallsPaymentDialog, CallsUpdateSubscriptionDialog } from '../FullScreenModals/CallsVoucherModal/dialogs';
import { DialogType } from './DialogType';

const AssignTransferTicketToAgentDialog = lazy(
  () => import('@desk/containers/dialogs/AssignTransferTicketToAgentDialog'),
);
const CloseTicketDialog = lazy(() => import('@desk/containers/dialogs/CloseTicketDialog'));
const ConfirmEndOfChatDialog = lazy(() => import('@desk/containers/dialogs/ConfirmEndOfChatDialog'));
const CreateAgentGroupDialog = lazy(() => import('@desk/containers/dialogs/CreateAgentGroupDialog'));
const CreateTokenDialog = lazy(() => import('@desk/containers/dialogs/CreateTokenDialog'));
const TransferTicketToAgentGroupDialog = lazy(
  () => import('@desk/containers/dialogs/TransferTicketToAgentGroupDialog'),
);

const CreateRoomDialog = lazy(() => import('@calls/dialogs/CreateRoomDialog'));
const CallsStudioRoomInviteDialog = lazy(() => import('@calls/containers/Studio/dialogs/CallsStudioRoomInviteDialog'));
const CallsStudioAddExistingRoomDialog = lazy(
  () => import('@calls/containers/Studio/dialogs/CallsStudioAddExistingRoomDialog'),
);
const ManageDirectCallsColumnsDialog = lazy(
  () => import('@calls/containers/DirectCalls/manageDirectCallsColumnsDialog'),
);
const PushFCMVoIPRegisterDialog = lazy(
  () => import('@calls/containers/Setting/Notifications/PushFCMVoIPRegisterDialog'),
);
const CallsStudioMobileRemoveUserDialog = lazy(
  () => import('@calls/containers/Studio/dialogs/callsStudioMobileRemoveUserDialog'),
);
const PhoneboothUserUnregisterDialog = lazy(
  () => import('@calls/containers/Studio/dialogs/PhoneboothUserUnregisterDialog'),
);
const AnalyticsExportDialog = lazy(() => import('@chat/containers/analytics/analyticsExportDialog'));
const AnnouncementDataDisplayDialog = lazy(
  () => import('@chat/containers/announcements/AnnouncementDataDisplayDialog'),
);
const AdminMessageDialog = lazy(() => import('@chat/containers/channels/dialogs/AdminMessageDialog'));
const CreateSDKUserDialog = lazy(() => import('@chat/containers/channels/dialogs/CreateSDKUserDialog'));
const DeleteChannelsDialog = lazy(() => import('@chat/containers/channels/dialogs/DeleteChannelsDialog'));
const EditChannelDialog = lazy(() => import('@chat/containers/channels/dialogs/EditChannelDialog'));
const MetadataDialog = lazy(() => import('@chat/containers/channels/dialogs/MetadataDialog'));
const UpdateSDKUserDialog = lazy(() => import('@chat/containers/channels/dialogs/UpdateSDKUserDialog'));
const CreateGroupChannelDialog = lazy(() => import('@chat/containers/channels/GroupChannels/CreateGroupChannelDialog'));
const CreateOpenChannelDialog = lazy(() => import('@chat/containers/channels/OpenChannels/CreateOpenChannelDialog'));
const DeleteAllChannelMessagesDialog = lazy(() => import('@chat/containers/messages/deleteAllChannelMessagesDialog'));
const DeleteMessageDialog = lazy(() => import('@chat/containers/messages/deleteMessageDialog'));
const EditMessageDialog = lazy(() => import('@chat/containers/moderationTools/dialogs/EditMessageDialog'));
const PreviousChatDialog = lazy(
  () => import('@chat/containers/moderationTools/groupChannels/PreviousChatDialog/PreviousChatDialog'),
);
const ModeratorInformationDialog = lazy(
  () => import('@chat/containers/moderationTools/dialogs/ModeratorInformationDialog'),
);
const BanMuteUserDialog = lazy(() => import('@chat/containers/moderationTools/dialogs/BanMuteUserDialog'));
const PushAPNSRegisterDialog = lazy(() => import('@chat/containers/settings/notification/pushAPNSRegisterDialog'));
const PushFCMRegisterDialog = lazy(() => import('@chat/containers/settings/notification/pushFCMRegisterDialog'));
const PushHuaweiRegisterDialog = lazy(() => import('@chat/containers/settings/notification/PushHuaweiRegisterDialog'));
const RegexEditorDialog = lazy(() => import('@chat/containers/settings/ProfanityFilterSettings/RegexEditorDialog'));
const ChangeEmailDialog = lazy(() => import('@common/containers/account/ChangeEmailDialog'));
const DeleteAccountDialog = lazy(() => import('@common/containers/account/deleteAccountDialog'));
const RegisterTwoFactorDialog = lazy(() => import('@common/containers/account/RegisterTwoFactorDialog'));
const ChangePlanDialog = lazy(
  () => import('@common/containers/FullScreenModals/SubscriptionPlanModal/ChangePlanDialog'),
);
const ChangeAppNameDialog = lazy(() => import('@common/containers/home/changeAppNameDialog'));
const DeleteApplicationDialog = lazy(() => import('@common/containers/home/deleteApplicationDialog'));
const OnboardingDialog = lazy(() => import('@common/containers/home/OnboardingDialog'));
const RegisterCardDialog = lazy(() => import('@common/containers/settings/billing/RegisterCardDialog'));
const ChangeMemberRoleDialog = lazy(() => import('@common/containers/settings/members/changeMemberRoleDialog'));
const InviteMemberDialog = lazy(() => import('@common/containers/settings/members/inviteMemberDialog'));
const SelectApplicationsDialog = lazy(() => import('@common/containers/settings/roles/selectApplicationsDialog'));
const OneMoreStepToGoDialog = lazy(() => import('@common/containers/settings/security/oneMoreStepToGoDialog'));
const SamlSSOConfigDialog = lazy(() => import('@common/containers/settings/security/SamlSsoConfigDialog'));
const CallsFreeVoucherDialog = lazy(() => import('@core/containers/app/CallsFreeVoucherDialog'));
const CreateAppDialog = lazy(() => import('@core/containers/app/createAppDialog'));
const SubscriptionPlanDialog = lazy(() => import('@core/containers/overview/subscriptionPlanDialog'));
const GetAPITokenDialog = lazy(() => import('@core/containers/settings/general/GetAPITokenDialog'));
const CreateUserDialog = lazy(() => import('@core/containers/users/dialogs/createUserDialog'));
const DeactivateUserDialog = lazy(() => import('@core/containers/users/dialogs/deactivateUserDialog'));
const DeleteUsersDialog = lazy(() => import('@core/containers/users/dialogs/deleteUsersDialog'));
const IssueUserAccessTokenDialog = lazy(() => import('@core/containers/users/dialogs/issueUserAccessTokenDialog'));
const ReactivateUserDialog = lazy(() => import('@core/containers/users/dialogs/reactivateUserDialog'));
const RegisterUserAsOperatorDialog = lazy(() => import('@core/containers/users/dialogs/registerUserAsOperatorDialog'));
const AgentActivationStatusChangeDialog = lazy(
  () => import('@desk/containers/agents/AgentActivationStatusChangeDialog'),
);
const AgentConnectionStatusChangeDialog = lazy(
  () => import('@desk/containers/agents/AgentConnectionStatusChangeDialog'),
);
const SelectTwitterStatusRecipientsDialog = lazy(
  () => import('@desk/containers/conversation/selectTwitterStatusRecipientsDialog'),
);
const UpdateAgentProfileDialog = lazy(() => import('@desk/containers/conversation/UpdateAgentProfileDialog'));
const ViewAgentProfileDialog = lazy(() => import('@desk/containers/conversation/ViewAgentProfileDialog'));
const CreateProactiveChatDialog = lazy(() => import('@desk/containers/proactiveChat/CreateProactiveChatDialog'));
const DeleteAgentGroupDialog = lazy(
  () => import('@desk/containers/settings/agentGroups/DeleteAgentGroupDialog/DeleteAgentGroupDialog'),
);
const CreateDeskBotDialog = lazy(() => import('@desk/containers/settings/Bots/CreateDeskBotDialog'));
const DeactivateDeskBotDialog = lazy(() => import('@desk/containers/settings/Bots/DeactivateDeskBotDialog'));
const DeleteDeskBotDialog = lazy(() => import('@desk/containers/settings/Bots/DeleteDeskBotDialog'));
const DeleteNexmoAccountDialog = lazy(() => import('@desk/containers/settings/integration/DeleteNexmoAccountDialog'));
const AddWebhookDialog = lazy(() => import('@desk/containers/settings/webhooks/addWebhookDialog'));
const DeleteWebhookDialog = lazy(() => import('@desk/containers/settings/webhooks/deleteWebhookDialog'));
const EditWebhookDialog = lazy(() => import('@desk/containers/settings/webhooks/editWebhookDialog'));
const ReportsDataExportDialog = lazy(() => import('@desk/containers/statistics/reportsDataExportDialog'));
const ReopenTicketDialog = lazy(() => import('@desk/containers/ticketDetail/reopenTicketDialog'));
const ExportTicketDialog = lazy(() => import('@desk/containers/tickets/exportTicketDialog'));
const ExportTicketsInfoDialog = lazy(() => import('@desk/containers/tickets/exportTicketsInfoDialog'));
const ExportMissedTicketDialog = lazy(() => import('@desk/containers/views/exportMissedTicketDialog'));
const DeleteDeskSendbirdMessageDialog = lazy(
  () => import('@desk/containers/conversation/message/DeleteDeskSendbirdMessageDialog'),
);
const OverageDialog = lazy(() => import('../FullScreenModals/SubscriptionPlanModal/OverageDialog'));
const CallsDisableSubscriptionDialog = lazy(() => import('../settings/general/CallsDisableSubscriptionDialog'));
const IPRestrictionGuideDialog = lazy(() => import('../settings/security/IPRestrictionGuideDialog'));
const ChangePasswordDialog = lazy(() => import('./ChangePasswordDialog'));
const ConfirmDialog = lazy(() => import('./ConfirmDialog'));
const ConfirmWithOrganizationNameDialog = lazy(() => import('./ConfirmWithOrganizationNameDialog'));
const Confirm1kDialog = lazy(() => import('./Confirm1kDialog'));
const ReasonForCancelDialog = lazy(() => import('./ReasonForCancelDialog'));
const ConvertFreePlanDialog = lazy(() => import('./ConvertFreePlanDialog'));
const CustomDialog = lazy(() => import('./CustomDialog'));
const DeleteDialog = lazy(() => import('./DeleteDialog'));
const UninstallDialog = lazy(() => import('./UninstallDialog'));

export const dialogComponents = {
  [DialogType.Custom]: CustomDialog,
  [DialogType.Confirm]: ConfirmDialog,
  [DialogType.ConfirmWithOrganizationName]: ConfirmWithOrganizationNameDialog,
  [DialogType.Confirm1k]: Confirm1kDialog,
  [DialogType.ReasonForCancel]: ReasonForCancelDialog,
  [DialogType.Delete]: DeleteDialog,
  [DialogType.Uninstall]: UninstallDialog,

  [DialogType.ChangePassword]: ChangePasswordDialog,

  [DialogType.DeleteAccount]: DeleteAccountDialog,
  [DialogType.ChangeEmail]: ChangeEmailDialog,
  [DialogType.RegisterTwoFactor]: RegisterTwoFactorDialog,

  [DialogType.Onboarding]: OnboardingDialog,
  [DialogType.Overage]: OverageDialog,

  [DialogType.CreateApp]: CreateAppDialog,
  [DialogType.CallsFreeVoucher]: CallsFreeVoucherDialog,

  [DialogType.GetApiToken]: GetAPITokenDialog,
  [DialogType.SubscriptionPlan]: SubscriptionPlanDialog,

  [DialogType.DeleteApplication]: DeleteApplicationDialog,
  [DialogType.ChangeAppName]: ChangeAppNameDialog,
  [DialogType.InviteMember]: InviteMemberDialog,
  [DialogType.ChangeMemberRole]: ChangeMemberRoleDialog,

  [DialogType.RegisterCard]: RegisterCardDialog,

  [DialogType.SamlOneMoreStepToGo]: OneMoreStepToGoDialog,

  [DialogType.SelectApplicationsToAccess]: SelectApplicationsDialog,

  [DialogType.CreateOpenChannel]: CreateOpenChannelDialog,
  [DialogType.CreateGroupChannel]: CreateGroupChannelDialog,
  [DialogType.ChannelMetadata]: MetadataDialog,
  [DialogType.EditChannel]: EditChannelDialog,
  [DialogType.DeleteChannels]: DeleteChannelsDialog,
  [DialogType.AdminMessage]: AdminMessageDialog,
  [DialogType.CreateSDKUser]: CreateSDKUserDialog,
  [DialogType.UpdateSDKUser]: UpdateSDKUserDialog,

  [DialogType.EditMessage]: EditMessageDialog,
  [DialogType.DeleteMessage]: DeleteMessageDialog,
  [DialogType.DeleteAllChannelMessages]: DeleteAllChannelMessagesDialog,
  [DialogType.ModeratorInformation]: ModeratorInformationDialog,

  [DialogType.BanMuteUser]: BanMuteUserDialog,

  [DialogType.CreateUser]: CreateUserDialog,
  [DialogType.DeleteUser]: DeleteUsersDialog,
  [DialogType.DeactivateUser]: DeactivateUserDialog,
  [DialogType.ReactivateUser]: ReactivateUserDialog,

  [DialogType.RegisterUserAsOperator]: RegisterUserAsOperatorDialog,

  [DialogType.IssueUserAccessToken]: IssueUserAccessTokenDialog,

  [DialogType.AnalyticsExport]: AnalyticsExportDialog,
  [DialogType.AnnouncementDataDisplay]: AnnouncementDataDisplayDialog,

  [DialogType.PushApnsRegister]: PushAPNSRegisterDialog,
  [DialogType.PushApnsVoipRegister]: PushAPNSVoIPRegisterDialog,
  [DialogType.PushApnsVoipEdit]: PushAPNSVoIPEditDialog,
  [DialogType.PushFcmRegister]: PushFCMRegisterDialog,
  [DialogType.PushFcmVoipRegister]: PushFCMVoIPRegisterDialog,
  [DialogType.PushHuaweiRegister]: PushHuaweiRegisterDialog,

  [DialogType.UpdateAgentProfile]: UpdateAgentProfileDialog,
  [DialogType.ViewAgentProfile]: ViewAgentProfileDialog,
  [DialogType.SelectTwitterStatusRecipients]: SelectTwitterStatusRecipientsDialog,

  [DialogType.ConfirmEndOfChat]: ConfirmEndOfChatDialog,
  [DialogType.AssignTransferTicketToAgent]: AssignTransferTicketToAgentDialog,
  [DialogType.AssignTransferTicketToGroup]: TransferTicketToAgentGroupDialog,
  [DialogType.CreateAgentGroup]: CreateAgentGroupDialog,
  [DialogType.CloseTicket]: CloseTicketDialog,
  [DialogType.ReopenTicket]: ReopenTicketDialog,
  [DialogType.ExportTicket]: ExportTicketDialog,
  [DialogType.ExportTicketsInfo]: ExportTicketsInfoDialog,

  [DialogType.CreateNewToken]: CreateTokenDialog,

  [DialogType.AddWebhook]: AddWebhookDialog,
  [DialogType.EditWebhook]: EditWebhookDialog,
  [DialogType.DeleteWebhook]: DeleteWebhookDialog,

  [DialogType.ReportsExport]: ReportsDataExportDialog,

  [DialogType.CreateProactiveChat]: CreateProactiveChatDialog,
  [DialogType.DeleteAgentGroup]: DeleteAgentGroupDialog,
  [DialogType.ManageDirectCallsColumns]: ManageDirectCallsColumnsDialog,
  [DialogType.ExportMissedTicket]: ExportMissedTicketDialog,
  [DialogType.PhoneboothUserUnregister]: PhoneboothUserUnregisterDialog,
  [DialogType.DirectCallsDurationLimit]: DirectCallsDurationLimitDialog,
  [DialogType.CreateRoom]: CreateRoomDialog,
  [DialogType.CallsStudioRoomInvite]: CallsStudioRoomInviteDialog,
  [DialogType.CallsStudioAddExistingRoom]: CallsStudioAddExistingRoomDialog,
  [DialogType.CallsStudioMobileCreateUser]: CallsStudioMobileCreateUserDialog,
  [DialogType.CallsStudioMobileAddUser]: CallsStudioMobileAddUsersDialog,
  [DialogType.CallsStudioMobileEditUser]: CallsStudioMobileEditUserDialog,
  [DialogType.CallsStudioMobileRemoveUser]: CallsStudioMobileRemoveUserDialog,
  [DialogType.CallsUpdateSubscription]: CallsUpdateSubscriptionDialog,
  [DialogType.CallsDisableSubscription]: CallsDisableSubscriptionDialog,
  [DialogType.CallsPayment]: CallsPaymentDialog,
  [DialogType.ChangePlan]: ChangePlanDialog,
  [DialogType.ConvertFreePlan]: ConvertFreePlanDialog,
  [DialogType.AgentConnectionStatusChange]: AgentConnectionStatusChangeDialog,
  [DialogType.AgentActivationStatusChange]: AgentActivationStatusChangeDialog,
  [DialogType.RegexEditor]: RegexEditorDialog,
  [DialogType.DeleteNexmoAccount]: DeleteNexmoAccountDialog,
  [DialogType.IPRestrictionGuide]: IPRestrictionGuideDialog,
  [DialogType.CreateDeskBot]: CreateDeskBotDialog,
  [DialogType.DeactivateDeskBot]: DeactivateDeskBotDialog,
  [DialogType.DeleteDeskBot]: DeleteDeskBotDialog,
  [DialogType.PreviousChat]: PreviousChatDialog,
  [DialogType.SSOConfig]: SamlSSOConfigDialog,
  [DialogType.DeleteDeskSendbirdMessage]: DeleteDeskSendbirdMessageDialog,
};
