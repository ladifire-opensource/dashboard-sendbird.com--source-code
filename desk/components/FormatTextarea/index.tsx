import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Dropdown,
  IconButton,
  transitionDefault,
  Lozenge,
  DropdownProps,
  Tooltip,
  ContextualHelp,
  TooltipTargetIcon,
} from 'feather';

import CaretPopper from '@desk/components/CaretPopper';
import { useOutsideEventByRef } from '@hooks/useOutsideEventByRef';
import { ContentEditable, ContentEditableRef } from '@ui/components/contentEditable';

import {
  pasteHtmlAtCaret,
  ReplaceTextWithComponent,
  getKeywordNearCaretOnContentEditable,
  replaceWordNearCaret,
} from './caretUtils';

export type PropertyTagItem = {
  label: string;
  value: string;
};

type Props = {
  editorRef: React.RefObject<ContentEditableRef>;
  defaultText: string;
  propertyTags?: PropertyTagItem[];
  propertyTagTooltip?: string;
  contextualTooltip?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
  error?: string;
  onChange?: (message: string) => void;
};

enum TabEnum {
  ORIGINAL = 'ORIGINAL',
  PREVIEW = 'PREVIEW',
}

const Container = styled.div<{ isFocused: boolean; error?: string }>`
  position: relative;
  z-index: 1;
  padding: 0 16px 6px;
  min-height: 128px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => (props.isFocused ? cssVariables('purple-7') : cssVariables('neutral-4'))};
  border-color: ${(props) => props.error && cssVariables('red-5')};
  box-shadow: ${(props) => (props.isFocused ? `0 0 0 1px ${cssVariables('purple-7')}` : 'none')};
  box-shadow: ${(props) => props.error && `0 0 0 1px ${cssVariables('red-5')}`};
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
  z-index: 100;
  height: 40px;
  transform: translateX(8px) translateY(4px);
  display: flex;
  align-items: center;
`;

const contentEditorStyles = css`
  margin: 0;
  padding: 0;
  min-height: 68px;
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

const ErrorMessageText = styled.div`
  display: block;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
  margin-top: 4px;
  transition: 0.2s ${transitionDefault};
  transition-property: height, opacity, transform;
  will-change: height, opacity, transform;

  &[aria-hidden='true'] {
    height: 0;
    opacity: 0;
    transform: translateY(-12px);
  }
`;

const FormatTextarea = React.memo<Props>(
  ({
    editorRef,
    defaultText,
    propertyTags,
    propertyTagTooltip,
    placeholder,
    contextualTooltip,
    disabled,
    onChange,
    testId,
    error,
  }) => {
    const intl = useIntl();
    const [isFocused, setIsFocused] = useState(false);
    const [activeTab, setActiveTab] = useState<TabEnum>(TabEnum.ORIGINAL);
    const [propertyQuery, setPropertyQuery] = useState('');
    const [canUsePropertyPopup, setCanUsePropertyPopup] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const rangeRef = useRef<Range | null>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const propertyContainerRef = useRef<HTMLUListElement>(null);

    const onContainerBlur = () => {
      setIsFocused(false);
      setActiveTab(TabEnum.PREVIEW);
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
      if (nextActiveTab === TabEnum.ORIGINAL) {
        editorRef.current?.focus();
      } else {
        setIsFocused(false);
      }

      if (nextActiveTab !== activeTab) {
        setActiveTab(nextActiveTab);
      }
    };

    const handlePropertyTagClick: DropdownProps<PropertyTagItem>['onItemSelected'] = (item) => {
      rangeRef.current && item && pasteHtmlAtCaret(rangeRef.current, `{${item.value}}`);

      if (editorRef.current) {
        onChange?.(editorRef.current?.getText());
      }
    };

    const handleEditableFocus = () => {
      outsideEvent.subscribe();
      setIsFocused(true);
      setActiveTab(TabEnum.ORIGINAL);
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
      if (propertyTags && canUsePropertyPopup && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        e && e.preventDefault();
        const items = propertyTags.filter(itemToFilter);
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
              replaceWordNearCaret({ range: rangeRef.current, replaceValue: item.value, searchQuery: propertyQuery });
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

    const handleEditableKeyUp = useCallback(
      (e) => {
        e && e.stopPropagation();
        saveSelectionRange();
        setPropertyQuery(getKeywordNearCaretOnContentEditable(editorRef, '{') || '');
      },
      [editorRef],
    );

    const handlePropertyClick = (item: PropertyTagItem) => (e) => {
      e && e.preventDefault();
      replaceWordNearCaret({ range: rangeRef.current, replaceValue: item.value, searchQuery: propertyQuery });
      setCanUsePropertyPopup(false);
    };

    useEffect(() => {
      if (
        propertyQuery === '{' ||
        (propertyQuery.indexOf('{') === 0 &&
          propertyTags?.find((item) => item.value.toLowerCase().includes(propertyQuery.toLowerCase().slice(1))))
      ) {
        setCanUsePropertyPopup(true);
      } else {
        if (canUsePropertyPopup && propertyQuery.indexOf('{') !== 0) {
          setCanUsePropertyPopup(false);
        }
      }
    }, [canUsePropertyPopup, propertyQuery, propertyTags]);

    useEffect(() => {
      editorRef.current && editorRef.current.setText(defaultText);
    }, [defaultText, editorRef]);

    const isOriginalActive = activeTab === TabEnum.ORIGINAL;
    const isPreviewActive = activeTab === TabEnum.PREVIEW;
    const viewerValues = propertyTags?.reduce((acc, cur) => {
      acc[cur.value] = (
        <EditorTag color="neutral" key={cur.value}>
          {cur.label}
        </EditorTag>
      );
      return acc;
    }, {});

    return (
      <>
        {propertyTags && (
          <CaretPopper<PropertyTagItem>
            isOpen={canUsePropertyPopup}
            searchQuery={propertyQuery.slice(1)}
            highlightedIndex={highlightedIndex}
            itemContainerRef={propertyContainerRef}
            items={propertyTags}
            itemToElement={(item) => (
              <EditorTag color="neutral" key={item.value}>
                {item.label}
              </EditorTag>
            )}
            onItemFilter={itemToFilter}
            onItemClick={handlePropertyClick}
          />
        )}
        <Container id="FormatTextareaContainer" ref={messageContainerRef} isFocused={isFocused} error={error}>
          <EditorFunctions>
            <EditorTabs>
              <EditorTab isActive={activeTab === TabEnum.ORIGINAL} onClick={handleTabClick(TabEnum.ORIGINAL)}>
                {intl.formatMessage({ id: 'ui.formatTextarea.tab.write' })}
              </EditorTab>
              <EditorTab isActive={isPreviewActive} onClick={handleTabClick(TabEnum.PREVIEW)}>
                {intl.formatMessage({ id: 'ui.formatTextarea.tab.preview' })}
              </EditorTab>
            </EditorTabs>
            {propertyTags && (
              <EditorPropertyTag data-test-id="PropertyTagMenu">
                {contextualTooltip && (
                  <ContextualHelp
                    content={contextualTooltip}
                    tooltipContentStyle={css`
                      width: 360px;
                      cursor: default;
                    `}
                    placement="top-end"
                  >
                    <TooltipTargetIcon icon="info" />
                  </ContextualHelp>
                )}
                <Dropdown<PropertyTagItem>
                  variant="inline"
                  showArrow={false}
                  placement="bottom-end"
                  disabled={isPreviewActive || disabled}
                  selectedItem={{
                    label: '',
                    value: '',
                  }}
                  items={propertyTags}
                  itemToElement={(item) => (
                    <EditorTag color="neutral" key={item.value}>
                      {item.label}
                    </EditorTag>
                  )}
                  toggleRenderer={() => (
                    <Tooltip placement="top-end" content={propertyTagTooltip ?? 'PropertyTag'} portalId="portal_popup">
                      <IconButton
                        icon="metadata"
                        buttonType="primary"
                        size="small"
                        disabled={isPreviewActive || disabled}
                        onClick={handleToggleClick}
                      />
                    </Tooltip>
                  )}
                  onItemSelected={handlePropertyTagClick}
                />
              </EditorPropertyTag>
            )}
          </EditorFunctions>
          <EditorContainer>
            {/* eslint-disable */}
            <Editable
              ref={editorRef as React.MutableRefObject<ContentEditableRef>}
              autoFocus={false}
              placeholder={placeholder}
              isEnterKeySubmit={false}
              isEditable={!disabled}
              isStopDefaultKeyDownEvent={canUsePropertyPopup}
              onFocus={handleEditableFocus}
              onBlur={handleEditableBlur}
              onKeyDown={handleEditableKeyDown}
              onKeyUp={handleEditableKeyUp}
              onChange={onChange}
              testId={testId}
              styles={css`
                ${contentEditorStyles};
                opacity: ${isOriginalActive ? 1 : 0};
                transition: opacity 0.3s ${transitionDefault};
              `}
            />
            {/* eslint-disable */}
            <Viewer isShow={isPreviewActive} data-test-id="Preview">
              <ReplaceTextWithComponent text={editorRef.current?.getText() || ''} values={viewerValues} />
            </Viewer>
          </EditorContainer>
        </Container>
        <ErrorMessageText data-test-id="ErrorMessage" aria-hidden={!error}>
          {error}
        </ErrorMessageText>
      </>
    );
  },
);

export default FormatTextarea;
