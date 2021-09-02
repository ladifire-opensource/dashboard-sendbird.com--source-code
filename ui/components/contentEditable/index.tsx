import React, { useEffect, useRef, HTMLAttributes, KeyboardEvent, useCallback, DOMAttributes } from 'react';
import { useIntl } from 'react-intl';

import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables } from 'feather';
import { ResizeObserver } from 'resize-observer';
import { ContentRect } from 'resize-observer/lib/ContentRect';

const StyledContentEditable = styled.div<{ styles: SimpleInterpolation }>`
  padding: 22px 20px;
  color: ${cssVariables('neutral-8')};
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  word-break: break-word;
  background: white;
  cursor: text;
  &:focus {
    outline: none;
  }

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: ${cssVariables('neutral-6')};
  }

  ${(props) => props.styles};
`;

type Props = {
  dir?: React.HTMLAttributes<HTMLDivElement>['dir'];
  className?: string;
  placeholder?: string;
  isEditable?: boolean;
  isEnterKeySubmit?: boolean;
  autoFocus?: boolean;
  isStopDefaultKeyDownEvent?: boolean;
  testId?: string;
  onKeyUp?: (e: KeyboardEvent<HTMLDivElement>, text: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>, text: string) => void;
  onKeyPress?: (e: KeyboardEvent<HTMLDivElement>, text: string) => void;
  onResize?: (contentRect: ContentRect) => void;
  onSubmit?: (text: string) => void;
  onChange?: (text: string) => void;

  styles?: any;
} & Pick<HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'>;

export interface ContentEditableRef {
  getText(): string;
  setText(text: string): void;
  getInnerHTML(): string;
  getCurrent(): HTMLDivElement | null;
  focus(): void;
  blur(): void;
}

export const ContentEditable = React.forwardRef<ContentEditableRef, Props>(
  (
    {
      dir,
      className,
      isEditable = true,
      isEnterKeySubmit = true,
      autoFocus = true,
      isStopDefaultKeyDownEvent = false,
      onResize,
      onKeyUp,
      onKeyDown,
      onKeyPress,
      onFocus,
      onBlur,
      onChange,
      onSubmit,
      placeholder,
      testId,
      styles,
    },
    ref,
  ) => {
    const intl = useIntl();
    const contentEditable = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const ro = new ResizeObserver((entries) => {
        onResize && onResize(entries[0].contentRect);
      });
      ro.observe(contentEditable.current!);

      if (autoFocus) {
        setTimeout(() => {
          contentEditable.current && contentEditable.current.focus();
        }, 0);
      }
    }, [autoFocus, onResize]);

    const getText = () => {
      return contentEditable.current?.innerText || '';
    };

    const previousText = useRef(contentEditable.current?.innerText ?? '');

    const triggerOnChangeIfNeeded = useCallback(
      (currentText: string = getText()) => {
        const { current: currentPreviousText } = previousText;
        previousText.current = currentText;
        if (onChange) {
          if (currentPreviousText !== currentText) {
            onChange(currentText);
          }
        }
      },
      [onChange],
    );

    const getInnerHTML = () => {
      return contentEditable.current?.innerHTML || '';
    };

    const setText = useCallback(
      (text) => {
        if (contentEditable.current) {
          contentEditable.current.textContent = text;
          triggerOnChangeIfNeeded(text);
        }
      },
      [triggerOnChangeIfNeeded],
    );

    const handleKeyUp = (e) => {
      e.stopPropagation();
      onKeyUp?.(e, getText());
      triggerOnChangeIfNeeded();
    };

    const handleKeyDown = (e) => {
      e.stopPropagation();

      onKeyDown?.(e, getText());
      triggerOnChangeIfNeeded();
    };

    const handleKeyPress = (e) => {
      e.stopPropagation();
      onKeyPress?.(e, getText());
      triggerOnChangeIfNeeded();

      if (!isStopDefaultKeyDownEvent) {
        switch (e.key) {
          case 'Enter':
            if (isEnterKeySubmit && !e.shiftKey) {
              e.preventDefault();
              onSubmit?.(getText());
              e.target.innerHTML = '';
            }
            break;

          default:
            break;
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    useEffect(() => {
      const refHandler = ref as React.MutableRefObject<ContentEditableRef>;
      if (refHandler) {
        refHandler.current = {
          getText,
          getInnerHTML,
          setText,
          getCurrent: () => {
            return contentEditable.current;
          },
          focus: () => {
            if (contentEditable.current) {
              contentEditable.current.focus();
            }
          },
          blur: () => {
            if (contentEditable.current) {
              contentEditable.current.blur();
            }
          },
        };
      }
    }, [ref, setText]);

    const ignoreEvents: Pick<DOMAttributes<HTMLDivElement>, 'onDragOver' | 'onDrop'> = {
      onDragOver: (event) => {
        event.preventDefault();
      },
      onDrop: (event) => {
        event.preventDefault();
      },
    };

    return (
      <StyledContentEditable
        role="textbox"
        dir={dir}
        className={className}
        ref={contentEditable}
        contentEditable={isEditable}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onKeyPress={handleKeyPress}
        onPaste={handlePaste}
        {...ignoreEvents}
        placeholder={placeholder || intl.formatMessage({ id: 'common.contentEditable.input.placeholder' })}
        styles={styles}
        data-test-id={testId ?? 'ContentEditable'}
      />
    );
  },
);
