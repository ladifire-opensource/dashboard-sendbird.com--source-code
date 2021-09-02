import { FC, ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Spinner, Button, EmptyState, EmptyStateSize } from 'feather';

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  onRetry: () => void;
  isLoading: boolean;
  error?: string | null;
};

const Container = styled.div<{ $state: 'idle' | 'loading' | 'error' }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  ${({ $state }) =>
    $state === 'loading' &&
    css`
      height: 320px;

      ${EmptyState} {
        display: none;
      }
    `}

  > [role='progressbar'] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%) scale(${({ $state }) => ($state === 'loading' ? 1 : 0)});
  }
`;

const Error = styled.div`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
  text-align: center;
  color: ${cssVariables('neutral-6')};

  > *:first-child {
    margin-bottom: 8px;
  }
`;

export const EmptyView: FC<Props> = ({ isLoading, error, onRetry, title, description }) => {
  const intl = useIntl();

  const state = useMemo(() => {
    if (error) {
      return 'error';
    }
    return isLoading ? 'loading' : 'idle';
  }, [error, isLoading]);

  if (error) {
    return (
      <Container $state={state}>
        <Error role="alert">
          <div>{error}</div>
          <Button buttonType="tertiary" size="small" icon="refresh" onClick={onRetry} isLoading={isLoading}>
            {intl.formatMessage({ id: 'desk.agentSelect.dropdown.btn.retry' })}
          </Button>
        </Error>
      </Container>
    );
  }

  return (
    <Container $state={state}>
      <Spinner size={20} stroke={cssVariables('neutral-9')} aria-hidden={!isLoading} />
      <EmptyState
        size={EmptyStateSize.Small}
        icon="no-data"
        withoutMarginBottom={true}
        title={title}
        description={description}
      />
    </Container>
  );
};
