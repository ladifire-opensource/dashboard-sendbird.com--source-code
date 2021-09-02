import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { SettingsGridGroup } from '@common/containers/layout';
import { TicketAssignmentSystemMessagesKey } from '@constants';

import { SettingSystemMessage } from './SettingSystemMessage';

type Props = {
  defaultMessages?: {
    [key in SystemMessageKey]: DefaultSystemMessage;
  };
  values?: {
    [key in SystemMessageKey]: string;
  };
  onSave: (result: UpdateSystemMessageResponse) => void;
  disabled?: boolean;
};

const Bold = styled.b`
  font-weight: 600;
`;

export const TicketAssignmentSystemMessages = React.memo<Props>(({ defaultMessages = {}, values = {}, onSave }) => {
  const intl = useIntl();
  const systemMessages: Array<React.ComponentProps<typeof SettingSystemMessage> & { systemMessageKey: string }> = [
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.assignedToAgentBySystem' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.ASSIGNED_BY_SYSTEM,
      defaultValue: values[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_SYSTEM] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_SYSTEM]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_SYSTEM]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.assignedToAgentByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.ASSIGNED_BY_AGENT,
      defaultValue: values[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.ASSIGNED_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.assignedToTeamByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.GROUP_ASSIGNED_BY_AGENT,
      defaultValue: values[TicketAssignmentSystemMessagesKey.GROUP_ASSIGNED_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_ASSIGNED_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_ASSIGNED_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.dismissedToTeamByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.GROUP_UNASSIGNED_BY_AGENT,
      defaultValue: values[TicketAssignmentSystemMessagesKey.GROUP_UNASSIGNED_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_UNASSIGNED_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_UNASSIGNED_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.transferredToTeamByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_AGENT,
      defaultValue: values[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.transferredAgentToAgentByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.TRANSFERRED_BY_AGENT,
      defaultValue: values[TicketAssignmentSystemMessagesKey.TRANSFERRED_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.TRANSFERRED_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.TRANSFERRED_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketAssignment.transferredToTeamByPlatformAPI' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_PLATFORM_API,
      defaultValue: values[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_PLATFORM_API] ?? '',
      placeholder: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_PLATFORM_API]?.message ?? '',
      propertyTags: defaultMessages[TicketAssignmentSystemMessagesKey.GROUP_TRANSFERRED_BY_PLATFORM_API]?.parameters,
    },
  ];

  return (
    <SettingsGridGroup>
      {systemMessages.map((item) => (
        <SettingSystemMessage key={`${item.systemMessageKey}_${item.defaultValue}`} onSave={onSave} {...item} />
      ))}
    </SettingsGridGroup>
  );
});
