import { useEffect, useContext } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { toast } from 'feather';
import numbro from 'numbro';

import { SubscriptionInfoContext } from '@/SubscriptionInfoContext';
import { commonActions } from '@actions';
import { commonApi } from '@api';
import { fetchSubscriptionPlans } from '@common/api';
import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { CLOUD_FRONT_URL } from '@constants';
import { SubscriptionName, SubscriptionProduct } from '@constants';
import { getErrorMessage } from '@epics/generateBadRequest';
import { useAsync, useOrganization, useShowDialog } from '@hooks';

const STARTER_PLAN_KEY = 'plan_a';
const PRO_PLAN_KEY = 'plan_b';

type UseSubscriptionPlans = () => {
  isFetching: boolean;
  plans: {
    starter: SubscriptionPlan[];
    pro: SubscriptionPlan[];
  };
  allPlans?: SubscriptionPlansData;
  planA1kAvailable: boolean;
};

const getSubscriptionPlan = (params: {
  intl: IntlShape;
  subscriptionPlansData: SubscriptionPlansData;
}): { starter: SubscriptionPlan[]; pro: SubscriptionPlan[] } => {
  const { intl, subscriptionPlansData } = params;
  return Object.keys(subscriptionPlansData).reduce<{ starter: SubscriptionPlan[]; pro: SubscriptionPlan[] }>(
    (plans, subscriptionName: SubscriptionName) => {
      if (subscriptionName.includes(STARTER_PLAN_KEY)) {
        const planData = subscriptionPlansData[subscriptionName];
        plans.starter.push({
          subscriptionName,
          displayName: intl.formatMessage(
            { id: 'common.subscriptionPlan.starter.displayName' },
            { mau: String(numbro(planData.mau.purchased_units).format('0a')).toUpperCase() },
          ),
          quota: planData.mau.purchased_units,
          baseFee: planData.base_fee.cost_per_unit,
        });
      }
      if (subscriptionName.includes(PRO_PLAN_KEY)) {
        const planData = subscriptionPlansData[subscriptionName];
        plans.pro.push({
          subscriptionName,
          displayName: intl.formatMessage(
            { id: 'common.subscriptionPlan.pro.displayName' },
            { mau: String(numbro(planData.mau.purchased_units).format('0a')).toUpperCase() },
          ),
          quota: planData.mau.purchased_units,
          baseFee: planData.base_fee.cost_per_unit,
        });
      }
      return plans;
    },
    { starter: [], pro: [] },
  );
};

export const useSubscriptionPlans: UseSubscriptionPlans = () => {
  const intl = useIntl();
  const organization = useOrganization();
  const [{ data: response, status }, load] = useAsync(() => fetchSubscriptionPlans(organization.uid), [
    organization.uid,
  ]);

  const responseData = response?.data;

  useEffect(() => {
    load();
  }, [load]);

  return {
    isFetching: status === 'loading',
    plans: responseData ? getSubscriptionPlan({ intl, subscriptionPlansData: responseData }) : { starter: [], pro: [] },
    allPlans: responseData,
    planA1kAvailable: !!responseData?.plan_a_1k,
  };
};

// Dialogs
type ShowCancelSubscriptionAction = (params: { currentSubscription: Subscription; endReason: string }) => void;
type ShowUndoCancelSubscriptionAction = (params: { currentSubscription: Subscription }) => void;
type CommonFutureSubscriptionAction = (params: { futureSubscription: Subscription }) => void;
type ShowChangePlanDialogAction = (params: {
  currentSubscription: Subscription | null;
  selectedPlan: SubscriptionPlan;
  onSuccess?: () => void;
}) => void;
type Show1kSubscriptionAction = (params: { onSubmit: () => void; onNoThanksClick: () => void }) => void;
type ShowReasonForCancelAction = (params: { onSubmit: ({ endReason: string }) => void }) => void;

type UseSubscriptionActionDialogs = () => {
  showChangePlanDialog: ShowChangePlanDialogAction;
  showUndoCancelSubscriptionDialog: ShowUndoCancelSubscriptionAction;
  showCancelSubscriptionDialog: ShowCancelSubscriptionAction;
  showUndoPlanChangeRequestDialog: CommonFutureSubscriptionAction;
  show1kSubscriptionDialog: Show1kSubscriptionAction;
  showReasonForCancelDialog: ShowReasonForCancelAction;
};

export const useSubscriptionActionDialogs: UseSubscriptionActionDialogs = () => {
  const intl = useIntl();
  const { updateSubscriptions, fetchSubscriptions } = useContext(SubscriptionInfoContext);
  const showDialog = useShowDialog();
  const dispatch = useDispatch();
  const updateOrganization = (organization) => dispatch(commonActions.updateOrganizationSuccess(organization));
  const { reload } = useCurrentChatSubscription();

  const handleError = (error) => {
    toast.error({ message: getErrorMessage(error) });
  };

  const showChangePlanDialog: ShowChangePlanDialogAction = (params) => {
    showDialog({
      dialogTypes: DialogType.ChangePlan,
      dialogProps: {
        currentSubscription: params.currentSubscription,
        selectedSubscriptionPlan: params.selectedPlan,
        onSuccessSubmit: params.onSuccess,
        onChangePlanSuccessConfirm: (updatedSubscription) => {
          if (updatedSubscription) {
            updateSubscriptions({
              product: SubscriptionProduct.Chat,
              info: { current: updatedSubscription, future: null },
            });
            updateOrganization(updatedSubscription.organization);
            reload();
          } else {
            // downgrade request
            fetchSubscriptions();
          }
        },
      },
    });
  };

  const showUndoCancelSubscriptionDialog: ShowUndoCancelSubscriptionAction = (params) => {
    showDialog({
      dialogTypes: DialogType.ConfirmWithOrganizationName,
      dialogProps: {
        title: intl.formatMessage({ id: 'common.dialog.undoCancelSubscription.title' }),
        description: intl.formatMessage({ id: 'common.dialog.undoCancelSubscription.description' }),
        onSuccess: () => {
          toast.success({
            message: intl.formatMessage({
              id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.toast.success.undoCancelSubscription',
            }),
          });
          fetchSubscriptions();
        },
        onError: handleError,
        api: commonApi.cancelUnsubscribeSubscription,
        payload: params.currentSubscription.id,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.resubscribe' }),
        },
      },
    });
  };

  const show1kSubscriptionDialog: Show1kSubscriptionAction = (params) => {
    showDialog({
      dialogTypes: DialogType.Confirm1k,
      dialogProps: params,
    });
  };

  const showReasonForCancelDialog: ShowReasonForCancelAction = (params) => {
    showDialog({
      dialogTypes: DialogType.ReasonForCancel,
      dialogProps: params,
    });
  };

  const showCancelSubscriptionDialog: ShowCancelSubscriptionAction = (params) => {
    showDialog({
      dialogTypes: DialogType.ConfirmWithOrganizationName,
      dialogProps: {
        title: intl.formatMessage({ id: 'common.dialog.cancelSubscription.title' }),
        description: intl.formatMessage({ id: 'common.dialog.cancelSubscription.description' }),
        subDescription: intl.formatMessage({ id: 'common.dialog.cancelSubscription.subDescription' }),
        onSuccess: () => {
          toast.warning({
            message: intl.formatMessage({
              id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.toast.warning.cancelPlan',
            }),
          });
          fetchSubscriptions();
        },
        onError: handleError,
        api: commonApi.unsubscribeSubscriptionPlan,
        payload: { subscription_id: params.currentSubscription.id, endReason: params.endReason },
        negativeButtonProps: {
          text: intl.formatMessage({ id: 'common.dialog.confirmWithOrganizationName.keepSubscription' }),
          buttonType: 'primary',
        },
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.cancelSubscription' }),
          buttonType: 'tertiary',
        },
        renderGuideImage: () => {
          return (
            <img
              alt={intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.imageAlt' })}
              width={432}
              height={136}
              srcSet={`${CLOUD_FRONT_URL}/dashboard/img-page-cancelrequest.png,
                ${CLOUD_FRONT_URL}/dashboard/img-page-cancelrequest%402x.png 2x,
                ${CLOUD_FRONT_URL}/dashboard/img-page-cancelrequest%403x.png 3x
                `}
              src={`${CLOUD_FRONT_URL}/dashboard/img-page-cancelrequest.png`}
            />
          );
        },
      },
    });
  };

  const showUndoPlanChangeRequestDialog: CommonFutureSubscriptionAction = (params) => {
    showDialog({
      dialogTypes: DialogType.ConfirmWithOrganizationName,
      dialogProps: {
        title: intl.formatMessage({ id: 'common.dialog.undoDowngrade.title' }),
        description: intl.formatMessage({ id: 'common.dialog.undoDowngrade.description' }),
        onSuccess: () => {
          toast.success({
            message: intl.formatMessage({
              id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.toast.success.undoPlanChangeRequest',
            }),
          });
          fetchSubscriptions();
        },
        onError: handleError,
        api: commonApi.cancelDowngradeSubscription,
        payload: params.futureSubscription.id,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.keepPlan' }),
        },
      },
    });
  };

  return {
    showChangePlanDialog,
    showUndoCancelSubscriptionDialog,
    showCancelSubscriptionDialog,
    showUndoPlanChangeRequestDialog,
    show1kSubscriptionDialog,
    showReasonForCancelDialog,
  };
};
