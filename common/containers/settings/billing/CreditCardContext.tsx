import { FC, useEffect, useCallback, createContext, useMemo, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAuthorization, useShowDialog, useTypedSelector } from '@hooks';

import { useFetchCreditCardAPI } from './useFetchCreditCardAPI';

const CreditCardInfoContext = createContext<{ isLoading: boolean; cardInfo: CreditCardInfo | null; load: () => void }>({
  isLoading: false,
  cardInfo: null,
  load: () => {},
});
const CreditCardDialogContext = createContext<{ open: () => void }>({ open: () => {} });
const OnSuccessUpdaterContext = createContext<{ setOnSuccess: (value?: () => void) => void }>({
  setOnSuccess: () => {},
});

export const CreditCardContextProvider: FC = ({ children }) => {
  const { isPermitted } = useAuthorization();
  const orgUid = useTypedSelector((state) => state.organizations.current.uid);
  const { isLoading, cardInfo, load } = useFetchCreditCardAPI(orgUid);
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const hideDialog = useCallback(() => dispatch(commonActions.hideDialogsRequest()), [dispatch]);
  const onSuccessRef = useRef<() => void>();
  const { path: matchPath = '' } = useRouteMatch() || {};
  const history = useHistory();

  const isCardDialogOpen = useTypedSelector((state) => {
    const { dialogTypes } = state.dialogs;
    return dialogTypes === DialogType.RegisterCard;
  });
  const isCardDialogPath = matchPath === '/settings/billing' && history.location.pathname === '/settings/billing/card';

  const openCreditCardDialog = useCallback(() => {
    history.push('/settings/billing/card');
  }, [history]);

  const onDialogClose = useCallback(() => {
    history.push('/settings/billing');
  }, [history]);

  const isCardFetched = cardInfo != null;
  useEffect(() => {
    const showCardDialog = () => {
      if (!isPermitted(['organization.billing.all']) || !orgUid || !isCardFetched) {
        return;
      }

      showDialog({
        dialogTypes: DialogType.RegisterCard,
        dialogProps: {
          onClose: onDialogClose,
          onSuccess: onSuccessRef.current,
        },
      });
      onSuccessRef.current = undefined;
    };

    if (isCardDialogPath && !isCardDialogOpen) {
      showCardDialog();
    } else if (!isCardDialogPath && isCardDialogOpen) {
      hideDialog();
    }
  }, [hideDialog, isCardDialogOpen, isCardDialogPath, isCardFetched, isPermitted, onDialogClose, orgUid, showDialog]);

  const setOnSuccess = (value?: () => void) => {
    onSuccessRef.current = value;
  };

  return (
    <CreditCardInfoContext.Provider value={useMemo(() => ({ load, cardInfo, isLoading }), [cardInfo, isLoading, load])}>
      <CreditCardDialogContext.Provider value={useMemo(() => ({ open: openCreditCardDialog }), [openCreditCardDialog])}>
        <OnSuccessUpdaterContext.Provider value={{ setOnSuccess }}>{children}</OnSuccessUpdaterContext.Provider>
      </CreditCardDialogContext.Provider>
    </CreditCardInfoContext.Provider>
  );
};

export const useCreditCardDialog = (onSuccess?: () => void) => {
  const { setOnSuccess } = useContext(OnSuccessUpdaterContext);
  setOnSuccess(onSuccess);
  return useContext(CreditCardDialogContext);
};

export const useCreditCardInfo = () => useContext(CreditCardInfoContext);
