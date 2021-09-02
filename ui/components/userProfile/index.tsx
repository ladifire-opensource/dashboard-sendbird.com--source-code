import { PureComponent } from 'react';

import styled from 'styled-components';

import { CLOUD_FRONT_URL } from '@constants';
import { StyledProps } from '@ui';
import { getRandomNumber, uuid } from '@utils';

import { Image } from '../image';

const UserProfileImage = styled.img<StyledProps>`
  ${(props) => props.styles};
`;

interface UserProfileProps {
  user: SDKUser;
  styles?: any;
}

export class UserProfile extends PureComponent<UserProfileProps> {
  private handleImageError = (e) => {
    e.target.src = `${CLOUD_FRONT_URL}/dashboard/icon-user-profile-0${getRandomNumber(
      this.props.user.nickname,
      4,
    )}.svg`;
  };

  public render() {
    const { user, styles } = this.props;

    if (user && user.profile_url) {
      return (
        <UserProfileImage styles={styles} src={user.profile_url} alt="Profile URL" onError={this.handleImageError} />
      );
    }
    return (
      <Image
        styles={styles}
        src={`${CLOUD_FRONT_URL}/dashboard/icon-user-profile-0${getRandomNumber(user ? user.nickname : uuid(), 4)}.svg`}
        alt="Default Profile"
      />
    );
  }
}
