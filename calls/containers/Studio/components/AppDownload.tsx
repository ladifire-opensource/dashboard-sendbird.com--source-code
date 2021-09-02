import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, Icon, cssVariables } from 'feather';

const APP_STORE_LINK = 'https://apps.apple.com/gb/app/id1503477603';
const GOOGLE_PLAY_LINK = 'http://play.google.com/store/apps/details?id=com.sendbird.calls.quickstart';

const Container = styled.a`
  &:hover {
    text-decoration: none;
  }

  > button {
    white-space: nowrap;
    svg {
      margin-right: 8px;
    }
  }
`;

export const AppStore = () => {
  const intl = useIntl();
  return (
    <Container href={APP_STORE_LINK} target="_blank">
      <Button buttonType="tertiary">
        <Icon icon="apple" size={16} color={cssVariables('neutral-9')} />
        {intl.formatMessage({ id: 'calls.studio.components.appDownload.ios' })}
      </Button>
    </Container>
  );
};

export const GooglePlay = () => {
  const intl = useIntl();
  return (
    <Container href={GOOGLE_PLAY_LINK} target="_blank">
      <Button buttonType="tertiary">
        <Icon icon="google-play-colored" size={16} />
        {intl.formatMessage({ id: 'calls.studio.components.appDownload.android' })}
      </Button>
    </Container>
  );
};
