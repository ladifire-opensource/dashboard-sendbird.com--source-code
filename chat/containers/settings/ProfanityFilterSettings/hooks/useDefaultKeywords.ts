import { useState, useCallback } from 'react';

import { toast } from 'feather';

import { fetchDefaultProfanity } from '@core/api';
import { getErrorMessage } from '@epics';

const useDefaultKeywords = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [keywords, setKeywords] = useState<string | null>(null);

  const fetchKeywords = useCallback(async () => {
    try {
      setIsFetching(true);
      const {
        data: { en },
      } = await fetchDefaultProfanity();
      setKeywords(en);
      return en;
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setIsFetching(false);
    }
  }, []);

  return {
    isFetching,
    getKeywords: useCallback(async () => {
      return keywords || (await fetchKeywords());
    }, [fetchKeywords, keywords]),
  };
};

export default useDefaultKeywords;
