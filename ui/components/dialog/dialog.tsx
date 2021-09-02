import { Component, FC, MouseEvent, ReactNode } from 'react';
import ReactDOM from 'react-dom';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Body, cssVariables, elevation, Headings, IconButton } from 'feather';
import FocusTrap from 'focus-trap-react';
import { BrowserHistoryBuildOptions } from 'history';

import { Overlay } from '../overlay';
import { CancelButton, ConfirmButton } from './buttons';

type Size = 'small' | 'large' | 'xlarge' | number;

const getDialogWidth = (size: Size) => {
  if (typeof size === 'number' && size > 0) {
    return size;
  }

  switch (size) {
    case 'large':
      return 640;
    case 'xlarge':
      return 800;
    case 'small':
    default:
      return 480;
  }
};

interface DialogProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  body?: ReactNode;
  size?: Size;
  isFullBody?: boolean;
  titleButtonComponent?: ReactNode;
  styles?: SimpleInterpolation;
  onClose?: () => any;
  className?: string;
  dialogClassName?: string;
  hideCloseIconButton?: boolean;

  /**
   * With this option you can specify a different element to receive that initial focus. Can be a selector string
   * (which will be passed to document.querySelector() to find the DOM node), or a function that returns a DOM node.
   */
  initialFocus?: string | (() => HTMLElement);
}

type GetUserConfirmation = Exclude<BrowserHistoryBuildOptions['getUserConfirmation'], undefined>;

const DialogContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 100%;
  user-select: text;
  overflow-y: scroll;
`;

const DialogWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  margin: 0 auto;
  padding: 30px 0;
`;

const StyledDialog = styled.div<{ size: 'small' | 'large' | 'xlarge' | number; styles: SimpleInterpolation }>`
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 5px;
  background: white;
  width: ${({ size }) => `${getDialogWidth(size)}px`};
  user-select: initial;
  outline: 0;
  ${elevation.modal};

  ${(props) => props.styles};
`;

const DialogHeader = styled.div`
  padding: 16px 24px;
  padding-right: 56px;
  min-height: 64px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  position: relative;
`;

const DialogTitle = styled.h1`
  ${Headings['heading-04']}
  color: ${cssVariables('neutral-10')};
  word-break: break-word;
  white-space: pre-wrap;
  margin-top: 2px;
  padding-right: 32px;
`;

const DialogDescription = styled.div`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-10')};
  margin-top: 18px;
`;

const DialogClose = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
`;

const DialogFormAction = styled.div`
  margin: 0 -24px;
  padding: 32px 24px 0;
  display: grid;
  grid-column-gap: 8px;
  grid-auto-flow: column;
  justify-content: end;
`;

const DialogBody = styled.div<{ isFullBody?: boolean }>`
  padding: ${(props) => (props.isFullBody ? '0' : '0 24px 24px')};
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-wrap: break-word;
`;

export class Dialog extends Component<DialogProps> {
  private renderHeader = () => {
    const { title, description, titleButtonComponent } = this.props;

    if (!title) {
      return null;
    }

    return (
      <DialogHeader>
        <DialogTitle data-test-id="DialogTitle" id="dialogTitle">
          {title}
          {titleButtonComponent}
        </DialogTitle>
        {description && <DialogDescription id="dialogDescription">{description}</DialogDescription>}
      </DialogHeader>
    );
  };

  private renderBody = () => {
    const { body, children, isFullBody } = this.props;

    if (!body) {
      return children;
    }
    return <DialogBody isFullBody={isFullBody}>{body}</DialogBody>;
  };

  public render() {
    const {
      size = 'small',
      className,
      dialogClassName,
      styles = css``,
      description,
      hideCloseIconButton = false,
      onClose,
      initialFocus,
    } = this.props;

    // Include toasts in the focus trap container
    const portalFocusTrapElement = document.getElementById('portal_focus_trap');

    return (
      <DialogContainer className={className} data-test-id="Dialog">
        <DialogWrapper>
          <FocusTrap
            focusTrapOptions={{ initialFocus }}
            containerElements={portalFocusTrapElement ? [portalFocusTrapElement] : undefined}
          >
            <StyledDialog
              role="dialog"
              size={size}
              className={dialogClassName}
              styles={styles}
              aria-labelledby="dialogTitle"
              aria-describedby={description ? 'dialogDescription' : undefined}
              tabIndex={-1}
            >
              {this.renderHeader()}
              {this.renderBody()}
              {!hideCloseIconButton && (
                <DialogClose onClick={onClose} data-test-id="CloseButton">
                  <IconButton icon="close" buttonType="secondary" size="small" />
                </DialogClose>
              )}
            </StyledDialog>
          </FocusTrap>
        </DialogWrapper>
      </DialogContainer>
    );
  }
}

const ConfirmDescription = styled.div`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-10')};
`;

const StyledConfirmDialog = styled.div``;

/**
 * Render a dialog which confirms if the user wants to leave the current page.
 *
 * @param message dialog body message
 * @param callback callback to be called when user presses a button
 */
export const checkUnsavedConfirm: GetUserConfirmation = (message, callback?) => {
  const unsavedRoot = document.getElementById('unsaved_root');

  const withCleanup = (answer: boolean, e?: MouseEvent<HTMLButtonElement>) => () => {
    e?.preventDefault();
    ReactDOM.render(<div />, unsavedRoot);
    callback(answer);
  };

  const UnsavedDialog: FC = () => {
    // This component is not wrapped with ConnectedIntlProvider and useIntl is not accessible here.
    const { intl } = window;

    return (
      <Dialog
        size="small"
        title={intl.formatMessage({ id: 'common.dialog.unsaved.title' })}
        body={
          <StyledConfirmDialog>
            <ConfirmDescription>
              {message || intl.formatMessage({ id: 'common.dialog.unsaved.desc' })}
            </ConfirmDescription>
            <DialogFormAction>
              <CancelButton onClick={withCleanup(false)}>
                {intl.formatMessage({ id: 'common.dialog.unsaved.btn.cancel' })}
              </CancelButton>
              <ConfirmButton onClick={withCleanup(true)}>
                {intl.formatMessage({ id: 'common.dialog.unsaved.btn.confirm' })}
              </ConfirmButton>
            </DialogFormAction>
          </StyledConfirmDialog>
        }
        onClose={withCleanup(false)}
      />
    );
  };

  ReactDOM.render(
    <Overlay isOpen={true} hasBackdrop={true} onClose={withCleanup(false)}>
      <UnsavedDialog />
    </Overlay>,
    unsavedRoot,
  );
};
