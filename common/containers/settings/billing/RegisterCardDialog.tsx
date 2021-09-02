import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import { toast } from 'feather';

import { commonActions } from '@actions';
import { registerCard } from '@common/api';
import { getErrorMessage } from '@epics';
import { SetupIntent } from '@stripe/stripe-js';
import { Dialog } from '@ui/components';

import { CardForm } from './cardForm';

type Props = DefaultDialogProps<RegisterCardDialogProps>;

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const RegisterCardDialog: React.FC<Props> = ({ dialogProps: { onSuccess, onClose: closeCallback }, onClose }) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const organization_uid = useTypedSelector((state) => state.organizations.current.uid);
  const dispatch = useDispatch();
  const closeDialog = () => {
    closeCallback?.();
    onClose();
  };

  const handleSubmit = async (setupIntent: SetupIntent) => {
    setIsLoading(true);
    if (!setupIntent.payment_method) {
      toast.warning({ message: 'Failed to setup payment method' });
      return;
    }
    try {
      await registerCard(organization_uid, setupIntent.payment_method);
      dispatch(commonActions.fetchCardInfoRequest({ organization_uid }));

      toast.success({ message: intl.formatMessage({ id: 'common.changesSaved' }) });

      closeDialog();
      onSuccess?.();
    } catch (e) {
      toast.error({
        message: getErrorMessage(e),
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog
      size="small"
      onClose={closeDialog}
      title="Credit card information"
      body={
        <CardForm
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleDialogCancel={closeDialog}
          submitText="Update"
        />
      }
    />
  );
};

export default RegisterCardDialog;
