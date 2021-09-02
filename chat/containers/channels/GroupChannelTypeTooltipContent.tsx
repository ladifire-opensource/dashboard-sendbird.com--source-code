import { memo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, ContextualHelpContent } from 'feather';

import { SUPERGROUP_COLOR } from './constants';
import { useSupergroupDescription } from './hooks/useSupergroupDescription';

const MemberCountTooltipHeader = styled(ContextualHelpContent.Header)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;

  > * {
    margin-right: 4px;
  }
`;

export const GroupChannelTypeTooltipContent = memo(() => {
  const intl = useIntl();
  const { tooltipDefinition } = useSupergroupDescription();
  return (
    <>
      <MemberCountTooltipHeader style={{ color: SUPERGROUP_COLOR }}>
        <Icon size={20} icon="teams" color={SUPERGROUP_COLOR} />
        {intl.formatMessage({ id: 'chat.channelList.list.column.memberCount.tooltip.supergroup.header' })}
      </MemberCountTooltipHeader>
      <ContextualHelpContent.Body>{tooltipDefinition}</ContextualHelpContent.Body>
      <MemberCountTooltipHeader>
        <Icon size={20} icon="user" color={cssVariables('neutral-6')} />
        {intl.formatMessage({ id: 'chat.channelList.list.column.memberCount.tooltip.group.header' })}
      </MemberCountTooltipHeader>
      <ContextualHelpContent.Body>
        {intl.formatMessage({ id: 'chat.channelList.list.column.memberCount.tooltip.group.body' })}
      </ContextualHelpContent.Body>
    </>
  );
});
