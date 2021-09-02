import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button } from 'feather';

import CenteredEmptyState from '@ui/components/CenteredEmptyState';

const Retry = styled(Button).attrs({
  buttonType: 'tertiary',
  icon: 'refresh',
  size: 'small',
})`
  display: flex;
  margin: 16px auto;
`;

export const ErrorView: FC<{
  disabled?: boolean;
  onClickRetryButton: () => void;
}> = ({ disabled, onClickRetryButton }) => {
  const intl = useIntl();
  return (
    <CenteredEmptyState
      icon="error"
      title={intl.formatMessage({ id: 'calls.callLogs.table.errorView.title' })}
      description={
        <>
          {intl.formatMessage({ id: 'calls.callLogs.table.errorView.description' })}
          <Retry onClick={onClickRetryButton} disabled={disabled}>
            {intl.formatMessage({ id: 'calls.callLogs.table.errorView.button' })}
          </Retry>
        </>
      }
    />
  );
};
