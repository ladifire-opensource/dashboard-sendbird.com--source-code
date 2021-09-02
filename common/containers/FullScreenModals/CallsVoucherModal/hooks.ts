import { useContext } from 'react';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import { BillingCardContext } from './BillingCardContext';

/* hook to open RegisterCard dialog */
export const useShowRegisterCardDialog = () => {
  const showDialog = useShowDialog();
  const showAddCreditCardDialog = (onSuccess?: () => void) =>
    showDialog({
      dialogTypes: DialogType.RegisterCard,
      dialogProps: { onSuccess },
    });

  return showAddCreditCardDialog;
};

export const useBillingCard = () => {
  const contextValue = useContext(BillingCardContext);

  if (!contextValue) {
    throw new Error('The component using BillingCardContext must be a descendant of BillingCardProvider');
  }

  return contextValue;
};

export const useHasCreditCard = () => {
  const [{ response: card }] = useBillingCard();
  return card && 'name' in card;
};

/* hook to enforce card registration with dialog to assure that organization has credit card for billing */
export const useAssureCard = () => {
  const hasCreditCard = useHasCreditCard();
  const showRegisterCardDialog = useShowRegisterCardDialog();

  return (onSuccess: () => void) => (hasCreditCard ? onSuccess() : showRegisterCardDialog(onSuccess));
};
