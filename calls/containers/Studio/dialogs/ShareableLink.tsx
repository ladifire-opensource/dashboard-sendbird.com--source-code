import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Body, ContextualHelp, InputText, TooltipTargetIcon } from 'feather';

import { useCopy } from '@hooks';

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type Props = { userId: string; link?: string; className?: string };

export const ShareableLink = styled(({ userId, link, className }: Props) => {
  const intl = useIntl();
  const copy = useCopy();

  const handleCopy = () => {
    link && copy(link);
  };

  return (
    <InputText
      label={
        <LabelWrapper>
          {intl.formatMessage({ id: 'calls.studio.mobileApp.signinDialog.shareableLink.label' })}
          <ContextualHelp
            content={intl.formatMessage(
              { id: 'calls.studio.mobileApp.signinDialog.shareableLink.label.tooltip' },
              { userId },
            )}
            tooltipContentStyle={css`
              ${Body['body-short-01']}
              max-width: 256px;
            `}
          >
            <TooltipTargetIcon icon="info" />
          </ContextualHelp>
        </LabelWrapper>
      }
      value={link}
      icons={[{ icon: 'copy', title: 'Copy', onClick: handleCopy, disabled: !link }]}
      readOnly={true}
      className={className}
      css="width: 100%;"
    />
  );
})``;
