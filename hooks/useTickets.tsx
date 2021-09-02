import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Moment } from 'moment-timezone';

import { deskActions } from '@actions';
import { TicketStatus, TicketType, ISO_DATE_FORMAT } from '@constants';
import { updateTicket as updateTicketAPI, fetchTickets as fetchTicketsAPI } from '@desk/api';
import { generateBadRequest } from '@epics/generateBadRequest';

export const useTickets = () => {
  const dispatch = useDispatch();
  const pid = useSelector<RootState, Project['pid']>((state) => state.desk.project.pid);
  const region = useSelector<RootState, Application['region']>((state) => state.applicationState.data?.region ?? '');

  const updateTicket = useCallback(
    async (ticketId: number, params: Partial<Ticket>) => {
      try {
        const { data } = await updateTicketAPI(pid, region, { ticketId, params });
        return data;
      } catch (err) {
        return;
      }
    },
    [pid, region],
  );

  const fetchTickets = useCallback(
    async ({
      offset = 0,
      limit = 20,
      query = '',
      order = '-created_at',
      ticketStatus,
      startDate,
      endDate,
      agentId,
      groupId,
      ticketType,
      channelTypes,
      tags,
      priority,
      isSearchMode = false,
    }: {
      offset?: number;
      limit?: number;
      query?: string;
      order?: string;
      ticketStatus?: TicketStatus;
      startDate?: Moment;
      endDate?: Moment;
      agentId?: Agent['id'];
      groupId?: AgentGroup['id'];
      ticketType?: TicketType;
      channelTypes?: TicketChannelType[];
      tags?: TicketTag['id'][];
      priority?: Priority;
      isSearchMode?: boolean;
    }): Promise<FetchTicketsResponse | undefined> => {
      try {
        const params = isSearchMode
          ? {
              limit,
              offset,
              q: query,
              order,
              status2: [
                TicketStatus.ACTIVE,
                TicketStatus.IDLE,
                TicketStatus.PENDING,
                TicketStatus.WIP,
                TicketStatus.CLOSED,
              ],
            }
          : {
              limit,
              offset,
              order,
              q: undefined,
              start_date: startDate?.format(ISO_DATE_FORMAT),
              end_date: endDate?.format(ISO_DATE_FORMAT),
              agent: agentId,
              group: groupId,
              ticket_type: ticketType,
              channel_type: channelTypes,
              tag: tags,
              priority,
              status2:
                ticketStatus === TicketStatus.ALL
                  ? [
                      TicketStatus.ACTIVE,
                      TicketStatus.IDLE,
                      TicketStatus.PENDING,
                      TicketStatus.WIP,
                      TicketStatus.CLOSED,
                    ]
                  : ticketStatus,
            };
        const { data } = await fetchTicketsAPI(pid, region, params);
        return data;
      } catch (error) {
        dispatch(generateBadRequest(error));
        dispatch(deskActions.fetchTicketsFail(error));
        return;
      }
    },
    [pid, region, dispatch],
  );
  return { fetchTickets, updateTicket };
};
