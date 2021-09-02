import styled from 'styled-components';

import { Avatar } from 'feather';

import { DeskAvatarType } from '@constants';

const DeskBotAvatar = styled(Avatar).attrs({ type: DeskAvatarType.Bot })`
  // FIXME: Why do we need this?
  margin-left: 0 !important;
`;

export default DeskBotAvatar;
