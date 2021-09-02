import { FC, useMemo, useContext, useCallback, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Link,
  LinkVariant,
  cssVariables,
  Table,
  Lozenge,
  LozengeVariant,
  Toggle,
  TableColumnProps,
  ContextualHelp,
  TooltipTargetIcon,
  Tooltip,
  Subtitles,
  Spinner,
  InlineNotification,
  PrimitiveColor,
} from 'feather';
import partition from 'lodash/partition';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { UsageColumnUsage } from '@common/containers/settings/usage/UsageColumnUsage';
import { useFeatureName } from '@common/hooks';
import { FeatureTypeLozengeColors, ChatFeatureList, FeatureType, SubscriptionName, ChatFeatureName } from '@constants';
import { Unsaved, useShowDialog } from '@hooks';
import { useApplicationMonthlyUsageWithOrgUsages } from '@hooks/useApplicationMonthlyUsageWithOrgUsage';
import { useIsMessageSearchAvailable } from '@hooks/useIsMessageSearchAvailable';
import { LastUpdatedAt } from '@ui/components';
import { UsagePercent } from '@ui/components/usage';
import { getUsageTooltipText } from '@ui/components/usage/getUsageTooltipText';
import { generateUsageData, isByteUsageFeature } from '@utils';

import { FeaturesContext } from './FeaturesContext';

const MULTIPLE_CELL_DISTANCE = 48;

const percentCellStyle = {
  padding: '10px 8px 10px 0',
};

const FeatureNameWrapper = styled.div`
  display: flex;
  align-items: center;
  div[role='progressbar'] {
    margin-left: 8px;
  }
`;

const FeatureNameLink = styled(Link)<{ $color?: PrimitiveColor }>`
  ${({ $color }) =>
    $color
      ? css`
          color: ${cssVariables([$color, 5])};
          &:hover {
            color: ${cssVariables([$color, 6])};
          }
        `
      : ''};
`;

const ColumnWithChildren = styled.div`
  display: flex;
  align-items: center;
`;

const ColumnTitle = styled.div`
  margin-right: 4px;
`;

const ColumnUsageInProgress = styled.div`
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-6')};
  white-space: pre-wrap;
`;

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
};

export const FeaturesList: FC<Props> = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const match = useRouteMatch();
  const history = useHistory();

  const {
    isLoadingEnabledFeatures,
    enabledFeatures,
    toggleFeature,
    currentSubscription,
    messageSearchPipeline,
  } = useContext(FeaturesContext);
  const { isLoadingUsage, usageWithOrgUsages } = useApplicationMonthlyUsageWithOrgUsages();
  const isMessageSearchAvailable = useIsMessageSearchAvailable();

  const handleOverageLinkClick = useCallback(() => {
    showDialog({ dialogTypes: DialogType.Overage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFeatureClick = (featureKey) => () => {
    history.push(`${match?.url}/${featureKey}`);
  };

  const getFeatureName = useFeatureName();

  // TODO: refactor to hook
  const transformedFeatures = useMemo(() => {
    if (enabledFeatures && currentSubscription) {
      const dataSourceBeforeSort = ChatFeatureList.filter((feature) => {
        return feature.plans?.every(({ planKey }) => {
          return typeof currentSubscription.plan[planKey] === 'object' && currentSubscription.plan[planKey].enabled;
        });
      }).map((feature) => {
        const plans: BillingPlanItem[] = [];

        const isWebhook = feature.key === ChatFeatureName.Webhook; // Webhook is the only core feature that can be toggled.
        const usageData = feature.plans.map(({ planKey, usageField }) => {
          const monthlyAppUsage = usageWithOrgUsages?.[usageField]?.usage ?? 0;
          const monthlyOrgUsage = usageWithOrgUsages?.[usageField]?.others_usage ?? 0;
          const plan = currentSubscription.plan[planKey] ?? null;
          if (plan) {
            plans.push(plan);
          }
          return generateUsageData({
            feature,
            plan,
            usage: monthlyAppUsage,
            others: monthlyOrgUsage,
            usageField,
            skipAverageCheck: true,
          });
        });
        const isUnavailable = usageData.some(({ isExceedLimit }) => isExceedLimit);

        // Only Webhook can be toggled among Core features.
        let isEnabled = feature.type === FeatureType.Core && !isWebhook ? true : enabledFeatures[feature.key];

        if (feature.key === ChatFeatureName.MessageSearch) {
          isEnabled = messageSearchPipeline.subscribed && enabledFeatures[feature.key];
        }
        return {
          usageData,
          feature,
          name: getFeatureName({ featureKey: feature.key, billingPlanItem: plans.length > 0 ? plans[0] : undefined }),
          onAndOff: feature.type === FeatureType.Premium || isWebhook,
          isEnabled,
          isUnavailable,
        };
      });

      // reorder the list so all untrackable features come after the trackable features.
      const [trackableFeatures, untrackableFeatures] = partition(
        dataSourceBeforeSort,
        (item) => item.feature.trackable,
      );
      return [...trackableFeatures, ...untrackableFeatures];
    }
    return [];
  }, [currentSubscription, enabledFeatures, getFeatureName, usageWithOrgUsages, messageSearchPipeline.subscribed]);

  type TableRecord = typeof transformedFeatures[number];

  const renderFeatureName = ({ feature, isUnavailable, isEnabled, name }: TableRecord) => {
    const isSearchLoading =
      feature.key === ChatFeatureName.MessageSearch &&
      (messageSearchPipeline.doingHistoryMigration || messageSearchPipeline.waitingForMigrationStopped);

    const isSearchMigrationErrored =
      feature.key === ChatFeatureName.MessageSearch && isEnabled && messageSearchPipeline.migrationErrored;
    return (
      <FeatureNameWrapper>
        <FeatureNameLink
          variant={LinkVariant.Neutral}
          $color={isUnavailable || isSearchMigrationErrored ? 'red' : undefined}
        >
          {name}
        </FeatureNameLink>
        {isUnavailable ? (
          <Lozenge variant={LozengeVariant.Dark} color="red" css="margin-left: 16px;">
            {intl.formatMessage({ id: 'common.settings.usage.column.isActive.unavailable' })}
          </Lozenge>
        ) : null}
        {isSearchLoading && <Spinner size={20} stroke={cssVariables('neutral-6')} />}
      </FeatureNameWrapper>
    );
  };

  const columns: TableColumnProps<TableRecord>[] = [
    {
      dataIndex: 'type',
      title: intl.formatMessage({ id: 'chat.settings.features.column.type' }),
      width: '100px',
      render: ({ feature }) => (
        <Lozenge variant={LozengeVariant.Light} color={FeatureTypeLozengeColors[feature.type]}>
          {feature.type}
        </Lozenge>
      ),
    },
    {
      dataIndex: 'key',
      title: intl.formatMessage({ id: 'chat.settings.features.column.features' }),
      width: 52,
      render: ({ isEnabled, onAndOff, feature }) => {
        if (onAndOff) {
          if (feature.key === ChatFeatureName.MessageSearch) {
            /**
             * message search migration has 2 phase
             * 1) history copy stage
             * 2) live copy stage
             * So we have to check WIP status whether it is now history or live
             **/
            if (!isMessageSearchAvailable) {
              return (
                <ContextualHelp
                  content={intl.formatMessage(
                    { id: 'chat.settings.features.messageSearch.tooltip.unavailable' },
                    {
                      a: (text) => {
                        return (
                          <Link
                            href="/settings/contact_us?category=technical_issue"
                            useReactRouter={true}
                            variant={LinkVariant.Inline}
                          >
                            {text}
                          </Link>
                        );
                      },
                    },
                  )}
                  tooltipContentStyle={css`
                    font-weight: 400;
                    width: 256px;
                  `}
                >
                  <Toggle checked={isEnabled} disabled={true} />
                </ContextualHelp>
              );
            }
            if (!isEnabled && messageSearchPipeline.waitingForMigrationStopped) {
              return (
                <ContextualHelp
                  content={intl.formatMessage({ id: 'chat.settings.features.messageSearch.tooltip.discarding' })}
                  tooltipContentStyle={css`
                    font-weight: 400;
                    width: 256px;
                  `}
                >
                  <Toggle checked={isEnabled} disabled={true} />
                </ContextualHelp>
              );
            }
            if (isEnabled && messageSearchPipeline.doingHistoryMigration) {
              return (
                <ContextualHelp
                  content={intl.formatMessage({ id: 'chat.settings.features.messageSearch.tooltip.gathering' })}
                  tooltipContentStyle={css`
                    font-weight: 400;
                    width: 256px;
                  `}
                >
                  <Toggle checked={isEnabled} disabled={true} />
                </ContextualHelp>
              );
            }
          }
          return <Toggle checked={isEnabled} onClick={toggleFeature(feature)} />;
        }
        return (
          <Tooltip
            content={intl.formatMessage({ id: 'chat.settings.features.column.features.tooltip.core' })}
            popperProps={{
              modifiers: {
                offset: { offset: '0, 8' },
              },
            }}
            tooltipContentStyle={css`
              padding: 6px 16px;
              ${Subtitles['subtitle-01']};
            `}
          >
            <Toggle checked={isEnabled} disabled={true} css="display: block;" />
          </Tooltip>
        );
      },
    },
    {
      dataIndex: 'name',
      width: '316px',
      render: renderFeatureName,
      onCell: (record) => ({
        style: {
          cursor: 'pointer',
        },
        onClick: handleFeatureClick(record.feature.key),
      }),
      styles: css`
        &:hover {
          a {
            text-decoration: underline;
          }
        }
      `,
    },
    {
      dataIndex: 'usage',
      title: (
        <ColumnWithChildren>
          <ColumnTitle>{intl.formatMessage({ id: 'chat.settings.features.column.usage' })}</ColumnTitle>
          <ContextualHelp
            content={intl.formatMessage({ id: 'chat.settings.features.column.usage.tooltip' })}
            tooltipContentStyle={css`
              font-weight: 400;
            `}
          >
            <TooltipTargetIcon icon="info" />
          </ContextualHelp>
        </ColumnWithChildren>
      ),
      onCell: ({ feature }) => {
        return feature.key === ChatFeatureName.MessageSearch && messageSearchPipeline.preventShowPercent
          ? ({
              colSpan: 3,
            } as HTMLAttributes<HTMLElement>)
          : ({} as HTMLAttributes<HTMLElement>);
      },
      render: ({ feature, usageData, isEnabled }) => {
        if (feature.key === ChatFeatureName.MessageSearch) {
          if (messageSearchPipeline.isInitial) {
            return null;
          }
          if (messageSearchPipeline.migrationErrored) {
            return (
              <InlineNotification
                type="error"
                message={intl.formatMessage(
                  { id: 'chat.settings.features.messageSearch.alert.errored' },
                  {
                    a: (text) => {
                      return (
                        <Link
                          href="/settings/contact_us?category=technical_issue"
                          useReactRouter={true}
                          variant={LinkVariant.Inline}
                        >
                          {text}
                        </Link>
                      );
                    },
                  },
                )}
                action={{
                  label: 'Retry',
                  onClick: (e) => toggleFeature(feature)?.(isEnabled, e),
                }}
              />
            );
          }
          if (isEnabled) {
            if (messageSearchPipeline.doingHistoryMigration) {
              return (
                <ColumnUsageInProgress>
                  {intl.formatMessage({ id: 'chat.settings.features.messageSearch.alert.gathering' })}
                </ColumnUsageInProgress>
              );
            }
          }
        }
        return (
          <UsageColumnUsage
            record={{ feature, usageData, isEnabled }}
            subscription={currentSubscription}
            skipUpgradeCheck={true}
            showPercent={false}
            showAlert={false}
          />
        );
      },
    },
    {
      key: 'current',
      title: (
        <ColumnWithChildren>
          <ColumnTitle>{intl.formatMessage({ id: 'chat.settings.features.column.current' })}</ColumnTitle>
          <ContextualHelp
            content={intl.formatMessage({ id: 'chat.settings.features.column.current.tooltip' })}
            tooltipContentStyle={css`
              font-weight: 400;
            `}
          >
            <TooltipTargetIcon icon="info" />
          </ContextualHelp>
        </ColumnWithChildren>
      ),
      onCell: ({ feature }) =>
        feature.key === ChatFeatureName.MessageSearch && messageSearchPipeline.preventShowPercent
          ? ({ width: 0, style: { ...percentCellStyle, margin: 0 } } as HTMLAttributes<HTMLElement>)
          : ({ style: { ...percentCellStyle } } as HTMLAttributes<HTMLElement>),
      width: '96px',
      styles: css`
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-start;
        > div + div {
          margin-top: ${MULTIPLE_CELL_DISTANCE}px;
        }
      `,
      render: ({ feature, usageData }) => {
        if (feature.key === ChatFeatureName.MessageSearch && messageSearchPipeline.preventShowPercent) {
          return '';
        }
        return (
          feature.trackable &&
          usageData.map(({ usage, others, quota, limit, usageField }) => {
            return (
              <UsagePercent
                key={`featurePercentByApp_${usageField}`}
                usage={usage}
                others={others}
                quota={quota}
                limit={limit}
                type="current"
              />
            );
          })
        );
      },
    },
    {
      key: 'all',
      title: (
        <ColumnWithChildren>
          <ColumnTitle>{intl.formatMessage({ id: 'chat.settings.features.column.all' })}</ColumnTitle>
          <ContextualHelp
            content={intl.formatMessage({ id: 'chat.settings.features.column.all.tooltip' })}
            tooltipContentStyle={css`
              font-weight: 400;
            `}
          >
            <TooltipTargetIcon icon="info" />
          </ContextualHelp>
        </ColumnWithChildren>
      ),
      onCell: ({ feature }) =>
        feature.key === ChatFeatureName.MessageSearch && messageSearchPipeline.preventShowPercent
          ? ({ width: 0, style: { ...percentCellStyle, margin: 0 } } as HTMLAttributes<HTMLElement>)
          : ({ style: { ...percentCellStyle } } as HTMLAttributes<HTMLElement>),
      width: '96px',
      styles: css`
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-start;
        > div + div {
          margin-top: ${MULTIPLE_CELL_DISTANCE}px;
        }
      `,
      render: ({ feature, usageData }) => {
        if (feature.key === ChatFeatureName.MessageSearch && messageSearchPipeline.preventShowPercent) {
          return '';
        }
        return (
          feature.trackable &&
          usageData.map(({ usage, others, quota, limit, usageField }) => {
            return (
              <UsagePercent
                key={`featurePercentByAll_${usageField}`}
                usage={usage}
                others={others}
                quota={quota}
                limit={limit}
                type="all"
                availabilityTooltips={getUsageTooltipText({
                  intl,
                  limit,
                  isFreeTrial: currentSubscription?.subscription_name === SubscriptionName.FreeTrial,
                  onLinkClick: handleOverageLinkClick,
                  unit: isByteUsageFeature(usageField) ? 'gigabyte' : '',
                })}
              />
            );
          })
        );
      },
    },
  ];

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader
        css={`
          * + ${AppSettingPageHeader.Description} {
            margin-top: 24px;
          }
        `}
      >
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'core.settings.application.tab.features' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          {usageWithOrgUsages?.updated_dt && <LastUpdatedAt timestamp={usageWithOrgUsages.updated_dt} />}
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description>
          {intl.formatMessage(
            { id: 'chat.settings.features.description' },
            {
              a: (text) => (
                <Link variant={LinkVariant.Inline} href="/settings/usage" useReactRouter={true}>
                  {text}
                </Link>
              ),
            },
          )}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <Table<TableRecord>
        columns={columns}
        dataSource={transformedFeatures}
        rowStyles={() => css`
          &:hover {
            a {
              color: ${cssVariables('purple-7')};
            }
          }
        `}
        loading={isLoadingEnabledFeatures || isLoadingUsage}
      />
    </AppSettingsContainer>
  );
};
