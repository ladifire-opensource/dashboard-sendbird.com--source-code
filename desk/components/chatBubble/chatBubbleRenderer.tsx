import React, { useRef, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import styled, { css } from 'styled-components';

import { cssVariables, OverflowMenu, OverflowMenuItem } from 'feather';

import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';

interface ChatBubbleAction {
  label: string;
  onClick: () => void;
}

type Props = {
  isOwn?: boolean;
  renderAvatar: (avatarProps: { className: string }) => React.ReactNode;
  renderStatus?: () => React.ReactNode;
  renderMessageArea: () => React.ReactNode;
  isAvatarHidden?: boolean;
  isStatusHidden?: boolean;
  actions?: readonly ChatBubbleAction[];
  className?: string;
};

// The width of the component adjacent to a bubble, i.e. avatar, menu button
export const CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH = 32;

// horizontal spacing between the bubble and and its adjacent component in pixel
export const CHAT_BUBBLE_HORIZONTAL_SPACING = 8;

const MenuButton = styled(OverflowMenu)<{ isDisabled: boolean }>`
  grid-area: menu;
  margin-top: 6px;
  position: relative;

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 32px;
        height: 32px;
        background: ${cssVariables('neutral-1')};
        opacity: 0.4;
        cursor: not-allowed;
      }
    `}
`;

const Container = styled.div<{ isOwn: Props['isOwn']; isStatusHidden: Props['isStatusHidden'] }>`
  display: grid;
  grid-template-rows: auto auto;
  grid-gap: 4px ${CHAT_BUBBLE_HORIZONTAL_SPACING}px;

  ${(props) =>
    props.isOwn
      ? css`
          grid-template-columns: 1fr ${CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH}px auto ${CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH}px;
          grid-template-areas:
            '. menu   message avatar'
            '. status status  .';
          align-self: flex-end;

          ${MenuButton} {
            justify-self: end;
          }
        `
      : css`
          grid-template-columns: ${CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH}px auto ${CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH}px 1fr;
          grid-template-areas:
            'avatar message menu   .'
            '.      status  status .';
          align-self: flex-start;
        `}

  ${MenuButton} {
    visibility: hidden;
  }

  :hover ${MenuButton}, &[data-is-menu-open='true'] ${MenuButton} {
    visibility: visible;
  }

  & + & {
    margin-top: ${(props) => (props.isStatusHidden ? 0 : 16)}px;
  }

  .ChatBubbleRenderer__renderAvatar {
    grid-area: avatar;
    align-self: end;
    margin-bottom: 6px;
  }
`;

const MessageArea = styled.div<{ isOwn: Props['isOwn'] }>`
  grid-area: message;
  justify-self: ${(props) => (props.isOwn ? 'end' : 'start')};
  display: grid;
  grid-template-columns: 100%;
  grid-auto-flow: row;
  grid-gap: 4px;
  justify-items: ${(props) => (props.isOwn ? 'end' : 'start')};
`;

const Status = styled.div<{ isOwn: Props['isOwn'] }>`
  grid-area: status;
  display: flex;
  flex-direction: ${(props) => (props.isOwn ? 'row-reverse' : 'row')};
  align-items: center;

  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
`;

export const ChatBubbleMenuPopperBoundariesElementContext = React.createContext<HTMLElement | undefined>(undefined);

export const ChatBubbleRenderer = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      isOwn,
      renderAvatar,
      renderStatus = () => null,
      renderMessageArea,
      isAvatarHidden,
      isStatusHidden,
      actions = [],
      className,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isConnected = useSelector<RootState, boolean>((state) => state.sendbird.isConnected);

    const containerRefCallback = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };
    const onMenuStateChange = useCallback((changes) => {
      if (containerRef.current && Object.keys(changes).includes('isOpen')) {
        containerRef.current.dataset.isMenuOpen = `${!!changes.isOpen}`;
      }
    }, []);
    const boundariesElement = useContext(ChatBubbleMenuPopperBoundariesElementContext);
    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({
      adjacentComponentWidth: CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH,
      bubbleHorizontalSpacing: CHAT_BUBBLE_HORIZONTAL_SPACING,
    });

    return (
      <Container
        ref={containerRefCallback}
        isOwn={isOwn}
        isStatusHidden={isStatusHidden}
        data-test-id="ChatBubbleContainer"
        data-is-menu-open={false}
        className={className}
      >
        {!isAvatarHidden && renderAvatar({ className: 'ChatBubbleRenderer__renderAvatar' })}
        <MessageArea
          isOwn={isOwn}
          css={chatBubbleMaxWidth ? `max-width: ${chatBubbleMaxWidth}px;` : undefined}
          data-test-id="ChatBubbleMessage"
        >
          {renderMessageArea()}
        </MessageArea>
        {actions.length > 0 && (
          <MenuButton
            items={actions as OverflowMenuItem[]}
            isDisabled={!isConnected}
            onStateChange={onMenuStateChange}
            popperProps={{
              placement: isOwn ? 'bottom-start' : 'bottom-end',
              modifiers: { flip: { boundariesElement: boundariesElement ?? 'viewport' } },
            }}
          />
        )}
        {!isStatusHidden && <Status isOwn={isOwn}>{renderStatus()}</Status>}
      </Container>
    );
  },
);
