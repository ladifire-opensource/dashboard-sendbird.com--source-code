import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { logException } from '@utils/logException';

type DeskErrorType = 'default' | 'inline';

export const useDeskErrorHandler = () => {
  const intl = useIntl();

  const getErrorMessage = useCallback(
    (error: any, type: DeskErrorType = 'default') => {
      const { code } = error;
      let errorMessage: string = error.data?.message || error.data?.detail || error.message;

      if (!code) {
        // if no matching error message is found, the server displays the message returned.
        logException({ error, label: 'An error without an error code occurred.' });
        return errorMessage;
      }

      try {
        errorMessage = intl.formatMessage({ id: `desk.error.${type}.message.${code}` });
      } catch {
        logException({
          error,
          label: 'An error occurred with an undefined error code.',
          context: { undefinedErrorCode: code },
        });
      }
      return errorMessage;
    },
    [intl],
  );

  return useMemo(() => ({ getErrorMessage }), [getErrorMessage]);
};
