import { FC, VFC, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { ContextualHelp, Link, Typography, cssVariables, CSSVariableKey } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { SubscriptionName } from '@constants';
import { useShowDialog } from '@hooks';
import { Usage } from '@ui/components';
import { getUsageTooltipText } from '@ui/components/usage/getUsageTooltipText';
import { Availability } from '@ui/components/usage/types';
import { getAvailability, getUsageUnitAndSuffixIntlData, getAvailabilityColor } from '@ui/components/usage/utils';
import { getTransformedUsage, isByteUsageFeature, transformBytesToGigaByte } from '@utils';

type UsageColumnProps = {
  record: {
    feature: ChatFeature;
    usageData: UsageData[];
    isEnabled: boolean;
  };
  subscription?: Subscription | null;
  skipUpgradeCheck?: boolean;
  showPercent?: boolean;
  showAlert?: boolean;
};

const UsageWrapper = styled.div`
  margin-top: 2px;
  margin-bottom: -6px;
  padding-right: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const UsageValue = styled.strong<{ $color?: CSSVariableKey }>`
  ${Typography['label-02']};
  color: ${({ $color }) => cssVariables($color || 'content-1')};
`;
const UsageValueWithUnit = styled.small<{ $color?: CSSVariableKey }>`
  ${Typography['label-02']};
  color: ${({ $color }) => cssVariables($color || 'content-2')};
`;

const UsageLabel: FC<{
  usageField: FeatureUsageField;
  usageValue: number;
  unitType: 'gigabyte' | '';
  availability: Availability;
}> = ({ usageField, usageValue, unitType, availability }) => {
  const intl = useIntl();

  const convertedUsedValue = unitType === 'gigabyte' ? transformBytesToGigaByte(usageValue) : usageValue;
  const formatLabel = getTransformedUsage(convertedUsedValue);

  const { content: contentColor } = getAvailabilityColor(availability);
  const color = availability === Availability.available ? undefined : contentColor;

  const { unit: unitIntlKey } = getUsageUnitAndSuffixIntlData({
    usageField,
  });
  const valueWithUnit = unitIntlKey
    ? intl.formatMessage(
        { id: unitIntlKey },
        {
          strong: () => <UsageValue $color={color}>{formatLabel}</UsageValue>,
          value: parseInt(convertedUsedValue.toString()),
        },
      )
    : null;

  return <UsageValueWithUnit $color={color}>{valueWithUnit}</UsageValueWithUnit>;
};

export const UsageColumnUsage: VFC<UsageColumnProps> = ({
  record: { feature, usageData, isEnabled },
  subscription,
  skipUpgradeCheck = false,
  showPercent = true,
  showAlert = true,
}) => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleOverageLinkClick = useCallback(() => {
    showDialog({ dialogTypes: DialogType.Overage });
  }, [showDialog]);

  if (!isEnabled && !skipUpgradeCheck) {
    return subscription?.subscription_type === 'SALES_CUSTOM' ? (
      <ContextualHelp
        content={intl.formatMessage({
          id: 'common.settings.usage.usageTable.upgradePlan.tooltip',
        })}
        tooltipContentStyle={css`
          width: 256px;
        `}
        placement="top-start"
        popperProps={{
          modifiers: {
            offset: {
              offset: '-8, 10',
            },
          },
        }}
      >
        <Link disabled={true}>{intl.formatMessage({ id: 'common.settings.usage.usageTable.upgradePlan.button' })}</Link>
      </ContextualHelp>
    ) : (
      <Link href="/settings/general" useReactRouter={true} css="margin-left: 80px;">
        {intl.formatMessage({ id: 'common.settings.usage.usageTable.upgradePlan.button' })}
      </Link>
    );
  }

  if (!feature.trackable) {
    return null;
  }

  return (
    <UsageWrapper>
      {usageData.map(({ usage, others, quota, limit, usageField }) => {
        const unitType = isByteUsageFeature(usageField) ? 'gigabyte' : '';
        const totalUsage = usage + (others ?? 0);
        const availability = getAvailability(totalUsage, quota, limit);
        return (
          <Usage
            key={`usageItem_${usageField}`}
            unitType={unitType}
            variant="mini"
            name={
              usageData.length > 1
                ? intl.formatMessage({ id: `common.features.usage.${feature.key}.${usageField}.title` })
                : ''
            }
            label={
              <UsageLabel usageField={usageField} usageValue={usage} unitType={unitType} availability={availability} />
            }
            usage={usage}
            others={others}
            usageField={usageField}
            quota={quota}
            limit={limit}
            showPercent={showPercent}
            showAlert={showAlert}
            showBarChartRange={true}
            availabilityTooltips={getUsageTooltipText({
              intl,
              isFreeTrial: subscription?.subscription_name === SubscriptionName.FreeTrial,
              limit,
              unit: unitType,
              onLinkClick: handleOverageLinkClick,
            })}
          />
        );
      })}
    </UsageWrapper>
  );
};
