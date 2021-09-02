import React, { useEffect, useCallback, useContext, useRef } from 'react';
import { useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';

import styled from 'styled-components';

import { toast } from 'feather';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SpinnerFull } from '@ui/components';
import { TicketActions, TicketActionToastMessage } from '@ui/components/TicketActionToastMessage';

import { IframeSidebar } from '../iframeSidebar';
import { TicketsContext } from '../tickets/ticketsContext';
import { TicketDetailBody } from './ticketDetailBody';
import { TicketHeader } from './ticketHeader';

const origin: DeskOrigin = 'detail';

interface OwnProps {
  ticketId: string;
  isShownExportNotification: boolean;
  setIsShownExportNotification: React.Dispatch<React.SetStateAction<boolean>>;
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { isFetching, isFetchingMessages, ticket } = state.ticketDetail;
  return {
    desk: state.desk,
    project: state.desk.project,
    isFetching,
    isFetchingMessages,
    ticket,
    ...ownProps,
  };
};

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  fetchTicketDetailTicketRequest: deskActions.fetchTicketDetailTicketRequest,
  moveTicketToIdleRequest: deskActions.moveTicketToIdleRequest,
  resetTicketDetail: deskActions.resetTicketDetail,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

const TicketDetailBodyPlaceholder = styled.div`
  background-color: white;
  grid-row: top / bottom;
  grid-column: chat-thread-start / iframe-sidebar;
`;

const TicketDetailConnectable: React.FC<Props> = React.memo(
  ({
    ticketId,
    desk,
    project,
    isFetching,
    isFetchingMessages,
    ticket,
    fetchTicketDetailTicketRequest,
    moveTicketToIdleRequest,
    resetTicketDetail,
    showDialogsRequest,
    isShownExportNotification,
    setIsShownExportNotification,
  }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const { updateTicketInList } = useContext(TicketsContext);

    useEffect(() => {
      fetchTicketDetailTicketRequest(Number(ticketId));
      return () => {
        resetTicketDetail();
      };
    }, [fetchTicketDetailTicketRequest, resetTicketDetail, ticketId]);

    /**
     * `handleDetailActionChange` depends on `ticket` prop. But `ticket` gets updated too often. That's why we keep
     * a ref to `ticket` and reference it in `handleDetailActionChange`.
     */
    const ticketRef = useRef<Ticket>();
    useEffect(() => {
      ticketRef.current = ticket;
    }, [ticket]);

    const handleDetailActionChange = useCallback(
      ({ action, agent, group }: { action: TicketHeaderActionType; agent?: Agent; group?: AgentGroup<'listItem'> }) => {
        if (!ticketRef.current) {
          return;
        }

        switch (action) {
          case 'TRANSFER_TO_AGENT':
          case 'ASSIGN_TO_AGENT': {
            const mode = action === 'TRANSFER_TO_AGENT' ? 'TRANSFER' : 'ASSIGN';
            const onSuccess =
              action === 'TRANSFER_TO_AGENT'
                ? (assignment: Assignment) => {
                    if (ticketRef.current) {
                      updateTicketInList(ticketRef.current, { recentAssignment: assignment });
                      toast.success({
                        message: (
                          <TicketActionToastMessage
                            action={TicketActions.TRANSFERRED_TO_AGENT}
                            ticketChannelName={ticketRef.current.channelName}
                          />
                        ),
                      });
                    }
                  }
                : (updatedTicket: Ticket) => {
                    updateTicketInList(updatedTicket);
                    toast.success({
                      message: (
                        <TicketActionToastMessage
                          action={TicketActions.ASSIGNED}
                          ticketChannelName={updatedTicket.channelName}
                        />
                      ),
                    });
                  };
            showDialogsRequest({
              dialogTypes: DialogType.AssignTransferTicketToAgent,
              dialogProps: { mode, ticket: ticketRef.current, agent, origin, onSuccess },
            });
            return;
          }
          case 'CLOSE_TICKET': {
            showDialogsRequest({
              dialogTypes: DialogType.CloseTicket,
              dialogProps: {
                ticket: ticketRef.current,
                origin,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                  toast.success({
                    message: (
                      <TicketActionToastMessage
                        action={TicketActions.CLOSED}
                        ticketChannelName={updatedTicket.channelName}
                      />
                    ),
                  });
                },
              },
            });
            return;
          }
          case 'MOVE_TO_IN_PROGRESS': {
            showDialogsRequest({
              dialogTypes: DialogType.Confirm,
              dialogProps: {
                title: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.inProgress' }),
                description: intl.formatMessage(
                  { id: 'desk.tickets.ticketHeader.dialog.title.inProgress.descForNoRedirecting' },
                  {
                    b: (text) => <b>{text}</b>,
                    tickets: intl.formatMessage({ id: 'desk.tickets.header.title' }),
                    yours: intl.formatMessage({ id: 'desk.tickets.header.title.conversation' }),
                  },
                ),
                confirmText: intl.formatMessage({ id: 'desk.dialogs.button.ok' }),
                cancelText: intl.formatMessage({ id: 'desk.dialogs.button.cancel' }),
                onConfirm: () => {
                  ticketRef.current && dispatch(deskActions.moveTicketToWIPRequest(ticketRef.current));
                },
              },
            });
            return;
          }
          case 'MOVE_TO_IDLE': {
            showDialogsRequest({
              dialogTypes: DialogType.Confirm,
              dialogProps: {
                title: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle' }),
                description: '',
                confirmText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.confirm' }),
                cancelText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.cancel' }),
                onConfirm: () => {
                  if (ticketRef.current) {
                    moveTicketToIdleRequest({
                      ticket: ticketRef.current,
                      origin: 'detail',
                      onSuccess: (assignment) => {
                        if (ticketRef.current) {
                          updateTicketInList(ticketRef.current, { recentAssignment: assignment });
                        }
                      },
                    });
                  }
                },
              },
            });
            return;
          }
          case 'REOPEN_TICKET': {
            showDialogsRequest({
              dialogTypes: DialogType.ReopenTicket,
              dialogProps: {
                ticket: ticketRef.current,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            });
            return;
          }
          case 'ASSIGN_TICKET_TO_MYSELF': {
            showDialogsRequest({
              dialogTypes: DialogType.Confirm,
              dialogProps: {
                title: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.title' }),
                description: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.description' }),
                confirmText: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.button.confirm' }),
                cancelText: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.button.cancel' }),
                onConfirm: () => {
                  ticketRef.current && dispatch(deskActions.assignTicketToMyselfRequest(ticketRef.current));
                },
              },
            });
            return;
          }
          case 'TRANSFER_TO_GROUP': {
            showDialogsRequest({
              dialogTypes: DialogType.AssignTransferTicketToGroup,
              dialogProps: {
                mode: 'TRANSFER',
                ticket: ticketRef.current,
                group,
                origin,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            });
            return;
          }
          case 'EXPORT_TICKET':
            showDialogsRequest({
              dialogTypes: DialogType.ExportTicket,
              dialogProps: {
                ticketID: ticketRef.current.id,
                onSuccess: () => {
                  setIsShownExportNotification(true);
                },
              },
            });
            return;
          default:
            return;
        }
      },
      [dispatch, intl, moveTicketToIdleRequest, setIsShownExportNotification, showDialogsRequest, updateTicketInList],
    );

    return (
      <>
        <TicketHeader
          key={ticket?.id ?? ''}
          isFetching={isFetching}
          project={project}
          agent={desk.agent}
          ticket={ticket}
          handleActionChange={handleDetailActionChange}
        />
        {isFetchingMessages ? <SpinnerFull transparent={true} /> : ''}
        {ticket ? (
          <TicketDetailBody
            ticket={ticket}
            isShownExportNotification={isShownExportNotification}
            setIsShownExportNotification={setIsShownExportNotification}
          />
        ) : (
          <TicketDetailBodyPlaceholder />
        )}
        <IframeSidebar ticketId={Number(ticketId) ?? undefined} />
      </>
    );
  },
);

export const TicketDetail = connect(mapStateToProps, mapDispatchToProps)(TicketDetailConnectable);
