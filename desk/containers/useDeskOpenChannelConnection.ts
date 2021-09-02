import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { commonActions, deskActions } from '@actions';
import { deskApi } from '@api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShallowEqualSelector } from '@hooks';
import { logException } from '@utils/logException';

export const useDeskOpenChannelConnection = () => {
  const dispatch = useDispatch();
  const { pid, region } = useProjectIdAndRegion();
  const { agent, authenticated, connected, openChannelUrl } = useShallowEqualSelector((state) => {
    const { agent, authenticated, connected, project } = state.desk;
    return { agent, authenticated, connected, openChannelUrl: project.openChannelUrl };
  });
  const disconnectPromiseRef = useRef<Promise<void>>();

  useEffect(() => {
    if (!openChannelUrl) {
      return;
    }

    // when openChannelUrl is about to change, disconnect from the current open channel
    return () => {
      const disconnect = () =>
        new Promise<void>((resolve) => {
          window.dashboardSB.OpenChannel.getChannel(openChannelUrl)
            .then((channel) => {
              channel.exit((_, channelExitError) => {
                if (channelExitError) {
                  logException({ error: channelExitError, context: { channel } });
                  dispatch(deskActions.setDeskConnected(false));
                  return resolve();
                }
                dispatch(deskActions.setDeskConnected(false));
                return resolve();
              });
            })
            .catch((error) => {
              logException({ error, context: { channelUrl: openChannelUrl } });
              resolve();
            });
        });

      disconnectPromiseRef.current = disconnect();
    };
  }, [dispatch, openChannelUrl]);

  useEffect(() => {
    if (!openChannelUrl || !authenticated || connected) {
      // no need to connect
      return;
    }

    const connect = async () => {
      // wait for ongoing disconnecting to be finished
      await disconnectPromiseRef.current;

      const enterChannel = async () => {
        try {
          const channel = await window.dashboardSB.OpenChannel.getChannel(openChannelUrl);

          channel.enter((_, channelEnterError) => {
            if (channelEnterError) {
              logException({ error: channelEnterError, context: { channel } });
              return;
            }
            // This api will request initial `AGENT_TICKET_COUNTS` socket event
            deskApi.fetchTicketsCounts(pid, region);
          });
        } catch (error) {
          logException({ error, context: { channelUrl: openChannelUrl } });
        }
      };

      // connect to sendbird
      dispatch(
        commonActions.sbConnectRequest({
          userInformation: {
            userId: agent.sendbirdId,
            accessToken: agent.sendbirdAccessToken,
          },
          onSuccess: () => {
            dispatch(deskActions.setDeskConnected(true));
            enterChannel();
          },
        }),
      );
    };

    if (authenticated && !connected) {
      connect();
    }
  }, [authenticated, agent, dispatch, connected, openChannelUrl, pid, region]);
};
