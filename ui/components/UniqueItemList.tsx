import { ReactNode, forwardRef, MutableRefObject, HTMLAttributes } from 'react';
import { FixedSizeList } from 'react-window';

import styled, { css } from 'styled-components';

import { IconName, IconButton, ScrollBar, cssVariables, transitionDefault, ScrollBarProps, cssColors } from 'feather';
import { rgba } from 'polished';

type Props = {
  color: 'white' | 'neutral';
  items?: string[];
  renderItem?: (item: string) => ReactNode;
  disabled?: boolean;
  rowActions?: { icon: IconName; label: string; onClick: (item: string) => void }[];
} & HTMLAttributes<HTMLUListElement>;

const RowActionWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 1px;
  right: 0;
  bottom: 1px;
  align-items: center;
  min-width: 14px;
  height: 100%;
`;

const RowActions = styled.div`
  display: flex;
  align-items: center;
  transform: translateX(100%);
  overflow: hidden;
  opacity: 0;

  transition: 0.3s ${transitionDefault};
  transition-property: transform, opacity;
`;

const Gradient = styled.div`
  position: absolute;
  top: 1px;
  left: -40px;
  width: 40px;
  height: 28px;
`;

const ListItem = styled.li<{ showBorderBottom?: boolean; isDisabled?: boolean }>`
  display: flex;
  position: relative;
  align-items: center;
  padding: 0 14px;
  width: 100%;
  height: 30px;

  font-size: 14px;
  line-height: 20px;
  color: ${(props) => (props.isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-7'))};
  white-space: nowrap;

  &:not(:first-child)::before {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    top: 0;
    height: 1px;
  }

  ${({ showBorderBottom }) =>
    showBorderBottom &&
    css`
      &::after {
        content: '';
        position: absolute;
        left: 14px;
        right: 14px;
        bottom: 0;
        height: 1px;
      }
    `}

  &:hover {
    ${RowActions} {
      transform: translateX(-14px);
      opacity: 1;
    }
  }
`;

const List = styled.ul<{ color: Props['color'] }>`
  border-radius: 4px;
  height: 168px;
  overflow: hidden;

  ${({ color }) =>
    color === 'neutral'
      ? css`
          background-color: ${cssVariables('neutral-2')};

          ${RowActionWrapper} {
            background: ${cssVariables('neutral-2')};
          }

          ${ListItem}::before,${ListItem}::after {
            background-color: ${cssVariables('neutral-3')};
          }

          ${Gradient} {
            background-image: linear-gradient(
              to right,
              ${rgba(cssColors('neutral-2'), 0)},
              ${cssVariables('neutral-2')}
            );
          }
        `
      : css`
          background-color: white;
          border: 1px solid ${cssVariables('neutral-3')};

          ${RowActionWrapper} {
            background: white;
          }

          ${ListItem}::before,${ListItem}::after {
            background-color: ${cssVariables('neutral-2')};
          }

          ${Gradient} {
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0), white);
          }
        `};
`;

const RowAction = styled(IconButton).attrs({
  type: 'button',
  buttonType: 'tertiary',
  size: 'xsmall',
})``;

const VerticalScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>((props, ref) => (
  <ScrollBar
    ref={(scrollbarRef) => {
      if (typeof ref === 'function') {
        ref(scrollbarRef?.node ?? null);
      } else {
        (ref as MutableRefObject<HTMLDivElement | null>).current = scrollbarRef?.node ?? null;
      }
    }}
    options={{ suppressScrollX: true }}
    {...props}
  />
));

export const UniqueItemList = forwardRef<HTMLUListElement, Props>(
  ({ color, renderItem, items = [], disabled, rowActions = [], ...ulAttributes }, ref) => {
    return (
      <List ref={ref} color={color} {...ulAttributes}>
        <FixedSizeList
          itemSize={30}
          width="100%"
          height={168}
          itemCount={items.length}
          outerElementType={VerticalScrollBar}
        >
          {({ index, style }) => {
            const item = items[index];
            return (
              <ListItem
                key={`uniqueitem-${item}`}
                showBorderBottom={items.length === 1}
                style={style}
                isDisabled={disabled}
              >
                {renderItem?.(item) ?? item}
                {!disabled && rowActions.length > 0 && (
                  <RowActionWrapper>
                    <Gradient />
                    <RowActions>
                      {rowActions.map(({ label, icon, onClick }) => (
                        <RowAction
                          key={label}
                          icon={icon}
                          aria-label={label}
                          onClick={() => onClick(item)}
                          title={label}
                        />
                      ))}
                    </RowActions>
                  </RowActionWrapper>
                )}
              </ListItem>
            );
          }}
        </FixedSizeList>
      </List>
    );
  },
);
