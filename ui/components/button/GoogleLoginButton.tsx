import { FC, useCallback } from 'react';

import { Icon } from 'feather';

import { getGoogleAuthURL } from '@api';
import { SocialLoginWrapper, SocialLoginButton, SocialLoginButtonText } from '@common/containers/auth/components';
import { useNextParameter } from '@hooks/useNextParameter';

export const GoogleLoginButton: FC = () => {
  const next = useNextParameter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.location.href = getGoogleAuthURL(next === '' ? {} : JSON.stringify({ next }));
    },
    [next],
  );

  return (
    <SocialLoginWrapper>
      <SocialLoginButton
        type="button"
        id="social_login_google"
        key="social_login_google"
        buttonType="tertiary"
        size="large"
        onClick={handleClick}
        data-test-id="GoogleButton"
      >
        <Icon icon="google-colored" size={24} />
        <SocialLoginButtonText>Continue with Google</SocialLoginButtonText>
      </SocialLoginButton>
    </SocialLoginWrapper>
  );
};
