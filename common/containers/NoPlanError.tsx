import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Icon, cssVariables, Subtitles, Body, Link, LinkVariant, Headings } from 'feather';

const Container = styled.div`
  width: 640px;
  text-align: center;

  * {
    text-align: inherit;
  }
`;

const Title = styled.h5`
  ${Subtitles['subtitle-03']};
  color: ${cssVariables('neutral-7')};
  margin-top: 12px;
  padding: 0 32px;
`;

const Description = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 4px;
  white-space: pre-line;
`;

const ErrorType = styled.div`
  width: 100%;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  padding: 24px 0;
  margin-top: 24px;
`;

const ErrorTypeLabel = styled.h6`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-6')};
`;

const ErrorTypeDescription = styled.p`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-6')};
  margin-top: 2px;
`;

export const NoPlanError: FC<{ className?: string }> = ({ className }) => {
  const intl = useIntl();
  return (
    <Container className={className}>
      <Icon icon="error" size={80} color={cssVariables('neutral-5')} />
      <Title>{intl.formatMessage({ id: 'common.noPlanError.title' })}</Title>
      <Description>
        {intl.formatMessage(
          { id: 'common.noPlanError.description' },
          {
            a: (text) => (
              <Link variant={LinkVariant.Inline} useReactRouter={true} href="/settings/contact_us">
                {text}
              </Link>
            ),
          },
        )}
      </Description>
      <ErrorType>
        <ErrorTypeLabel>{intl.formatMessage({ id: 'common.noPlanError.errorTypeLabel' })}</ErrorTypeLabel>
        <ErrorTypeDescription>
          {intl.formatMessage({ id: 'common.noPlanError.errorTypeDescription' })}
        </ErrorTypeDescription>
      </ErrorType>
    </Container>
  );
};
