import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { SettingsGridGroup } from '@common/containers/layout';
import { TicketStatus } from '@constants';
import { TicketStatusSystemMessageKey } from '@constants';
import { TicketStatusLozenge } from '@ui/components';

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

const StyledLozenge = styled(TicketStatusLozenge)`
  display: inline-block;
`;

export const TicketStatusSystemMessages = React.memo<Props>(({ defaultMessages = {}, values = {}, onSave }) => {
  const intl = useIntl();

  const systemMessages: Array<
    React.ComponentProps<typeof SettingSystemMessage> & {
      systemMessageKey: string;
    }
  > = useMemo(
    () => [
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.activeToIdleBySystem' },
          {
            active: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
            idle: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_SYSTEM,
        defaultValue: values[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_SYSTEM] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_SYSTEM]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_SYSTEM]?.parameters,
      },

      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.activeToIdleByAgent' },
          {
            active: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
            idle: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_AGENT,
        defaultValue: values[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_AGENT] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_AGENT]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.ACTIVE_TO_IDLE_BY_AGENT]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.toWipByAgent' },
          {
            wip: <StyledLozenge ticketStatus={TicketStatus.WIP} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.WIP_BY_AGENT,
        defaultValue: values[TicketStatusSystemMessageKey.WIP_BY_AGENT] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.WIP_BY_AGENT]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.WIP_BY_AGENT]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.wipToPending' },
          {
            wip: <StyledLozenge ticketStatus={TicketStatus.WIP} />,
            pending: <StyledLozenge ticketStatus={TicketStatus.PENDING} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.WIP_TO_PENDING_BY_SYSTEM,
        defaultValue: values[TicketStatusSystemMessageKey.WIP_TO_PENDING_BY_SYSTEM] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.WIP_TO_PENDING_BY_SYSTEM]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.WIP_TO_PENDING_BY_SYSTEM]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.idleToActiveByAgent' },
          {
            idle: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
            active: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_AGENT,
        defaultValue: values[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_AGENT] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_AGENT]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_AGENT]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.idleToActiveByCustomer' },
          {
            idle: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
            active: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_CUSTOMER,
        defaultValue: values[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_CUSTOMER] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_CUSTOMER]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_CUSTOMER]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.idleToActiveBySystem' },
          {
            idle: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
            active: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_SYSTEM,
        defaultValue: values[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_SYSTEM] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_SYSTEM]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.IDLE_TO_ACTIVE_BY_SYSTEM]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.closedByAgent' },
          {
            closed: <StyledLozenge ticketStatus={TicketStatus.CLOSED} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.CLOSED_BY_AGENT,
        defaultValue: values[TicketStatusSystemMessageKey.CLOSED_BY_AGENT] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_AGENT]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_AGENT]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.closedByCustomer' },
          {
            closed: <StyledLozenge ticketStatus={TicketStatus.CLOSED} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.CLOSED_BY_CUSTOMER,
        defaultValue: values[TicketStatusSystemMessageKey.CLOSED_BY_CUSTOMER] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_CUSTOMER]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_CUSTOMER]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.closedByPlatform' },
          {
            closed: <StyledLozenge ticketStatus={TicketStatus.CLOSED} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.CLOSED_BY_PLATFORM_API,
        defaultValue: values[TicketStatusSystemMessageKey.CLOSED_BY_PLATFORM_API] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_PLATFORM_API]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_PLATFORM_API]?.parameters,
      },
      {
        title: intl.formatMessage(
          { id: 'desk.settings.systemMessages.ticketStatus.closedBySystem' },
          {
            closed: <StyledLozenge ticketStatus={TicketStatus.CLOSED} />,
          },
        ),
        systemMessageKey: TicketStatusSystemMessageKey.CLOSED_BY_SYSTEM,
        defaultValue: values[TicketStatusSystemMessageKey.CLOSED_BY_SYSTEM] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_SYSTEM]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.CLOSED_BY_SYSTEM]?.parameters,
      },
      {
        title: intl.formatMessage({ id: 'desk.settings.systemMessages.ticketStatus.reopenedByAgent' }),
        systemMessageKey: TicketStatusSystemMessageKey.REOPENED_BY_AGENT,
        defaultValue: values[TicketStatusSystemMessageKey.REOPENED_BY_AGENT] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.REOPENED_BY_AGENT]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.REOPENED_BY_AGENT]?.parameters,
      },
      {
        title: intl.formatMessage({ id: 'desk.settings.systemMessages.ticketStatus.reopenedByCustomer' }),
        systemMessageKey: TicketStatusSystemMessageKey.REOPENED_BY_CUSTOMER,
        defaultValue: values[TicketStatusSystemMessageKey.REOPENED_BY_CUSTOMER] ?? '',
        placeholder: defaultMessages[TicketStatusSystemMessageKey.REOPENED_BY_CUSTOMER]?.message ?? '',
        propertyTags: defaultMessages[TicketStatusSystemMessageKey.REOPENED_BY_CUSTOMER]?.parameters,
      },
    ],
    [defaultMessages, intl, values],
  );

  return (
    <SettingsGridGroup>
      {systemMessages.map((item) => (
        <SettingSystemMessage key={`${item.systemMessageKey}_${item.defaultValue}`} onSave={onSave} {...item} />
      ))}
    </SettingsGridGroup>
  );
});
