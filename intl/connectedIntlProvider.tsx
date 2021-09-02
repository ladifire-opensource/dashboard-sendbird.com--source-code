import { FC, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import moment from 'moment-timezone';

import { IntlActionTypes } from '@actions/types';
import { DEFAULT_LOCALE } from '@constants';
import { useFeatureFlags, useLocaleKO } from '@hooks';

export const ConnectedIntlProvider: FC = ({ children }) => {
  const isLocaleKO = useLocaleKO();
  const dispatch = useDispatch();
  const lang = useSelector((state: RootState) => state.intl.language);
  const {
    flags: { intlInspector },
  } = useFeatureFlags();

  useEffect(() => {
    if (intlInspector) {
      dispatch({ type: IntlActionTypes.SELECT_LOCALE, payload: 'key' });
    } else if (isLocaleKO) {
      dispatch({ type: IntlActionTypes.SELECT_LOCALE, payload: 'ko' });
    } else {
      dispatch({ type: IntlActionTypes.SELECT_LOCALE, payload: DEFAULT_LOCALE });
    }
  }, [dispatch, isLocaleKO, intlInspector]);

  useEffect(() => {
    if (isLocaleKO) {
      moment.updateLocale('ko', {
        longDateFormat: {
          LT: 'HH:mm',
          LTS: 'A h:mm',
          L: 'MM/DD/YYYY',
          l: 'M/D/YYYY',
          LL: 'YYYY년 MMM D일',
          ll: 'YYYY년 MMM D일',
          LLL: 'MMMM Do YYYY LT',
          lll: 'll LTS',
          LLLL: 'dddd, MMMM Do YYYY LT',
          llll: 'ddd, MMM D YYYY LT',
        },
      });
      moment.locale('ko');

      return;
    }
    moment.updateLocale('en', {
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'h:mm A',
        L: 'MM/DD/YYYY',
        l: 'M/D/YYYY',
        LL: 'MMMM D, YYYY',
        ll: 'MMM D, YYYY',
        LLL: 'MMMM Do YYYY LT',
        lll: 'll [at] LTS',
        LLLL: 'dddd, MMMM Do YYYY LT',
        llll: 'ddd, MMM D YYYY LT',
      },
    });
    moment.locale('en');
  }, [isLocaleKO]);

  return (
    <IntlProvider locale={lang.lang} defaultLocale={DEFAULT_LOCALE} messages={lang.messages} children={children} />
  );
};
