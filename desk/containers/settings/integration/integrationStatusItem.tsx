import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';

type Props = {
  label: string;
  isEnabled: boolean;
};

const Container = styled.div<{ isEnabled: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;

    color: ${cssVariables('neutral-5')};

    ${(props) => props.isEnabled && `color: ${cssVariables('neutral-10')};`}

    margin-right: 16px;

    :last-of-type {
      margin-right: auto;
    }
  }
`;

const StatusIcon = styled(Icon)`
  margin-right: 4px;
`;

export const IntegrationStatusItem: React.FC<Props> = ({ label, isEnabled }) => {
  const intl = useIntl();
  return (
    <Container isEnabled={isEnabled}>
      {isEnabled ? (
        <StatusIcon
          icon="done"
          size={16}
          color={cssVariables('green-5')}
          assistiveText={intl.formatMessage({ id: 'desk.settings.integration.list.lbl.enabled' })}
        />
      ) : (
        <StatusIcon
          icon="close"
          size={16}
          color={cssVariables('neutral-5')}
          assistiveText={intl.formatMessage({ id: 'desk.settings.integration.list.lbl.disabled' })}
        />
      )}{' '}
      {label}
    </Container>
  );
};
