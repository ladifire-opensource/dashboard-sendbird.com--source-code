import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Prompt } from 'react-router-dom';

import { PropsOf } from '@utils';

export const UnsavedPrompt: FC<Omit<PropsOf<typeof Prompt>, 'message'>> = (props) => {
  const intl = useIntl();
  return <Prompt message={intl.formatMessage({ id: 'common.dialog.unsaved.desc' })} {...props} />;
};
