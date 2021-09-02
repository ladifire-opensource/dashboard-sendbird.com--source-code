import { useEffect, useCallback } from 'react';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { fetchCardInfo } from '@common/api';
import { useAsync, useAuthorization } from '@hooks';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useFetchCreditCardAPI = (organization_uid: string) => {
  const { isSelfService } = useAuthorization();
  const [{ data, status }, loadCardInfo] = useAsync(async () => {
    return await fetchCardInfo({ organization_uid });
  }, [organization_uid]);

  const cardInfo_LEGACY = useTypedSelector((state) => state.billing.cardInfo);
  const isFetchingCardInfo_LEGACY = useTypedSelector((state) => state.billing.fetchingCardInfo);
  const dispatch = useDispatch();
  const loadCardInfo_LEGACY = useCallback(() => dispatch(commonActions.fetchCardInfoRequest({ organization_uid })), [
    dispatch,
    organization_uid,
  ]);

  const load = useCallback(() => {
    if (!organization_uid) {
      return;
    }
    (isSelfService ? loadCardInfo : loadCardInfo_LEGACY)();
  }, [isSelfService, loadCardInfo, loadCardInfo_LEGACY, organization_uid]);

  useEffect(() => {
    load();
  }, [load]);

  const isLoading = isSelfService ? status === 'loading' : isFetchingCardInfo_LEGACY;

  // null or undefined if it's not fetched yet. {} (empty object) if there's no registered card.
  const cardInfo = isSelfService ? data?.data : cardInfo_LEGACY;

  return {
    isLoading,
    cardInfo,
    load,
  };
};
