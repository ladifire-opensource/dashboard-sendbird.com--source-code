import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Headings,
  Icon,
  IconButton,
  ScrollBar,
  ScrollBarRef,
  Spinner,
  toast,
  transitionDefault,
  Typography,
} from 'feather';

import * as deskApi from '@desk/api';
import DeskCustomerAvatar from '@desk/components/DeskCustomerAvatar';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, useShallowEqualSelector } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { ContentEditable, ContentEditableRef, PriorityBadge, TransitionedDrawer } from '@ui/components';
import { logException } from '@utils';

import { CHAT_HEIGHTS } from '../conversation/constants';
import { ProactiveChatMessages } from './ProactiveChatMessages';
import { StatusChangedNotification } from './StatusChangedNotification';
import { useProactiveChatViewDrawer } from './useProactiveChatViewDrawer';

export const drawerId = 'proactiveChatView';

const DrawerContainer = styled(TransitionedDrawer)`
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 560px;
`;

const Header = styled.header`
  display: grid;
  grid-template-areas:
    'title   title title    close'
    'subject group priority .';
  grid-template-columns: auto auto 1fr 32px;
  grid-column-gap: 8px;
  align-items: center;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  padding: 16px 16px 16px 24px;
  color: ${cssVariables('neutral-10')};
  ${Typography['caption-01']};

  > div {
    display: flex;
    align-items: center;
  }

  > div::before {
    display: inline-block;
    margin-right: 4px;
    background: ${cssVariables('neutral-3')};
    width: 1px;
    height: 12px;
    content: '';
  }
`;

const Body = styled.div`
  overflow: hidden;
`;

const Title = styled.h3`
  display: inline-flex;
  grid-area: title;
  align-items: center;
  height: 32px;
  ${Headings['heading-03']};
`;

const CloseButton = styled(IconButton)`
  grid-area: close;
`;

const Subject = styled.span`
  grid-area: subject;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
`;

const MessageInput = styled.div`
  position: relative;
  width: 100%;
`;

const DisabledCover = styled.div<{ $disabled: boolean }>`
  display: ${({ $disabled }) => ($disabled ? 'block' : 'none')};
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: ${cssVariables('neutral-1')};
  opacity: 0.4;
  border-radius: 4px;
  z-index: 1;
`;

const CEWrapper = styled.div`
  transition: border 0.2s ${transitionDefault};
  border-radius: 4px;
  box-shadow: 0 1px 5px 0 rgba(33, 34, 66, 0.12), 0 0 1px 0 rgba(33, 34, 66, 0.16), 0 2px 1px 0 rgba(33, 34, 66, 0.08);
  max-height: ${CHAT_HEIGHTS.INPUT_MAX_HEIGHT}px;
  overflow: auto;
`;

const StyledContentEditable = styled(ContentEditable)`
  padding: 18px 56px 18px 16px;
  min-height: 56px;
`;

export const ProactiveChatViewDrawer: FC = () => {
  const intl = useIntl();
  const dir = useCharDirection();
  const { drawerState, activeDrawerID, closeDrawer } = useProactiveChatViewDrawer();
  const { pid, region } = useProjectIdAndRegion();
  const { openChannelUrl } = useShallowEqualSelector((state) => ({
    openChannelUrl: state.desk.project.openChannelUrl,
  }));

  const [messages, setMessages] = useState<ProactiveChatMessage[]>([]);
  const [isCustomerReplied, setIsCustomerReplied] = useState(false);
  const contentEditableRef = useRef<ContentEditableRef | null>(null);
  const scrollBarRef = useRef<ScrollBarRef | null>(null);

  const [{ status, data }, fetchProactiveChatDetail] = useAsync(
    (payload: FetchProactiveChatDetailAPIPayload) => deskApi.fetchProactiveChatDetail(pid, region, payload),
    [pid, region],
    { status: 'loading' },
  );

  const close = useCallback(() => {
    closeDrawer();
    drawerState?.onClose?.();
  }, [closeDrawer, drawerState]);

  const clear = useCallback(() => {
    setMessages([]);
    setIsCustomerReplied(false);
    window.dashboardSB.removeChannelHandler('PROACTIVE_CHAT_HANDLER');
    window.removeEventListener('popstate', close);
  }, [close]);

  const initialize = useCallback(() => {
    if (drawerState != null) {
      // fetch detail info
      fetchProactiveChatDetail({ ticketId: drawerState.ticket.id });

      // add open channel event handler
      const channelHandler = new window.dashboardSB.ChannelHandler();
      channelHandler.onMessageReceived = (channel, message) => {
        if (channel.isOpenChannel() && channel.url === openChannelUrl) {
          try {
            const deskEvent = JSON.parse(message['message']);
            if (
              (deskEvent.type as DeskEvent) === 'TICKET_PROACTIVE_TO_PENDING' &&
              deskEvent.ticket.id === drawerState?.ticket.id
            ) {
              setIsCustomerReplied(true);
            }
          } catch (error) {
            logException(error);
          }
        }
      };
      window.dashboardSB.addChannelHandler('PROACTIVE_CHAT_HANDLER', channelHandler);

      // add popstate event listener
      window.addEventListener('popstate', close);
    }
  }, [close, drawerState, fetchProactiveChatDetail, openChannelUrl]);

  const handleCloseButtonClick = useCallback(() => {
    close();
  }, [close]);

  const sendMessage = useCallback(async () => {
    const message = contentEditableRef.current?.getText() ?? '';
    if (drawerState && message.trim().length > 0) {
      contentEditableRef.current?.setText('');
      try {
        const { data } = await deskApi.sendFollowUpMessage(pid, region, {
          ticketId: drawerState.ticket.id,
          message,
        });
        setMessages((messages) => [...messages, data]);
      } catch {
        toast.error({
          message: intl.formatMessage({ id: 'desk.drawer.proactiveChatViewDrawer.notification.error' }),
        });
      }
    }
  }, [drawerState, intl, pid, region]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (drawerState == null && activeDrawerID !== drawerId) {
      clear();
    }
  }, [activeDrawerID, clear, drawerState]);

  useEffect(() => {
    if (status === 'success') {
      setMessages(data?.data.proactiveChat.messages ?? []);
    }
  }, [data?.data.proactiveChat.messages, status]);

  useEffect(() => {
    if (status === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.drawer.proactiveChatViewDrawer.notification.error' }) });
    }
  }, [intl, status]);

  useEffect(() => {
    scrollBarRef.current?.scrollToBottom();
  }, [messages]);

  if (drawerState != null) {
    const { customer, channelName, priority, group } = drawerState.ticket;
    const isMessageInputDisabled = status === 'error' || isCustomerReplied;
    return (
      <DrawerContainer id={drawerId} isDarkBackground={true} isFullHeight={true}>
        <Header data-test-id="DrawerHeader">
          <Title>
            {intl.formatMessage(
              { id: 'desk.drawer.proactiveChatViewDrawer.title' },
              {
                profileImage: (
                  <DeskCustomerAvatar
                    profileID={customer.id}
                    imageUrl={customer.photoThumbnailUrl ?? ''}
                    size={20}
                    css={css`
                      margin-left: 4px;
                      margin-right: 8px;
                    `}
                  />
                ),
                customerName: customer.displayName,
              },
            )}
          </Title>
          <CloseButton
            data-test-id="CloseDrawerButton"
            icon="close"
            buttonType="tertiary"
            size="small"
            onClick={handleCloseButtonClick}
          />
          <Subject>{channelName}</Subject>
          <div css="grid-area: group;">
            <Icon
              icon="teams"
              color={cssVariables('neutral-9')}
              size={12}
              css={css`
                margin-right: 4px;
              `}
            />
            {group?.name}
          </div>
          <div css="grid-area: priority;">
            <PriorityBadge priority={priority} showLabel={true} />
          </div>
        </Header>
        <Body data-test-id="Body">
          {status === 'loading' ? (
            <Spinner
              size={64}
              css={css`
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              `}
            />
          ) : (
            <>
              {isCustomerReplied && (
                <StatusChangedNotification
                  data-test-id="StatusChangedNotification"
                  onBackButtonClick={close}
                  onSeeTicketButtonClick={close}
                  css={css`
                    margin: 14px 24px 0;
                  `}
                />
              )}
              <ScrollBar ref={scrollBarRef}>
                <ProactiveChatMessages messages={messages} />
              </ScrollBar>
            </>
          )}
        </Body>
        <Footer>
          <MessageInput data-test-id="MessageInput">
            <DisabledCover data-test-id="DisabledCover" $disabled={isMessageInputDisabled} />
            <CEWrapper>
              <StyledContentEditable
                dir={dir}
                ref={contentEditableRef}
                placeholder={
                  isMessageInputDisabled
                    ? ' ' // Show empty strings that do not use the default message for ContentEditable
                    : intl.formatMessage({ id: 'desk.drawer.proactiveChatViewDrawer.input.placeholder' })
                }
                isEditable={!isMessageInputDisabled}
                onSubmit={sendMessage}
              />
            </CEWrapper>
            <IconButton
              icon="send"
              size="small"
              buttonType="tertiary"
              color={cssVariables('neutral-5')}
              onClick={sendMessage}
              css={css`
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
              `}
            />
          </MessageInput>
        </Footer>
      </DrawerContainer>
    );
  }
  return null;
};
