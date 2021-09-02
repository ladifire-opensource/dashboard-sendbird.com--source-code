import styled from 'styled-components';

import { Avatar } from 'feather';

import { DeskAvatarType } from '@constants';

const DeskCustomerAvatar = styled(Avatar).attrs({ type: DeskAvatarType.Customer })``;

export default DeskCustomerAvatar;
