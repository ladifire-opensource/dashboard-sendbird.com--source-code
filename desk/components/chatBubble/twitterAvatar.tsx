import styled from 'styled-components';

import { Icon } from 'feather';

const TWITTER_COLOR = '#1DA1F2';

const TwitterAvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  background: ${TWITTER_COLOR};
`;

const twitterAvatar = (
  <TwitterAvatarContainer role="img">
    <Icon icon="twitter" size={20} color="white" />
  </TwitterAvatarContainer>
);

export default twitterAvatar;
