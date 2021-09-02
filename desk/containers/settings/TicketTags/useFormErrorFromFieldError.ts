import { useRef, useState, useEffect } from 'react';
import { FieldError } from 'react-hook-form';

export const useFormErrorFromFieldError = (
  error: FieldError | undefined,
  getMessage: (error: FieldError) => FieldError['message'] = (error) => error.message,
): FormError | undefined => {
  const getMessageRef = useRef(getMessage);
  const [formError, setFormError] = useState<FormError | undefined>(undefined);

  useEffect(() => {
    getMessageRef.current = getMessage;
  });

  useEffect(() => {
    const message = error ? getMessageRef.current?.(error) ?? error.message ?? '' : '';

    if (error) {
      if (error.type === 'required' && !message) {
        // if a required field is empty and there isn't any specific message for the error,
        // return undefined to prevent "This field is required" from being shown.
        return undefined;
      }

      // FieldError['message'] is typed string | React.ReactElement, but FormError only allows string messages.
      setFormError({ message: (message as string) || '', hasError: true });
      return;
    }

    // When existing error was gone, preserve the previous message to prevent "This field is required" from being shown.
    setFormError((currentError) => ({ message: currentError?.message ?? '', hasError: false }));
  }, [error]);

  return formError;
};
