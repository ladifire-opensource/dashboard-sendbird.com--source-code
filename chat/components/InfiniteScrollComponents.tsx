import { forwardRef, FC, MouseEventHandler, HTMLAttributes } from 'react';

import { css } from 'styled-components';

import { Spinner as FeatherSpinner, cssVariables, Button, Body, EmptyState, EmptyStateSize } from 'feather';

import { PropsOf } from '@utils';

type RetryButtonProps = {
  onRetry: MouseEventHandler<HTMLButtonElement>;
  isRetrying?: boolean;
  retryButtonLabel: string;
};

/**
 * Loading indicator displayed when loading a next page.
 */
export const Spinner = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div
    ref={ref}
    css={css`
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    `}
    {...props}
  >
    <FeatherSpinner size={20} stroke={cssVariables('neutral-9')} />
  </div>
));

/**
 * Error view displayed when fetching a next page fails.
 */
export const LoadMoreError: FC<RetryButtonProps> = ({ children, onRetry, isRetrying, retryButtonLabel }) => (
  <div
    role="alert"
    css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 0;
      text-align: center;
      color: ${cssVariables('neutral-6')};
      ${Body['body-short-01']};

      button {
        margin-top: 8px;
      }
    `}
  >
    {children}
    <Button
      buttonType="tertiary"
      size="small"
      icon="refresh"
      onClick={onRetry}
      isLoading={isRetrying}
      disabled={isRetrying}
    >
      {retryButtonLabel}
    </Button>
  </div>
);

/**
 * Error view displayed when fetching the first page fails and there's no item to show.
 */
export const ErrorView: FC<Pick<PropsOf<typeof EmptyState>, 'icon' | 'title' | 'description'> & RetryButtonProps> = ({
  icon,
  title,
  description,
  onRetry,
  isRetrying,
  retryButtonLabel,
}) => (
  <div
    css={`
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
    `}
  >
    <EmptyState
      size={EmptyStateSize.Small}
      icon={icon}
      title={title}
      description={description}
      css="margin-bottom: 16px;"
    />
    <Button
      buttonType="tertiary"
      size="small"
      icon="refresh"
      onClick={onRetry}
      isLoading={isRetrying}
      disabled={isRetrying}
    >
      {retryButtonLabel}
    </Button>
  </div>
);
