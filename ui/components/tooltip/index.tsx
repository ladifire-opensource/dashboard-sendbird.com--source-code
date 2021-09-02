import React from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps } from '@ui';

import { Button } from '../button';
import { Popover, PopoverProps } from '../popover';

const StyledTooltip = styled.div<StyledProps>`
  color: ${(props) => props.theme.color};
  font-size: ${(props) => props.theme.fontSize};
  font-weight: ${(props) => props.theme.fontWeight};
  background: ${(props) => props.theme.background};
  padding: ${(props) => props.theme.padding};
  ${(props) => {
    if (props.theme.paddingBottom) {
      return css`
        padding-bottom: ${props.theme.paddingBottom};
      `;
    }
  }}
  min-width: 40px;
  line-height: 1.25;
  border-radius: 4px;
  ${(props) => props.styles};

  ${(props) => {
    if (props.placement === 'top') {
      return css`
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          bottom: -12px;
          left: calc(50% - -14px);
          margin-left: -19px;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-top: 6px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'top-end') {
      return css`
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          bottom: -12px;
          right: 16px;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-top: 6px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'left') {
      return css`
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          top: 50%;
          left: 100%;
          margin-top: -6px;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-left: 6px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'left-start') {
      return css`
        margin-top: -10px;
        &:before {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          top: 6px;
          left: 100%;
          border-color: transparent;
          border-width: 5px;
          border-style: solid;
          border-left: 5px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'right') {
      return css`
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          top: 50%;
          right: 100%;
          margin-top: -6px;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-right: 6px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'right-start') {
      return css`
        margin-top: -10px;
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          top: 6px;
          right: 100%;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-right: 6px solid ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'bottom') {
      return css`
        &:before {
          content: '';
          display: block;
          position: absolute;
          width: 0;
          height: 0;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          top: auto;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'bottom-start') {
      return css`
        &:before {
          content: '';
          display: block;
          position: absolute;
          width: 0;
          height: 0;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          top: auto;
          bottom: 100%;
          left: 16px;
          border-bottom-color: ${props.theme.background};
        }
      `;
    }
    if (props.placement === 'bottom-end') {
      return css`
        &:after {
          display: block;
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          top: -12px;
          right: 16px;
          border-color: transparent;
          border-width: 6px;
          border-style: solid;
          border-bottom: 6px solid ${props.theme.background};
        }
      `;
    }
  }};

  &:before,
  &:after {
    pointer-events: none;
  }
`;

const TooltipContent = styled.div<StyledProps>`
  ${(props) => (props.width ? `width: ${props.width}` : '')};
  line-height: 20px;
  padding-top: 0;
`;

const TooltipContentItem = styled.div`
  text-align: left;
  & + & {
    margin-top: 16px;
  }
`;

const TooltipContentItemHeader = styled.div`
  font-weight: 600;
`;

const TooltipContentItemDescription = styled.div``;

const TooltipAction = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;

  > button + button {
    margin-left: 8px;
  }
`;

const TooltipPrimaryButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid white;
  background: white;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  width: 80px;
  height: 32px;

  &:hover {
    background: #e0e6f4;
    border: 0;
  }

  &:focus {
    border: 2px solid ${cssVariables('purple-7')};
  }

  &:active {
    background: ${cssVariables('neutral-3')};
    border: 0;
  }
`;

const TooltipSecondaryButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid white;
  background: none;
  color: white;
  font-weight: 600;
  width: 80px;
  height: 32px;

  &:hover {
    border: 1px solid ${cssVariables('neutral-5')};
    color: ${cssVariables('neutral-3')};
  }

  &:focus {
    border: 2px solid ${cssVariables('purple-7')};
  }

  &:active {
    background: ${cssVariables('neutral-8')};
    border: 1px solid ${cssVariables('neutral-5')};
    color: ${cssVariables('neutral-3')};
  }
`;

type Props = {
  enabled?: boolean;
  items?: any[];
  theme?: string; // default, black
  styles?: SimpleInterpolation;
  contentWidth?: string;
  showArrow?: boolean;
  enablePrimaryButton?: boolean;
  enableSecondaryButton?: boolean;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  onClickPrimaryButton?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickSecondaryButton?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  // Popover props
  isOpen?: PopoverProps['isOpen'];
  target: PopoverProps['target'];
  content?: PopoverProps['content'];
  placement?: PopoverProps['placement'];
  offset?: PopoverProps['offset'];
  tag?: PopoverProps['tag'];
  targetStyle?: PopoverProps['targetStyle'];
  canOutsideClickClose?: PopoverProps['canOutsideClickClose'];
  interactionHover?: PopoverProps['interactionHover'];
  debug?: PopoverProps['debug'];
  hasBackdrop?: PopoverProps['hasBackdrop'];
  onClick?: PopoverProps['onClick'];
  onOpen?: PopoverProps['onOpen'];
  onClose?: PopoverProps['onClose'];
};

export class Tooltip extends React.PureComponent<Props> {
  private popoverComponent;
  private refHandlers = {
    popover: (ref) => {
      this.popoverComponent = ref;
    },
  };

  public static defaultProps: Partial<Props> = {
    showArrow: true,
    content: '',
    items: [],
    placement: 'top',
    offset: '0',
    theme: 'default',
    tag: 'div',
    canOutsideClickClose: false,
    interactionHover: true,
    debug: false,
    contentWidth: '',
    enabled: true,
    enablePrimaryButton: false,
    enableSecondaryButton: false,
    onClickPrimaryButton: () => {},
    onClickSecondaryButton: () => {},
    primaryButtonLabel: 'OK',
    secondaryButtonLabel: 'Cancel',
    hasBackdrop: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      this.close();
    }
  }

  private handleClickPrimaryBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClickPrimaryButton && this.props.onClickPrimaryButton(e);
    this.close();
  };

  private handleClickSecondaryBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClickSecondaryButton && this.props.onClickSecondaryButton(e);
    this.close();
  };

  private close = () => {
    this.setState({ isOpen: false });
    this.popoverComponent.close();
  };

  public render() {
    const {
      enabled,
      content,
      items,
      theme,
      styles,
      targetStyle,
      contentWidth,
      interactionHover,
      showArrow,
      enablePrimaryButton,
      enableSecondaryButton,
      primaryButtonLabel,
      secondaryButtonLabel,
      target,
      placement,
      offset,
      tag,
      canOutsideClickClose,
      debug,
      hasBackdrop,
      onClick,
      onOpen,
      onClose,
    } = this.props;

    const hasAction = enablePrimaryButton || enableSecondaryButton;

    const tooltipColors = {
      default: {
        background: cssVariables('neutral-10'),
        color: 'white',
        fontSize: content ? '13px' : '14px',
        fontWeight: content ? '600' : '400',
        padding: content ? '8px 16px' : '14px 16px 16px 16px',
        paddingBottom: hasAction && '10px',
      },
      black: {
        background: 'black',
        color: 'white',
        padding: '7px 10px',
      },
    };

    const styledContent = (
      <StyledTooltip theme={tooltipColors[theme!]} showArrow={showArrow} placement={placement} styles={styles}>
        {content ? (
          <TooltipContent width={contentWidth}>{content}</TooltipContent>
        ) : (
          <TooltipContent width={contentWidth}>
            {items &&
              items.map((item, index) => {
                return (
                  <TooltipContentItem key={`tooltipContentItem_${item.label}_${index}`}>
                    {item.header ? <TooltipContentItemHeader>{item.header}</TooltipContentItemHeader> : ''}
                    <TooltipContentItemDescription>{item.description}</TooltipContentItemDescription>
                  </TooltipContentItem>
                );
              })}
          </TooltipContent>
        )}
        {hasAction && (
          <TooltipAction>
            {enableSecondaryButton && (
              <TooltipSecondaryButton onClick={this.handleClickSecondaryBtn}>
                {secondaryButtonLabel}
              </TooltipSecondaryButton>
            )}
            {enablePrimaryButton && (
              <TooltipPrimaryButton onClick={this.handleClickPrimaryBtn}>{primaryButtonLabel}</TooltipPrimaryButton>
            )}
          </TooltipAction>
        )}
      </StyledTooltip>
    );

    return (
      <Popover
        ref={this.refHandlers.popover}
        {...this.props}
        tag={tag}
        target={target}
        content={styledContent}
        offset={offset}
        placement={placement}
        interactionHover={enabled && interactionHover}
        canOutsideClickClose={canOutsideClickClose}
        hasBackdrop={hasBackdrop}
        transitionDuration={100}
        backdropStyles={css`
          background: transparent;
        `}
        targetStyle={
          targetStyle ||
          css`
            line-height: 1;
          `
        }
        onClick={onClick}
        onOpen={onOpen}
        onClose={onClose}
        debug={debug}
      />
    );
  }
}
