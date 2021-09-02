import { memo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Subtitles, cssVariables, Button } from 'feather';

type Props = { error: string; onRetry: () => void };

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const ErrorMessage = styled.p`
  ${Subtitles['subtitle-02']}
  color: ${cssVariables('neutral-7')};
  margin-bottom: 16px;
`;

export const ChartError = memo<Props>(({ error, onRetry }) => {
  const intl = useIntl();
  return (
    <ErrorContainer data-test-id="ErrorContainer">
      <ErrorMessage>{error}</ErrorMessage>
      <Button buttonType="tertiary" icon="refresh" size="small" onClick={onRetry}>
        {intl.formatMessage({ id: 'desk.statistics.button.retry' })}
      </Button>
    </ErrorContainer>
  );
});
