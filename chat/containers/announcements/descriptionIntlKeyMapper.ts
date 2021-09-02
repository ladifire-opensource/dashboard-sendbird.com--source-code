import { useIntl } from 'react-intl';

import { SelectFieldDescription } from './constants';

export const descriptionIntlKeyMapper = (intl: ReturnType<typeof useIntl>) => <T>({
  key,
  labelIntlKey,
  descriptionIntlKey,
}: SelectFieldDescription<T>) => ({
  key,
  label: intl.formatMessage({ id: labelIntlKey }),
  description: intl.formatMessage({ id: descriptionIntlKey }),
});
