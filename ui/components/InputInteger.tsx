import { ChangeEvent, useMemo, ComponentProps, forwardRef } from 'react';
import { useIntl } from 'react-intl';

import { InputText } from 'feather';

type Props = {
  value?: number;
  onChange?: (value?: number) => void;
  min?: number;
  max?: number;
} & Omit<ComponentProps<typeof InputText>, 'onChange' | 'value' | 'max' | 'min'>;

const InputInteger = forwardRef<HTMLInputElement, Props>(
  ({ min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, onChange, ...props }, ref) => {
    const intl = useIntl();
    const value = useMemo(() => {
      if (props.value === undefined || Number.isNaN(props.value)) {
        return '';
      }
      return intl.formatNumber(props.value);
    }, [intl, props.value]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.value) {
        onChange?.();
        return;
      }

      /* ignore if new value is not valid integer */
      const newValue = parseInt(event.target.value.replace(/,/g, ''), 10);
      const valid = Number.isInteger(newValue) && newValue >= min && newValue <= max;

      if (valid) {
        onChange?.(newValue);
      }
    };

    return <InputText ref={ref} inputMode="numeric" {...props} value={value} onChange={handleChange} />;
  },
);

export default InputInteger;
