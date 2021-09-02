import { FC, useContext, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import formatDistanceStrict from 'date-fns/formatDistanceStrict/index';
import { Body, cssVariables, Headings, Icon, Typography } from 'feather';

import { fetchUser } from '@core/api';
import { useAppId, useAsync, useFormatDate } from '@hooks';

import Countdown from '../Countdown';
import { Actions } from './ProfileCard';
import UserProfileHeader from './UserProfileHeader';
import { UserProfilePopupContext } from './UserProfilePopupContextProvider';
import { CloseButton, Footer, Wrapper } from './components';
import useDeactivateAction from './hooks/useDeactivateAction';
import useUserActions from './hooks/useUserActions';

type Props = {
  type: 'mute' | 'ban';
  user: UserProfile;
  startAt: number;
  endAt: number;
  description: string;
};

const Duration = styled.dd`
  position: relative;
  display: flex;
  flex-direction: column;
  color: ${cssVariables('neutral-10')};
  ${Body['body-short-01']};

  b {
    ${Headings['heading-01']}
    margin-bottom: 2px;
  }
`;

const Comments = styled.dd<{ isEmpty: boolean }>`
  white-space: pre-line;
  background: ${cssVariables('neutral-2')};
  padding: 12px 16px;
  border-radius: 4px;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};

  ${(props) =>
    props.isEmpty &&
    css`
      background: transparent;
      padding: 0;
    `}
`;

const RemainingDuration = styled.div`
  display: flex;
  position: absolute;
  top: -18px;
  right: 0;
  align-items: center;
  line-height: 1;
  color: ${cssVariables('red-5')};
  font-size: 12px;
  font-weight: 500;

  > * + * {
    margin-left: 4px;
  }
`;

const PopupBody = styled.div`
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding: 24px 16px;
  max-height: 280px;
  overflow-y: auto;

  dt {
    ${Typography['label-02']};
    margin-bottom: 6px;
    color: ${cssVariables('neutral-6')};
  }

  dd + dt {
    margin-top: 24px;
  }
`;

const ProhibitedUserProfilePopup: FC<Props> = ({ type, user, startAt, endAt, description }) => {
  const { closeProfilePopup, notifyChange } = useContext(UserProfilePopupContext);
  const formatDate = useFormatDate();
  const intl = useIntl();
  const appId = useAppId();
  const { unbanUser, unmuteUser } = useUserActions();
  const { userId, nickname, profileUrl, role } = user;

  const [{ data, status }, loadUserStatus] = useAsync(async () => {
    const { data } = await fetchUser({ appId, userId });
    return data;
  }, [appId, userId]);

  useEffect(() => {
    loadUserStatus();
  }, [loadUserStatus]);

  const deactivateAction = useDeactivateAction(user);

  const { actions, isActionsDisabled } = useMemo(() => {
    const banAction = {
      current: true,
      handler: () => {
        unbanUser(user, () => {
          notifyChange('ban', { userId: user.userId, isBanned: false });
          closeProfilePopup();
        });
      },
    };

    const muteAction = {
      current: true,
      handler: () => {
        unmuteUser(user, () => {
          notifyChange('mute', { userId: user.userId, isMuted: false });
          closeProfilePopup();
        });
      },
    };

    const defaultUserActions = {
      deactivate: deactivateAction,
      ...(type === 'ban' ? { ban: banAction } : { mute: muteAction }),
    };

    if (status === 'success' && data) {
      if (data.is_active) {
        return { actions: defaultUserActions, isActionsDisabled: false };
      }
      // Deactivated users can neither be unbanned nor unmuted.
      return { actions: undefined, isActionsDisabled: false };
    }

    // while loading the user's status, show both buttons as disabled.
    return { actions: defaultUserActions, isActionsDisabled: true };
  }, [closeProfilePopup, data, deactivateAction, notifyChange, status, type, unbanUser, unmuteUser, user]);

  return (
    <Wrapper data-test-id="ProhibitedUserProfilePopup">
      <UserProfileHeader userId={userId} nickname={nickname} profileUrl={profileUrl} userRole={role} />
      <PopupBody>
        <dl>
          <dt>
            {intl.formatMessage({
              id:
                type === 'ban'
                  ? 'chat.components.userProfilePopup.banTime'
                  : 'chat.components.userProfilePopup.muteTime',
            })}
          </dt>
          <Duration>
            <b css={endAt === -1 ? `color: ${cssVariables('red-5')}` : undefined} data-test-id="FormattedDuration">
              {endAt > -1
                ? formatDistanceStrict(startAt, endAt)
                : intl.formatMessage({ id: 'chat.components.userProfilePopup.permanent' })}
            </b>
            <span data-test-id="DurationStart">
              {intl.formatMessage(
                { id: 'chat.components.userProfilePopup.duration.from' },
                { date: formatDate(startAt, { dateStyle: 'medium', timeStyle: 'medium' }) },
              )}
            </span>
            {endAt > -1 && (
              <span data-test-id="DurationEnd">
                {intl.formatMessage(
                  { id: 'chat.components.userProfilePopup.duration.to' },
                  { date: formatDate(endAt, { dateStyle: 'medium', timeStyle: 'medium' }) },
                )}
              </span>
            )}
            {endAt > -1 && (
              <RemainingDuration data-test-id="RemainingDuration">
                <Icon
                  icon={type === 'mute' ? 'mute-filled' : 'ban-filled'}
                  size={12}
                  color="currentColor"
                  assistiveText={intl.formatMessage({ id: 'chat.components.userProfilePopup.remainingTime' })}
                />
                <Countdown endAt={endAt} />
              </RemainingDuration>
            )}
          </Duration>
          <dt>{intl.formatMessage({ id: 'chat.components.userProfilePopup.comments' })}</dt>
          <Comments isEmpty={!description} data-test-id="Comments">
            {description || intl.formatMessage({ id: 'chat.components.userProfilePopup.comments.placeholder' })}
          </Comments>
        </dl>
      </PopupBody>
      {actions && (
        <Footer>
          <Actions actions={actions} disabled={isActionsDisabled} />
        </Footer>
      )}
      <CloseButton onClick={closeProfilePopup} />
    </Wrapper>
  );
};

export default ProhibitedUserProfilePopup;
