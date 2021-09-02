import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Icon,
  OverlayButton,
  OverlayButtonBackgroundType,
  OverlayButtonBackgroundTypeContext,
  Subtitles,
} from 'feather';

import { useAppId, useAuthorization } from '@hooks';

import { getDefaultTicketSearchQueryParam, DefaultFilterItemId } from '../TicketSearchInput';
import { useProactiveChatViewDrawer } from './useProactiveChatViewDrawer';

const NotificationWrapper = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr;
  grid-column-gap: 16px;
  align-items: flex-start;
  border-radius: 4px;
  background: ${cssVariables('neutral-2')};
  padding: 0 16px;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const Message = styled.p`
  color: ${cssVariables('neutral-10')};
  padding: 14px 0;
  ${Subtitles['subtitle-01']};
`;

const Actions = styled.div`
  margin-bottom: 14px;

  button + button {
    margin-left: 4px;
  }
`;

type Props = {
  onBackButtonClick: () => void;
  onSeeTicketButtonClick: () => void;
};

// FIXME: Refactor the InlineNotification component in feather to allow multiple actions.
export const StatusChangedNotification: FC<Props> = ({ onBackButtonClick, onSeeTicketButtonClick, ...restProps }) => {
  const intl = useIntl();
  const history = useHistory();
  const appId = useAppId();
  const { isPermitted } = useAuthorization();
  const { drawerState } = useProactiveChatViewDrawer();

  const handleBackActionClick = () => {
    onBackButtonClick();
  };

  const handleSeeTicketActionClick = () => {
    if (drawerState) {
      const { ticket } = drawerState;
      const queryParam = getDefaultTicketSearchQueryParam(DefaultFilterItemId.TicketID, ticket.id.toString());
      onSeeTicketButtonClick();

      if (isPermitted(['desk.agent'])) {
        history.push(`/${appId}/desk/conversation/${ticket.id}?${queryParam}`);
      } else {
        history.push(`/${appId}/desk/tickets/${ticket.id}?${queryParam}`);
      }
    }
  };

  return (
    <OverlayButtonBackgroundTypeContext.Provider value={OverlayButtonBackgroundType.Mono}>
      <NotificationWrapper {...restProps}>
        <Icon
          icon="info-filled"
          size={20}
          color={cssVariables('neutral-6')}
          assistiveText="Notification"
          css={css`
            margin-top: 14px;
          `}
        />
        <ContentArea>
          <Message>
            {intl.formatMessage(
              { id: 'desk.drawer.proactiveChatViewDrawer.notification.content' },
              { b: (text) => <b css="font-weight: 600;">{text}</b> },
            )}
          </Message>
          <Actions>
            <OverlayButton onClick={handleBackActionClick}>
              {intl.formatMessage({ id: 'desk.drawer.proactiveChatViewDrawer.notification.action.back' })}
            </OverlayButton>
            <OverlayButton onClick={handleSeeTicketActionClick}>
              {intl.formatMessage({ id: 'desk.drawer.proactiveChatViewDrawer.notification.action.seeTicket' })}
            </OverlayButton>
          </Actions>
        </ContentArea>
      </NotificationWrapper>
    </OverlayButtonBackgroundTypeContext.Provider>
  );
};
