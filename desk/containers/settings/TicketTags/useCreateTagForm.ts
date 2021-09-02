import { useMemo, useEffect, useCallback, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

import { useFormErrorFromFieldError } from './useFormErrorFromFieldError';

type FormValues = { name: string };

type UseCreateTagFormOptions = { defaultValue?: string; serverError: unknown | null };

// /\p{L}/u RegExp targets all unicode characters and will be converted by
// @babel/plugin-proposal-unicode-property-regex to make it work across browsers.
// https://stackoverflow.com/a/52205643/4010013
export const isTagNameCharactersValid = (value: string) => !/[^-_\s\d\p{L}]/u.test(value.trim());

export const useCreateTagForm = (options: UseCreateTagFormOptions) => {
  const { defaultValue, serverError } = options;

  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const { handleSubmit: originalHandleSubmit, register, ...useFormResult } = useForm<FormValues>({
    defaultValues: { name: defaultValue },
  });
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const { errors, clearErrors, setError, setValue, trigger } = useFormResult;

  useEffect(() => {
    if (serverError) {
      const serverErrorCode = (serverError as any)?.data?.code;
      const message =
        {
          desk400118: intl.formatMessage({ id: 'desk.tags.createTagErrors.duplicated' }),
          desk400122: intl.formatMessage({ id: 'desk.tags.createTagErrors.maxActiveTags' }),
        }[serverErrorCode] || getErrorMessage(serverError);

      setError('name', { type: 'serverError', message });
    } else {
      clearErrors('name');
    }
  }, [clearErrors, getErrorMessage, intl, serverError, setError]);

  const nameError = useFormErrorFromFieldError(errors.name, (error) => {
    if (error.type === 'maxLength') {
      return intl.formatMessage({ id: 'desk.tags.createTagErrors.maxLengthExceeded' }, { limit: 32 });
    }
    if (error.type === 'specialCharactersNotAllowed') {
      return intl.formatMessage({ id: 'desk.tags.createTagErrors.specialCharactersNotAllowed' });
    }
    return error.message;
  });

  const handleSubmit = useCallback(
    (callback: SubmitHandler<FormValues>) => {
      return originalHandleSubmit(async ({ name }: { name: string }) => {
        const trimmed = name.trim();
        setValue('name', trimmed);
        const isNameValid = await trigger('name');

        if (!isNameValid) {
          nameInputRef.current?.focus();
          return;
        }

        return callback({ name: trimmed });
      });
    },
    [originalHandleSubmit, setValue, trigger],
  );

  return useMemo(() => {
    const nameInputProps = {
      ref: (node: HTMLInputElement) => {
        register(node, {
          required: true,
          maxLength: 32,
          validate: { specialCharactersNotAllowed: isTagNameCharactersValid },
        });
        nameInputRef.current = node;
      },
      error: nameError,
      type: 'text',
      name: 'name',
      placeholder: intl.formatMessage({ id: 'desk.settings.tags.nameInputPlaceholder' }),
    };

    return { nameInputProps, handleSubmit, ...useFormResult };
  }, [handleSubmit, intl, nameError, register, useFormResult]);
};
