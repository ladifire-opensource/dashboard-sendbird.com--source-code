import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { Locale } from 'date-fns';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import enLocale from 'date-fns/locale/en-US';
import koLocale from 'date-fns/locale/ko';

export enum FormatTimeAgoType {
  Strict = 'strict',
  Approximate = 'approximate',
}

type UseFormatTimeAgoOptions = {
  type?: FormatTimeAgoType;
  withoutSuffix?: boolean;
  formatDistance?: Locale['formatDistance'];
};

const locales: Record<string, Locale> = { ko: koLocale, en: enLocale };

const useFormatTimeAgo = () => {
  const intl = useIntl();

  return useCallback(
    (value: number | Date, options?: UseFormatTimeAgoOptions) => {
      const { type = FormatTimeAgoType.Strict, withoutSuffix = false, formatDistance } = options || {};

      const dateFnsLocale = locales[intl.locale] || enLocale;
      const locale = { ...dateFnsLocale, formatDistance: formatDistance || dateFnsLocale.formatDistance };
      const addSuffix = !withoutSuffix;

      return type === FormatTimeAgoType.Strict
        ? formatDistanceToNowStrict(value, { addSuffix, locale })
        : formatDistanceToNow(value, { addSuffix, locale });
    },
    [intl.locale],
  );
};

export default useFormatTimeAgo;
