import { Switch, Route } from 'react-router-dom';

import styled from 'styled-components';

import { ProveGreenLantern } from './ProveGreenLantern';
import { ResetPassword } from './ResetPassword';
import { SignIn } from './SignIn';
import { TwoFactorAuthentication } from './TwoFactorAuthentication';
import { TwoFactorRegistration } from './TwoFactorRegistration';
import { ConfirmEmailChange } from './confirmEmail';
import { ForgotPassword } from './forgotPassword';
import { OAuthGoogle } from './oauthGoogle';
import { SignInWithSso } from './signInWithSso';
import { SignOut } from './signOut';
import { SignUp } from './signUp';
import { TwitterCallback } from './twitterCallback';
import { TwoFactorRecovery } from './twoFactorRecovery';
import { VerifyEmail } from './verifyEmail';

const StyledAuth = styled.div``;

export const Auth = ({ match }) => {
  return (
    <StyledAuth id="id_page_auth">
      <Switch>
        <Route path={`${match.url}/signin`} component={SignIn} />
        <Route path={`${match.url}/sso`} component={SignInWithSso} />
        <Route path={`${match.url}/signout`} component={SignOut} />
        <Route path={`${match.url}/signup`} component={SignUp} />
        <Route path={`${match.url}/forgot`} component={ForgotPassword} />
        <Route path={`${match.url}/reset`} component={ResetPassword} />
        <Route path={`${match.url}/google`} component={OAuthGoogle} />
        <Route path={`${match.url}/two_factor`} component={TwoFactorAuthentication} />
        <Route path={`${match.url}/two_factor_registration`} component={TwoFactorRegistration} />
        <Route path={`${match.url}/two_factor_recovery`} component={TwoFactorRecovery} />
        <Route path={`${match.url}/greenlantern`} component={ProveGreenLantern} />
        <Route path={`${match.url}/verify_email`} component={VerifyEmail} />
        <Route path={`${match.url}/change_email`} component={ConfirmEmailChange} />
        <Route path={`${match.url}/twitter_callback`} component={TwitterCallback} />
      </Switch>
    </StyledAuth>
  );
};
