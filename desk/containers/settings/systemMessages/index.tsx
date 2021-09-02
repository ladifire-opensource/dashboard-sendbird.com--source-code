import { FC, useMemo, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useRouteMatch, useHistory, Switch, Route, Redirect } from 'react-router-dom';

import styled from 'styled-components';

import { deskApi } from '@api';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { useAsync, useErrorToast } from '@hooks';
import { TabMenu } from '@ui/components';

import { TicketAssignmentSystemMessages } from './TicketAssignmentSystemMessages';
import { TicketPrioritySystemMessages } from './TicketPrioritySystemMessages';
import { TicketStatusSystemMessages } from './TicketStatusSystemMessages';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TICKET_STATUS_TAB_URL = 'ticket_status';
export const TICKET_ASSIGNMENT_TAB_URL = 'ticket_assignment';
export const TICKET_PRIORITY_TAB_URL = 'ticket_priority';

export const SystemMessages: FC = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const history = useHistory();
  const { pid, region } = useSelector((state: RootState) => ({
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region || '',
  }));
  const [systemMessages, setSystemMessages] = useState<FetchSystemMessagesResponse>();

  const [fetchSystemMessageResponse, fetchSystemMessages] = useAsync(() => deskApi.fetchSystemMessages(pid, region), [
    pid,
    region,
  ]);
  const [fetchDefaultSystemMessageResponse, fetchDefaultSystemMessages] = useAsync(
    () => deskApi.fetchDefaultSystemMessages(pid, region),
    [pid, region],
  );

  useEffect(() => {
    fetchSystemMessages();
    fetchDefaultSystemMessages();
  }, [fetchDefaultSystemMessages, fetchSystemMessages]);

  useEffect(() => {
    setSystemMessages(fetchSystemMessageResponse.data?.data);
  }, [fetchSystemMessageResponse.data]);

  useErrorToast(fetchSystemMessageResponse.error);
  useErrorToast(fetchDefaultSystemMessageResponse.error);

  const activeTabIndex = useMemo(() => {
    if (location.pathname.startsWith(`${match?.url}/${TICKET_STATUS_TAB_URL}`)) {
      return 0;
    }
    if (location.pathname.startsWith(`${match?.url}/${TICKET_ASSIGNMENT_TAB_URL}`)) {
      return 1;
    }
    if (location.pathname.startsWith(`${match?.url}/${TICKET_PRIORITY_TAB_URL}`)) {
      return 2;
    }
    return 0;
  }, [match]);

  const handleTabClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          return history.push(`${match?.url}/${TICKET_ASSIGNMENT_TAB_URL}`);
        case 2:
          return history.push(`${match?.url}/${TICKET_PRIORITY_TAB_URL}`);
        case 0:
        default:
          return history.push(`${match?.url}/${TICKET_STATUS_TAB_URL}`);
      }
    },
    [history, match],
  );

  const handleSave = useCallback((result: UpdateSystemMessageResponse) => {
    setSystemMessages(result);
  }, []);

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.systemMessages.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Description>
          {intl.formatMessage({ id: 'desk.settings.systemMessages.desc' })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <TabMenu
        tabs={[
          {
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.tab.ticketStatus' }),
            value: 'ticketStatus',
          },
          {
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.tab.ticketAssignment' }),
            value: 'ticketAssignment',
          },
          {
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.tab.ticketPriority' }),
            value: 'ticketPriority',
          },
        ]}
        activeTab={activeTabIndex}
        handleTabClick={handleTabClick}
        hasBorder={false}
        css={`
          margin-bottom: 24px;
          padding: 0;
        `}
      />
      <Container>
        <Switch>
          <Route
            path={`${match?.url}/${TICKET_STATUS_TAB_URL}`}
            exact={true}
            render={() => (
              <TicketStatusSystemMessages
                defaultMessages={fetchDefaultSystemMessageResponse.data?.data}
                values={systemMessages}
                onSave={handleSave}
                disabled={
                  fetchDefaultSystemMessageResponse.status === 'loading' ||
                  fetchSystemMessageResponse.status === 'loading'
                }
              />
            )}
          />
          <Route
            path={`${match?.url}/${TICKET_ASSIGNMENT_TAB_URL}`}
            exact={true}
            render={() => (
              <TicketAssignmentSystemMessages
                defaultMessages={fetchDefaultSystemMessageResponse.data?.data}
                values={systemMessages}
                onSave={handleSave}
                disabled={
                  fetchDefaultSystemMessageResponse.status === 'loading' ||
                  fetchSystemMessageResponse.status === 'loading'
                }
              />
            )}
          />
          <Route
            path={`${match?.url}/${TICKET_PRIORITY_TAB_URL}`}
            exact={true}
            render={() => (
              <TicketPrioritySystemMessages
                defaultMessages={fetchDefaultSystemMessageResponse.data?.data}
                values={systemMessages}
                onSave={handleSave}
                disabled={
                  fetchDefaultSystemMessageResponse.status === 'loading' ||
                  fetchSystemMessageResponse.status === 'loading'
                }
              />
            )}
          />
          <Redirect to={`${match?.url}/${TICKET_STATUS_TAB_URL}`} />
        </Switch>
      </Container>
    </AppSettingsContainer>
  );
};
