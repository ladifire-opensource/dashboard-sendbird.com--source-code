import React, { useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Dropdown, IconButton, transitionDefault, Lozenge, DropdownProps, Tooltip } from 'feather';

import CaretPopper from '@desk/components/CaretPopper';
import { useCharDirection } from '@hooks/useCharDirection';
import { useOutsideEventByRef } from '@hooks/useOutsideEventByRef';
import { ContentEditableRef, ContentEditable } from '@ui/components';

import {
  MessagePropertyTagEnum,
  pasteHtmlAtCaret,
  MessagePropertyLabelMap,
  ReplaceTextWithComponent,
  getKeywordNearCaretOnContentEditable,
  replaceWordNearCaret,
} from './caretUtils';

type QuickRepliesEditorProps = {
  editorRef: React.RefObject<ContentEditableRef>;
  editableText: QuickReply['message'];
};

type QuickRepliesPropertyTagItem = {
  label: string;
  nodeLabel: string;
  value: MessagePropertyTagEnum;
};

enum QuickRepliesEditorTabEnum {
  ORIGINAL = 'ORIGINAL',
  PREVIEW = 'PREVIEW',
}

const Container = styled.div<{ isFocused: boolean }>`
  position: relative;
  z-index: 1;
  padding: 0 16px 12px;
  min-height: 200px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => (props.isFocused ? cssVariables('purple-7') : cssVariables('neutral-3'))};
  box-shadow: ${(props) => (props.isFocused ? `0 0 0 1px ${cssVariables('purple-7')}` : 'none')};
  transition: 0.2s ${transitionDefault};
  transition-property: color, background, border, box-shadow;
  will-change: color, background, border, box-shadow;

  &:focus {
    border-color: ${cssVariables('purple-7')};
    box-shadow: 0 0 0 1px ${cssVariables('purple-7')};
  }

  #caret {
    display: inline-block;
    width: 1px;
    height: 18px;
    background: ${cssVariables('purple-7')};
  }
`;

const EditorFunctions = styled.div`
  display: flex;
  align-items: center;
`;

const EditorTabs = styled.ul`
  display: flex;
  flex: 1;
`;

const EditorTag = styled(Lozenge)`
  display: inline-block;
  font-family: 'Roboto Mono', monospace;
  color: ${cssVariables('neutral-10')} !important;
`;

const EditorTab = styled.li<{ isActive: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 24px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${(props) => (props.isActive ? cssVariables('purple-7') : cssVariables('neutral-7'))};
  cursor: pointer;

  &:before {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: ${cssVariables('purple-7')};
    opacity: ${(props) => (props.isActive ? 1 : 0)};
    transform: scale(${(props) => (props.isActive ? 1 : 0)});
    transition: 0.2s ${transitionDefault};
    transition-property: opacity, transform;
  }
`;

const EditorPropertyTag = styled.div`
  flex: none;
  position: relative;
  z-index: 40;
  height: 40px;
  transform: translateX(8px) translateY(4px);
`;

const contentEditorStyles = css`
  margin: 0;
  padding: 0;
  min-height: 136px;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
  background: none;
  outline: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
`;
const EditorContainer = styled.div`
  position: relative;
  margin-top: 12px;
`;

const Editable = styled(ContentEditable)`
  position: relative;
  z-index: 30;
`;

const Viewer = styled.div<{ isShow: boolean }>`
  ${contentEditorStyles}
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  opacity: ${(props) => (props.isShow ? 1 : 0)};
  transition: opacity 0.3s ${transitionDefault};
`;

const messagePropertyTagItems: QuickRepliesPropertyTagItem[] = [
  {
    label: `{${MessagePropertyTagEnum.TICKET_NAME}}`,
    nodeLabel: 'Ticket name',
    value: MessagePropertyTagEnum.TICKET_NAME,
  },
  {
    label: `{${MessagePropertyTagEnum.CUSTOMER_DISPLAY_NAME}}`,
    nodeLabel: 'Customer name',
    value: MessagePropertyTagEnum.CUSTOMER_DISPLAY_NAME,
  },
  {
    label: `{${MessagePropertyTagEnum.AGENT_DISPLAY_NAME}}`,
    nodeLabel: 'Agent name',
    value: MessagePropertyTagEnum.AGENT_DISPLAY_NAME,
  },
];

export const QuickRepliesEditor = React.memo<QuickRepliesEditorProps>(({ editorRef, editableText }) => {
  const intl = useIntl();
  const dir = useCharDirection();
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<QuickRepliesEditorTabEnum>(QuickRepliesEditorTabEnum.ORIGINAL);
  const [propertyQuery, setPropertyQuery] = useState('');
  const [canUsePropertyPopup, setCanUsePropertyPopup] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const rangeRef = useRef<Range | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const propertyContainerRef = useRef<HTMLUListElement>(null);

  const onContainerBlur = () => {
    setIsFocused(false);
    setActiveTab(QuickRepliesEditorTabEnum.PREVIEW);
    setCanUsePropertyPopup(false);
    setHighlightedIndex(-1);
  };

  const outsideEvent = useOutsideEventByRef({
    ref: messageContainerRef,
    exceptionRefs: [propertyContainerRef],
    isExceptionsPreventOutsideClickEvent: true,
    onOutsideClick: onContainerBlur,
  });

  const saveSelectionRange = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.getRangeAt && selection.rangeCount) {
        rangeRef.current = selection.getRangeAt(0);
      }
    }
  };

  const itemToFilter = (item) => {
    return (
      propertyQuery === '{' ||
      (propertyQuery ? item.value.toLowerCase().includes(propertyQuery.slice(1).toLowerCase()) : true)
    );
  };

  const handleTabClick = (nextActiveTab) => () => {
    if (nextActiveTab === QuickRepliesEditorTabEnum.ORIGINAL) {
      editorRef.current?.focus();
    } else {
      setIsFocused(false);
    }

    if (nextActiveTab !== activeTab) {
      setActiveTab(nextActiveTab);
    }
  };

  const handlePropertyTagClick: DropdownProps<QuickRepliesPropertyTagItem>['onItemSelected'] = (item) => {
    rangeRef.current && item && pasteHtmlAtCaret(rangeRef.current, item.label);
  };

  const handleEditableFocus = () => {
    outsideEvent.subscribe();
    setIsFocused(true);
    setActiveTab(QuickRepliesEditorTabEnum.ORIGINAL);
    saveSelectionRange();
  };

  const handleEditableBlur = () => {
    outsideEvent.unsubscribe();
  };

  const handleToggleClick = () => {
    editorRef.current?.focus();
  };

  const handleEditableKeyDown = (e) => {
    e && e.stopPropagation();
    if (canUsePropertyPopup && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
      e && e.preventDefault();
      const items = messagePropertyTagItems.filter(itemToFilter);
      const item = items[highlightedIndex];
      const itemMaxIndex = items.length - 1;
      switch (e.key) {
        case 'ArrowUp':
          if (highlightedIndex - 1 < 0) {
            setHighlightedIndex(itemMaxIndex);
          } else {
            setHighlightedIndex(highlightedIndex - 1);
          }
          break;

        case 'ArrowDown':
          if (highlightedIndex + 1 > itemMaxIndex) {
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex(highlightedIndex + 1);
          }
          break;

        case 'Enter':
          if (item) {
            replaceWordNearCaret({ range: rangeRef.current, replaceValue: item.label, searchQuery: propertyQuery });
          }
          setCanUsePropertyPopup(false);
          setHighlightedIndex(-1);
          break;

        case 'Escape':
          setCanUsePropertyPopup(false);
          setHighlightedIndex(-1);
          break;

        default:
          break;
      }
    } else {
      saveSelectionRange();
    }
  };

  const handleEditableKeyUp = (e) => {
    e && e.stopPropagation();
    saveSelectionRange();
    setPropertyQuery(getKeywordNearCaretOnContentEditable(editorRef, '{') || '');
  };

  const handlePropertyClick = (item: QuickRepliesPropertyTagItem) => (e) => {
    e && e.preventDefault();
    replaceWordNearCaret({ range: rangeRef.current, replaceValue: item.label, searchQuery: propertyQuery });
    setCanUsePropertyPopup(false);
  };

  useEffect(() => {
    if (
      propertyQuery === '{' ||
      (propertyQuery.indexOf('{') === 0 &&
        messagePropertyTagItems.find((item) => item.value.toLowerCase().includes(propertyQuery.toLowerCase().slice(1))))
    ) {
      setCanUsePropertyPopup(true);
    } else {
      if (canUsePropertyPopup && propertyQuery.indexOf('{') !== 0) {
        setCanUsePropertyPopup(false);
      }
    }
  }, [propertyQuery]);

  useEffect(() => {
    editorRef.current && editorRef.current.setText(editableText);
  }, [editableText]);

  const isOriginalActive = activeTab === QuickRepliesEditorTabEnum.ORIGINAL;
  const isPreviewActive = activeTab === QuickRepliesEditorTabEnum.PREVIEW;

  return (
    <>
      <CaretPopper<QuickRepliesPropertyTagItem>
        isOpen={canUsePropertyPopup}
        searchQuery={propertyQuery.slice(1)}
        highlightedIndex={highlightedIndex}
        itemContainerRef={propertyContainerRef}
        items={messagePropertyTagItems}
        itemToElement={(item) => <EditorTag color="neutral">{item.nodeLabel}</EditorTag>}
        onItemFilter={itemToFilter}
        onItemClick={handlePropertyClick}
      />
      <Container id="QuickReplyEditorContainer" ref={messageContainerRef} isFocused={isFocused}>
        <EditorFunctions>
          <EditorTabs>
            <EditorTab
              isActive={activeTab === QuickRepliesEditorTabEnum.ORIGINAL}
              onClick={handleTabClick(QuickRepliesEditorTabEnum.ORIGINAL)}
            >
              {intl.formatMessage({ id: 'desk.settings.quickReplies.detail.tab.write' })}
            </EditorTab>
            <EditorTab isActive={isPreviewActive} onClick={handleTabClick(QuickRepliesEditorTabEnum.PREVIEW)}>
              {intl.formatMessage({ id: 'desk.settings.quickReplies.detail.tab.preview' })}
            </EditorTab>
          </EditorTabs>
          <EditorPropertyTag>
            <Dropdown<QuickRepliesPropertyTagItem>
              variant="inline"
              showArrow={false}
              placement="bottom-end"
              disabled={isPreviewActive}
              selectedItem={{
                label: '',
                nodeLabel: '',
                value: MessagePropertyTagEnum.NONE,
              }}
              items={messagePropertyTagItems}
              itemToElement={(item) => <EditorTag color="neutral">{item.nodeLabel}</EditorTag>}
              toggleRenderer={() => (
                <Tooltip
                  placement="top-end"
                  content={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.tooltip.propertyTags' })}
                  portalId="QuickReplyEditorContainer"
                >
                  <IconButton
                    icon="metadata"
                    buttonType="primary"
                    size="small"
                    disabled={isPreviewActive}
                    onClick={handleToggleClick}
                  />
                </Tooltip>
              )}
              onItemSelected={handlePropertyTagClick}
            />
          </EditorPropertyTag>
        </EditorFunctions>
        <EditorContainer>
          {/* eslint-disable */}
          <Editable
            dir={dir}
            ref={editorRef as React.MutableRefObject<ContentEditableRef>}
            placeholder=" "
            isEnterKeySubmit={false}
            isStopDefaultKeyDownEvent={canUsePropertyPopup}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={false}
            onFocus={handleEditableFocus}
            onBlur={handleEditableBlur}
            onKeyDown={handleEditableKeyDown}
            onKeyUp={handleEditableKeyUp}
            styles={css`
              ${contentEditorStyles}
              opacity: ${isOriginalActive ? 1 : 0};
              transition: opacity 0.3s ${transitionDefault};
            `}
          />
          {/* eslint-disable */}
          <Viewer dir={dir} isShow={isPreviewActive}>
            <ReplaceTextWithComponent
              text={editorRef.current?.getText() || ''}
              values={{
                ticketName: <EditorTag color="neutral">{MessagePropertyLabelMap.ticket.name}</EditorTag>,
                customerName: <EditorTag color="neutral">{MessagePropertyLabelMap.customer.displayName}</EditorTag>,
                agentName: <EditorTag color="neutral">{MessagePropertyLabelMap.agent.displayName}</EditorTag>,
              }}
            />
          </Viewer>
        </EditorContainer>
      </Container>
    </>
  );
});
