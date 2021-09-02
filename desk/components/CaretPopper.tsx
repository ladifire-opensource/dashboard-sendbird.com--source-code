import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Popper, PopperProps } from 'react-popper';

import styled from 'styled-components';

import { cssVariables, ScrollBar, ScrollBarProps, ScrollBarRef, transitionDefault } from 'feather';

import { getBoundingClientRectAt } from '../containers/settings/quickReplies/caretUtils';

const PopperContainer = styled.div<{ isShow: boolean }>`
  position: absolute;
  padding: 8px 0;
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 3px 5px -3px rgba(33, 34, 66, 0.04), 0 3px 14px 2px rgba(33, 34, 66, 0.08),
    0 8px 10px 1px rgba(33, 34, 66, 0.12);
`;

const ItemContainer = styled.ul``;

export const CaretPopperItem = styled.li<{ isHighlighted: boolean }>`
  padding: 8px 16px;
  outline: 0;
  background: ${(props) => (props.isHighlighted ? cssVariables('neutral-1') : 'transparent')};
  transition: background 0.2 ${transitionDefault};
  cursor: pointer;

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  &:focus {
    box-shadow: inset 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

type ClientRect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

class VirtualReference {
  private rects = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  };

  constructor(clientRect?: ClientRect) {
    if (clientRect) {
      this.rects = clientRect;
    }
  }

  getBoundingClientRect() {
    return this.rects;
  }

  get clientWidth() {
    return this.getBoundingClientRect().width;
  }

  get clientHeight() {
    return this.getBoundingClientRect().height;
  }
}

type DefaultItem = {
  value: string | number;
  label?: string;
};

type Props<T> = {
  className?: string;
  isOpen: boolean;
  highlightedIndex: number;
  itemContainerRef?: React.RefObject<HTMLUListElement>;
  items: T[];
  itemToElement?: (item: T) => React.ReactNode;
  searchQuery?: string;
  popperProps?: PopperProps;
  scrollbarProps?: ScrollBarProps;
  scrollbarRef?: React.RefObject<ScrollBarRef>;
  onItemFilter?: (item: T) => boolean;
  onItemClick: (item: T) => (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
};

const CaretPopper = <T extends DefaultItem>({
  className,
  isOpen,
  highlightedIndex,
  itemContainerRef,
  items,
  itemToElement,
  searchQuery,
  popperProps,
  scrollbarProps,
  scrollbarRef,
  onItemFilter,
  onItemClick,
}: Props<T>) => {
  const [virtualReference, setVirtualReference] = useState(new VirtualReference());

  useEffect(() => {
    setVirtualReference(new VirtualReference(getBoundingClientRectAt()));
  }, [isOpen, items, searchQuery]);

  if (!isOpen) {
    return null;
  }

  const itemDatas = onItemFilter ? items.filter(onItemFilter) : items;

  return ReactDOM.createPortal(
    <Popper placement="top" referenceElement={virtualReference} {...popperProps}>
      {({ ref, style }) => (
        <PopperContainer className={className} ref={ref} style={style} isShow={isOpen}>
          <ScrollBar ref={scrollbarRef} {...scrollbarProps}>
            <ItemContainer ref={itemContainerRef}>
              {itemDatas.map((item, index) => (
                <CaretPopperItem
                  key={`${item.value}-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  isHighlighted={highlightedIndex === index}
                  onClick={onItemClick(item)}
                >
                  {itemToElement ? itemToElement(item) : item.label || item.value}
                </CaretPopperItem>
              ))}
            </ItemContainer>
          </ScrollBar>
        </PopperContainer>
      )}
    </Popper>,
    document.getElementById('portal_popup') as HTMLDivElement,
  );
};

export default CaretPopper;
