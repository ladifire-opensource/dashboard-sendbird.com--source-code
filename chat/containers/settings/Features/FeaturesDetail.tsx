import { useContext } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Toggle, ContextualHelp, Link, LinkVariant, Subtitles, InlineNotification } from 'feather';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { FeatureDocument } from '@common/containers/settings/usage/FeatureDocument';
import UsageDetailCalculation from '@common/containers/settings/usage/UsageDetailCalculation';
import UsageDetailMonthlyQuota from '@common/containers/settings/usage/UsageDetailMonthlyQuota';
import { useFeatureName } from '@common/hooks';
import { ChatFeatureList, FeatureType, ChatFeatureName } from '@constants';
import { useApplicationMonthlyUsageWithOrgUsages } from '@hooks/useApplicationMonthlyUsageWithOrgUsage';
import { useIsMessageSearchAvailable } from '@hooks/useIsMessageSearchAvailable';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LastUpdatedAt, LinkWithPermissionCheck } from '@ui/components';
import { QuotaNotification } from '@ui/components/usage/QuotaNotification';
import { generateUsageData, isByteUsageFeature } from '@utils';

import { AutoTranslation } from './AutoTranslation';
import { FeaturesContext } from './FeaturesContext';
import { FeaturesDetailContent } from './FeaturesDetailContent';

const TitleAttachment = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  > div {
    display: flex;
  }
`;

const UsageHelpers = styled.div`
  display: flex;
  margin-bottom: 16px;

  > div + div {
    margin-left: 32px;
  }
`;

const UsageTitle = styled.div`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-02']};
  margin-bottom: 12px;
`;

const FeatureDetailInlineNotification = styled(InlineNotification)`
  margin-bottom: 8px;
`;

export const FeaturesDetail = () => {
  const intl = useIntl();
  const match = useRouteMatch<{ featureKey: ChatFeature['key'] }>();

  const getFeatureName = useFeatureName();
  const { enabledFeatures, toggleFeature, currentSubscription, messageSearchPipeline } = useContext(FeaturesContext);
  const { featureKey } = match?.params as { featureKey: ChatFeature['key'] };
  const feature = ChatFeatureList.find((feature) => feature.key === featureKey);
  const { updatedDt, usageWithOrgUsages } = useApplicationMonthlyUsageWithOrgUsages({
    feature,
  });
  const isMessageSearchAvailable = useIsMessageSearchAvailable();

  if (!feature || !currentSubscription) {
    return null;
  }

  const isFeatureEnabled = enabledFeatures
    ? enabledFeatures[feature.key] ||
      feature.type === FeatureType.Core ||
      (feature.key === ChatFeatureName.MessageSearch &&
        messageSearchPipeline.subscribed &&
        messageSearchPipeline.isLive)
    : false;
  const subscriptionName = currentSubscription.subscription_name;
  const isFreeTrial = subscriptionName === 'free_trial';
  const usageData = feature.plans.map(({ planKey, usageField }) => {
    const monthlyUsageValue = usageWithOrgUsages?.[usageField].usage ?? 0;
    const monthlyOthersValue = usageWithOrgUsages?.[usageField]?.others_usage ?? 0;
    const plan = (currentSubscription.plan[planKey] as BillingPlanItem) ?? null;
    return {
      ...generateUsageData({
        feature,
        plan,
        usage: monthlyUsageValue,
        others: monthlyOthersValue,
        skipAverageCheck: true,
        usageField,
      }),
      orgUsage: monthlyUsageValue + (monthlyOthersValue || 0),
    };
  });

  const trackableQuotaDataList = feature.trackable
    ? feature.plans.map(({ planKey, usageField }) => {
        const monthlyUsageValue = usageField ? usageWithOrgUsages?.[usageField] : 0;
        const currentPlan = currentSubscription.plan[planKey] ?? null;
        const { quota, limit } = generateUsageData({
          feature,
          plan: currentPlan,
          usage: monthlyUsageValue,
          usageField,
        });
        return {
          featureKey,
          usageField,
          quota,
          limit,
        };
      })
    : null;

  const renderToggle = () => {
    const defaultToggle = (
      <Toggle
        checked={isFeatureEnabled}
        disabled={feature.type === FeatureType.Core}
        onClick={toggleFeature(feature)}
      />
    );

    if (feature.type === FeatureType.Core) {
      return (
        <ContextualHelp content={intl.formatMessage({ id: 'chat.settings.features.column.features.tooltip.core' })}>
          <Toggle checked={isFeatureEnabled} disabled={true} />
        </ContextualHelp>
      );
    }

    if (feature.key !== ChatFeatureName.MessageSearch) {
      return defaultToggle;
    }

    if (!isMessageSearchAvailable) {
      return (
        <ContextualHelp
          content={intl.formatMessage(
            { id: 'chat.settings.features.messageSearch.tooltip.unavailable' },
            {
              a: (text) => {
                return (
                  <LinkWithPermissionCheck
                    href="/settings/contact_us?category=technical_issue"
                    useReactRouter={true}
                    variant={LinkVariant.Inline}
                    permissions={CONTACT_US_ALLOWED_PERMISSIONS}
                    alertType="dialog"
                  >
                    {text}
                  </LinkWithPermissionCheck>
                );
              },
            },
          )}
          tooltipContentStyle={css`
            font-weight: 400;
            width: 256px;
          `}
        >
          <Toggle checked={isFeatureEnabled} disabled={true} />
        </ContextualHelp>
      );
    }

    if (!isFeatureEnabled && messageSearchPipeline.waitingForMigrationStopped) {
      return (
        <ContextualHelp
          content={intl.formatMessage({ id: 'chat.settings.features.messageSearch.tooltip.discarding' })}
          tooltipContentStyle={css`
            font-weight: 400;
            width: 256px;
          `}
        >
          <Toggle checked={isFeatureEnabled} disabled={true} />
        </ContextualHelp>
      );
    }

    if (isFeatureEnabled && messageSearchPipeline.doingHistoryMigration) {
      return (
        <ContextualHelp
          content={intl.formatMessage({ id: 'chat.settings.features.messageSearch.tooltip.gathering' })}
          tooltipContentStyle={css`
            font-weight: 400;
            width: 256px;
          `}
        >
          <Toggle checked={isFeatureEnabled} disabled={true} />
        </ContextualHelp>
      );
    }

    return defaultToggle;
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader
        css={`
          * + ${AppSettingPageHeader.Description} {
            margin-top: 24px;
          }
        `}
      >
        <AppSettingPageHeader.BackButton href="../features" />
        <AppSettingPageHeader.Title>
          {feature ? getFeatureName({ featureKey }) : ''}
          {enabledFeatures && <TitleAttachment>{renderToggle()}</TitleAttachment>}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Description>
          {intl.formatMessage({ id: `common.features.description.${featureKey}` })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      {trackableQuotaDataList && (
        <UsageHelpers>
          <UsageDetailMonthlyQuota quotas={trackableQuotaDataList} />
          <UsageDetailCalculation
            calculations={trackableQuotaDataList.map(({ usageField }) => ({ featureKey, usageField }))}
            openUsageGuideFrom="application"
          />
        </UsageHelpers>
      )}
      {featureKey === ChatFeatureName.TranslationTools && <AutoTranslation isDisabled={!isFeatureEnabled} />}
      <UsageTitle>
        {intl.formatMessage({ id: 'common.settings.usage.usageDetail.title' })}
        {updatedDt && (
          <LastUpdatedAt
            timestamp={updatedDt}
            css={`
              margin-left: auto;
            `}
          />
        )}
      </UsageTitle>
      {featureKey === ChatFeatureName.MessageSearch && messageSearchPipeline.doingHistoryMigration && (
        <FeatureDetailInlineNotification
          type="info"
          message={intl.formatMessage({ id: 'chat.settings.features.messageSearch.inlineNotification.gathering' })}
        />
      )}
      {featureKey === ChatFeatureName.MessageSearch && messageSearchPipeline.waitingForMigrationStopped && (
        <FeatureDetailInlineNotification
          type="info"
          message={intl.formatMessage({ id: 'chat.settings.features.messageSearch.inlineNotification.discarding' })}
        />
      )}
      {featureKey === ChatFeatureName.MessageSearch && messageSearchPipeline.migrationErrored && (
        <FeatureDetailInlineNotification
          type="error"
          message={intl.formatMessage(
            { id: 'chat.settings.features.messageSearch.inlineNotification.errored' },
            {
              a: (text) => (
                <Link
                  href="/settings/contact_us?category=technical_issue"
                  variant={LinkVariant.Inline}
                  useReactRouter={true}
                >
                  {text}
                </Link>
              ),
            },
          )}
        />
      )}
      {usageData.map(({ usage, others, quota, limit, usageField, orgUsage }) => {
        return (
          <FeaturesDetailContent
            key={`featureDetailContent_${usageField}`}
            feature={feature}
            usageField={usageField}
            isFeatureEnabled={isFeatureEnabled}
            isFreeTrial={isFreeTrial}
            isLoading={
              featureKey === ChatFeatureName.MessageSearch &&
              (messageSearchPipeline.doingHistoryMigration || messageSearchPipeline.waitingForMigrationStopped)
            }
            usage={usage}
            others={others}
            quota={quota}
            limit={limit}
            placeholder={
              featureKey === ChatFeatureName.MessageSearch && messageSearchPipeline.isInitial
                ? intl.formatMessage({ id: 'chat.settings.features.messageSearch.placeholder.initial' })
                : ''
            }
            quotaNotification={
              feature.trackable && (
                <QuotaNotification
                  isFreeTrial={isFreeTrial}
                  usage={orgUsage}
                  quota={quota}
                  limit={limit}
                  unit={isByteUsageFeature(usageField) ? 'gigabyte' : ''}
                />
              )
            }
          />
        );
      })}
      <FeatureDocument feature={featureKey} />
    </AppSettingsContainer>
  );
};
