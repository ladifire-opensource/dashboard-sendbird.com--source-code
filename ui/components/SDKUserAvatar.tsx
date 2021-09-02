import { FC, ComponentProps, memo } from 'react';

import styled from 'styled-components';

import { Avatar, AvatarType } from 'feather';

type Props = Omit<ComponentProps<typeof Avatar>, 'type' | 'profileID'> & { userID: string };

const SDKUserAvatarStyleable: FC<Props> = memo(({ userID, ...props }) => (
  <Avatar type={AvatarType.User} profileID={userID} {...props} />
));

export const SDKUserAvatar = styled(SDKUserAvatarStyleable)``;
