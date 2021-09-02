import { useEffect, useRef } from 'react';

import { toast, ToastOption } from 'feather';

import { getErrorMessage } from '@epics';

export const useErrorToast = (error: any, options?: { ignoreDuplicates?: boolean } & Partial<ToastOption>) => {
  const { ignoreDuplicates = false, ...toastOptions } = options || {};
  const toastOptionRef = useRef(toastOptions); // prevent calling `useEffect` multiple times
  const errorMessage = error && getErrorMessage(error);

  useEffect(() => {
    if (!ignoreDuplicates) {
      return;
    }
    if (errorMessage) {
      toast.error({ message: errorMessage, ...toastOptionRef.current });
    }
  }, [errorMessage, ignoreDuplicates]);

  useEffect(() => {
    if (ignoreDuplicates) {
      return;
    }
    if (error) {
      toast.error({ message: getErrorMessage(error), ...toastOptionRef.current });
    }
  }, [error, ignoreDuplicates]);
};
