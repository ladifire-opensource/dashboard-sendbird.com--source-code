import { useMemo, FC, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, cssColors, Button, Subtitles } from 'feather';
import { Moment } from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { ChatFeatureName, MultipleUsageFeatures, OnlyUsageBarFeatures, LineChartOnlyFeatures } from '@constants';
import { useShowDialog } from '@hooks';
import { useOrganizationDailyFeatureUsage } from '@hooks/useOrganizationDailyFeatureUsage';
import { Usage } from '@ui/components';
import { MixedChart } from '@ui/components/chart';
import { QuotaNotification } from '@ui/components/usage/QuotaNotification';
import { UsageDetailCard } from '@ui/components/usage/UsageDetailCard';
import { getUsageTooltipText } from '@ui/components/usage/getUsageTooltipText';
import { generateUsageData, isByteUsageFeature, transformBytesToGigaByte } from '@utils';

import { UsageByApps } from './UsageByApps';

const UsageSection = styled.section<{ $useTopBorder?: boolean }>`
  padding: 0 24px;
  & + & {
    margin-top: 24px;
  }
  ${({ $useTopBorder }) => {
    if ($useTopBorder) {
      return css`
        border-top: 1px solid ${cssVariables('neutral-3')};
        padding-top: 24px;
      `;
    }
  }}
`;

const UsageByAppHeader = styled.div`
  ${Subtitles['subtitle-02']};
`;

const UsageDetailShowMore = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding: 8px 0;
`;

const UsageUnavailable = styled.div`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${cssVariables('neutral-7')};
  height: 122px;
  display: flex;
  justify-content: center;
  padding-top: 32px;
`;

const defaultDataSetsOption = {
  borderWidth: 2,
  borderCapStyle: 'round',
  pointBorderColor: '#fff',
  pointHoverBorderColor: '#fff',
  pointHitRadius: 3,
  lineTension: 0,
};

// const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

type Props = {
  monthlyUsage: ReturnType<typeof generateUsageData>['usage'];
  feature: ChatFeature;
  isFreeTrial: boolean;
  date: Moment;
  quota: number;
  limit: number;
  usageField: FeatureUsageField;
  updatedDt?: string | null;
  isMultiple?: boolean;
};

const useMixedChart = ({
  feature,
  usageField,
  date,
  quota,
}: Pick<Props, 'feature' | 'usageField' | 'date' | 'quota'>) => {
  const intl = useIntl();
  const {
    dailyUsage: { daily, accumulate, labels },
  } = useOrganizationDailyFeatureUsage(feature, usageField, date);

  const unitConvertedValues = useMemo(() => {
    if (isByteUsageFeature(usageField)) {
      return {
        quota: transformBytesToGigaByte(quota),
        daily: daily?.map(transformBytesToGigaByte),
        accumulate: accumulate?.map(transformBytesToGigaByte),
      };
    }
    return { quota, daily, accumulate };
  }, [accumulate, daily, quota, usageField]);

  const datasets = useMemo(() => {
    if (!feature) {
      return [];
    }
    const lineOption = {
      backgroundColor: 'transparent',
      borderColor: cssColors('purple-7'),
      pointBackgroundColor: cssColors('purple-7'),
      pointHoverBackgroundColor: cssColors('purple-8'),
    };
    const barOption = {
      categoryPercentage: 0.6,
      maxBarThickness: 6,
      backgroundColor: cssColors('blue-5'),
      backgroundHoverColor: cssColors('blue-6'),
    };
    if (LineChartOnlyFeatures.includes(feature.key)) {
      return [
        {
          type: 'line',
          label: 'Daily',
          data: unitConvertedValues.daily,
          ...lineOption,
          ...defaultDataSetsOption,
        },
      ];
    }
    return [
      {
        type: 'line',
        label: 'Total',
        data: unitConvertedValues.accumulate,
        ...lineOption,
        ...defaultDataSetsOption,
      },
      {
        type: 'bar',
        label: 'Daily',
        data: unitConvertedValues.daily,
        ...barOption,
      },
    ];
  }, [feature, unitConvertedValues.accumulate, unitConvertedValues.daily]);

  return (
    feature.trackable &&
    !OnlyUsageBarFeatures.includes(feature.key as ChatFeatureName) && (
      <UsageSection>
        <UsageByAppHeader css="margin-top: 56px;">
          {intl.formatMessage({ id: 'common.settings.usage.usageByApps.header.dailyActivity' })}
        </UsageByAppHeader>
        <MixedChart
          height="240px"
          labels={labels}
          datasets={datasets}
          annotation={{
            value: unitConvertedValues.quota,
            label: `${unitConvertedValues.quota} Quota`,
          }}
        />
      </UsageSection>
    )
  );
};

export const UsageDetailContent: FC<Props> = ({
  monthlyUsage,
  feature,
  isFreeTrial,
  date,
  quota,
  limit,
  usageField,
  isMultiple = false,
}) => {
  const intl = useIntl();
  const [showMore, setShowMore] = useState(false);
  const showDialog = useShowDialog();
  const mixedChartRendered = useMixedChart({ feature, usageField, date, quota });
  const unit = isByteUsageFeature(usageField) ? 'gigabyte' : '';

  const handleOverageLinkClick = () => {
    showDialog({ dialogTypes: DialogType.Overage });
  };

  const getUsageTitle = () => {
    if (MultipleUsageFeatures.includes(usageField)) {
      return intl.formatMessage({ id: `common.features.usage.${feature.key}.${usageField}.title` });
    }

    return undefined;
  };

  const getUsageDescription = () => {
    if (MultipleUsageFeatures.includes(usageField)) {
      return intl.formatMessage({ id: `common.features.usage.${feature.key}.${usageField}.description` });
    }
  };

  const getUsageLegend = () => {
    if (feature.key === ChatFeatureName.PeakConnection) {
      return intl.formatMessage({ id: 'common.settings.usage.usageDetail.legend.used.peak_connection' });
    }

    return intl.formatMessage({ id: 'common.settings.usage.usageDetail.legend.used' });
  };

  return (
    <UsageDetailCard
      title={getUsageTitle()}
      description={getUsageDescription()}
      quotaNotification={
        <QuotaNotification isFreeTrial={isFreeTrial} usage={monthlyUsage} quota={quota} limit={limit} unit={unit} />
      }
      isMultiple={isMultiple}
    >
      {feature.trackable ? (
        <UsageSection>
          <Usage
            usageField={usageField}
            variant="medium"
            unitType={unit}
            label=""
            usage={monthlyUsage}
            quota={quota}
            limit={limit}
            showLegends={true}
            showAlert={true}
            showBarChartRange={true}
            legendLabels={{
              usage: getUsageLegend(),
              remains: intl.formatMessage({ id: 'common.settings.usage.usageDetail.legend.remaining' }),
            }}
            tooltipLabels={{
              usage: getUsageLegend(),
              remains: intl.formatMessage({ id: 'common.settings.usage.usageDetail.legend.remaining' }),
            }}
            availabilityTooltips={getUsageTooltipText({
              intl,
              isFreeTrial,
              limit,
              unit,
              onLinkClick: handleOverageLinkClick,
            })}
            showUsedValueLegend={true}
          />
        </UsageSection>
      ) : (
        <UsageSection>
          <UsageUnavailable>
            {intl.formatMessage({ id: 'chat.settings.features.detail.usage.unavailable' })}
          </UsageUnavailable>
        </UsageSection>
      )}
      {(showMore || !isMultiple) && (
        <>
          {mixedChartRendered}
          {feature.trackable && (
            <UsageSection $useTopBorder={true}>
              <UsageByAppHeader css="margin-bottom: 24px;">
                {intl.formatMessage({ id: 'common.settings.usage.usageByApps.header.application' })}
              </UsageByAppHeader>
              <UsageByApps date={date} usageField={usageField} />
            </UsageSection>
          )}
        </>
      )}
      {isMultiple && (
        <UsageDetailShowMore>
          {' '}
          <Button
            variant="ghost"
            buttonType="primary"
            icon={showMore ? 'chevron-up' : 'chevron-down'}
            size="small"
            onClick={() => {
              setShowMore((showMore) => !showMore);
            }}
          >
            {showMore
              ? intl.formatMessage({ id: 'common.settings.usage.button.showLess' })
              : intl.formatMessage({ id: 'common.settings.usage.button.showMore' })}
          </Button>
        </UsageDetailShowMore>
      )}
    </UsageDetailCard>
  );
};
