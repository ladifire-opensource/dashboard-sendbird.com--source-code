import { memo, useCallback, useEffect, useMemo, useState, HTMLAttributes, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import setDate from 'date-fns/setDate';
import {
  cssVariables,
  Typography,
  Headings,
  Subtitles,
  Body,
  Dropdown,
  shadow,
  Lozenge,
  Button,
  Icon,
  ButtonProps,
  Link,
  LinkVariant,
  InlineNotification,
  transitionDefault,
} from 'feather';
import qs from 'qs';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMPTY_TEXT, SubscriptionName } from '@constants';
import { useErrorToast } from '@hooks';
import useAuthentication from '@hooks/useAuthentication';
import { useShowDialog } from '@hooks/useShowDialog';
import { onDropdownChangeIgnoreNull } from '@utils';

import { SubscriptionPlanType, TALK_TO_SALES_PLAN_NAMES } from './constants';
import { useSubscriptionActionDialogs } from './hooks';
import { checkIsLegacyStarterPlan, getFormattedPlanFee, getFormattedQuota, isTalkToSalesPlan } from './utils';

export enum CurrentPlanStatus {
  NO_PLAN = 'NO_PLAN',
  HAS_PLAN = 'HAS_PLAN',
}

export enum FuturePlanStatus {
  REQUESTED_CANCEL_PLAN = 'REQUEST_CANCEL_PLAN',
  REQUESTED_LOWER_FEE_PLAN = 'REQUESTED_LOWER_FEE_PLAN',
  SELECTED_TALK_TO_SALES_PLAN = 'SELECTED_TALK_TO_SALES_PLAN',
  SELECTED_LOWER_FEE_PLAN = 'SELECTED_LOWER_FEE_PLAN',
  SELECTED_HIGHER_FEE_PLAN = 'SELECTED_HIGHER_FEE_PLAN',
  EMPTY = 'EMPTY',
}

const UPDATER_CONTAINER_WIDTH = 1024;
const UPDATER_WIDTH = 320;

const SubscriptionPlanUpdaterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 72px -32px;
  padding: 32px;
  background: ${cssVariables('bg-2')};
`;

const SubscriptionPlanUpdaterTitleContainer = styled.div`
  display: flex;
  width: ${UPDATER_CONTAINER_WIDTH}px;
`;

const SubscriptionPlanUpdaterTitle = styled.h2`
  ${Subtitles['subtitle-02']};
  flex: auto;
  margin-bottom: 12px;
  font-weight: 600;
  color: ${cssVariables('neutral-7')};
`;

const PlanUpdaterContainer = styled.div`
  display: grid;
  grid-template-columns: ${UPDATER_WIDTH}px auto;
  grid-template-areas: 'current future';
  position: relative;
  width: ${UPDATER_CONTAINER_WIDTH}px;
  min-height: 330px;
  background: white;
  border-radius: 4px;
`;

const PlanUpdaterColumn = styled.div<{ showVerticalDivider?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 24px;

  ${({ showVerticalDivider }) =>
    showVerticalDivider &&
    css`
      border-left: 1px solid ${cssVariables('neutral-3')};
    `};
`;

const ArrowRight = styled(Icon).attrs({
  icon: 'arrow-right',
  size: 24,
})`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(150%, -50%);
`;

const ScheduledPlanBox = styled.div`
  display: flex;
  flex-direction: inherit;
  position: relative;
  padding: inherit;
  height: 100%;
  border-radius: 4px;
  ${shadow[2]};
`;

const PlanTitle = styled.h3`
  ${Typography['label-03']};
  margin-bottom: 16px;
  color: ${cssVariables('neutral-7')};
`;

const CurrentPlanName = styled.strong<{ $isNoPlan?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  ${Headings['heading-03']};
  color: ${({ $isNoPlan }) => ($isNoPlan ? cssVariables('red-5') : cssVariables('neutral-10'))};
`;

const CurrentPlanFee = styled.b`
  ${Headings['heading-05']};
  color: ${cssVariables('neutral-10')};
`;

const PlanFee = styled.div`
  display: flex;
  flex: auto;
  align-items: flex-end;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-7')};

  u {
    margin-left: 4px;
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const Quota = styled.span`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const SubscriptionPlanItemType = styled.strong`
  padding-top: 10px;
  ${Typography['label-02']};
  color: ${cssVariables('neutral-7')};
  pointer-events: none;
`;

const DescriptionContainer = styled.div<{ $hideLabel: boolean }>`
  display: flex;
  flex: auto;
  padding: 16px 0 24px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  > div {
    display: flex;
    flex-direction: column;
    width: ${({ $hideLabel }) => ($hideLabel ? '100%' : '104px')};
    height: 100%;
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-7')};

    &:nth-child(2) {
      flex: 1;
      width: auto;
      padding: 0 16px;
    }

    strong {
      display: block;
      font-weight: 600;
    }
  }
`;

const ScheduledDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};

  strong {
    display: block;
    font-weight: 600;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 24px;
  margin-left: 196px;
`;

const ButtonContainerWithTooltip = styled(ButtonContainer)`
  position: relative;
`;

const MovingTooltipWrapper = styled.div`
  @keyframes move-arrow {
    0% {
      transform: translate(0, -50%);
    }
    100% {
      transform: translate(3px, -50%);
    }
  }

  position: absolute;
  top: 50%;
  left: 240px;
  margin-left: 8px;
  animation: move-arrow 0.4s infinite alternate ease-in-out;
`;

const MovingTooltipArrow = styled.div`
  position: absolute;
  top: 50%;
  left: -7px;

  &::before,
  &::after {
    position: absolute;
    top: -8px;
    border: 8px solid transparent;
    content: '';
    pointer-events: none;
  }

  &::before {
    margin-left: -8px;
    border-right-color: ${cssVariables('neutral-3')};
    width: 8px;
    height: 16x;
  }

  &::after {
    margin-left: -7px;
    border-right-color: #fff;
    width: 7px;
    height: 14px;
  }
`;

const MovingTooltipContent = styled.div`
  border: 1px solid #c9d0e6;
  border-radius: 4px;
  background-color: #fff;
  padding: 16px 20px 16px 12px;
  line-height: 20px;
  white-space: pre;
  color: #212242;
  font-size: 14px;
  ${shadow[8]};
`;

const ScheduledActionButton = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;
  transform: translate(-14px, 25%);

  > div > svg {
    width: 16px;
    height: 16px;
  }
`;

// dropdown
const SubscriptionPlanDropdownWrapper = styled.div`
  div[role='combobox'] {
    ${shadow[2]};

    > button {
      height: 82px;
      border-color: transparent;

      > svg {
        width: 28px;
        height: 28px;
        fill: ${cssVariables('neutral-6')};
      }
    }
  }

  &:hover {
    div[role='combobox'] > button {
      strong,
      span,
      b,
      u,
      small {
        color: ${cssVariables('purple-7')};
      }
    }
  }
`;
const SubscriptionPlanItem = styled.div<{ isInUse?: boolean; isSelected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;

  ${({ isInUse }) =>
    isInUse &&
    css`
      &::before {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 5;
        width: 4px;
        height: 100%;
        background: ${cssVariables('purple-7')};
      }

      &::after {
        content: '';
        display: block;
        position: absolute;
        left: 4px;
        top: 0;
        z-index: 1;
        width: calc(100% - 4px);
        height: 100%;
        background: ${cssVariables('neutral-2')};
      }
    `}

  div {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: flex-start;
    position: relative;
    z-index: 10;

    &:nth-child(2) {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;

      transform: translateX(${({ isSelected }) => (isSelected ? 0 : 28)}px);
    }

    /* subscription display name */
    strong {
      display: flex;
      align-items: center;
      ${Headings['heading-02']};
    }

    /* mau quota */
    span {
      ${Typography['caption-01']};
      color: ${cssVariables('neutral-7')};
    }

    /* base fee */
    b {
      ${Headings['heading-02']};
    }

    /* per month */
    u {
      margin-left: 3px;
      ${Body['body-short-01']};
      text-decoration: none;
      color: ${cssVariables('neutral-7')};
    }

    /* talk to sales */
    small {
      ${Body['body-short-01']};
      text-decoration: none;
      color: ${cssVariables('neutral-6')};
      background: none;
    }

    ${({ isInUse }) =>
      isInUse &&
      css`
        strong,
        span,
        b,
        u,
        small {
          color: ${cssVariables('neutral-6')};
        }
      `};

    ${({ isSelected }) =>
      isSelected &&
      css`
        strong,
        span,
        b,
        u,
        small {
          color: ${cssVariables('purple-7')};
        }
      `};
  }
`;

const SelectedSubscriptionPlanItem = styled(SubscriptionPlanItem)<{ isOpen?: boolean }>`
  div {
    &:nth-child(2) {
      transform: translateX(0);
    }

    /* subscription display name */
    strong {
      ${Headings['heading-04']};
    }
    /* mau quota */
    span {
      ${Body['body-short-01']};
    }
    /* base fee */
    b {
      ${Headings['heading-06']};
    }
    /* per month */
    u {
      ${Subtitles['subtitle-01']};
    }
    /* talk to sales */
    small {
      ${Subtitles['subtitle-01']};
      color: ${cssVariables('neutral-7')};
    }

    ${({ isOpen }) =>
      isOpen &&
      css`
        strong,
        span,
        b,
        u,
        small {
          color: ${cssVariables('purple-7')};
        }
      `};
  }
`;

const SubscriptionPlanDropdownPlaceholder = styled.span<{ isOpen: boolean }>`
  ${Subtitles['subtitle-03']}
  color: ${({ isOpen }) => (isOpen ? cssVariables('purple-9') : cssVariables('neutral-6'))};
`;

const SubscriptionPlanDropdownCancelPlan = styled.span<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  ${Headings['heading-04']};
  color: ${({ isOpen }) => (isOpen ? cssVariables('purple-9') : cssVariables('red-5'))};
`;

const TooltipBold = styled.b`
  color: ${cssVariables('purple-7')};
  font-weight: 600;
`;

type SubscriptionPlanDropdownItem = SubscriptionPlan | SubscriptionPlanType;

type SubscriptionPlanDropdownProps = {
  plans: {
    starter: SubscriptionPlan[];
    pro: SubscriptionPlan[];
  };
  currentPlan: SubscriptionPlan | null;
  selectedItem: SubscriptionPlan | null;
  isLegacyStarterPlan: boolean;
  onChange: (selectedItem: SubscriptionPlan) => void;
};

const PlanItemContent = memo<{ displayNameLozenge: ReactNode } & SubscriptionPlan>(
  ({ displayNameLozenge, ...planItem }) => {
    const intl = useIntl();

    const { subscriptionName, displayName, quota, baseFee } = planItem;
    const isEnterprise = subscriptionName === SubscriptionName.Enterprise;

    const formattedQuota = isEnterprise
      ? intl.formatMessage({ id: 'common.subscriptionPlan.enterprise.mau' })
      : getFormattedQuota(quota);
    const formattedBaseFee = getFormattedPlanFee(baseFee);

    return (
      <>
        <div>
          <strong data-test-id="FuturePlanItemDisplayName">
            {displayName}
            {displayNameLozenge}
          </strong>
          <span data-test-id="FuturePlanItemQuota">
            {intl.formatMessage(
              { id: 'common.subscriptionPlanDialog.subscriptionUpdater.format.mau' },
              {
                quota: formattedQuota,
              },
            )}
          </span>
        </div>
        <div data-test-id="FuturePlanItemFee">
          {isTalkToSalesPlan(subscriptionName) ? (
            <small>
              {intl.formatMessage({
                id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.talkToSales',
              })}
            </small>
          ) : (
            intl.formatMessage(
              { id: 'common.subscriptionPlanDialog.subscriptionUpdater.format.baseFee' },
              {
                planFee: <CurrentPlanFee>{formattedBaseFee}</CurrentPlanFee>,
                span: (perMonth) => <u>{perMonth}</u>,
              },
            )
          )}
        </div>
      </>
    );
  },
);

const IconWrapper = styled.div`
  position: absolute;
  right: 24px;
`;

const TogglerRendererWrapper = styled.div<{ isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  padding-right: 72px;
  padding-left: 16px;
  width: 100%;
  height: 82px;

  &:hover {
    ${IconWrapper} {
      svg {
        fill: ${cssVariables('purple-7')};
      }
    }
  }

  ${IconWrapper} {
    transition: 0.2s ${transitionDefault};
    ${({ isOpen }) =>
      isOpen &&
      css`
        transform: rotate(180deg);
        svg {
          fill: ${cssVariables('purple-7')};
        }
      `};
  }
`;

const SubscriptionPlanDropdown = memo<SubscriptionPlanDropdownProps>(
  ({ plans, currentPlan, selectedItem, isLegacyStarterPlan, onChange }) => {
    const intl = useIntl();
    const enterpriseItem: SubscriptionPlan = {
      subscriptionName: SubscriptionName.Enterprise,
      displayName: intl.formatMessage({ id: 'common.subscriptionPlan.enterprise.displayName' }),
      quota: 0,
      baseFee: 0,
    };

    const items: SubscriptionPlanDropdownItem[] = [
      SubscriptionPlanType.Starter,
      ...plans.starter,
      SubscriptionPlanType.Pro,
      ...plans.pro,
      SubscriptionPlanType.Enterprise,
      enterpriseItem,
    ];

    const isInUsePlan = useCallback(
      (plan: SubscriptionPlan) => {
        const isExactSamePlan =
          !!currentPlan &&
          Object.entries(currentPlan).every(([key, currentPlanValue]) => plan[key] === currentPlanValue);
        const isStarter5KPlan = plan.subscriptionName === SubscriptionName.PlanA5K;

        return (
          (!isLegacyStarterPlan && isExactSamePlan) || (isLegacyStarterPlan && isExactSamePlan && !isStarter5KPlan)
        );
      },
      [currentPlan, isLegacyStarterPlan],
    );

    const inUseLozenge = useMemo(
      () => (
        <Lozenge color="purple" css="margin-left: 8px;">
          {intl.formatMessage({
            id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.lozenge.inUse',
          })}
        </Lozenge>
      ),
      [intl],
    );

    const specialOfferLozenge = useMemo(
      () => (
        <Lozenge color="orange" css="margin-left: 8px;">
          {intl.formatMessage({
            id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.lozenge.specialOffer',
          })}
        </Lozenge>
      ),
      [intl],
    );

    const getLozengeOfElement = useCallback(
      (item: SubscriptionPlan) => {
        const isInUse = isInUsePlan(item);

        if (isInUse) {
          return inUseLozenge;
        }

        if (item.subscriptionName === 'plan_a_1k') {
          return specialOfferLozenge;
        }

        return undefined;
      },
      [specialOfferLozenge, inUseLozenge, isInUsePlan],
    );

    const toggleRenderer = useCallback(
      ({ selectedItem: selectedToggleItem, isOpen }) => {
        const isPlaceholder = !selectedToggleItem || typeof selectedToggleItem === 'string';

        return (
          <TogglerRendererWrapper isOpen={isOpen}>
            {isPlaceholder ? (
              <SubscriptionPlanDropdownPlaceholder isOpen={isOpen} data-test-id="FuturePlanPlaceHolder">
                {intl.formatMessage({
                  id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.placeholder',
                })}
              </SubscriptionPlanDropdownPlaceholder>
            ) : (
              <SelectedSubscriptionPlanItem isOpen={isOpen} data-test-id="FuturePlanSelected">
                <PlanItemContent displayNameLozenge={getLozengeOfElement(selectedToggleItem)} {...selectedToggleItem} />
              </SelectedSubscriptionPlanItem>
            )}
            <IconWrapper>
              <Icon icon="input-arrow-down" size={24} color={cssVariables('neutral-6')} />
            </IconWrapper>
          </TogglerRendererWrapper>
        );
      },
      [getLozengeOfElement, intl],
    );

    return (
      <SubscriptionPlanDropdownWrapper>
        <Dropdown<SubscriptionPlanDropdownItem>
          items={items}
          selectedItem={selectedItem}
          width="100%"
          isItemDisabled={(item) => typeof item === 'string' || isInUsePlan(item)}
          itemToElement={(item) => {
            if (typeof item === 'string') {
              return <SubscriptionPlanItemType>{item}</SubscriptionPlanItemType>;
            }

            return (
              <SubscriptionPlanItem
                isInUse={isInUsePlan(item)}
                isSelected={item.subscriptionName === selectedItem?.subscriptionName}
              >
                <PlanItemContent displayNameLozenge={getLozengeOfElement(item)} {...item} />
              </SubscriptionPlanItem>
            );
          }}
          itemToString={(item) => {
            // For resolving Key error of Dropdown
            return typeof item === 'string' ? item : item.subscriptionName;
          }}
          toggleRenderer={toggleRenderer}
          onChange={onDropdownChangeIgnoreNull(onChange)}
          stateReducer={(_, changes) => {
            const modal = document.getElementById('SubscriptionPlanModal');
            if (modal && typeof changes.isOpen === 'boolean') {
              if (changes.isOpen) {
                modal.style.overflowY = 'hidden';
              } else {
                modal.style.overflowY = 'auto';
              }
            }
            return changes;
          }}
          showArrow={false}
        />
      </SubscriptionPlanDropdownWrapper>
    );
  },
);

type FuturePlanContent = {
  label: string | null;
  date: { text: string; color: string };
  description: { text: string | null; color: string };
  button: {
    text: string;
    props: Pick<ButtonProps, 'buttonType'> &
      Partial<Omit<ButtonProps, 'buttonType'>> &
      HTMLAttributes<HTMLButtonElement> & { width?: number };
  };
};

type Props = {
  currentSubscription: Subscription | null;
  futureSubscription?: Subscription | null;
  plans: {
    starter: SubscriptionPlan[];
    pro: SubscriptionPlan[];
  };
  cardInfo: {} | CreditCardInfo | null;
  setIs1kInterested: (is1kInterested: boolean) => void;
  planA1kAvailable: boolean;
  showStarter1kOption: boolean;
};

const FULL_DATE_FORMAT = 'MMMM d, yyyy';
const getPlan = (subscription: Subscription) => ({
  subscriptionName: subscription.subscription_name,
  displayName: subscription.display_name,
  quota: subscription.plan.mau.purchased_units,
  baseFee: subscription.plan_value,
});

const SubscriptionPlanUpdater = memo<Props>((props) => {
  const {
    currentSubscription,
    futureSubscription,
    plans,
    cardInfo,
    setIs1kInterested,
    planA1kAvailable,
    showStarter1kOption,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const { isOrganizationDeactivated } = useAuthentication();
  const showDialog = useShowDialog();
  const {
    showChangePlanDialog,
    showUndoCancelSubscriptionDialog,
    showUndoPlanChangeRequestDialog,
    show1kSubscriptionDialog,
    showReasonForCancelDialog,
    showCancelSubscriptionDialog,
  } = useSubscriptionActionDialogs();

  const [selectedPlanItem, setSelectedPlanItem] = useState<SubscriptionPlan | null>(null);
  const currentPlan = currentSubscription ? getPlan(currentSubscription) : null;
  const futurePlan = futureSubscription ? getPlan(futureSubscription) : null;
  const resetSelectedPlanItem = () => {
    setSelectedPlanItem(null);
  };

  useEffect(() => {
    // Reset `selectedPlanItem` when there is update on `currentSubscription` or `futureSubscription`.
    if (currentSubscription || !futureSubscription) {
      resetSelectedPlanItem();
    }
  }, [currentSubscription, futureSubscription]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useErrorToast(errorMessage, {
    ignoreDuplicates: true,
    onClose: () => {
      setErrorMessage(null);
    },
  });

  const hasCreditCard = useMemo(() => cardInfo != null && Object.keys(cardInfo).length > 0, [cardInfo]);
  const currentPlanName =
    currentPlan?.displayName ??
    intl.formatMessage({ id: 'common.subscriptionPlanDialog.subscriptionUpdater.current.displayName.unsubscribed' });
  const currentPlanQuotaFormatted = getFormattedQuota(currentPlan?.quota ?? 0);
  const currentPlanFeeFormatted = getFormattedPlanFee(currentPlan?.baseFee ?? 0);

  const isTalkToSalesPlanSelected = !!selectedPlanItem && isTalkToSalesPlan(selectedPlanItem.subscriptionName);

  const isLegacyStarterPlan = checkIsLegacyStarterPlan(currentSubscription);

  /**
   * defines various conditions into a certain status within two scenarios, which are current and future
   */
  const planStatus = useMemo(() => {
    const futurePlanStatus = (() => {
      const currentPlanValue = currentSubscription?.plan_value ?? 0;
      if (selectedPlanItem) {
        if (isTalkToSalesPlan(selectedPlanItem.subscriptionName)) {
          return FuturePlanStatus.SELECTED_TALK_TO_SALES_PLAN;
        }

        if (currentPlanValue <= selectedPlanItem.baseFee) {
          return FuturePlanStatus.SELECTED_HIGHER_FEE_PLAN;
        }
        return FuturePlanStatus.SELECTED_LOWER_FEE_PLAN;
      }

      if (currentSubscription) {
        if (currentSubscription.subscription_name !== SubscriptionName.FreeTrial && !!currentSubscription.end_date) {
          return FuturePlanStatus.REQUESTED_CANCEL_PLAN;
        }

        if (futureSubscription && currentSubscription.plan_value > futureSubscription.plan_value) {
          return FuturePlanStatus.REQUESTED_LOWER_FEE_PLAN;
        }
      }

      return FuturePlanStatus.EMPTY;
    })();
    return {
      current: currentSubscription ? CurrentPlanStatus.HAS_PLAN : CurrentPlanStatus.NO_PLAN,
      future: futurePlanStatus,
    };
  }, [currentSubscription, futureSubscription, selectedPlanItem]);

  const isFuturePlanScheduled = [
    FuturePlanStatus.REQUESTED_CANCEL_PLAN,
    FuturePlanStatus.REQUESTED_LOWER_FEE_PLAN,
  ].includes(planStatus.future);

  const showAddCreditCardDialog = useCallback(
    ({ onSuccess }: { onSuccess: () => void }) =>
      showDialog({
        dialogTypes: DialogType.RegisterCard,
        dialogProps: { onSuccess },
      }),
    [showDialog],
  );

  const handleTalkToSalesClick = useCallback(() => {
    const subject =
      selectedPlanItem && TALK_TO_SALES_PLAN_NAMES.includes(selectedPlanItem.subscriptionName)
        ? intl.formatMessage(
            { id: 'common.subscriptionPlanDialog.talkToSales.supportForm.subject' },
            { planName: selectedPlanItem.displayName },
          )
        : null;
    const query = {
      category: 'sales_inquiry',
      ...(subject && { subject }),
    };
    history.push(`/settings/contact_us?${qs.stringify(query)}`);
  }, [history, intl, selectedPlanItem]);

  const showUnsubscribeRelatedDialogs = useCallback(() => {
    if (currentSubscription) {
      showReasonForCancelDialog({
        onSubmit: ({ endReason }) => {
          showCancelSubscriptionDialog({ currentSubscription, endReason });
        },
      });
    }
  }, [currentSubscription, showCancelSubscriptionDialog, showReasonForCancelDialog]);

  const handleCancelCurrentSubscriptionClick = useCallback(() => {
    if (!currentSubscription) return;

    if (planA1kAvailable) {
      // is the user available for starter 1K plan?
      if (showStarter1kOption) {
        // if the user is currently using starter 1K plan or has clicked `I'm interested` already.
        showUnsubscribeRelatedDialogs();
      } else {
        const plan1K = plans.starter.find(({ subscriptionName }) => subscriptionName === 'plan_a_1k');
        show1kSubscriptionDialog({
          onSubmit: () => {
            setIs1kInterested(true);
            setSelectedPlanItem(plan1K ?? null);
          },
          onNoThanksClick: () => {
            showUnsubscribeRelatedDialogs();
          },
        });
      }
    } else {
      // is the user not available for starter 1K plan?
      showUnsubscribeRelatedDialogs();
    }
  }, [
    currentSubscription,
    planA1kAvailable,
    plans.starter,
    setIs1kInterested,
    show1kSubscriptionDialog,
    showStarter1kOption,
    showUnsubscribeRelatedDialogs,
  ]);

  const handleUndoPlanChangeRequestClick = useCallback(() => {
    if (futureSubscription) {
      showUndoPlanChangeRequestDialog({ futureSubscription });
    }
  }, [futureSubscription, showUndoPlanChangeRequestDialog]);

  const handleUndoCancelSubscriptionClick = useCallback(() => {
    if (currentSubscription) {
      // TODO: show can't cancel dialog if org have active Calls voucher or
      // disable cancel button to prevent cancellation (discuss with UX)
      showUndoCancelSubscriptionDialog({ currentSubscription });
    }
  }, [currentSubscription, showUndoCancelSubscriptionDialog]);

  const handleChangePlanClick = useCallback(() => {
    if (!selectedPlanItem) {
      setErrorMessage(
        intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.toast.error.noSelectedPlan',
        }),
      );
      return;
    }

    // reset errorMessage if user clicked change plan button without selectedItem
    if (errorMessage) {
      setErrorMessage(null);
    }

    if (currentSubscription && !hasCreditCard) {
      showAddCreditCardDialog({
        onSuccess: () => {
          showChangePlanDialog({
            currentSubscription,
            selectedPlan: selectedPlanItem,
          });
        },
      });
      return;
    }

    showChangePlanDialog({
      currentSubscription: currentSubscription ?? null,
      selectedPlan: selectedPlanItem,
    });
  }, [
    currentSubscription,
    errorMessage,
    hasCreditCard,
    intl,
    selectedPlanItem,
    showAddCreditCardDialog,
    showChangePlanDialog,
  ]);

  const guideMessages = useMemo(
    () => ({
      LABEL: {
        STARTS_ON: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.label.startsOn',
        }),
        EFFECTIVE: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.label.effective',
        }),
        CANCEL_STARTS_ON: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.label.cancelPlanStartsOn',
        }),
      },
      DATE: {
        NO_PLAN: EMPTY_TEXT,
        TALK_TO_SALES: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.date.talkToSales',
        }),

        IMMEDIATELY: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.date.immediately',
        }),
        LOWER_PLAN: futureSubscription
          ? format(new Date(futureSubscription.start_date), FULL_DATE_FORMAT) // scheduled date from server
          : format(setDate(addMonths(Date.now(), 1), 1), FULL_DATE_FORMAT), // expected date should be 1st day of next month
        CANCEL_PLAN: currentSubscription?.end_date
          ? format(setDate(addMonths(new Date(currentSubscription.end_date), 1), 1), FULL_DATE_FORMAT)
          : EMPTY_TEXT,
      },
      DESCRIPTION: {
        NO_PLAN: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.description.noPlan',
        }),
        TALK_TO_SALES: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.description.changeToTalkToSalesPlan',
        }),
        IMMEDIATELY: intl.formatMessage(
          {
            id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.description.changeToHigherFeePlan',
          },
          { effectiveDate: format(Date.now(), 'MMM d, yyyy') },
        ),
        TO_LOWER_PLAN: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.description.changeToLowerFeePlan',
        }),
        CANCEL_SCHEDULED: intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.guide.description.cancelPlan',
        }),
      },
    }),
    [currentSubscription, futureSubscription, intl],
  );

  const buttonLabel = useMemo(
    () => ({
      CHANGE_NOW: intl.formatMessage({
        id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.changeNow',
      }),
      SCHEDULE: intl.formatMessage({
        id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.schedule',
      }),
      CANCEL_REQUEST: intl.formatMessage({
        id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.cancelRequest',
      }),
      SUBSCRIBE_AGAIN: intl.formatMessage({
        id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.subscribeAgain',
      }),
      TALK_TO_SALES: intl.formatMessage({
        id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.talkToSales',
      }),
    }),
    [intl],
  );

  const futurePlanContent = useMemo<FuturePlanContent>(() => {
    switch (planStatus.future) {
      case FuturePlanStatus.REQUESTED_CANCEL_PLAN:
        return {
          label: guideMessages.LABEL.CANCEL_STARTS_ON,
          date: { text: guideMessages.DATE.CANCEL_PLAN, color: cssVariables('red-5') },
          description: { text: guideMessages.DESCRIPTION.CANCEL_SCHEDULED, color: cssVariables('neutral-10') },
          button: {
            text: buttonLabel.SUBSCRIBE_AGAIN,
            props: {
              buttonType: 'primary',
              variant: 'ghost',
              icon: 'rollback',
              onClick: handleUndoCancelSubscriptionClick,
            },
          },
        };

      case FuturePlanStatus.REQUESTED_LOWER_FEE_PLAN:
        return {
          label: guideMessages.LABEL.STARTS_ON,
          date: { text: guideMessages.DATE.LOWER_PLAN, color: cssVariables('red-5') },
          description: { text: guideMessages.DESCRIPTION.TO_LOWER_PLAN, color: cssVariables('neutral-10') },
          button: {
            text: buttonLabel.CANCEL_REQUEST,
            props: {
              buttonType: 'primary',
              variant: 'ghost',
              icon: 'rollback',
              onClick: handleUndoPlanChangeRequestClick,
            },
          },
        };

      case FuturePlanStatus.SELECTED_TALK_TO_SALES_PLAN:
        return {
          label: null,
          date: { text: guideMessages.DATE.TALK_TO_SALES, color: cssVariables('purple-7') },
          description: { text: guideMessages.DESCRIPTION.TALK_TO_SALES, color: cssVariables('neutral-10') },
          button: {
            text: buttonLabel.TALK_TO_SALES,
            props: {
              buttonType: 'primary',
              width: 232,
              onClick: handleTalkToSalesClick,
            },
          },
        };

      case FuturePlanStatus.SELECTED_HIGHER_FEE_PLAN:
        return {
          label: guideMessages.LABEL.EFFECTIVE,
          date: { text: guideMessages.DATE.IMMEDIATELY, color: cssVariables('purple-7') },
          description: { text: guideMessages.DESCRIPTION.IMMEDIATELY, color: cssVariables('neutral-10') },
          button: {
            text: isTalkToSalesPlanSelected ? buttonLabel.TALK_TO_SALES : buttonLabel.CHANGE_NOW,
            props: {
              buttonType: 'primary',
              width: 232,
              onClick: handleChangePlanClick,
            },
          },
        };

      case FuturePlanStatus.SELECTED_LOWER_FEE_PLAN:
        return {
          label: guideMessages.LABEL.EFFECTIVE,
          date: { text: guideMessages.DATE.LOWER_PLAN, color: cssVariables('red-5') },
          description: { text: guideMessages.DESCRIPTION.TO_LOWER_PLAN, color: cssVariables('neutral-10') },
          button: {
            text: isTalkToSalesPlanSelected ? buttonLabel.TALK_TO_SALES : buttonLabel.SCHEDULE,
            props: {
              buttonType: 'primary',
              width: 232,
              onClick: handleChangePlanClick,
            },
          },
        };

      default:
        return {
          label: guideMessages.LABEL.EFFECTIVE,
          date: { text: guideMessages.DATE.NO_PLAN, color: cssVariables('neutral-7') },
          description: { text: null, color: cssVariables('neutral-7') },
          button: {
            text: buttonLabel.CHANGE_NOW,
            props: { buttonType: 'primary', width: 232, onClick: handleChangePlanClick },
          },
        };
    }
  }, [
    buttonLabel,
    guideMessages,
    handleTalkToSalesClick,
    handleUndoCancelSubscriptionClick,
    handleChangePlanClick,
    handleUndoPlanChangeRequestClick,
    isTalkToSalesPlanSelected,
    planStatus,
  ]);

  const renderCurrentPlan = useMemo(
    () => (
      <>
        <CurrentPlanName $isNoPlan={planStatus.current === CurrentPlanStatus.NO_PLAN} data-test-id="CurrentPlanName">
          {currentPlanName}
          {isOrganizationDeactivated && (
            <Lozenge color="red" css="margin-top: 4px;">
              {intl.formatMessage({
                id: 'common.subscriptionPlanDialog.subscriptionUpdater.current.lozenge.organizationDeactivated',
              })}
            </Lozenge>
          )}
        </CurrentPlanName>
        {planStatus.current === CurrentPlanStatus.HAS_PLAN && (
          <>
            <Quota data-test-id="CurrentPlanQuota">
              {intl.formatMessage(
                { id: 'common.subscriptionPlanDialog.subscriptionUpdater.format.mau' },
                {
                  quota: currentPlanQuotaFormatted,
                },
              )}
            </Quota>
            <PlanFee data-test-id="CurrentPlanFee">
              {intl.formatMessage(
                { id: 'common.subscriptionPlanDialog.subscriptionUpdater.format.baseFee' },
                {
                  planFee: <CurrentPlanFee>{currentPlanFeeFormatted}</CurrentPlanFee>,
                  span: (perMonth) => <u>{perMonth}</u>,
                },
              )}
            </PlanFee>
          </>
        )}
      </>
    ),
    [currentPlanFeeFormatted, currentPlanName, currentPlanQuotaFormatted, intl, isOrganizationDeactivated, planStatus],
  );

  const filteredPlans = useMemo(() => {
    if (planA1kAvailable) {
      return showStarter1kOption
        ? plans
        : { ...plans, starter: plans.starter.filter(({ subscriptionName }) => subscriptionName !== 'plan_a_1k') };
    }
    return plans;
  }, [showStarter1kOption, planA1kAvailable, plans]);

  const renderChangeButton = useCallback(() => {
    const renderButton = () => (
      <Button
        {...futurePlanContent.button.props}
        data-test-id="ChangePlanActionButton"
        disabled={!selectedPlanItem}
        css={
          typeof futurePlanContent.button.props?.width === 'number'
            ? css`
                width: ${futurePlanContent.button.props.width}px;
              `
            : undefined
        }
      >
        {futurePlanContent.button.text}
      </Button>
    );

    return selectedPlanItem?.subscriptionName === 'plan_a_1k' ? (
      <ButtonContainerWithTooltip>
        {renderButton()}
        <MovingTooltipWrapper data-test-id="starter1kTooltip">
          <MovingTooltipArrow />
          <MovingTooltipContent>
            {intl.formatMessage(
              {
                id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.button.1kTooltip',
              },
              { b: (item) => <TooltipBold>{item}</TooltipBold> },
            )}
          </MovingTooltipContent>
        </MovingTooltipWrapper>
      </ButtonContainerWithTooltip>
    ) : (
      <ButtonContainer>{renderButton()}</ButtonContainer>
    );
  }, [futurePlanContent.button.props, futurePlanContent.button.text, intl, selectedPlanItem]);

  const renderFuturePlanDropdown = useMemo(
    () => (
      <>
        <SubscriptionPlanDropdown
          plans={filteredPlans}
          currentPlan={currentPlan}
          selectedItem={selectedPlanItem}
          isLegacyStarterPlan={isLegacyStarterPlan}
          onChange={setSelectedPlanItem}
        />
        <DescriptionContainer $hideLabel={!futurePlanContent.label}>
          {futurePlanContent.label && <div data-test-id="FuturePlanGuideLabel">{futurePlanContent.label}</div>}
          <div>
            <strong
              data-test-id="FuturePlanGuideDate"
              css={`
                color: ${futurePlanContent.date.color};
              `}
            >
              {futurePlanContent.date.text}
            </strong>
            {futurePlanContent.description.text && (
              <p
                data-test-id="FuturePlanGuideDescription"
                css={`
                  color: ${futurePlanContent.description.color};
                `}
              >
                {futurePlanContent.description.text}
              </p>
            )}
          </div>
        </DescriptionContainer>
        {renderChangeButton()}
      </>
    ),
    [
      currentPlan,
      filteredPlans,
      futurePlanContent.date.color,
      futurePlanContent.date.text,
      futurePlanContent.description.color,
      futurePlanContent.description.text,
      futurePlanContent.label,
      isLegacyStarterPlan,
      renderChangeButton,
      selectedPlanItem,
    ],
  );

  const changeRequestedLozenge = useMemo(
    () => (
      <Lozenge color="blue" css="margin-left: 8px;">
        {intl.formatMessage({
          id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.lozenge.changeRequested',
        })}
      </Lozenge>
    ),
    [intl],
  );

  const renderFuturePlanScheduled = useMemo(() => {
    const requestedPlan = (() => {
      switch (planStatus.future) {
        case FuturePlanStatus.REQUESTED_CANCEL_PLAN:
          return (
            <SubscriptionPlanDropdownCancelPlan data-test-id="FuturePlanCancelled">
              {intl.formatMessage({
                id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.dropdown.cancelPlan',
              })}
              {changeRequestedLozenge}
            </SubscriptionPlanDropdownCancelPlan>
          );

        default:
          return futurePlan ? (
            <>
              <SelectedSubscriptionPlanItem data-test-id="FuturePlanScheduled">
                <PlanItemContent {...futurePlan} displayNameLozenge={changeRequestedLozenge} />
              </SelectedSubscriptionPlanItem>
            </>
          ) : null;
      }
    })();

    return (
      <>
        {requestedPlan}
        <ScheduledDescriptionContainer>
          <strong
            data-test-id="FuturePlanGuideScheduledDate"
            css={`
              color: ${futurePlanContent.date.color};
            `}
          >
            {futurePlanContent.label} {futurePlanContent.date.text}
          </strong>
          <p
            data-test-id="FuturePlanGuideScheduledDescription"
            css={`
              color: ${futurePlanContent.description.color};
            `}
          >
            {futurePlanContent.description.text}
          </p>
        </ScheduledDescriptionContainer>
      </>
    );
  }, [changeRequestedLozenge, futurePlan, futurePlanContent, intl, planStatus.future]);

  const canCancelCurrentSubscription =
    currentSubscription &&
    ![SubscriptionName.Free, SubscriptionName.FreeTrial].includes(currentSubscription.subscription_name) &&
    ![FuturePlanStatus.REQUESTED_CANCEL_PLAN, FuturePlanStatus.REQUESTED_LOWER_FEE_PLAN].includes(planStatus.future);

  return (
    <SubscriptionPlanUpdaterWrapper data-test-id="SubscriptionPlanUpdaterWrapper">
      <SubscriptionPlanUpdaterTitleContainer data-test-id="SubscriptionPlanUpdaterTitleContainer">
        <SubscriptionPlanUpdaterTitle>
          {intl.formatMessage({ id: 'common.subscriptionPlanDialog.subscriptionUpdater.title' })}
        </SubscriptionPlanUpdaterTitle>
        {canCancelCurrentSubscription && (
          <Link
            variant={LinkVariant.Inline}
            onClick={handleCancelCurrentSubscriptionClick}
            css={css`
              ${Subtitles['subtitle-01']};
            `}
          >
            {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.cancelSubscription' })}
          </Link>
        )}
      </SubscriptionPlanUpdaterTitleContainer>
      {isLegacyStarterPlan && (
        <InlineNotification
          type="warning"
          message={intl.formatMessage(
            {
              id: 'common.subscriptionPlanDialog.inlineNotification.warning.legacyStarterPlan',
            },
            {
              b: (messageSearchText) => <b>{messageSearchText}</b>,
              a: (talkToSalesText) => (
                <Link
                  href="/settings/contact_us?category=pricing"
                  useReactRouter={true}
                  iconProps={{ icon: 'open-in-new', size: 16 }}
                  css="text-decoration: underline;"
                >
                  {talkToSalesText}
                </Link>
              ),
            },
          )}
          css={`
            margin-bottom: 8px;
            max-width: 1024px;

            b {
              font-weight: 600;
            }
          `}
        />
      )}
      <PlanUpdaterContainer>
        <PlanUpdaterColumn css="grid-area: current;">
          <PlanTitle>
            {intl.formatMessage({ id: 'common.subscriptionPlanDialog.subscriptionUpdater.current.title' })}
          </PlanTitle>
          {isFuturePlanScheduled ? (
            <ScheduledPlanBox>
              {renderCurrentPlan}
              <ArrowRight />
            </ScheduledPlanBox>
          ) : (
            renderCurrentPlan
          )}
        </PlanUpdaterColumn>
        <PlanUpdaterColumn showVerticalDivider={!isFuturePlanScheduled} css="grid-area: future;">
          <PlanTitle>
            {intl.formatMessage({ id: 'common.subscriptionPlanDialog.subscriptionUpdater.future.title' })}
          </PlanTitle>

          {isFuturePlanScheduled ? (
            <>
              <ScheduledActionButton {...futurePlanContent.button.props}>
                {futurePlanContent.button.text}
              </ScheduledActionButton>
              <ScheduledPlanBox>{renderFuturePlanScheduled}</ScheduledPlanBox>
            </>
          ) : (
            renderFuturePlanDropdown
          )}
        </PlanUpdaterColumn>
      </PlanUpdaterContainer>
    </SubscriptionPlanUpdaterWrapper>
  );
});

export default SubscriptionPlanUpdater;
