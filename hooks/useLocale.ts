import { useShallowEqualSelector } from './useTypedSelector';

const langLocaleMap = { en: 'en-US', ko: 'ko-KR' };

export const useLocale = (): string | undefined => {
  const lang = useShallowEqualSelector((state) => state.intl.language.lang);
  return langLocaleMap[lang];
};
