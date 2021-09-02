import { useState, useCallback, useRef, memo, FC } from 'react';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { Icon, cssVariables, toast, transitions } from 'feather';
import numbro from 'numbro';

import { convertURLsAndEmailsToLinks } from '@utils';

import { SlideTransition } from '../SlideTransition';

const Value = styled.div`
  position: relative;
  height: 100%; // make this element to have full height, so user has better experience while interacting with hover menus
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  word-break: break-word;
`;

const HoverMenu = styled(SlideTransition)<{ verticalPosition: number }>`
  position: absolute;
  top: calc(${({ verticalPosition }) => (verticalPosition ? verticalPosition / 2 - 12 : 0)}px);
  right: 0;
`;

const HoverMenuItem = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
  transition: ${transitions({ properties: ['background'], duration: 0.3 })};
  cursor: pointer;

  & + & {
    margin-left: 4px;
  }

  &:hover {
    background: ${cssVariables('neutral-2')};
  }
`;

type Props = {
  isEditable: boolean;
  field: CustomField;
  value: CustomFieldData['value'];
  onEditButtonClick: (e: any) => void;
};

export const CustomFieldValue: FC<Props> = memo(({ isEditable, field, value, onEditButtonClick }) => {
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHover(false);
  }, []);

  const handleClickCopyButton = useCallback(() => {
    toast.success({
      message: `${field.name} copied`,
    });
    if (field.fieldType === 'LINK') {
      copy(JSON.parse(value).url);
    } else {
      copy(value);
    }
  }, [field, value]);

  const getCustomValue = useCallback(() => {
    if (field) {
      if (field.fieldType === 'INTEGER') {
        return numbro(value).format({ thousandSeparated: true, mantissa: 0 });
      }

      if (field.fieldType === 'LINK') {
        const { text, url } = JSON.parse(value);
        return (
          <a href={url} target="_blank">
            {text || url}
          </a>
        );
      }
      return convertURLsAndEmailsToLinks(value);
    }
  }, [field, value]);

  return (
    <Value onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} data-test-id="CustomFieldValue">
      <span ref={valueRef}>{getCustomValue()}</span>
      <HoverMenu show={isHover} duration={0.1} verticalPosition={valueRef.current?.offsetHeight ?? 0}>
        <HoverMenuItem onClick={handleClickCopyButton} data-test-id="CustomFieldButtonCopy">
          <Icon icon="copy" size={16} />
        </HoverMenuItem>
        {isEditable && (
          <HoverMenuItem onClick={onEditButtonClick} data-test-id="CustomFieldEditCopy">
            <Icon icon="edit" size={16} />
          </HoverMenuItem>
        )}
      </HoverMenu>
    </Value>
  );
});
