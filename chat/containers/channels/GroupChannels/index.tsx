import { FC } from 'react';
import { Switch, Route, useRouteMatch, RouteComponentProps } from 'react-router-dom';

import styled from 'styled-components';

import UserProfilePopupContextProvider from '@chat/components/UserProfilePopup/UserProfilePopupContextProvider';
import GroupChannelDetail from '@chat/containers/moderationTools/groupChannels/GroupChannelDetail';

import { ContractedChannelList } from '../ContractedChannelList';
import { ChannelListContextsProvider } from '../hooks/useChannelList';
import { GroupChannelList } from './GroupChannelList';

const StyledModerationTools = styled.div`
  display: flex;
  min-width: 960px;
  height: 100%;
`;

export const GroupChannels: FC = () => {
  const match = useRouteMatch();

  const renderContracted = ({ match }: RouteComponentProps<{ channelUrl: string }>) => {
    const { channelUrl } = match.params;
    return (
      <StyledModerationTools>
        <ContractedChannelList />
        <UserProfilePopupContextProvider channelType="group_channels" channelUrl={channelUrl}>
          {/* Reset internal states when channelUrl changes */}
          <GroupChannelDetail key={channelUrl} channelUrl={channelUrl} />
        </UserProfilePopupContextProvider>
      </StyledModerationTools>
    );
  };

  if (match == null) {
    return null;
  }

  return (
    <ChannelListContextsProvider channelType="group_channels">
      <Switch>
        <Route path={`${match.url}/:channelUrl/:messageId`} render={renderContracted} />
        <Route path={`${match.url}/:channelUrl`} render={renderContracted} />
        <Route path={`${match.url}`} component={GroupChannelList} />
      </Switch>
    </ChannelListContextsProvider>
  );
};
