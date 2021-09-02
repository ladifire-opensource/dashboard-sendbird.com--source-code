import { useContext } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import { Subtitles } from 'feather';

import { useFeatureName } from '@common/hooks';
import { ChatFeatureList, ChatFeatureName } from '@constants';
import { useOrganizationMonthlyFeatureUsage } from '@hooks/useOrganizationMonthlyFeatureUsage';
import { LastUpdatedAt } from '@ui/components';
import { UsageDetailCardGroup } from '@ui/components/usage/UsageDetailCard';
import { generateUsageData } from '@utils';

import { OrgSettingPageHeader } from '../OrgSettingPageHeader';
import { FeatureDocument } from './FeatureDocument';
import { UsageContext } from './UsageContext';
import UsageDetailCalculation from './UsageDetailCalculation';
import { UsageDetailContent } from './UsageDetailContent';
import UsageDetailMonthlyQuota from './UsageDetailMonthlyQuota';

const UsageDetailWrapper = styled.div`
  padding-bottom: 64px;
  .usageDetailNotification {
    margin-bottom: 16px;
  }
`;

const UsageMultipleTitle = styled.div`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-02']};
  margin-bottom: 12px;
`;

const UsageHelpers = styled.div`
  display: flex;

  > div + div {
    margin-left: 32px;
  }
`;

const HISTORY_BACK_PATH = '/settings/usage';

export const UsageDetail = () => {
  const intl = useIntl();
  const match = useRouteMatch<{ featureKey: ChatFeatureName }>();
  const location = useLocation();

  const getFeatureName = useFeatureName();
  /**
   * { date: string } query string will be assigned for the `location.search`
   * i.e.) ?date=2021-08
   */
  const backHref = `${HISTORY_BACK_PATH}${location.search || ''}`;

  const { featureKey } = match?.params as { featureKey: ChatFeatureName };

  const { date, subscription } = useContext(UsageContext);
  const feature = ChatFeatureList.find((feature) => feature.key === featureKey);

  const { monthlyUsage, updatedDt } = useOrganizationMonthlyFeatureUsage(feature, date);

  if (!feature || !subscription) {
    return null;
  }
  const subscriptionName = subscription.subscription_name;

  const isFreeTrial = subscriptionName === 'free_trial';
  const monthlyUsageData: UsageData[] = feature.trackable
    ? feature.plans.map(({ planKey, usageField }) => {
        const monthlyUsageValue = usageField ? monthlyUsage?.[usageField] : 0;
        const plan = subscription.plan[planKey] ?? null;
        return generateUsageData({
          feature,
          plan,
          usage: monthlyUsageValue,
          usageField,
        });
      })
    : [];

  const isMultiple = monthlyUsageData.length > 1;
  const featureName = getFeatureName({ featureKey });

  const trackableQuotaDataList = feature.trackable
    ? feature.plans.map(({ planKey, usageField }) => {
        const monthlyUsageValue = usageField ? monthlyUsage?.[usageField] : 0;
        const plan = subscription.plan[planKey] ?? null;
        const { quota, limit } = generateUsageData({
          feature,
          plan,
          usage: monthlyUsageValue,
          usageField,
        });
        return {
          usageField,
          quota,
          limit,
        };
      })
    : null;

  return (
    <UsageDetailWrapper>
      <OrgSettingPageHeader>
        <OrgSettingPageHeader.BackButton href={backHref} />
        <OrgSettingPageHeader.Title>{featureName}</OrgSettingPageHeader.Title>
        <OrgSettingPageHeader.Description>
          {intl.formatMessage({ id: `common.features.description.${featureKey}` })}
        </OrgSettingPageHeader.Description>
      </OrgSettingPageHeader>
      {trackableQuotaDataList && (
        <UsageHelpers>
          <UsageDetailMonthlyQuota quotas={trackableQuotaDataList} />
          <UsageDetailCalculation
            calculations={trackableQuotaDataList.map(({ usageField }) => ({ featureKey, usageField }))}
            openUsageGuideFrom="organization"
          />
        </UsageHelpers>
      )}
      <UsageDetailCardGroup
        css={`
          margin-top: 24px;
          margin-bottom: 24px;
        `}
        $isMultiple={isMultiple}
      >
        <UsageMultipleTitle>
          {intl.formatMessage({ id: 'common.settings.usage.usageDetail.title' })}
          {updatedDt && (
            <LastUpdatedAt
              timestamp={updatedDt}
              css={`
                margin-left: auto;
              `}
            />
          )}
        </UsageMultipleTitle>
        {feature.plans.map(({ planKey, usageField }) => {
          const monthlyUsageValue = usageField ? monthlyUsage?.[usageField] : 0;
          const plan = subscription.plan[planKey] ?? null;
          const { usage, quota, limit } = generateUsageData({
            feature,
            plan,
            usage: monthlyUsageValue,
            usageField,
          });
          return (
            <UsageDetailContent
              key={`usage-detail-content-${usageField}`}
              feature={feature}
              monthlyUsage={usage}
              updatedDt={updatedDt}
              isFreeTrial={isFreeTrial}
              date={date}
              quota={quota}
              limit={limit}
              usageField={usageField}
              isMultiple={isMultiple}
            />
          );
        })}
        <FeatureDocument feature={featureKey} />
      </UsageDetailCardGroup>
    </UsageDetailWrapper>
  );
};
