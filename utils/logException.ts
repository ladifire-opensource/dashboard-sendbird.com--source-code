import { ScopeContext } from '@sentry/types';

import { captureException, captureMessage } from './sentry';

type Extra = ScopeContext['extra'];

/**
 * Report an exception to Sentry. `options.error` must be either string or Error object.
 */
export const logException = ({ error, label, context }: { error: any; label?: string; context?: Extra }) => {
  const { BUILD_MODE } = process.env; // npm host environment
  if (BUILD_MODE === 'production') {
    if (typeof error === 'string') {
      captureMessage(error, { extra: context });
    } else {
      captureException(error, { extra: context });
    }
  } else {
    // Dont print console logs on other than production environment.
    // eslint-disable-next-line no-console
    window.console && console.error?.(label, error, context);
  }
};
