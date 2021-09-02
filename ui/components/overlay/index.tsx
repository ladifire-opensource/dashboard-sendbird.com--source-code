import React from 'react';
import * as ReactDOM from 'react-dom';
import { TransitionGroup, Transition } from 'react-transition-group';

import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps } from '@ui';
import { transitionDefault } from '@ui/styles';

import { Portal } from '../portal';
import { intersectRect } from './intersectRect';

const Backdrop = styled.div<StyledProps>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${cssVariables('bg-overlay-4')};
  overflow: auto;
  user-select: none;
  ${(props) => props.styles};
`;

type Props = {
  isOpen: boolean;
  usePortal?: boolean;
  canOutsideClickClose?: boolean;
  hasBackdrop?: boolean;
  backdropStyles?: any;
  zIndex?: number;
  transitionDuration?: number;
  onClose?: (e?) => void;
  handleBackdropClick?: (e?) => void;
};

type State = {
  hasEverOpened: boolean;
};

const transitionStyles = {
  entering: {
    opacity: 0,
  },
  entered: {
    opacity: 1,
  },
  exiting: {
    opacity: 0,
  },
  exited: {
    opacity: 0,
  },
};

export class Overlay extends React.Component<Props, State> {
  private containerComponent: Element | null;
  private refHandlers = {
    container: (ref) => {
      this.containerComponent = ReactDOM.findDOMNode(ref) as Element | null;
    },
  };

  public state = {
    hasEverOpened: this.props.isOpen,
  };
  componentDidMount() {
    this.overlayWillClose();
    if (this.props.isOpen) {
      this.overlayWillOpen();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (state.hasEverOpened !== props.isOpen) {
      return {
        ...state,
        hasEverOpened: props.isOpen,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen) {
      this.overlayWillClose();
    } else if (!prevProps.isOpen && this.props.isOpen) {
      this.overlayWillOpen();
    }
  }

  private handleBackdropMouseDown = () => {
    const { isOpen, onClose, canOutsideClickClose = true } = this.props;
    if (isOpen && canOutsideClickClose) {
      if (onClose) {
        onClose();
      }
    }
    if (this.props.handleBackdropClick) {
      this.props.handleBackdropClick();
    }
  };

  private handleDocumentClick = (e) => {
    const { isOpen, onClose, canOutsideClickClose = true } = this.props;

    const eventTarget = e.target;
    const isClickInOverlay =
      this.containerComponent !== null &&
      (this.containerComponent.contains(eventTarget) ||
        intersectRect(this.containerComponent.getBoundingClientRect(), eventTarget.getBoundingClientRect()));

    if (isOpen && canOutsideClickClose && !isClickInOverlay) {
      if (onClose) {
        onClose(e);
      }
    }
  };

  private overlayWillOpen = () => {
    const { canOutsideClickClose = true, hasBackdrop = false } = this.props;
    if (canOutsideClickClose && !hasBackdrop) {
      document.addEventListener('click', this.handleDocumentClick);
      document.addEventListener('touchend', this.handleDocumentClick);
    }
  };

  private overlayWillClose = () => {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('touchend', this.handleDocumentClick);
  };

  private renderBackdrop = () => {
    const {
      zIndex,
      isOpen,
      canOutsideClickClose = true,
      hasBackdrop = false,
      backdropStyles = css``,
      transitionDuration = 200,
    } = this.props;

    const defaultStyle = {
      transition: `opacity ${transitionDuration}ms ${transitionDefault}`,
    };

    if (hasBackdrop && isOpen) {
      return (
        <Transition key="overlay_transition" in={isOpen} timeout={transitionDuration} unmountOnExit={true}>
          {(state) => (
            <Backdrop
              data-test-id="Backdrop"
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
              zIndex={zIndex}
              onClick={this.handleBackdropMouseDown}
              canOutsideClickClose={canOutsideClickClose}
              tabIndex={canOutsideClickClose ? 0 : -1}
              styles={backdropStyles}
            />
          )}
        </Transition>
      );
    }
    return '';
  };

  private maybeRenderChild = (child) => {
    if (child == null) {
      return null;
    }

    const { transitionDuration = 200 } = this.props;

    const decoratedChildren = React.cloneElement(child as React.ReactElement<any>);

    const defaultStyle = {
      transition: `opacity ${transitionDuration}ms ${transitionDefault}`,
      position: 'relative',
      zIndex: 1,
    };

    return (
      <Transition
        key={`transition-${child.key}`}
        in={this.props.isOpen}
        timeout={transitionDuration}
        unmountOnExit={true}
      >
        {(state) => {
          return (
            <div
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              {decoratedChildren}
            </div>
          );
        }}
      </Transition>
    );
  };

  public render() {
    const { isOpen = false, zIndex, children, usePortal = true } = this.props;

    if (!this.state.hasEverOpened) {
      return null;
    }

    const childrenWithTransitions: any[] = isOpen ? React.Children.map(children, this.maybeRenderChild) : [];
    childrenWithTransitions.push(this.renderBackdrop());

    const transitionGroup = (
      <TransitionGroup appear={true} component="div" ref={this.refHandlers.container}>
        {childrenWithTransitions}
      </TransitionGroup>
    );

    if (usePortal) {
      return <Portal zIndex={zIndex}>{transitionGroup}</Portal>;
    }
    return transitionGroup;
  }
}
