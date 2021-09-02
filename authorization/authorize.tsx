import React from 'react';
import { useIntl } from 'react-intl';
import { RouteProps, RouteComponentProps, Route } from 'react-router-dom';

import { toast, SpinnerFull } from 'feather';

import { AllPremiumFeatures } from '@constants';
import { useAuthorization } from '@hooks';
import { LimitedAccess } from '@ui/components/limitedAccess';

interface AuthorizeProps {
  allowedPermissions?: PermissionKey[];
  allowedPredefinedRoles?: string[];
  renderLimitedAccess?: boolean;
  premiumFeature?: AllPremiumFeatures;
  backHistory: () => void;
}

export const Authorize: React.FC<AuthorizeProps> = ({
  allowedPermissions = [],
  allowedPredefinedRoles = [],
  renderLimitedAccess = true,
  premiumFeature = '',
  backHistory,
  children,
}) => {
  const intl = useIntl();
  const { isPermitted, isFeatureEnabled, preparingFeatures, role } = useAuthorization();

  /**
   * Preparing enabledFeatures
   */
  if (preparingFeatures) {
    return <SpinnerFull />;
  }

  /**
   * Check feature enabled first
   */
  if (premiumFeature !== '' && !isFeatureEnabled(premiumFeature)) {
    return <LimitedAccess />;
  }

  // User has allowed role or allowed permissions
  if (allowedPredefinedRoles.includes(role.name) || isPermitted(allowedPermissions)) {
    return <>{children}</>;
  }
  /**
   * User has not been permitted to access
   */
  if (renderLimitedAccess) {
    return <LimitedAccess />;
  }
  /**
   * When route dosen't use LimtedAccess component to render
   */
  toast.warning({
    message: intl.formatMessage({ id: 'common.authorize_toastMessage.notAllowed' }),
  });
  backHistory();
  return null;
};

export const AuthorizeRoute: React.FC<
  { component: any } & RouteProps &
    Pick<AuthorizeProps, 'allowedPermissions' | 'allowedPredefinedRoles' | 'renderLimitedAccess' | 'premiumFeature'>
> = ({
  component: Component,
  allowedPermissions = [],
  allowedPredefinedRoles = [],
  renderLimitedAccess = true,
  premiumFeature = '',
  ...rest
}) => {
  const backHistory = (history) => () => {
    history.goBack();
  };
  const renderComponent = (matchProps: RouteComponentProps) => {
    return (
      <Authorize
        allowedPermissions={allowedPermissions}
        allowedPredefinedRoles={allowedPredefinedRoles}
        renderLimitedAccess={renderLimitedAccess}
        premiumFeature={premiumFeature}
        backHistory={backHistory(matchProps.history)}
      >
        <Component {...matchProps} />
      </Authorize>
    );
  };
  return <Route {...rest} render={renderComponent} />;
};

export const AuthorizeDeskRoute: React.FC<
  { component: any } & RouteProps & {
      history: RouteComponentProps['history'];
    }
> = ({ component, history, ...rest }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  if (isPermitted(['desk.admin', 'desk.agent'])) {
    return <Route {...rest} component={component} />;
  }
  toast.warning({
    message: intl.formatMessage({ id: 'common.authorize_toastMessage.notAllowedToDesk' }),
  });
  history.goBack();
  return null;
};
