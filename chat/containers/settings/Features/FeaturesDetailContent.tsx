import { FC, ReactNode, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { MultipleUsageFeatures } from '@constants';
import { useShowDialog } from '@hooks';
import { Usage } from '@ui/components';
import { UsageDetailCard } from '@ui/components/usage/UsageDetailCard';
import { getUsageTooltipText } from '@ui/components/usage/getUsageTooltipText';
import { isByteUsageFeature } from '@utils';

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

const UsageSection = styled.section`
  padding: 0 24px;

  & + & {
    margin-top: 24px;
  }
`;

type Props = {
  feature: ChatFeature;
  usageField: FeatureUsageField;
  isFeatureEnabled: boolean;
  isFreeTrial: boolean;
  isLoading: boolean;
  usage: number;
  others?: number;
  quota: number;
  limit: number;
  placeholder?: string;
  quotaNotification?: ReactNode;
};

export const FeaturesDetailContent: FC<Props> = ({
  feature,
  usageField,
  isFeatureEnabled,
  isFreeTrial,
  isLoading,
  usage,
  others,
  quota,
  limit,
  quotaNotification,
  placeholder,
}) => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const handleOverageLinkClick = useCallback(() => {
    showDialog({ dialogTypes: DialogType.Overage });
  }, [showDialog]);

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
    return undefined;
  };

  const unitType = isByteUsageFeature(usageField) ? 'gigabyte' : '';

  return (
    <UsageDetailCard
      title={getUsageTitle()}
      description={getUsageDescription()}
      placeholder={placeholder}
      quotaNotification={quotaNotification}
      isLoading={isFeatureEnabled && isLoading}
      disabled={!placeholder && !isFeatureEnabled}
    >
      {feature?.trackable ? (
        <UsageSection>
          <Usage
            usageField={usageField}
            variant="medium"
            unitType={unitType}
            label=""
            usage={usage}
            others={others}
            quota={quota}
            limit={limit}
            showLegends={true}
            showAlert={true}
            showBarChartRange={true}
            legendLabels={{
              usage: intl.formatMessage({ id: 'chat.settings.features.detail.usage.currentApplication' }),
              others: intl.formatMessage({ id: 'chat.settings.features.detail.usage.otherApplications' }),
              remains: intl.formatMessage({ id: 'chat.settings.features.detail.usage.remaining' }),
            }}
            tooltipLabels={{
              usage: intl.formatMessage({ id: 'chat.settings.features.detail.usage.currentApplication' }),
              others: intl.formatMessage({ id: 'chat.settings.features.detail.usage.otherApplications' }),
              remains: intl.formatMessage({ id: 'chat.settings.features.detail.usage.remaining' }),
            }}
            availabilityTooltips={getUsageTooltipText({
              intl,
              limit,
              isFreeTrial,
              onLinkClick: handleOverageLinkClick,
              unit: unitType,
            })}
          />
        </UsageSection>
      ) : (
        <UsageSection>
          <UsageUnavailable>
            {intl.formatMessage({ id: 'chat.settings.features.detail.usage.unavailable' })}
          </UsageUnavailable>
        </UsageSection>
      )}
    </UsageDetailCard>
  );
};
