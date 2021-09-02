import { forwardRef, RefObject, HTMLAttributes, useMemo, ReactNode } from 'react';

import styled from 'styled-components';

import { ScrollBarRef, Spinner } from 'feather';
import FocusTrap from 'focus-trap-react';

import { Portal } from '../portal';
import FullScreenModalHeader from './components/FullScreenModalHeader';

const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 100%;
  min-height: 100vh;
  overflow: auto;
  background: white;
  outline: 0;

  & > div {
    padding: 32px 32px 56px;
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export enum InitialFocusOption {
  FirstTabbableElement = 'FIRST_TABBABLE_ELEMENT',
  Dialog = 'DIALOG',
}

type CommonProps = {
  scrollBarRef?: RefObject<ScrollBarRef>;
  children: ReactNode;
  isLoading?: boolean;
  initialFocus?: InitialFocusOption | string | HTMLElement | (() => HTMLElement);
  onClose: () => void;
} & Pick<HTMLAttributes<HTMLElement>, 'className' | 'aria-labelledby' | 'aria-describedby'>;

type ModalProps = {
  id: string;
  isOpen: boolean;
} & CommonProps;

type PageProps = {
  id?: string;
  isOpen?: never;
} & CommonProps;

type Props = ModalProps | PageProps;

export const FullScreenModal = forwardRef<HTMLDivElement, Props>(
  (
    {
      id,
      isOpen = true,
      children,
      isLoading,
      scrollBarRef,
      initialFocus = '[role="dialog"]',
      onClose,
      ...containerAttributes
    },
    ref,
  ) => {
    const focusTrapOptions = useMemo(() => {
      switch (initialFocus) {
        case InitialFocusOption.Dialog:
          return { initialFocus: '[role="dialog"]' };
        case InitialFocusOption.FirstTabbableElement:
          // this is the default behavior of focus-trap-react.
          return undefined;
        default:
          return { initialFocus };
      }
    }, [initialFocus]);

    if (!isOpen) {
      return null;
    }

    return (
      <Portal>
        <FocusTrap focusTrapOptions={focusTrapOptions} active={!isLoading}>
          <FullScreenContainer
            id={id}
            ref={ref}
            role="dialog"
            data-test-id="FullScreenModal"
            data-scroll="FullScreenModal"
            tabIndex={-1}
            {...containerAttributes}
          >
            {isLoading && (
              <SpinnerWrapper>
                <Spinner size={64} />
              </SpinnerWrapper>
            )}
            <div>{children}</div>
            <FullScreenModalHeader.CloseButton onClick={onClose} />
          </FullScreenContainer>
        </FocusTrap>
      </Portal>
    );
  },
);
