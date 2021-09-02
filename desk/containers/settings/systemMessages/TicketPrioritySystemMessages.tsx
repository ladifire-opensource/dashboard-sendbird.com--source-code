import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { SettingsGridGroup } from '@common/containers/layout';
import { TicketPrioritySystemMessagesKey } from '@constants';

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

export const TicketPrioritySystemMessages = React.memo<Props>(({ defaultMessages = {}, values = {}, onSave }) => {
  const intl = useIntl();
  const systemMessages: Array<React.ComponentProps<typeof SettingSystemMessage> & { systemMessageKey: string }> = [
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketPriority.changedByAgent' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_AGENT,
      defaultValue: values[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_AGENT] ?? '',
      placeholder: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_AGENT]?.message ?? '',
      propertyTags: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_AGENT]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketPriority.changedByCustomer' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_CUSTOMER,
      defaultValue: values[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_CUSTOMER] ?? '',
      placeholder: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_CUSTOMER]?.message ?? '',
      propertyTags: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_CUSTOMER]?.parameters,
    },
    {
      title: intl.formatMessage(
        { id: 'desk.settings.systemMessages.ticketPriority.changedByPlatformAPI' },
        { b: (text) => <Bold>{text}</Bold> },
      ),
      systemMessageKey: TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_PLATFORM_API,
      defaultValue: values[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_PLATFORM_API] ?? '',
      placeholder: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_PLATFORM_API]?.message ?? '',
      propertyTags: defaultMessages[TicketPrioritySystemMessagesKey.UPDATE_PRIORITY_BY_PLATFORM_API]?.parameters,
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
