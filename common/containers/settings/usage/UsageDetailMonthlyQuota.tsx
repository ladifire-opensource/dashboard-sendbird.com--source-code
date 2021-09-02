import { FC, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Headings, Body } from 'feather';
import numbro from 'numbro';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { getMultipleUsageDetailName } from '@common/hooks';
import { GigabyteUsageFeatures } from '@constants';
import { useShowDialog } from '@hooks/useShowDialog';
import { OverageTooltip } from '@ui/components/usage/OverageTooltip';
import UsageHelper, { UsageHelperContent } from '@ui/components/usage/UsageHelper';
import { getUsageUnitAndSuffixIntlData } from '@ui/components/usage/utils';
import { transformBytesToGigaByte } from '@utils';

const MultipleFeatureDescription = styled.div`
  display: initial;
  ${Body['body-short-01']};
`;

const MultipleFeatureUsageName = styled.div`
  display: block;
  ${Headings['heading-01']};

  ${MultipleFeatureDescription} + & {
    margin-top: 16px;
  }
`;

type QuotaData = {
  usageField: FeatureUsageField;
  quota: number;
  limit: number;
};

type Props = {
  quotas: QuotaData[];
};

const formatNumber = (value: number) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

const UsageDetailMonthlyQuota: FC<Props> = ({ quotas }) => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleSeeOverageGuideClick = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Overage,
    });
  }, [showDialog]);

  const contents: UsageHelperContent[] = useMemo(() => {
    return quotas.map(({ usageField, quota, limit }, index) => {
      const isUnitGigabyte = GigabyteUsageFeatures.includes(usageField);
      const isMultipleUsageFeature = quotas.length > 1;

      const convertedQuota = isUnitGigabyte ? transformBytesToGigaByte(quota) : quota;
      const formattedQuota = formatNumber(convertedQuota);

      const convertedLimit = isUnitGigabyte ? transformBytesToGigaByte(limit) : limit;
      const formattedLimit = formatNumber(convertedLimit);

      const { unit: unitValueIntlKey } = getUsageUnitAndSuffixIntlData({ usageField });

      const quotaWithUnit = unitValueIntlKey
        ? intl.formatMessage(
            { id: unitValueIntlKey },
            { strong: () => <>{formattedQuota}</>, value: parseInt(convertedQuota.toString()) },
          )
        : null;
      const limitWithUnit = unitValueIntlKey
        ? intl.formatMessage(
            { id: unitValueIntlKey },
            { strong: () => <>{formattedLimit}</>, value: parseInt(convertedLimit.toString()) },
          )
        : null;

      const quotaAndLimitLabel = intl.formatMessage(
        { id: 'common.settings.usage.usageDetail.monthlyQuota.quotaAndLimit' },
        {
          quota: quotaWithUnit,
          limit: limitWithUnit,
        },
      );

      const description = isMultipleUsageFeature ? (
        <>
          <MultipleFeatureUsageName>{getMultipleUsageDetailName({ intl, usageField })}</MultipleFeatureUsageName>
          <MultipleFeatureDescription>{quotaAndLimitLabel}</MultipleFeatureDescription>
        </>
      ) : (
        quotaAndLimitLabel
      );

      const actions =
        quotas.length - 1 === index
          ? [
              {
                type: 'button' as const,
                label: intl.formatMessage({ id: 'common.settings.usage.usageDetail.monthlyQuota.button.overage' }),
                onClick: handleSeeOverageGuideClick,
              },
            ]
          : undefined;

      const overageTooltip = (
        <OverageTooltip
          placement="bottom-start"
          css={css`
            display: inline-block;
            > div {
              display: inline-block;
              min-height: auto;
              min-width: auto;
              line-height: 1;
              vertical-align: middle;

              svg {
                fill: ${cssVariables('content-2')};
              }
            }
          `}
        />
      );

      /**
       * The UI between multiple and single usage are different.
       *
       * Multiple usages: use description for label of quota and limit
       * Single usage: use subtitle for label of quota and limit
       */
      return {
        description,
        descriptionSuffix: overageTooltip,
        actions,
      };
    });
  }, [handleSeeOverageGuideClick, intl, quotas]);

  return (
    <UsageHelper
      title={intl.formatMessage({ id: 'common.settings.usage.usageDetail.monthlyQuota.title' })}
      contents={contents}
      isMultipleContents={contents.length > 1}
    />
  );
};

export default UsageDetailMonthlyQuota;
