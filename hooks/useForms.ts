import { useState, useEffect, useRef, useCallback } from 'react';

export type Form = {
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => any;
  addField: (field: Field<string | boolean>) => void;
  reset: () => void;
  disabled: boolean;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

type FieldValue = string | boolean;

export type Field<T extends FieldValue> = {
  name: string;
  placeholder?: string;
  value: T;
  error: FormError;
  setValidationError: React.Dispatch<React.SetStateAction<FormError>>;
  setServerError: React.Dispatch<React.SetStateAction<string>>;
  validate?: (value: T) => string;
  reset: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  updateValue: (value: T) => void;
  ref: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
};

export type UseFieldOptions<T extends FieldValue> = {
  defaultValue: T;
  placeholder?: string;
  validate?: Field<T>['validate'];
};

export const useField = <T extends FieldValue>(name: string, form: Form, options: UseFieldOptions<T>): Field<T> => {
  const { defaultValue, placeholder, validate } = options;
  const [value, setValue] = useState<T>(defaultValue);
  const [validationError, setValidationError] = useState<FormError>({
    hasError: false,
    message: '',
  });
  const [serverError, setServerError] = useState('');
  const ref = useRef(null);
  const validateRef = useRef<typeof validate>(validate);
  const isFirstRun = useRef(true);

  useEffect(() => {
    validateRef.current = validate;
  }, [validate]);

  useEffect(() => {
    if (isFirstRun.current) {
      // bypass validation on first run
      isFirstRun.current = false;
      return;
    }

    const error = validateRef.current ? validateRef.current(value) : null;
    if (error) {
      setValidationError({ hasError: true, message: error });
    } else {
      setValidationError((validationError) => ({ ...validationError, hasError: false }));
    }
  }, [value]);

  const error: FormError = validationError.hasError
    ? validationError
    : {
        hasError: !!serverError,
        message: serverError || '',
      };

  const reset = useCallback(() => {
    setValue(defaultValue);
    setValidationError({ hasError: false, message: '' });
    setServerError('');
  }, [defaultValue]);

  const updateValue = useCallback((value) => setValue(value), []);

  const field: Field<T> = {
    name,
    value,
    placeholder,
    error,
    setValidationError,
    setServerError,
    validate,
    reset,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(
        (e.currentTarget.type === 'checkbox'
          ? (e as React.ChangeEvent<HTMLInputElement>).currentTarget.checked
          : e.currentTarget.value) as T,
      ),
    updateValue,
    ref,
  };

  form.addField(field);
  return field;
};

export const useForm = (options: {
  onSubmit: (formData: { [key: string]: any }) => void;
  onReset?: () => void;
}): Form => {
  const { onSubmit, onReset } = options;
  const fields: Array<Field<any>> = [];
  const [disabled, setDisabled] = useState(false);

  return {
    onSubmit: (e?: React.FormEvent<HTMLFormElement>) => {
      e && e.preventDefault();

      const [formData, firstInvalidField] = fields.reduce<[{ [key: string]: string }, Field<any> | null]>(
        ([accFormData, accFirstInvalidField], field) => {
          accFormData[field.name] = field.value;

          const error = field.validate ? field.validate(field.value) : null;
          if (error) {
            field.setValidationError({ hasError: true, message: error });
            return [accFormData, accFirstInvalidField || field];
          }
          return [accFormData, accFirstInvalidField];
        },
        [{}, null],
      );

      if (firstInvalidField) {
        if (firstInvalidField.ref.current) {
          firstInvalidField.ref.current.focus();
        }
        return;
      }

      onSubmit(formData);
    },
    addField: (field) => fields.push(field),
    reset: () => {
      fields.forEach((field) => field.reset());
      onReset && onReset();
    },
    disabled,
    setDisabled,
  };
};
