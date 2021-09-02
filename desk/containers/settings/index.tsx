import React from 'react';
import { Switch, Route, Redirect, match } from 'react-router-dom';

import { AuthorizeRoute } from '@authorization';
import { useDeskAuth } from '@authorization/useDeskAuth';
import { AppSettingsLayout } from '@common/containers/layout';
import { PredefinedRoles } from '@constants';
import { useShallowEqualSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';

import { Bots } from './Bots';
import { BotDetail } from './Bots/BotDetail';
import { BotWebhookLogsSidebar } from './Bots/BotWebhookLogsSidebar';
import { Security } from './Security';
import { TicketRule } from './TicketRule';
import { TicketTags } from './TicketTags';
import { AgentGroups } from './agentGroups';
import { AgentGroupsDetail } from './agentGroups/AgentGroupsDetail';
import { Automation } from './automation';
import { Credentials } from './credentials';
import { CustomerFields } from './customerFields';
import { CustomerFieldDetail } from './customerFields/customerFieldDetail';
import { GeneralSettings } from './general';
import { Integration } from './integration';
import { QuickReplies } from './quickReplies';
import { QuickRepliesDetail } from './quickReplies/quickRepliesDetail';
import { SystemMessages } from './systemMessages';
import { TicketFields } from './ticketFields';
import { TicketFieldDetail } from './ticketFields/ticketFieldDetail';
import { TriggersSettings } from './triggers';
import { Webhooks } from './webhooks';

type Props = {
  match: match;
};

export const DeskSettings: React.FC<Props> = ({ match }) => {
  useDeskAuth();
  const { isDeskConnected, isDeskAuthenticated } = useShallowEqualSelector((state) => {
    return {
      isDeskConnected: state.desk.connected,
      isDeskAuthenticated: state.desk.authenticated,
    };
  });

  return (
    <AppSettingsLayout
      preventScrollToTopPages={[`${match.url}/assignment_rules`, `${match.url}/priority_rules`]}
      css={`
        height: 100%;
      `}
    >
      {({ setUnsaved }) => {
        if (!isDeskAuthenticated) {
          return <SpinnerFull transparent={true} />;
        }
        return (
          <>
            <Switch>
              <Route
                path={`${match.url}/general`}
                render={(routeProps) => <GeneralSettings setUnsaved={setUnsaved} {...routeProps} />}
              />
              <Route
                path={`${match.url}/automation`}
                render={(routeProps) => <Automation setUnsaved={setUnsaved} {...routeProps} />}
              />
              <Route
                path={`${match.url}/triggers`}
                render={(routeProps) => <TriggersSettings setUnsaved={setUnsaved} {...routeProps} />}
              />
              <Route exact={true} path={`${match.url}/bots`} component={Bots} />
              <Route exact={true} path={`${match.url}/bots/create`} component={BotDetail} />
              <Route exact={true} path={`${match.url}/bots/:botId/edit`} component={BotDetail} />
              <Route exact={true} path={`${match.url}/bots/:botId/duplicate`} component={BotDetail} />
              <Route path={`${match.url}/system_messages`} component={SystemMessages} />
              <Route path={`${match.url}/assignment_rules`} component={TicketRule} />
              <Route path={`${match.url}/priority_rules`} component={TicketRule} />
              <Route exact={true} path={`${match.url}/quick-replies`} component={QuickReplies} />
              <Route exact={true} path={`${match.url}/quick-replies/create`} component={QuickRepliesDetail} />
              <Route
                exact={true}
                path={`${match.url}/quick-replies/:quickReplyId/edit`}
                component={QuickRepliesDetail}
              />
              <Route
                exact={true}
                path={`${match.url}/quick-replies/:duplicateQuickReplyId/duplicate`}
                component={QuickRepliesDetail}
              />
              <Route path={`${match.url}/tags`} component={TicketTags} />
              <Route exact={true} path={`${match.url}/teams`} component={AgentGroups} />
              <Route exact={true} path={`${match.url}/teams/form`} component={AgentGroupsDetail} />
              <Route path={`${match.url}/teams/form/:id`} component={AgentGroupsDetail} />
              <Route path={`${match.url}/customer-fields`} exact={true} component={CustomerFields} />
              <Route path={`${match.url}/customer-fields/create`} exact={true} component={CustomerFieldDetail} />
              <Route path={`${match.url}/customer-fields/:fieldId`} exact={true} component={CustomerFieldDetail} />
              <Route path={`${match.url}/ticket-fields`} exact={true} component={TicketFields} />
              <Route path={`${match.url}/ticket-fields/create`} exact={true} component={TicketFieldDetail} />
              <Route path={`${match.url}/ticket-fields/:fieldId`} exact={true} component={TicketFieldDetail} />
              <AuthorizeRoute
                path={`${match.url}/security`}
                allowedPredefinedRoles={[PredefinedRoles.OWNER]}
                component={Security}
              />
              <Route path={`${match.url}/credentials`} component={Credentials} />
              <Route path={`${match.url}/webhooks`} component={Webhooks} />
              <Route path={`${match.url}/integration`} component={Integration} />
              <Redirect to={`${match.url}/general`} />
            </Switch>
            {!isDeskConnected && <SpinnerFull transparent={true} />}
            <BotWebhookLogsSidebar />
          </>
        );
      }}
    </AppSettingsLayout>
  );
};
