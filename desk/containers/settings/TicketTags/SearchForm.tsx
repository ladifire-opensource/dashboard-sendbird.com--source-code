import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import { InputText } from 'feather';

type Props = {
  defaultInputValue: string;
  onSubmit: (inputValue: string) => void;
  onReset: () => void;
};

export const SearchForm: FC<Props> = ({ defaultInputValue, onSubmit, onReset }) => {
  const intl = useIntl();
  const [inputValue, setInputValue] = useState(defaultInputValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(inputValue);
      }}
    >
      <InputText
        size="small"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
        }}
        placeholder={intl.formatMessage({ id: 'desk.settings.tags.searchPlaceholder' })}
        icons={[
          inputValue
            ? {
                key: 'clear',
                size: 'xsmall',
                icon: 'close',
                type: 'reset',
                onClick: () => {
                  setInputValue('');
                  onReset();
                },
              }
            : { key: 'search', size: 'xsmall', icon: 'search', type: 'submit' },
        ]}
      />
    </form>
  );
};
