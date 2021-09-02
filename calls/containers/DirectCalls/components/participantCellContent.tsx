import { FC } from 'react';

import styled from 'styled-components';

import { SDKUserAvatar } from '@ui/components';

type Props = {
  user: DirectCallParticipant;
};

const Container = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: auto 1fr;
  grid-gap: 8px;
`;

const ParticipantUserID = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ParticipantCellContent: FC<Props> = ({ user: { user_id, profile_url } }) => {
  return (
    <Container>
      <SDKUserAvatar key={user_id} userID={user_id} size={20} imageUrl={profile_url} />
      <ParticipantUserID>{user_id}</ParticipantUserID>
    </Container>
  );
};
