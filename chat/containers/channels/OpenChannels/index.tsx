import { FC } from 'react';
import { Switch, Route, RouteComponentProps, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import OpenChannelDetail from '@chat/containers/moderationTools/openChannels/OpenChannelDetail';

import { ContractedChannelList } from '../ContractedChannelList';
import { ChannelListContextsProvider } from '../hooks/useChannelList';
import { OpenChannelList } from './OpenChannelList';

const StyledModerationTools = styled.div`
  display: flex;
  min-width: 960px;
  height: 100%;
`;

export const OpenChannels: FC = () => {
  const match = useRouteMatch();

  const renderContracted = ({ match }: RouteComponentProps<{ channelUrl: string }>) => {
    const { channelUrl } = match.params;
    return (
      <StyledModerationTools>
        <ContractedChannelList />
        {/* Reset internal states when channelUrl changes */}
        <OpenChannelDetail key={channelUrl} channelUrl={channelUrl} />
      </StyledModerationTools>
    );
  };

  if (match == null) {
    return null;
  }

  return (
    <ChannelListContextsProvider channelType="open_channels">
      <Switch>
        <Route path={`${match.url}/:channelUrl`} render={renderContracted} />
        <Route path={`${match.url}`} component={OpenChannelList} />
      </Switch>
    </ChannelListContextsProvider>
  );
};
