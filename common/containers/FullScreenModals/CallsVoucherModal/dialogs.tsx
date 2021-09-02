import { FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { Body, cssVariables, InputTextarea, Radio } from 'feather';

import { commonActions } from '@actions';
import * as services from '@calls/services';
import { useCallsVoucher, useNextVoucher, useVoucherLoader } from '@common/containers/CallsVoucherContext';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { getErrorMessage } from '@epics';
import { useAsync, useShowDialog } from '@hooks';
import { CancelButton, ConfirmButton, Dialog, DialogFormAction, DialogFormBody } from '@ui/components';
import { FullScreenModalContext } from '@ui/components/FullScreenModal/context';

import { Calculator } from './Calculator';
import { useShowRegisterCardDialog } from './hooks';
import { formatCurrency } from './utils';

/* util */
const toVoucherSubscription = (payment: VoucherPayment): VoucherSubscription => ({
  voucher_subscription_payment_amount: Math.round(payment.price * 100), // Note that it should be converted in cents, not in dollars
  voucher_subscription_credit: payment.credits,
  voucher_subscription_duration_days: payment.duration,
});

/* link to /settings/general after closing all modals */
const SettingsGeneralLink: FC<{ text: ReactNode }> = ({ text }) => {
  const { closeModal } = useContext(FullScreenModalContext);
  const dispatch = useDispatch();

  const closeAllModals = () => {
    dispatch(commonActions.hideDialogsRequest());
    closeModal();
  };

  return (
    <Link to="/settings/general" css="text-decoration: underline;" onClick={closeAllModals}>
      {text}
    </Link>
  );
};

const renderSettingsLink = (text: string) => <SettingsGeneralLink text={text} />;

export const usePaymentFailedDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return ({ message, onConfirm }: { message: string; onConfirm: () => void }) => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.failed.title' }),
        description: <InputTextarea readOnly={true} value={message} label="Details" />,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.failed.submit' }),
          preventClose: true,
          onClick: onConfirm,
        },
      },
    });
  };
};

export const usePaymentSuccessDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const { fetchVouchers, fetchSubscription, fetchNextVoucher } = useCallsVoucher();
  const { closeModal } = useContext(FullScreenModalContext);

  const reload = () => Promise.all([fetchVouchers(), fetchSubscription(), fetchNextVoucher()]);

  const handleSubmit = () => {
    reload();
    closeModal();
  };

  return () => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.success.title' }),
        description: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.payment.success.description' },
          { a: renderSettingsLink },
        ),
        isNegativeButtonHidden: true,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.success.submit' }),
          onClick: handleSubmit,
        },
      },
    });
  };
};

const usePaymentSuccess = (isSuccess: boolean) => {
  const showPaymentSuccessDialog = usePaymentSuccessDialog();

  useEffect(() => {
    if (isSuccess) {
      showPaymentSuccessDialog();
    }
  }, [isSuccess, showPaymentSuccessDialog]);
};

export const usePaymentDialog = () => {
  const showDialog = useShowDialog();

  return (payment: VoucherPayment) => showDialog({ dialogTypes: DialogType.CallsPayment, dialogProps: { payment } });
};

const usePaymentError = ({ payment, error }: { payment: VoucherPayment; error: any }) => {
  const showRegisterCardDialog = useShowRegisterCardDialog();
  const showPaymentFailedDialog = usePaymentFailedDialog();
  const showPaymentDialog = usePaymentDialog();

  useEffect(() => {
    if (error) {
      showPaymentFailedDialog({
        message: getErrorMessage(error),
        onConfirm: () => showRegisterCardDialog(() => showPaymentDialog(payment)),
      });
    }
  }, [payment, error, showRegisterCardDialog, showPaymentFailedDialog, showPaymentDialog]);
};

const useVoucherPayment = (payment: VoucherPayment) => {
  const { nextVoucher } = useCallsVoucher();

  const failedVoucher = useMemo(() => {
    const invoice = nextVoucher.response?.invoice;
    return invoice?.status === 'FAILED' ? invoice.voucher : null;
  }, [nextVoucher]);

  const [state, requestPayment] = useAsync(async () => {
    failedVoucher ? await services.purchaseFailedVoucher(failedVoucher.uid) : await services.purchaseVoucher(payment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = state.status === 'loading' || nextVoucher.loading;

  usePaymentSuccess(state.status === 'success');

  usePaymentError({ payment, error: state.error });

  return { isLoading, requestPayment };
};

export const CallsPaymentDialog: FC<DefaultDialogProps<CallsPaymentDialogProps>> = ({ dialogProps, onClose }) => {
  const { payment } = dialogProps;
  const { credits, price } = payment;

  const intl = useIntl();
  const { isLoading, requestPayment } = useVoucherPayment(payment);

  useVoucherLoader({ nextVoucher: true });

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.confirm.title' })}
      description={intl.formatMessage(
        { id: 'common.settings.general.callsVoucherModalDialogs.payment.confirm.description' },
        { credits: credits.toLocaleString(), price: formatCurrency(price) },
      )}
      body={
        <DialogFormAction>
          <CancelButton type="button" onClick={onClose} disabled={isLoading}>
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.confirm.cancel' })}
          </CancelButton>
          <ConfirmButton
            type="submit"
            onClick={requestPayment}
            isFetching={isLoading}
            disabled={isLoading}
            data-test-id="DialogConfirmButton"
          >
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.payment.confirm.submit' })}
          </ConfirmButton>
        </DialogFormAction>
      }
    />
  );
};

const OptionList = styled.ul`
  list-style: none;

  li {
    > div {
      display: block;
    }

    > span {
      margin-top: 4px;
      padding-left: 28px;
      color: ${cssVariables('neutral-7')};
      ${Body['body-short-01']}
    }
  }

  li + li {
    margin-top: 16px;
  }
`;

enum PaymentOption {
  Later,
  Now,
}

export const CallsUpdateSubscriptionDialog: FC<DefaultDialogProps<CallsUpdateSubscriptionDialogProps>> = ({
  dialogProps,
  onClose,
}) => {
  const { payment, title, description, submitText, onSuccess } = dialogProps;
  const intl = useIntl();

  const { updateSubscription, subscription: subscriptionState } = useCallsVoucher();

  const showPaymentDialog = usePaymentDialog();
  const nextVoucher = useNextVoucher();
  const hasNextVoucher = !!nextVoucher;
  const [paymentOption, setPaymentOption] = useState(PaymentOption.Later);

  const initialUpdateResponse = useRef<typeof subscriptionState['response']>(subscriptionState.response);
  const isLoading = !!subscriptionState.loading;

  /* callback when success response is received */
  useEffect(() => {
    const hasChange = subscriptionState.response !== initialUpdateResponse.current;
    if (subscriptionState.response && hasChange) {
      onClose();
      onSuccess?.();
    }
  }, [subscriptionState.response, onClose, onSuccess]);

  const handleSubmit = () => {
    if (paymentOption === PaymentOption.Later) {
      updateSubscription(toVoucherSubscription(payment));
    }

    if (paymentOption === PaymentOption.Now) {
      showPaymentDialog(payment);
    }
  };

  const paymentOptions = [
    {
      value: PaymentOption.Later,
      label: 'common.settings.general.callsVoucherModalDialogs.updateSubscription.paymentOptions.later.label',
      description:
        'common.settings.general.callsVoucherModalDialogs.updateSubscription.paymentOptions.later.description',
    },
    {
      value: PaymentOption.Now,
      label: 'common.settings.general.callsVoucherModalDialogs.updateSubscription.paymentOptions.now.label',
      description: hasNextVoucher
        ? 'common.settings.general.callsVoucherModalDialogs.updateSubscription.paymentOptions.now.description'
        : undefined,
    },
  ] as const;

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={title}
      description={description}
      body={
        <>
          <DialogFormBody>
            <OptionList>
              {paymentOptions.map(({ value, label, description }) => (
                <li key={value}>
                  <Radio
                    label={intl.formatMessage({ id: label })}
                    value={value}
                    checked={value === paymentOption}
                    onChange={() => setPaymentOption(value)}
                    disabled={value !== paymentOption && hasNextVoucher}
                  />
                  {description && <span>{intl.formatMessage({ id: description })}</span>}
                </li>
              ))}
            </OptionList>
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose} disabled={isLoading}>
              {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.updateSubscription.cancel' })}
            </CancelButton>
            <ConfirmButton
              type="submit"
              onClick={handleSubmit}
              isFetching={isLoading}
              disabled={isLoading}
              data-test-id="DialogConfirmButton"
            >
              {submitText}
            </ConfirmButton>
          </DialogFormAction>
        </>
      }
    />
  );
};

export const useEnableSubscriptionSuccessDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const { closeModal } = useContext(FullScreenModalContext);

  return () => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.title',
        }),
        description: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.success.description' },
          { a: renderSettingsLink },
        ),
        isNegativeButtonHidden: true,
        positiveButtonProps: {
          text: intl.formatMessage({
            id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.success.submit',
          }),
          onClick: () => closeModal(),
        },
      },
    });
  };
};

export const useEnableSubscriptionConfirmDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const showSuccessDialog = useEnableSubscriptionSuccessDialog();

  return (payment: VoucherPayment) => {
    showDialog({
      dialogTypes: DialogType.CallsUpdateSubscription,
      dialogProps: {
        payment,
        title: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.confirm.title',
        }),
        description: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.confirm.description' },
          { credits: payment.credits.toLocaleString() },
        ),
        submitText: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.enableSubscription.confirm.submit',
        }),
        onSuccess: showSuccessDialog,
      },
    });
  };
};

export const useSaveSubscriptionSuccessDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const { closeModal } = useContext(FullScreenModalContext);

  return () => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.success.title',
        }),
        description: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.success.description' },
          { a: renderSettingsLink },
        ),
        isNegativeButtonHidden: true,
        positiveButtonProps: {
          text: intl.formatMessage({
            id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.success.submit',
          }),
          onClick: () => closeModal(),
        },
      },
    });
  };
};

export const useSaveSubscriptionConfirmDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const showSuccessDialog = useSaveSubscriptionSuccessDialog();

  return (payment: VoucherPayment) => {
    showDialog({
      dialogTypes: DialogType.CallsUpdateSubscription,
      dialogProps: {
        payment,
        title: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.confirm.title',
        }),
        description: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.confirm.description' },
          { credits: payment.credits.toLocaleString() },
        ),
        submitText: intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.saveSubscription.confirm.submit' },
          { credits: payment.credits },
        ),
        onSuccess: showSuccessDialog,
      },
    });
  };
};

export const useCalculatorDialog = ({
  rates,
  onSubmit,
}: {
  rates: CreditRates;
  onSubmit: (credits: number) => void;
}) => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return () => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'large',
        title: intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.title' }),
        description: intl.formatMessage({
          id: 'common.settings.general.callsVoucherModalDialogs.calculator.description',
        }),
        body: ({ close }) => {
          const handleSubmit = (credits: number) => {
            onSubmit(credits);
            close();
          };
          return <Calculator rates={rates} onSubmit={handleSubmit} onCancel={close} />;
        },
        isNegativeButtonHidden: true,
      },
    });
  };
};
