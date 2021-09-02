import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useLatestValue, useTypedSelector } from '@hooks';
import { logException } from '@utils/logException';

export const useTicketCountsHandlers = (options: {
  updateCounts: (counts: { wip: number }) => void;
  fetchAssignedTicketsCounts: (params: { agentId: number }) => void;
}) => {
  const agentId = useTypedSelector((state) => state.desk.agent.id);
  const openChannelUrl = useTypedSelector((state) => state.desk.project.openChannelUrl);
  const latestOpenChannelUrl = useLatestValue(openChannelUrl);
  const dispatch = useDispatch();
  const { updateCounts, fetchAssignedTicketsCounts } = options;

  useEffect(() => {
    const channelHandler = new window.dashboardSB.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      if (channel.isOpenChannel() && channel.url === latestOpenChannelUrl.current) {
        try {
          const deskEvent = JSON.parse(message['message']);
          if (deskEvent.type === 'AGENT_TICKET_COUNTS') {
            if (deskEvent.agents.includes(agentId)) {
              fetchAssignedTicketsCounts({ agentId });
            }
          }
          if (deskEvent.type === 'TICKET_WIP_COUNT') {
            updateCounts({ wip: deskEvent.count });
          }
        } catch (error) {
          logException({ error, context: { message } });
        }
      }
    };
    window.dashboardSB.addChannelHandler('TICKET_COUNTS_HANDLER', channelHandler);

    return () => {
      window.dashboardSB.removeChannelHandler('TICKET_COUNTS_HANDLER');
    };
  }, [agentId, dispatch, fetchAssignedTicketsCounts, latestOpenChannelUrl, updateCounts]);
};
