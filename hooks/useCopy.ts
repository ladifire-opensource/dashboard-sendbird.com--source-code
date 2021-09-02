import { useCallback, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import copy from 'copy-to-clipboard';
import { toast } from 'feather';

export const useCopy = () => {
  const intl = useIntl();

  return useCallback(
    (text: string, option?: { copySuccessMessage: ReactNode }) => {
      text && copy(text);
      toast.success({ message: option?.copySuccessMessage ?? intl.formatMessage({ id: 'ui.copy.toast' }) });
    },
    [intl],
  );
};
