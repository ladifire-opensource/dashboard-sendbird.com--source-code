import { FC } from 'react';
import { useIntl } from 'react-intl';
import { PopperProps } from 'react-popper';

import styled, { css } from 'styled-components';

import { ContextualHelpContent, Link, LinkVariant } from 'feather';

import { CLOUD_FRONT_URL } from '@constants';

import { ContextualInfoIconTooltip } from '../tooltip/ContextualInfoIconTooltip';

const OverageTooltipImage = styled.img`
  margin: 24px 0;
`;

const OverageTooltipBody = styled(ContextualHelpContent.Body)`
  strong {
    font-weight: 600;
  }
  p + p {
    margin-top: 16px;
  }
`;

export const OverageTooltip: FC<{ className?: string; placement?: PopperProps['placement'] }> = ({
  className,
  placement = 'bottom',
}) => {
  const intl = useIntl();

  return (
    <ContextualInfoIconTooltip
      className={className}
      content={
        <>
          <ContextualHelpContent.Header>
            {intl.formatMessage({ id: 'ui.usage.overage.title' })}
          </ContextualHelpContent.Header>
          <OverageTooltipImage
            src={`${CLOUD_FRONT_URL}/dashboard/img-overage.png`}
            srcSet={`${CLOUD_FRONT_URL}/dashboard/img-overage.png,
  ${CLOUD_FRONT_URL}/dashboard/img-overage%402x.png 2x,
  ${CLOUD_FRONT_URL}/dashboard/img-overage%403x.png 3x
  `}
          />
          <OverageTooltipBody>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {intl.formatMessage(
                { id: 'ui.usage.overage.content.quota' },
                {
                  strong: (text: string) => <strong>{text}</strong>,
                },
              )}
            </p>
            <p>
              {intl.formatMessage(
                { id: 'ui.usage.overage.content.limit' },
                {
                  strong: (text: string) => <strong>{text}</strong>,
                  a: (text: string) => (
                    <Link
                      variant={LinkVariant.Inline}
                      useReactRouter={true}
                      href="/settings/contact_us?category=service_limit_increase"
                    >
                      {text}
                    </Link>
                  ),
                },
              )}
            </p>
          </OverageTooltipBody>
        </>
      }
      tooltipContentStyle={css`
        width: 322px;
      `}
      placement={placement}
    />
  );
};
