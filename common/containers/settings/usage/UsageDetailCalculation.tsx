import { FC, MouseEventHandler, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Headings } from 'feather';

import { useFeatureUsageDetailName } from '@common/hooks/FeatureDescriptionHooks';
import { ChatFeatureName } from '@constants';
import UsageHelper, { UsageHelperContent } from '@ui/components/usage/UsageHelper';

import UsageCalculationDrawer, { USAGE_CALCULATION_DRAWER_ID } from './UsageCalculationDrawer';
import { useUsageCalculationDrawer } from './hooks/useUsageCalculationDrawer';

const MultipleDescription = styled.h3`
  ${Headings['heading-01']};
  font-weight: 400;

  b,
  strong {
    font-weight: 600;
  }
`;

type CalculationData = {
  featureKey: ChatFeatureName;
  usageField: FeatureUsageField;
};

type Props = {
  calculations: CalculationData[];
  openUsageGuideFrom: 'organization' | 'application';
};

const UsageDetailCalculation: FC<Props> = ({ calculations, openUsageGuideFrom }) => {
  const intl = useIntl();
  const { openDrawer } = useUsageCalculationDrawer();
  const getFeatureUsageName = useFeatureUsageDetailName();

  const title = intl.formatMessage({ id: 'common.settings.usage.usageDetail.calculation.title' });
  const isMultipleCalculations = calculations.length > 1;

  const contents: UsageHelperContent[] = useMemo(
    () =>
      calculations.map(({ featureKey, usageField }) => {
        const featureUsageName = getFeatureUsageName({ featureKey, usageField });
        const drawerTitle = intl.formatMessage(
          { id: 'common.settings.usage.usageDetail.calculation.description.single' },
          { featureUsageName },
        );
        const description = isMultipleCalculations ? (
          <MultipleDescription>
            {intl.formatMessage(
              { id: 'common.settings.usage.usageDetail.calculation.description.multiple' },
              { featureUsageName, b: (text) => <b>{text}</b> },
            )}
          </MultipleDescription>
        ) : (
          drawerTitle
        );

        const handleViewDetailClick: MouseEventHandler<HTMLButtonElement> = () => {
          openDrawer(USAGE_CALCULATION_DRAWER_ID, {
            title: drawerTitle,
            usageField,
          });
        };

        return {
          description,
          actions: [
            {
              type: 'button',
              label: intl.formatMessage({ id: 'common.settings.usage.usageDetail.calculation.button.viewDetail' }),
              onClick: handleViewDetailClick,
            },
          ],
        };
      }),
    [calculations, getFeatureUsageName, intl, isMultipleCalculations, openDrawer],
  );

  return (
    <>
      <UsageHelper title={title} contents={contents} isMultipleContents={isMultipleCalculations} />
      <UsageCalculationDrawer openedFrom={openUsageGuideFrom} />
    </>
  );
};

export default UsageDetailCalculation;
