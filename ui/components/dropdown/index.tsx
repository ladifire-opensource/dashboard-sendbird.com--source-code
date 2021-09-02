import React from 'react';

import styled, { SimpleInterpolation, css, Interpolation } from 'styled-components';

import { elevation, cssVariables, Icon } from 'feather';

import { StyledProps } from '@ui';
import { transitionDefault } from '@ui/styles';

import { Popover, PopoverProps } from '../popover';

export interface DropdownOptionItem {
  label: React.ReactNode;
  value?: string | number;
  styles?: SimpleInterpolation;
  onClick?: (e) => void;
}

type DropdownProps = {
  defaultItem?: DropdownOptionItem;
  usePlaceholder?: boolean;
  header?: React.ReactNode;
  target?: React.ReactNode;
  ariaLabel?: string;
  items: DropdownOptionItem[];
  disable?: boolean;
  styles?: {
    DropdownTarget?: Interpolation<{ isOpen?: boolean; disable?: boolean }>;
    DropdownMenu?: SimpleInterpolation;
    DropdownItem?: SimpleInterpolation;
    DropdownArrow?: Interpolation<{ isOpen?: boolean }>;
  };
  showArrow?: boolean;
  arrowTheme?: 'gray';
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (item) => void;
} & Pick<PopoverProps, 'placement' | 'offset' | 'preventPropagation'>;

interface DropdownState {
  item: DropdownOptionItem;
  isOpen: boolean;
}

const StyledDropdownItem = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  height: 32px;
  font-size: 14px;
  padding: 4px 20px;
  color: ${cssVariables('neutral-10')};
  font-weight: 500;
  transition: background 0.2s ${transitionDefault};
  &:hover {
    cursor: pointer;
    background: ${cssVariables('neutral-1')};
  }

  ${(props) => props.styles};
`;

const DropdownItemLabel = styled.div``;

export const DropdownItem = ({ label, icon = '', ...rest }) => {
  return (
    <StyledDropdownItem {...rest} role="option">
      {icon}
      <DropdownItemLabel>{label}</DropdownItemLabel>
    </StyledDropdownItem>
  );
};

const DropdownTarget = styled.div<StyledProps & { isOpen?: boolean; disable: boolean }>`
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;

  ${(props) =>
    props.disable
      ? css`
          opacity: 0.5;
          &:hover {
            cursor: not-allowed;
            color: ${cssVariables('neutral-8')};
            background: white;
            border-color: ${cssVariables('neutral-5')};
          }
        `
      : ''}

  &:focus {
    outline: none;
  }

  ${(props) => props.styles};
`;

export const DropdownMenu = styled.div<StyledProps>`
  display: flex;
  min-width: 150px;
  padding: 8px 0;
  background: white;
  border-radius: 4px;
  flex-direction: column;
  ${elevation.popover}

  ${(props) => props.styles};
`;

const DropdownPlaceholder = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const GrayDropdownArrow = styled.div<{
  isOpen: boolean;
  styles: NonNullable<DropdownProps['styles']>['DropdownArrow'];
}>`
  width: 9px;
  height: 5px;
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjUiIHZpZXdCb3g9IjAgMCA5IDUiPiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiAgICAgICAgPHBhdGggZmlsbD0iIzlEQTNBRSIgZD0iTTAgMGw0LjE2NyA0LjE2N0w4LjMzMyAweiIvPiAgICAgICAgPHBhdGggZD0iTS03LTloMjJ2MjJILTd6Ii8+ICAgIDwvZz48L3N2Zz4=);
  transform: ${(props) => (props.isOpen ? 'rotate(-180deg)' : 'rotate(0deg)')};
  margin-left: 8px;

  ${(props) => props.styles as Interpolation<any>};
`;

const Arrow = styled(Icon)<{ isOpen: boolean }>`
  transition: 0.15s;
  transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

export class Dropdown extends React.Component<DropdownProps, DropdownState> {
  // @ts-ignore: unused ref
  private popoverComponent;
  private refHandlers = {
    popover: (ref) => (this.popoverComponent = ref),
  };

  public state = {
    item: this.props.defaultItem || ({} as DropdownOptionItem),
    isOpen: false,
  };

  private handleItemClick = (item) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (this.props.usePlaceholder) {
      this.setState({ item }, () => {
        this.props.onChange && this.props.onChange(item);
      });
    }
    item.onClick && item.onClick();
  };

  private renderDropdownHeader = () => {
    if (this.props.header) {
      return this.props.header;
    }
    return '';
  };

  private openMenu = () => {
    this.setState({ isOpen: true });
  };

  private closeMenu = () => {
    this.setState({ isOpen: false });
  };

  public componentDidUpdate(prevProps: DropdownProps, prevState: DropdownState) {
    const { isOpen } = this.state;
    const { onOpen, onClose } = this.props;

    if (prevState.isOpen !== isOpen) {
      isOpen ? onOpen?.() : onClose?.();
    }
  }

  private handleOpen = () => {
    this.openMenu();
  };

  private handleClose = () => {
    this.closeMenu();
  };

  public close = () => {
    this.closeMenu();
  };

  public render() {
    const {
      target,
      ariaLabel,
      items,
      styles = {
        DropdownMenu: '',
        DropdownItem: '',
        DropdownArrow: '',
      },
      showArrow = false,
      arrowTheme,
      usePlaceholder = false,
      disable,
      placement,
      offset,
      preventPropagation,
    } = this.props;

    const { item, isOpen } = this.state;

    // defaultValue
    /* 
    {
      label:,
      onClick:,
      value:,
    }
    */

    return (
      <Popover
        ref={this.refHandlers.popover}
        placement={placement}
        offset={offset}
        preventPropagation={preventPropagation}
        isOpen={isOpen}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        preventOpen={disable}
        target={
          <DropdownTarget
            styles={styles.DropdownTarget}
            isOpen={isOpen}
            disable={disable}
            tabIndex="0"
            aria-label={ariaLabel}
            data-test-id="Dropdown"
          >
            {usePlaceholder ? <DropdownPlaceholder>{item.label}</DropdownPlaceholder> : target}
            {showArrow &&
              (arrowTheme ? (
                <GrayDropdownArrow styles={styles.DropdownArrow} isOpen={isOpen} />
              ) : (
                <Arrow icon="input-arrow-down" size={20} isOpen={isOpen} />
              ))}
          </DropdownTarget>
        }
        content={
          <DropdownMenu styles={styles.DropdownMenu}>
            {this.renderDropdownHeader()}
            {items.map((item, index) => {
              return (
                <DropdownItem
                  key={`dropdownItem_${item.label}_${index}`}
                  label={item.label}
                  styles={item.styles ? item.styles : styles.DropdownItem}
                  onClick={this.handleItemClick(item)}
                />
              );
            })}
          </DropdownMenu>
        }
        interactionHover={false}
        canOutsideClickClose={true}
      />
    );
  }
}
