import { FC, forwardRef, MouseEventHandler, PropsWithChildren, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, cssVariables, Spinner, Typography } from 'feather';

import { Wrapper, CloseButton, Footer } from './components';

const Profile = styled.section`
  display: flex;
  padding: 16px;
`;

const ActionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 3px 4px 4px;
`;

const Action = styled(Button).attrs({ variant: 'ghost', buttonType: 'primary', size: 'small' })`
  min-width: 0px;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled.p`
  ${Typography['body-short-01']}
  max-width: 220px;
  color: ${cssVariables('neutral-7')};
  margin-bottom: 16px;
  text-align: center;
`;

const Retry = styled(Button).attrs({ buttonType: 'tertiary', size: 'small' })`
  min-width: 0px;
  align-self: center;
`;

const Template = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    align?: 'center';
    footer?: ReactNode;
    onClose?: MouseEventHandler<HTMLButtonElement>;
  }>
>(({ align, footer, onClose, children, ...props }, ref) => {
  return (
    <Wrapper ref={ref} $align={align} data-test-id="ProfileCard" {...props}>
      <Profile>{children}</Profile>
      {footer && <Footer>{footer}</Footer>}
      {onClose && <CloseButton onClick={onClose} />}
    </Wrapper>
  );
});

export const Loading: FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <Template align="center" onClose={onClose}>
      <Spinner
        size={20}
        css={`
          margin: 10px;
        `}
      />
    </Template>
  );
};

export const Error: FC<{ onClose?: () => void; onRetry?: () => void }> = ({ onClose, onRetry }) => {
  const { messages } = useIntl();
  const message = messages['error.unexpectedError'];

  return (
    <Template align="center" onClose={onClose}>
      <ErrorWrapper>
        <ErrorMessage>{message}</ErrorMessage>
        {onRetry && <Retry onClick={onRetry}>Retry</Retry>}
      </ErrorWrapper>
    </Template>
  );
};

type ActionProps = {
  value: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
export const Ban: FC<ActionProps> = ({ value, ...buttonProps }) => (
  <Action icon="ban" {...buttonProps}>
    {value ? 'Unban' : 'Ban'}
  </Action>
);

export const Mute: FC<ActionProps> = ({ value, ...buttonProps }) => (
  <Action icon="mute" {...buttonProps}>
    {value ? 'Unmute' : 'Mute'}
  </Action>
);

export const Deactivate: FC<ActionProps> = ({ value, ...buttonProps }) => (
  <Action icon="deactivate" {...buttonProps}>
    {value ? 'Activate' : 'Deactivate'}
  </Action>
);

export const Actions: FC<{ actions: UserActions; disabled?: boolean }> = ({ actions, disabled = false }) => {
  const { ban, mute, deactivate } = actions;
  return (
    <ActionsWrapper data-test-id="Actions">
      {ban && <Ban disabled={disabled} value={ban.current} onClick={ban.handler} />}
      {mute && <Mute disabled={disabled} value={mute.current} onClick={mute.handler} />}
      {deactivate && <Deactivate disabled={disabled} value={deactivate.current} onClick={deactivate.handler} />}
    </ActionsWrapper>
  );
};
