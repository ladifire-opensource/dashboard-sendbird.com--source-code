import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, AvatarType, Avatar, Headings } from 'feather';

const Container = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 64px;
  background-color: white;
  padding-left: 16px;
  padding-right: 12px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const MTHeaderChannel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-width: 0;
`;

const MTChannelName = styled.div`
  display: -webkit-box;
  margin-left: 12px;
  overflow: hidden;
  word-wrap: break-word;
  color: ${cssVariables('neutral-10')};
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  ${Headings['heading-02']};
`;

const Separator = styled.div.attrs({ role: 'separator' })`
  margin-right: 16px;
  margin-left: 16px;
  background: ${cssVariables('neutral-3')};
  width: 1px;
  height: 20px;
`;

const MTHeaderMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0 0 16px;

  > *:not(${Separator}) + *:not(${Separator}) {
    // Separator has margins around itself.
    margin-left: 4px;
  }
`;

type Props = {
  channel: Channel | null;
  children: {
    operatorFilter?: ReactNode;
    textZoomButton: ReactNode;
    changeLayoutButton: ReactNode;
    previousChatButton?: ReactNode;
  };
};

export const ModerationToolHeader: FC<Props> = ({
  channel,
  children: { operatorFilter, textZoomButton, changeLayoutButton, previousChatButton },
}) => {
  const intl = useIntl();

  return (
    <Container>
      <MTHeaderChannel>
        <Avatar
          type={AvatarType.Channel}
          size={32}
          imageUrl={channel?.cover_url}
          profileID={channel?.channel_url ?? ''}
        />
        <MTChannelName data-test-id="ChannelName">
          {channel?.name || intl.formatMessage({ id: 'chat.channelList.emptyChannelNamePlaceholder' })}
        </MTChannelName>
      </MTHeaderChannel>
      <MTHeaderMenu>
        {textZoomButton}
        {previousChatButton}
        {operatorFilter && (
          <>
            <Separator />
            {operatorFilter}
          </>
        )}
        <Separator />
        {changeLayoutButton}
      </MTHeaderMenu>
    </Container>
  );
};
