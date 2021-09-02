import React, { useRef, useEffect, useCallback, useContext, useMemo, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault, IconButton } from 'feather';
import debounce from 'lodash/debounce';

import QuickRepliesPopper from '@desk/components/QuickRepliesPopper';
import { QuickRepliesContext } from '@desk/containers/settings/quickReplies/QuickRepliesContext';
import { getKeywordNearCaretOnContentEditable } from '@desk/containers/settings/quickReplies/caretUtils';
import { QuickReplyTemplate } from '@desk/hooks/useQuickReply';
import { useOutsideEventByRef } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { StyledProps } from '@ui';
import { ContentEditable, ContentEditableRef } from '@ui/components';

const StyledMessageInput = styled.div<StyledProps>`
  position: relative;
  margin-right: 20px;
  margin-bottom: 18px;
  margin-left: 20px;

  ${(props) => props.styles};

  /* onMouseLeave is not called on a disabled button without this workaround. https://github.com/facebook/react/issues/4251 */
  button[disabled] {
    pointer-events: none;
  }
`;

const ButtonWrapper = styled.div<StyledProps>`
  position: absolute;
  right: 12px;
  bottom: 9px;
  cursor: pointer;

  ${(props) => props.styles};
`;

const IconButtonContainer = styled.div`
  display: inline-block;
`;

const FileInput = styled.label<StyledProps>`
  margin-bottom: 0;
  cursor: pointer;
  input[type='file'] {
    display: none;
  }

  ${(props) => props.styles};
`;

const CEWrapper = styled.div<StyledProps>`
  overflow: auto;
  border-radius: 4px;
  box-shadow: 0 1px 5px 0 rgba(33, 34, 66, 0.12), 0 0 1px 0 rgba(33, 34, 66, 0.16), 0 2px 1px 0 rgba(33, 34, 66, 0.08);
  transition: border 0.2s ${transitionDefault};

  ${(props) => props.styles};
`;

const DisabledCover = styled.div<{ isDisabled: boolean }>`
  display: ${({ isDisabled }) => (isDisabled ? 'block' : 'none')};
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

const ToggleQuickReplies = styled.div``;

type Props = {
  currentTicket: Ticket;
  isDisabled?: boolean;

  maxHeight?: number;
  minHeight?: number;

  onKeyDown?: (e) => void;
  onKeyUp: (e: React.KeyboardEvent, text: string) => void;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onResize?: (e) => void;
  onSubmit: (text: string) => void;

  sendMessage: (payload) => void;

  agentTyping: boolean;
  setAgentTyping: (isTyping) => void;
};

export const SendBirdInput: React.FC<Props> = ({
  currentTicket,
  isDisabled = false,
  maxHeight,
  onKeyDown,
  onFileChange,
  onResize: onResizeProp,
  onSubmit,
  onKeyUp,
  setAgentTyping,
  agentTyping,
  sendMessage,
}) => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const toggleQuickRepliesRef = useRef<HTMLDivElement>(null);
  const dir = useCharDirection();

  const {
    searchCounts,

    isOpenCaretPopper,
    isOpenDropdownPopper,

    caretQuickReplyQuery,
    setCaretQuickReplyQuery,

    dropdownQuickReplyQuery,

    contentEditableRef,
    popperContentRef,

    saveSelectionOnContentEditable,

    handleQuickReplyEditableKeyDown,
    handleAppendQuickReply,
    handleQuickReplyIconButtonClick,
    handleCaretItemClick,

    reset,
  } = useContext(QuickRepliesContext);

  const outsideEvent = useOutsideEventByRef({
    ref: inputContainerRef,
    exceptionRefs: [popperContentRef],
    isExceptionsPreventOutsideClickEvent: true,
    onOutsideClick: reset,
  });

  const setContentEditableText = useCallback(
    (newText) => {
      if (contentEditableRef.current) {
        contentEditableRef.current.setText(newText);
      }
    },
    [contentEditableRef],
  );

  const getContentEditableText = useCallback(() => {
    if (contentEditableRef.current) {
      return contentEditableRef.current.getText();
    }
  }, [contentEditableRef]);

  const onSendFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isDisabled) {
      contentEditableRef.current?.blur();
    } else {
      contentEditableRef.current?.focus();
    }
  }, [contentEditableRef, isDisabled]);

  useEffect(() => {
    if (isOpenCaretPopper || isOpenDropdownPopper) {
      outsideEvent.subscribe();
    }

    if (!isOpenCaretPopper && !isOpenDropdownPopper) {
      outsideEvent.unsubscribe();
    }
  }, [isOpenCaretPopper, isOpenDropdownPopper, outsideEvent]);

  const debouncedSetCaretQuickReplyQuery = useMemo(
    () =>
      debounce((keyword: string) => {
        setCaretQuickReplyQuery(keyword);
      }, 300),
    [setCaretQuickReplyQuery],
  );

  const handleInputKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, text: string) => {
      saveSelectionOnContentEditable();
      onKeyUp(event, text);

      const isAgentTyping = !!text;
      if (isAgentTyping !== agentTyping) {
        setAgentTyping(isAgentTyping);
      }

      if (['Enter', 'Escape'].includes(event.key) && (isOpenCaretPopper || isOpenDropdownPopper)) {
        reset();
        return;
      }

      const query = getKeywordNearCaretOnContentEditable(contentEditableRef, '#');
      if (query !== caretQuickReplyQuery) {
        if (query === '#') {
          setCaretQuickReplyQuery('#');
          debouncedSetCaretQuickReplyQuery.cancel();
          return;
        }

        if (query.indexOf('#') === 0) {
          debouncedSetCaretQuickReplyQuery(query);
          return;
        }

        setCaretQuickReplyQuery('');
        debouncedSetCaretQuickReplyQuery.cancel();
      }
    },
    [
      agentTyping,
      caretQuickReplyQuery,
      contentEditableRef,
      debouncedSetCaretQuickReplyQuery,
      isOpenCaretPopper,
      isOpenDropdownPopper,
      onKeyUp,
      reset,
      saveSelectionOnContentEditable,
      setAgentTyping,
      setCaretQuickReplyQuery,
    ],
  );

  const handleSendMessage = () => {
    if (contentEditableRef.current) {
      sendMessage(getContentEditableText());
      setAgentTyping(false);
      setContentEditableText('');
    }
  };

  const handleKeyDown = (e) => {
    handleQuickReplyEditableKeyDown(currentTicket, e);
    onKeyDown?.(e);
  };

  const handleQuickReplyDropdownSelected = (item: QuickReplyTemplate) => (e: React.MouseEvent<HTMLLIElement>) => {
    e?.preventDefault();
    handleAppendQuickReply(currentTicket)(item);
    setAgentTyping(true);
  };

  const handleQuickReplyDropdownIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    outsideEvent.subscribe();
    saveSelectionOnContentEditable();
    handleQuickReplyIconButtonClick(e);
  };

  const onResize = (e) => {
    onResizeProp?.(e);
  };

  return (
    <StyledMessageInput ref={inputContainerRef}>
      <DisabledCover isDisabled={isDisabled} />
      <QuickRepliesPopper
        isOpen={isOpenCaretPopper}
        ticket={currentTicket}
        searchQuery={caretQuickReplyQuery.slice(1)}
        onItemClick={handleCaretItemClick(currentTicket)}
      />
      <CEWrapper
        styles={css`
          max-height: ${maxHeight}px;
        `}
      >
        {/* eslint-disable */}
        <ContentEditable
          dir={dir}
          ref={contentEditableRef as React.MutableRefObject<ContentEditableRef>}
          placeholder={intl.formatMessage({ id: 'desk.conversation.input.ph.message' })}
          isStopDefaultKeyDownEvent={isOpenCaretPopper}
          isEditable={!isDisabled}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={false}
          onKeyUp={handleInputKeyUp}
          onKeyDown={handleKeyDown}
          onResize={onResize}
          onSubmit={onSubmit}
          styles={css`
            padding: 17px 120px 17px 20px;
            word-wrap: break-word;
            white-space: pre-wrap;
          `}
        />
        {/* eslint-disable */}
      </CEWrapper>
      <ButtonWrapper>
        <IconButtonContainer>
          <QuickRepliesPopper
            isOpen={isOpenDropdownPopper}
            ticket={currentTicket}
            searchQuery={dropdownQuickReplyQuery}
            toggleRef={toggleQuickRepliesRef}
            onItemClick={handleQuickReplyDropdownSelected}
          />
          <ToggleQuickReplies ref={toggleQuickRepliesRef}>
            <IconButton
              icon="reply-template"
              size="small"
              buttonType="tertiary"
              title={intl.formatMessage({ id: 'desk.conversation.input.button.quickReply' })}
              disabled={Object.values(searchCounts).every((count) => count === 0)}
              onClick={handleQuickReplyDropdownIconClick}
              data-test-id="QuickReplyShortcutButton"
            />
          </ToggleQuickReplies>
        </IconButtonContainer>
        <FileInput>
          <IconButton
            icon="attach"
            size="small"
            buttonType="tertiary"
            title={intl.formatMessage({ id: 'desk.conversation.input.button.sendFile' })}
            disabled={agentTyping}
            onClick={onSendFileButtonClick}
            data-test-id="SendFileButton"
          />
          <input ref={fileInputRef} type="file" onChange={onFileChange} />
        </FileInput>
        <IconButton
          icon="send"
          size="small"
          buttonType="primary"
          title={intl.formatMessage({ id: 'desk.conversation.input.button.send' })}
          disabled={!agentTyping}
          onClick={handleSendMessage}
          data-test-id="SendMessageButton"
        />
      </ButtonWrapper>
    </StyledMessageInput>
  );
};
