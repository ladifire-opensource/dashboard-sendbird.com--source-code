import { useState, useEffect, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { history } from '../sbHistory';
import { checkUnsavedConfirm } from '../ui/components/dialog';

interface UseUnsaved {
  (matchedURL?: string): Unsaved;
}

export type Unsaved = {
  pushTo: (pathname: string) => void;
  unsaved: boolean;
  setUnsaved: React.Dispatch<boolean>;
};

export const useUnsaved: UseUnsaved = () => {
  const intl = useIntl();
  const [unsaved, setUnsaved] = useState(false);
  const pendingNavigationURL = useRef<string>('');

  useEffect(() => {
    if (!unsaved && pendingNavigationURL.current) {
      history.push(pendingNavigationURL.current);
      pendingNavigationURL.current = '';
    }
  }, [unsaved]);

  return useMemo(() => {
    const pushTo = (pathname: string) => {
      if (unsaved) {
        pendingNavigationURL.current = pathname;

        checkUnsavedConfirm(intl.formatMessage({ id: 'common.dialog.unsaved.desc' }), (confirmed) => {
          if (confirmed) {
            setUnsaved(false);
          } else {
            // cancel navigation
            pendingNavigationURL.current = '';
          }
        });
        return;
      }
      history.push(pathname);
    };

    return {
      pushTo,
      unsaved,
      setUnsaved,
    };
  }, [intl, unsaved]);
};
