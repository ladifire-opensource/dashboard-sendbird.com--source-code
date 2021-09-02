import { Component, MouseEvent, ReactNode, RefCallback } from 'react';
import { Manager, Popper, Reference } from 'react-popper';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Overlay } from '../overlay';

const ensureElement = (child: ReactNode) => {
  if (typeof child === 'string') {
    return child.trim().length > 0 ? <span>{child}</span> : undefined;
  }
  if (typeof child === 'number') {
    return <span>{child}</span>;
  }
  return child;
};

const elementOrContains = (element: HTMLElement, testEl: Element) => {
  return element === testEl || element.contains(testEl);
};

const ContentWrapper = styled.div<{ minWidth: number }>`
  position: relative;
  min-width: ${(props) => (props.minWidth ? `${props.minWidth}px` : null)};
`;

export const TargetWrapper = styled.div<{
  styles: SimpleInterpolation;
  useCursor?: boolean;
}>`
  cursor: ${(props) => (props.useCursor ? 'pointer' : null)};
  ${(props) => props.styles}
`;

export type PopoverProps = {
  target: ReactNode;
  content: ReactNode;

  tag?: keyof JSX.IntrinsicElements;
  offset?: string;
  placement?:
    | 'top'
    | 'top-end'
    | 'left'
    | 'left-start'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end';

  preventOpen?: boolean;
  preventTargetClickClose?: boolean;
  interactionHover?: boolean;
  canOutsideClickClose?: boolean;
  isOpen?: boolean;
  useCursor?: boolean;
  usePortal?: boolean;
  hasBackdrop?: boolean;
  preventPropagation?: boolean;
  enableFlip?: boolean;

  transitionDuration?: number;
  targetStyle?: SimpleInterpolation;
  backdropStyles?: any;

  handleBackdropClick?: () => void;
  onClick?: () => void;
  onOpen?: () => void;
  onClose?: () => void;

  debug?: boolean;

  className?: string;
};

type State = {
  isOpen: boolean;
};

class Popover extends Component<PopoverProps, State> {
  public static defaultProps = {
    offset: '0',
    placement: 'top',

    preventOpen: false,
    preventTargetClickClose: false,
    interactionHover: false,
    canOutsideClickClose: true,
    useCursor: true,
    usePortal: true,
    hasBackdrop: false,
    preventPropagation: false,
    enableFlip: true,

    transitionDuration: 200,
    targetStyle: css``,
    backdropStyles: css``,
    debug: false,
  };

  private isMouseInTargetOrPopover = false;

  private targetComponent: HTMLDivElement | null = null;
  private refHandlers: { target: RefCallback<HTMLDivElement> } = {
    target: (ref) => {
      this.targetComponent = ref;
    },
  };

  public state = {
    isOpen: false,
  };

  get isControlled() {
    return this.props.isOpen != null;
  }

  get isOpen(): boolean {
    return this.props.isOpen == null ? this.state.isOpen : this.props.isOpen;
  }

  private openPopover = () => {
    if (this.isControlled) {
      // Notify the parent that isOpen must be updated to true.
      this.props.onOpen?.();
      return;
    }

    this.setState({ isOpen: true });
  };

  private closePopover = () => {
    if (this.isControlled) {
      // Notify the parent that isOpen must be updated to false.
      this.props.onClose?.();
      return;
    }

    this.setState({ isOpen: false });
  };

  private handleTargetClick = (event: MouseEvent<HTMLDivElement>) => {
    const { preventPropagation, onClick, preventOpen, preventTargetClickClose } = this.props;

    if (preventPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }

    onClick?.();

    if (preventOpen) {
      return;
    }

    if (this.isOpen) {
      if (!preventTargetClickClose) {
        this.closePopover();
      }
    } else {
      this.openPopover();
    }
  };

  public componentDidUpdate(prevProps: PopoverProps, prevState: State) {
    if (this.isControlled) {
      return;
    }

    const { isOpen } = this.state;
    const { onOpen, onClose } = this.props;

    if (prevState.isOpen !== isOpen) {
      isOpen ? onOpen?.() : onClose?.();
    }
  }

  private handleOverlayClose = (eventOrUndefined?: MouseEvent<unknown>) => {
    const eventTarget = eventOrUndefined?.target;
    const shouldClosePopover =
      this.targetComponent && eventTarget instanceof Element && !elementOrContains(this.targetComponent, eventTarget);

    if (shouldClosePopover) {
      this.closePopover();
    }
  };

  private handleMouseEnter = () => {
    this.isMouseInTargetOrPopover = true;
    if (this.props.interactionHover) {
      this.openPopover();
    }
  };

  private handleMouseLeave = () => {
    this.isMouseInTargetOrPopover = false;
    setTimeout(() => {
      if (this.isMouseInTargetOrPopover) {
        return;
      }
      if (!this.props.debug && this.props.interactionHover && this.state.isOpen) {
        this.closePopover();
      }
    }, 200);
  };

  private handleBackdropClick = () => {
    this.props.handleBackdropClick?.();
  };

  private refineChildren = () => {
    const { content, target } = this.props;

    return {
      content: ensureElement(content),
      target: ensureElement(target),
    };
  };

  private renderPopper = (content: ReactNode) => {
    const { offset, placement, usePortal, enableFlip = true, interactionHover } = this.props;

    const popoverProps = interactionHover
      ? { onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave }
      : null;

    return (
      <Popper
        placement={placement}
        modifiers={{
          flip: {
            enabled: enableFlip,
          },
          preventOverflow: {
            enabled: false,
            padding: 0,
            escapeWithReference: true,
          },
          hide: {
            enabled: false,
          },
          offset: {
            offset,
          },
        }}
        positionFixed={!usePortal}
      >
        {(popperProps) => {
          return (
            <ContentWrapper
              {...popoverProps}
              ref={popperProps.ref}
              minWidth={this.targetComponent?.offsetWidth ?? 0}
              style={popperProps.style}
            >
              <div>{content}</div>
            </ContentWrapper>
          );
        }}
      </Popper>
    );
  };

  public close() {
    this.closePopover();
  }

  public render() {
    const { useCursor, targetStyle, interactionHover, tag } = this.props;
    const { target, content } = this.refineChildren();

    return (
      <Manager>
        <Reference innerRef={this.refHandlers.target}>
          {({ ref }) => {
            return (
              <TargetWrapper
                as={tag}
                className={this.props.className}
                onClick={this.handleTargetClick}
                useCursor={useCursor}
                styles={targetStyle}
                onMouseEnter={interactionHover ? this.handleMouseEnter : undefined}
                onMouseLeave={interactionHover ? this.handleMouseLeave : undefined}
                ref={ref}
                data-test-id="PopoverTrigger"
              >
                {target}
              </TargetWrapper>
            );
          }}
        </Reference>
        <Overlay
          isOpen={this.isOpen}
          onClose={this.handleOverlayClose}
          canOutsideClickClose={this.props.canOutsideClickClose}
          transitionDuration={this.props.transitionDuration}
          usePortal={this.props.usePortal}
          hasBackdrop={this.props.hasBackdrop}
          handleBackdropClick={this.handleBackdropClick}
          backdropStyles={this.props.backdropStyles}
        >
          {this.renderPopper(content)}
        </Overlay>
      </Manager>
    );
  }
}

export { Popover };
