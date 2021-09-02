import { useState, useEffect, useCallback, FC } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { toast } from 'feather';

import { chatActions } from '@actions';
import UserProfilePopupContextProvider from '@chat/components/UserProfilePopup/UserProfilePopupContextProvider';
import { useAppId, useCurrentSdkUser, useTypedSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';
import { logException } from '@utils/logException';

import { ModerationToolHeader } from '../ModerationToolHeader';
import { ChangeLayoutDropdown } from '../ModerationToolHeader/ChangeLayoutDropdown';
import { ZoomLevelPercentageValue, TextZoomButton } from '../ModerationToolHeader/TextZoomButton';
import { MT, MTBody, MTInfoSidebar, MTChat } from '../components';
import OpenChannelChat from './OpenChannelChat';
import { OpenChannelInfo } from './OpenChannelInfo';

const StyledOpenChannels = styled.div`
  flex: 1;
  min-width: 0;
`;

const OpenChannelDetail: FC<{ channelUrl: string }> = ({ channelUrl }) => {
  const appId = useAppId();
  const channel = useTypedSelector((state) => state.openChannels.current);
  const isFetchingChannel = useTypedSelector((state) => state.openChannels.isFetchingChannel);
  const intl = useIntl();
  const dispatch = useDispatch();
  const { sdkUser, isFetched: isSdkUserFetched } = useCurrentSdkUser();

  const [zoomLevel, setZoomLevel] = useState<ZoomLevelPercentageValue>(100);
  const [isInformationSidebarHidden, setInformationSidebarHidden] = useState(false);

  const history = useHistory();

  const close = useCallback(() => {
    if (appId) {
      history.push(`/${appId}/open_channels`);
    } else {
      history.push('/');
    }
  }, [appId, history]);

  const exitChat = useCallback(
    (channelUrl: string) => {
      if (window.dashboardSB && window.dashboardSB.getConnectionState() === 'OPEN') {
        window.dashboardSB.OpenChannel.getChannel(channelUrl, (channel, error) => {
          if (error) {
            logException({ error, context: { channelUrl } });
            return;
          }

          channel.exit((_, error) => {
            if (error) {
              logException({ error, context: { channelUrl } });
              return;
            }

            dispatch(chatActions.setOpenChannelsIsEntered(false));
          });
        });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const initializeSendBird = () => {
      if (sdkUser) {
        dispatch(chatActions.fetchOpenChannelRequest(channelUrl));
      } else if (isSdkUserFetched) {
        toast.warning({
          message: intl.formatMessage({ id: 'chat.moderationTool.noti.setModeratorInformationFirst' }),
        });
        close();
      }
    };

    initializeSendBird();

    return () => {
      exitChat(channelUrl);
      dispatch(chatActions.resetOpenChannelsModerationData());
    };
  }, [channelUrl, close, dispatch, exitChat, intl, isSdkUserFetched, sdkUser]);

  return (
    <UserProfilePopupContextProvider channelType="open_channels" channelUrl={channelUrl}>
      <StyledOpenChannels
        css={
          isInformationSidebarHidden
            ? css`
                ${MTInfoSidebar} {
                  display: none;
                }

                ${MTChat} {
                  padding-left: 16px;
                  padding-right: 16px;
                }
              `
            : undefined
        }
      >
        {channel == null ? (
          isFetchingChannel && <SpinnerFull />
        ) : (
          <MT>
            <ModerationToolHeader channel={channel}>
              {{
                textZoomButton: <TextZoomButton value={zoomLevel} onChange={(value) => setZoomLevel(value)} />,
                changeLayoutButton: (
                  <ChangeLayoutDropdown
                    isInformationSidebarHidden={isInformationSidebarHidden}
                    onChange={setInformationSidebarHidden}
                  />
                ),
              }}
            </ModerationToolHeader>
            <MTBody>
              <OpenChannelInfo />
              <OpenChannelChat channel={channel} zoomLevel={zoomLevel} />
            </MTBody>
          </MT>
        )}
      </StyledOpenChannels>
    </UserProfilePopupContextProvider>
  );
};

export default OpenChannelDetail;
