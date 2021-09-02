import * as messages from './messages';

export const oldMessages = {
  /**
   * Organization Settings: General
   */

  'label.organizationName': 'Organization name',
  'error.organizationNameIsRequired': 'Organization name is required.',

  /**
   * Organization Settings: Applications
   */

  'label.resultCount': '{count} results',
  'ph.searchApplications': 'Search applications',
  'label.applicationSearchResultEmpty': 'Application not found',
  'desc.applicationSearchResultEmpty': 'Please make sure the Application name is correct',
  'label.applicationListEmpty': 'You have no Applications',
  'desc.applicationListEmpty': 'Use the "Create app" button to get started',

  'label.name': 'Name',
  'label.server': 'Server',
  'label.created': 'Created',

  /**
   * Organization Settings: Members
   */

  'label.current': 'Current',
  'label.invited': 'Invited',
  'label.email': 'Email',
  'label.role': 'Role',
  'label.delete': 'Delete',
  'label.export': 'Export',
  'label.resend': 'Resend',
  'label.invitationListEmpty': 'You have no invitation',
  'desc.invitationListEmpty': "You haven't invited anyone yet.",

  /**
   * Organization Settings: Billing
   */

  'label.billingContacts': 'Billing contacts',
  'desc.billingContacts': 'All billing-related emails and receipts will be sent to your billing contacts.',
  'ph.billingContacts': 'Enter email address(es)',
  'alerts.billingContactsSaveComplete': 'The new billing contacts have been successfully added.',

  /**
   * Navigation Bar
   */

  'common.createApplication': 'Create application',
  'label.selectApplication': 'Select application',
  'navigationBar.applicationSelect_lbl.noResults': 'No results',
  'navigationBar.applicationSelect_lbl.noApplications': 'No applications',

  /**
   * Application Open Channels
   */

  'core.openChannels.metadataDialog_err.duplicateKeys': 'Duplicate keys are not allowed.',
  'core.openChannels.metadataDialog_lbl.removeMetadata': 'Remove metadata',
  'core.openChannels.metadataDialog_lbl.addRow': 'Add row',
  'core.openChannels.metadataDialog_ph.key': 'Key',
  'core.openChannels.metadataDialog_ph.value': 'Value',
  'core.openChannels.metadataDialog_title': 'Manage channel metadata',

  /**
   * Application Settings
   */

  'label.settings': 'Settings',

  // Add APNS dialog title

  'label.chooseFile': 'Choose file',
  'label.password': 'Password',
  'label.optional': 'Optional',

  /**
   * Alerts
   */

  'alerts.changesSaved': 'Changes have been saved.',
  'alerts.preventRoleChangeSelf': "You can't change you're role",
  'alerts.agentSelectRequired': 'Please select an agent to transfer the ticket to.',
  'alerts.transferNoteRequired': 'Please provide a transfer note.',
  'alerts.newIncomingChat': 'New incoming chat',
  'alerts.newTransferredChat': 'New transferred chat',
  'alerts.samlConfigurationDeleted': 'SAML configuration has been deleted.',

  /**
   * Options
   */

  'options.minutes': '{minute, plural, one {1 Minute} other {# Minutes}}',
  'options.hours': '{hour, plural, one {1 Hour} other {# Hours}}',

  /**
   * Placeholders
   */
  'ph.organizationKey': 'acme',

  /**
   * Labels
   */

  'label.agents': 'Agents',
  'label.customer': 'Customer',
  'label.customers': 'Customers',
  'label.follow': 'Follow',
  'label.unfollow': 'Unfollow',
  'label.status': 'Status',
  'label.priority': 'Priority',
  'label.cancel': 'Cancel',
  'label.sendbirdID': 'Sendbird ID',
  'label.sendMessage': 'Send message',
  'label.abort': 'Abort',
  'label.ok': 'OK',
  'label.no': 'No',
  'label.add': 'Add',
  'label.edit': 'Edit',
  'label.save': 'Save',
  'label.configure': 'Configure',
  'label.csat': 'CSAT',
  'label.members': 'Members',
  'label.haveNoCustomers': "We couldn't find any customers.",
  'label.haveNoMacros': "We couldn't find any macros",
  'label.haveNoTickets': 'You currently have no tickets.',
  'label.team': 'Team',
  'label.assignToAgent': 'Assign to agent',
  'label.closeTicket': 'Close ticket',
  'label.reopenTicket': 'Reopen Ticket',
  'label.subject': 'Subject',
  'label.assignee': 'Assignee',
  'label.sender': 'Sender',
  'label.isTyping': 'is typing...',
  'label.others': 'Others',
  'label.triggers': 'Triggers',
  'label.deleteAgent': 'Delete agent {agentName}',
  'label.runMacro': 'Run Macro',
  'label.confirmEndOfChat': 'Confirm End of Chat',
  'label.inquire': 'Inquire',
  'label.moveToIdle': 'Change to Idle',
  'label.operatingHours': 'Operating Hours',
  'label.operatingHoursMessage': 'Operating Hours Message',
  'label.waitingTickets': 'Tickets waiting',
  'label.send': 'Send',
  'label.viewDetail': 'View Detail',

  'label.samlIdentityProviderInformation': 'Information on Your Identity Provider',
  'label.samlConfigurationDeleteDialogTitle': 'Delete SAML configuration?',
  'label.samlConfigurationHelpCenterLink': 'Having trouble?',
  'label.deleteConfiguration': 'Delete Configuration',
  'label.changeConfiguration': 'Change Configuration',
  'label.currentIdp': 'Current IDP',
  'label.showMore': 'Show more',
  'label.showLess': 'Show less',
  'label.noResults': 'No results',
  'label.receiver': 'Receiver',
  'label.replied': 'Replied at',
  'label.clearTeam': 'Clear selection',
  'label.createTeam': 'Create team',
  'label.noTeam': 'No teams',
  'label.searchTeam': 'Search team',

  /**
   * Descriptions
   */

  'desc.accessDenied': "You're not registered as an agent on Sendbird Desk",
  'desc.confirmDeleteMacro': 'Are you sure to delete this macro?',
  'desc.pending': 'Not yet to be assigned to an agent.',
  'desc.active': 'Assigned to an agent and involves active interaction with the customer.',
  'desc.idle': 'No response from the customer for a set amount of time.',
  'desc.ticketPerAgent': 'Average of active tickets per agents who are currently online.',
  'desc.firstAssignedTime': 'Average time from tickets created to first assigned.',
  'desc.firstResponseTime': "Average time from tickets assigned to agents' first responses.",
  'desc.ticketResolutionTime': 'Time from ticket created to closed.',
  'desc.ticketProcessingTime': 'Average time from tickets assigned to closed.',
  'desc.haveNoCustomers': 'New customer will appear here.',
  'desc.haveNoMacros': 'Please try add a macro.',
  'desc.atmWelcomeMessage': 'Sent when a customer opens a new ticket and at least one agent is currently online.',
  'desc.atmAwayMessage': 'Sent when a customer opens a new ticket but no agents are currently online.',
  'desc.atmDelayMessage': 'Sent to customers when their ticket has not been assigned for a specified period of time',
  'desc.announcement': 'Sent when a customer opens new or existing tickets.',
  'desc.atmCloseMessage': 'Send a message when a ticket is closed.',
  'desc.atmIdleTicketCloseMessage': 'Send a message when an idle ticket is automatically closed.',
  'desc.agentRoleChangeConfirm': "Would you like to change {agentName}'s role to {role}?",
  'desc.agentDeleteConfirm': 'Are you sure you want to delete {agentName} Agent?',
  'desc.ticketReport': 'Daily statistics of tickets created and closed.',
  'desc.ticketFunnel': 'Proportion of each stage for tickets in a day.',
  'desc.haveNoTickets': 'New tickets assigned to you will appear here.',
  'desc.waitingTickets': 'There are tickets awaiting your response.',
  'desc.invalidEmailExists':
    '"{invalidEmail}" is not a valid email address. Please make sure that all email addresses are properly formatted or valid.',
  'desc.samlSingleSignOn': 'Configure SAML settings of your organization for single sign-on.',
  'desc.organizationKey':
    'Members should enter this key when signing in with SSO. This is separate from your organization name.',
  'desc.organizationKeyRule':
    'Only lowercase letters, numbers, and dashes are allowed. (The key must start with a letter or number)',
  'desc.samlIdentityProviderInformation': 'Copy and paste the URLs into your identity provider to complete the setup.',
  /**
   * Errors
   */

  'error.fieldIsRequired': '{field} is required.',
  'error.invalidEntityId': 'Please enter a valid entity ID.',
  'error.invalidPublicCertificate': 'Please enter a valid public certificate.',
  'error.invalidUrl': 'Please enter a valid URL.',
  'error.unexpectedError': 'Data cannot be retrieved due to an unexpected error.',
};

const mergedMessages = [oldMessages, ...Object.values(messages)].reduce((result, messageData) => {
  return { ...result, ...messageData };
}, {});

export const languageEN = {
  lang: 'en',
  messages: mergedMessages,
};
