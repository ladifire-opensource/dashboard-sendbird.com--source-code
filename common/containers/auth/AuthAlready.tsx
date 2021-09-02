import { useIntl } from 'react-intl';

import { triggerGAEvent } from '@utils';

import { AuthBoxAlready, AuthBoxAlreadyText, AuthBoxAlreadyLink } from './components';

export const AuthAlready = ({ isSigningUp = false }) => {
  const intl = useIntl();
  const onSignUpLinkClick = () => {
    triggerGAEvent({ category: 'sign up cta', action: 'click', label: 'navigation' });
  };
  return (
    <AuthBoxAlready>
      {isSigningUp ? (
        <>
          <AuthBoxAlreadyText>
            {intl.formatMessage({ id: 'common.authentication.label.alreadyHave' })}
          </AuthBoxAlreadyText>
          <AuthBoxAlreadyLink useReactRouter={true} href="/auth/signin">
            {intl.formatMessage({ id: 'common.authentication.button.signin' })}
          </AuthBoxAlreadyLink>
        </>
      ) : (
        <>
          <AuthBoxAlreadyText>{intl.formatMessage({ id: 'common.authentication.label.dontHave' })}</AuthBoxAlreadyText>
          <AuthBoxAlreadyLink useReactRouter={true} href="/auth/signup" onClick={onSignUpLinkClick}>
            {intl.formatMessage({ id: 'common.authentication.button.signup' })}
          </AuthBoxAlreadyLink>
        </>
      )}
    </AuthBoxAlready>
  );
};
