import { FC, ReactNode, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, TooltipTargetIcon } from 'feather';

import { useAuthorization } from '@hooks';
import { Card, ChevronLink } from '@ui/components';

import { KeyUsage } from './KeyUsage';
import { SummaryView } from './SummaryView';
import { ErrorView, OverviewTooltip } from './components';
import { Statistics } from './statistics';
import { useChatProductView } from './useProductView';

const StyledProductView = styled.section`
  ${Card} + ${Card} {
    border-top: 0;
    border-radius: 0;
  }

  ${Card}:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  div[role='alert'] {
    margin-bottom: 16px;
  }
`;

const ProductDetailContainer = styled(Card)<{ hasRowBelow: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
  padding: 22px 24px;

  ${({ hasRowBelow }) =>
    hasRowBelow
      ? css`
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `
      : ''}

  a {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.15px;
    color: ${cssVariables('purple-7')};
  }
`;

const ProductDetailItem = styled.div`
  position: relative; /* cover SpinnerFull(absolute) */
  display: flex;
  flex-direction: column;
  min-height: 334px;

  ${ChevronLink}:hover {
    font-weight: 600;
  }
`;

const ProductDetailTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 22px;
  display: flex;
  align-items: center;
`;

const ProductViewTemplate: FC<{
  id?: string;
  header?: ReactNode;
  quota: ReactNode;
  usage: ReactNode;
  statistics?: ReactNode;
}> = ({ id, header, quota, usage, statistics }) => {
  return (
    <StyledProductView data-test-id={id}>
      {header}
      <ProductDetailContainer hasRowBelow={!!statistics}>
        {quota}
        {usage}
      </ProductDetailContainer>
      {statistics}
    </StyledProductView>
  );
};

const ProductViewColumnTemplate: FC<{
  title: string;
  tooltipContent?: string;
  footer?: ReactNode;
  error?: { message?: string; onRetry: () => void };
  content: ReactNode;
}> = ({ title, tooltipContent, content, footer }) => {
  return (
    <ProductDetailItem>
      <ProductDetailTitle>
        {title}
        {tooltipContent && (
          <OverviewTooltip
            tooltipContent={tooltipContent}
            popperProps={{ modifiers: { offset: { offset: '-14, 4' } } }}
          >
            <TooltipTargetIcon icon="info" />
          </OverviewTooltip>
        )}
      </ProductDetailTitle>
      {content}
      {footer}
    </ProductDetailItem>
  );
};

export const ChatProductView: FC<{ onLoaded: () => void }> = ({ onLoaded }) => {
  const intl = useIntl();
  const { isSelfService } = useAuthorization();
  const {
    quota,
    usage,
    isFetchingQuota,
    isFetchingUsage,
    didFailToFetchQuota,
    didFailToFetchUsage,
    actions: { load },
  } = useChatProductView();

  useEffect(() => {
    load();
  }, [load]);

  const loaded = quota.length > 0 && usage.length > 0;
  useEffect(() => {
    loaded && onLoaded();
  }, [loaded, onLoaded]);

  return (
    <ProductViewTemplate
      id="ChatProductView"
      quota={
        <ProductViewColumnTemplate
          title={intl.formatMessage({ id: 'core.overview.quota_title' })}
          content={
            didFailToFetchQuota ? (
              <ErrorView onRetry={load} isRetrying={isFetchingQuota} />
            ) : (
              <KeyUsage usageProps={quota} isFetching={isFetchingQuota} />
            )
          }
          footer={
            isSelfService &&
            quota.length > 0 && (
              <ChevronLink href="settings/features">
                {intl.formatMessage({ id: 'core.overview.quota_link.viewMore' })}
              </ChevronLink>
            )
          }
        />
      }
      usage={
        <ProductViewColumnTemplate
          title={intl.formatMessage({ id: 'core.overview.usage_title' })}
          tooltipContent={intl.formatMessage({ id: 'core.overview.usage_tooltip.messaging' })}
          content={
            didFailToFetchUsage ? (
              <ErrorView onRetry={load} isRetrying={isFetchingUsage} />
            ) : (
              <SummaryView usage={usage} isFetching={isFetchingUsage} />
            )
          }
        />
      }
      statistics={<Statistics />}
    />
  );
};
