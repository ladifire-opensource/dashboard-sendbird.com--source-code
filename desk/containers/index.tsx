import { memo, useEffect, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import moment from 'moment-timezone';

import { deskActions } from '@actions';
import { useDeskAuth } from '@authorization/useDeskAuth';
import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { VMUAE } from '@constants/uids';
import { LNBContext } from '@core/containers/app/lnbContext';
import { Agents } from '@desk/containers/agents';
import { AssignmentLogs } from '@desk/containers/assignmentLogs';
import { Conversation } from '@desk/containers/conversation';
import { ConversationContext } from '@desk/containers/conversation/conversationTickets/conversationContext';
import { Customers } from '@desk/containers/customers';
import { DataExport } from '@desk/containers/dataExport';
import { Monitoring } from '@desk/containers/monitoring';
import { ProactiveChatList } from '@desk/containers/proactiveChat';
import { DeskSettings } from '@desk/containers/settings';
import { Statistics } from '@desk/containers/statistics';
import { Tickets } from '@desk/containers/tickets';
import { TicketsContextProvider } from '@desk/containers/tickets/ticketsContext';
import { Views } from '@desk/containers/views';
import { IntegrationContextProvider } from '@desk/contexts/integrationContext';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAuthorization, useShallowEqualSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';

import { DeskAdminApp } from './DeskAdminApp';
import { DeskAgentApp } from './DeskAgentApp';
import { getDefaultTicketSearchQueryParam, DefaultFilterItemId } from './TicketSearchInput';
import { AgentSettings } from './agentSettings';
import { useConversationTickets } from './conversation/conversationTickets/conversationTicketsContext';
import { useDeskOpenChannelConnection } from './useDeskOpenChannelConnection';
import { useTicketCountsHandlers } from './useTicketCountsHandlers';

type Props = RCProps<{}>;

export const Desk = memo<Props>(() => {
  const match = useRouteMatch();
  const conversationTicketsContext = useConversationTickets();
  const { updateCounts, fetchAssignedTicketsCounts } = conversationTicketsContext;
  useDeskAuth();
  useDeskOpenChannelConnection();
  useTicketCountsHandlers({
    updateCounts,
    fetchAssignedTicketsCounts,
  });

  const { isPermitted } = useAuthorization();
  const { setIsCollapsed } = useContext(LNBContext);

  const dispatch = useDispatch();
  const { pid, region } = useProjectIdAndRegion();
  const { organizationUID, timezone, connected } = useShallowEqualSelector((state) => ({
    organizationUID: state.organizations.current.uid,
    timezone: state.desk.project.timezone,
    connected: state.desk.connected,
  }));
  const isVM = organizationUID === VMUAE; // VM

  useEffect(() => {
    moment.tz.setDefault(timezone);
    // When the desk project is updated, reinitialize dates of date (range) pickers to avoid wrong date being shown as today
    dispatch(deskActions.initializeDateFilters());
  }, [timezone, dispatch]);

  useEffect(() => {
    if (isPermitted(['desk.agent'])) {
      setIsCollapsed(true);
    }
  }, [isPermitted, setIsCollapsed]);

  const gnbHeight = useContext(GNBHeightContext);

  const renderTickets = () => (
    <TicketsContextProvider>
      <Tickets />
    </TicketsContextProvider>
  );

  const renderDesk = useMemo(() => {
    if (isPermitted(['desk.admin'])) {
      return (
        <DeskAdminApp>
          <Switch>
            <Route path={`${match?.url}/tickets`} render={renderTickets} />
            <Route path={`${match?.url}/conversation/:ticketId`} component={Conversation} />
            <Route path={`${match?.url}/conversation`} component={Conversation} />
            <Route path={`${match?.url}/views`} component={Views} />
            <Route path={`${match?.url}/assignment_logs`} component={AssignmentLogs} />
            <Route path={`${match?.url}/proactive_chats`} component={ProactiveChatList} />
            <Route path={`${match?.url}/agents`} component={Agents} />
            <Route path={`${match?.url}/customers`} component={Customers} />
            <Route path={`${match?.url}/data_exports`} component={DataExport} />
            <Route path={`${match?.url}/monitoring`} component={Monitoring} />
            <Route path={`${match?.url}/reports`} component={Statistics} />
            <Route
              path={match?.url}
              render={() => {
                return <Redirect to={`${match?.url}/tickets`} />;
              }}
            />
            <Redirect from={`${match?.url}/teams`} to={`${match?.url}/settings/teams`} />
          </Switch>
        </DeskAdminApp>
      );
    }
    if (isPermitted(['desk.agent'])) {
      return (
        <DeskAgentApp>
          <Switch>
            <Route
              path={`${match?.url}/tickets/:ticketId`}
              render={(props) => {
                const queryParam = getDefaultTicketSearchQueryParam(
                  DefaultFilterItemId.TicketID,
                  props.match.params.ticketId,
                );
                return <Redirect to={`${match?.url}/conversation/${props.match.params.ticketId}?${queryParam}`} />;
              }}
            />
            <Route path={`${match?.url}/conversation/:ticketId`} component={Conversation} />
            <Route path={`${match?.url}/conversation`} component={Conversation} />
            <Route path={`${match?.url}/assignment_logs`} component={AssignmentLogs} />
            <Route path={`${match?.url}/customers`} component={Customers} />
            {isVM && <Route path={`${match?.url}/monitoring`} component={Monitoring} />}
            <Route path={`${match?.url}/proactive_chats`} component={ProactiveChatList} />
            <Route
              path={match?.url}
              render={() => {
                return <Redirect to={`${match?.url}/conversation`} />;
              }}
            />
          </Switch>
        </DeskAgentApp>
      );
    }
  }, [isPermitted, isVM, match]);

  const settingsRouteMatch = useRouteMatch(`${match?.url}/settings`);

  if (settingsRouteMatch) {
    return (
      <IntegrationContextProvider pid={pid} region={region}>
        {isPermitted(['desk.agent']) && (
          <DeskAgentApp>
            <AgentSettings match={settingsRouteMatch} />
          </DeskAgentApp>
        )}
        {isPermitted(['desk.admin']) && (
          <DeskAdminApp>
            <DeskSettings match={settingsRouteMatch} />
          </DeskAdminApp>
        )}
      </IntegrationContextProvider>
    );
  }

  if (!match || !connected) {
    return <SpinnerFull style={{ height: `calc(100vh - ${gnbHeight}px)` }} />;
  }

  return (
    <IntegrationContextProvider pid={pid} region={region}>
      <ConversationContext.Provider value={{ conversationTickets: conversationTicketsContext }}>
        {renderDesk}
      </ConversationContext.Provider>
    </IntegrationContextProvider>
  );
});
