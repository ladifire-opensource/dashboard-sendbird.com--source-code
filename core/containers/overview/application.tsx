import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { Avatar, AvatarType, Body, Button, cssVariables, IconButton, IconProps, Link, Lozenge, toast } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMPTY_TEXT, REGION_STATUS_PAGES, SubscriptionProduct } from '@constants';
import { useAuthorization, useIsCallsEnabled, useOrganization } from '@hooks';
import { useCurrentSubscription } from '@hooks/useCurrentSubscription';
import { useEnabledFeatures } from '@hooks/useEnabledFeatures';
import { ChevronLink } from '@ui/components';
import { getPremiumFeatures } from '@utils';

const StyledApplication = styled.section`
  border-radius: 4px;
  padding-bottom: 24px;
  border: 1px solid ${cssVariables('neutral-3')};
`;

const ApplicationHeader = styled.div`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  display: grid;
  grid-template-columns: 32px 1fr 144px;
  grid-gap: 12px;
  align-items: start;
  padding: 24px;
`;

const AppIcon = styled(Avatar)``;

const ApplicationName = styled.h1`
  padding-top: 2px;
  padding-right: 20px;
  font-size: 18px;
  line-height: 28px;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  margin: 0; /* FIXME: remove all predefined markup styles from GlobalStyles */
`;

const UpgradeButton = styled(Button)``;

const GoToSettingsWrapper = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  align-self: center;
  justify-self: flex-end;
  &:hover {
    font-weight: 600;
  }
`;

const ApplicationDetail = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
  padding: 24px 24px 0;

  ${GoToSettingsWrapper} {
    position: absolute;
    top: 24px;
    right: 24px;
  }
`;

const StyledApplicationDetailItem = styled.div`
  display: flex;
  flex-direction: column;

  ul + * {
    margin-top: 16px;
  }

  a {
    font-size: 14px;
    font-weight: 600;
  }
`;

const ADIItems = styled.ul`
  li {
    list-style: none;
    display: flex;
    align-items: center;
    margin-top: 4px;
    height: 20px;
    &:first-child {
      margin-top: 0;
    }
    .adi__item__label {
      ${Body['body-short-01']};
      width: 111px;
      color: ${cssVariables('neutral-7')};
    }
    .adi__item__text {
      display: flex;
      align-items: center;
      margin-right: 4px;
      margin-left: 16px;
      ${Body['body-short-01']};
      color: ${cssVariables('neutral-10')};

      ${Lozenge} {
        margin-left: 8px;
      }

      a:hover {
        font-weight: 600;
      }
    }
  }
`;

const ADITitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin: 0 0 12px 0;
`;

const RegionName = styled.div`
  position: relative;
  margin-right: 10px;
  &:after {
    position: absolute;
    content: '';
    top: 10px;
    right: -6px;
    width: 2px;
    height: 2px;
    border-radius: 1px;
    background: ${cssVariables('neutral-6')};
  }
`;

const NotificationsWrapper = styled.div`
  margin: 16px 24px 0;
`;

type DetailItem = {
  label: string;
  text?: string;
  component?: React.ReactNode;
  action?: {
    id?: string;
    icon: IconProps['icon'];
    onClick?: (item: DetailItem) => void;
    label?: string;
  };
};

type DetailItemProps = {
  title: string;
  items: DetailItem[];
  footer?: ReactNode;
};

const ApplicationDetailItem: FC<DetailItemProps> = ({ title, items, footer }) => {
  const renderItem = useCallback((item: DetailItem) => {
    const handleActionClick = () => {
      if (item.action && item.action.onClick) {
        item.action.onClick(item);
      }
    };
    return (
      <li className="adi__item" key={item.label}>
        <div className="adi__item__label">{item.label}</div>
        <div className="adi__item__text">{item.component || item.text}</div>
        {item.action && (
          <div className="adi__item__action" id={item.action.id}>
            <IconButton
              buttonType="tertiary"
              size="xsmall"
              icon={item.action.icon}
              onClick={handleActionClick}
              title={item.action.label}
            />
          </div>
        )}
      </li>
    );
  }, []);
  return (
    <StyledApplicationDetailItem>
      <ADITitle>{title}</ADITitle>
      <ADIItems style={items.length === 1 ? { flex: 1 } : {}}>{items.map((item) => renderItem(item))}</ADIItems>
      {footer}
    </StyledApplicationDetailItem>
  );
};

type Props = {
  notifications?: React.ReactNode[];
};

const SettingsLink = () => {
  const intl = useIntl();

  return (
    <GoToSettingsWrapper href="settings" useReactRouter={true}>
      {intl.formatMessage({ id: 'core.overview.application.info.link.viewMore' })}
    </GoToSettingsWrapper>
  );
};

export const Application: FC<Props> = ({ notifications }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const { isSelfService } = useAuthorization();

  const application = useSelector((state: RootState) => state.applicationState.data);
  const organization = useOrganization();
  const isCallsEnabled = useIsCallsEnabled();

  const { enabledFeatures } = useEnabledFeatures(application?.app_id);
  const { currentSubscription } = useCurrentSubscription(SubscriptionProduct.Chat);

  const featureCounts = useMemo(() => {
    if (!enabledFeatures || !currentSubscription) return;
    const premiumFeatures = Object.entries(enabledFeatures).filter(([key]) => key !== 'webhook');

    return {
      active: premiumFeatures.filter(([, value]) => !!value).length,
      total: premiumFeatures.length,
    };
  }, [currentSubscription, enabledFeatures]);

  if (!application) {
    return null;
  }

  const { app_name, app_id, plan, region, created_at, current_premium_features } = application;
  const {
    usage: { active, total },
  } = getPremiumFeatures(current_premium_features);

  const showSubscriptionPlanDialog = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.SubscriptionPlan,
      }),
    );
  };

  const handleTalkToAnExpertClick = () => {
    window.open('https://sendbird.com/contact-sales');
  };

  const handleAppIdCopyClick = (item) => {
    copy(item.text as string);
    toast.info({
      message: intl.formatMessage({ id: 'core.overview.application.info.appId.toast.message' }),
      actions: [
        {
          label: intl.formatMessage({ id: 'core.overview.application.info.appId.toast.action' }),
          onClick: () => {
            window.open('https://sendbird.com/docs');
          },
        },
      ],
    });
  };

  return (
    <StyledApplication data-test-id="ApplicationSection">
      <ApplicationHeader>
        <AppIcon size="medium" type={AvatarType.Application} profileID={app_id} />
        <ApplicationName data-test-id="ApplicationName">{app_name}</ApplicationName>
        {isSelfService ? (
          <SettingsLink />
        ) : (
          <UpgradeButton buttonType="secondary" size="small" onClick={handleTalkToAnExpertClick}>
            {intl.formatMessage({ id: 'core.overview.application_button.upgradePlan' })}
          </UpgradeButton>
        )}
      </ApplicationHeader>
      <ApplicationDetail>
        {!isSelfService && <SettingsLink />}
        <ApplicationDetailItem
          title={intl.formatMessage({ id: 'core.overview.application.info.title' })}
          items={[
            {
              label: intl.formatMessage({ id: 'core.overview.application.info.label.createdAt' }),
              text: moment(created_at).format('ll'),
            },
            {
              label: intl.formatMessage({ id: 'core.overview.application.info.label.appId' }),
              text: app_id,
              action: {
                id: 'tourTargetAppId',
                icon: 'copy',
                onClick: handleAppIdCopyClick,
                label: intl.formatMessage({ id: 'ui.button.copy' }),
              },
            },
            {
              label: intl.formatMessage({ id: 'core.overview.application.info.label.region' }),
              component: (
                <>
                  <RegionName>
                    {Object.prototype.hasOwnProperty.call(organization.regions, region)
                      ? organization.regions[region].name
                      : region}
                  </RegionName>
                  <Link
                    href={
                      Object.keys(REGION_STATUS_PAGES).includes(region)
                        ? REGION_STATUS_PAGES[region]
                        : 'https://status.sendbird.com'
                    }
                    target="_blank"
                    iconProps={{
                      size: 16,
                      icon: 'open-in-new',
                    }}
                  >
                    {intl.formatMessage({ id: 'core.overview.application.info.viewStatus' })}
                  </Link>
                </>
              ),
            },
          ]}
        />
        {isSelfService ? (
          <ApplicationDetailItem
            title={intl.formatMessage({ id: 'core.overview.application.info.products.title' })}
            items={
              [
                {
                  label: intl.formatMessage({ id: 'core.overview.application.info.products.chat.label' }),
                  component: featureCounts ? (
                    <ChevronLink href="settings/features">
                      {intl.formatMessage({ id: 'core.overview.application.info.products.chat.text' }, featureCounts)}
                    </ChevronLink>
                  ) : (
                    EMPTY_TEXT
                  ),
                },
                isCallsEnabled && {
                  label: intl.formatMessage({ id: 'core.overview.application.info.products.calls.label' }),
                  component: intl.formatMessage({ id: 'core.overview.application.info.products.calls.text.activated' }),
                },
              ].filter(Boolean) as DetailItem[]
            }
          />
        ) : (
          <ApplicationDetailItem
            title={intl.formatMessage({ id: 'core.overview.application.subscriptionPlan.title' })}
            items={[
              {
                label: intl.formatMessage({ id: 'core.overview.application.subscriptionPlan.label.plan' }),
                text: plan === 'enterprise' ? 'Custom' : 'Free',
              },
              {
                label: intl.formatMessage({ id: 'core.overview.application.subscriptionPlan.label.features' }),
                component: (
                  <ChevronLink onClick={showSubscriptionPlanDialog} data-test-id="PremiumFeatureCount">
                    {intl.formatMessage(
                      { id: 'core.overview.application.subscriptionPlan.text.features' },
                      { active, total },
                    )}
                  </ChevronLink>
                ),
              },
            ]}
          />
        )}
      </ApplicationDetail>
      {notifications && notifications.length > 0 && <NotificationsWrapper>{notifications}</NotificationsWrapper>}
    </StyledApplication>
  );
};
