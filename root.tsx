import React, { FC, lazy, Suspense, useContext, useEffect, useMemo } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { ConnectedRouter } from 'connected-react-router';
import 'element-scroll-polyfill';
import isEmpty from 'lodash/isEmpty';
import * as Mousetrap from 'mousetrap';
import { compose } from 'redux';

import { commonActions } from '@actions';
import { AuthenticationProvider } from '@authentication';
import { CallsVoucherProvider } from '@common/containers/CallsVoucherContext';
import {
  CurrentChatSubscriptionProvider,
  useCurrentChatSubscription,
} from '@common/containers/CurrentChatSubscriptionProvider';
import { FullScreenModals } from '@common/containers/FullScreenModals';
import { Auth } from '@common/containers/auth';
import { SignInWithSso } from '@common/containers/auth/signInWithSso';
import { Dialogs } from '@common/containers/dialogs';
import { ImagePreview } from '@common/containers/imagePreview';
import { NavigationLayout } from '@common/containers/layout';
import { useOrganization, useShallowEqualSelector } from '@hooks';
import '@stripe/stripe-js';
import { SpinnerFull } from '@ui/components';
import { FullScreenModalContextProvider } from '@ui/components/FullScreenModal/context';
import { DrawerContextProvider } from '@ui/components/drawer';
import { GlobalStyles } from '@ui/styles';

import { SubscriptionInfoContextProvider } from './SubscriptionInfoContext';
import { SupportPlanContext, SupportPlanContextProvider } from './SupportPlanContext';
import { history } from './sbHistory';

const Account = lazy(() => import('@common/containers/account'));
const Home = lazy(() => import('@common/containers/home'));
const OrganizationStatusScreen = lazy(() => import('@common/containers/home/OrganizationStatusScreen'));
const Settings = lazy(() => import('@common/containers/settings'));
const App = lazy(() => import('@core/containers/app'));

type RouteProps = {
  component: any;
  path?: string;
  exact?: boolean;
};

const AuthenticatedRoute: React.SFC<RouteProps> = (props) => {
  const { component: Component, ...rest } = props;
  const renderComponent = (matchProps: RouteComponentProps) => (
    <AuthenticationProvider>
      <NavigationLayout>
        <Component {...matchProps} />
      </NavigationLayout>
    </AuthenticationProvider>
  );
  return <Route {...rest} render={renderComponent} />;
};

const mapStateToProps = (state: RootState) => ({
  isDialogVisible: !!state.dialogs.dialogTypes,
  isImagePreviewVisible: state.imagePreview.images.length > 0,
});

const mapDispatchToProps = {
  pushHistory: commonActions.pushHistory,
  showDialogsRequest: commonActions.showDialogsRequest,
  hideDialogsRequest: commonActions.hideDialogsRequest,
  hideImagePreviewRequest: commonActions.hideImagePreviewRequest,
};

type Props = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps> & WrappedComponentProps;

// Pendo Initialize
const PendoInitializer: FC = () => {
  const { is_self_serve: isOrgV2 } = useOrganization();
  const { email, first_name, last_name, country_name, role } = useShallowEqualSelector(({ auth }) => {
    const {
      user: { email, first_name, last_name, country_name },
      role: { name: role },
    } = auth;
    return {
      email,
      first_name,
      last_name,
      country_name,
      role,
    };
  });
  const { uid, name, created_at } = useShallowEqualSelector(({ organizations }) => {
    const { current: organization } = organizations;
    const safeOrganization = isEmpty(organization) ? null : organization;
    return {
      uid: safeOrganization?.uid ?? '',
      name: safeOrganization?.name ?? '',
      created_at: safeOrganization?.created_at ?? '',
    };
  });

  const { isLoaded: isSupportPlanLoaded, current: supportData } = useContext(SupportPlanContext); // supportData can be null
  const { isLoaded: isOrgV2SubscriptionLoaded, currentSubscription: orgV2AccountInfo } = useCurrentChatSubscription();

  const skipPendo = useMemo(
    () => email === '' || !isSupportPlanLoaded || (isOrgV2 ? !isOrgV2SubscriptionLoaded : false),
    [email, isSupportPlanLoaded, isOrgV2, isOrgV2SubscriptionLoaded],
  );

  useEffect(() => {
    if (window.pendo == null || skipPendo) {
      return;
    }
    const options = {
      visitor: { id: email, first_name, last_name, country_name, role },
      account: {
        id: uid,
        name,
        created_at,
        customer_type: orgV2AccountInfo?.subscription_type ?? '',
        subscription_name: orgV2AccountInfo?.subscription_name ?? '',
        subscription_value: orgV2AccountInfo?.plan_value ?? '',
        support_type: supportData?.display_name ?? '',
        support_value: supportData?.plan_value ?? 0,
      },
    };

    // `pendo.getVisitorId` would be undefined before the script is loaded,
    const isAnonymousVisitor =
      typeof window.pendo.getVisitorId?.() === 'string' && window.pendo.getVisitorId().match(/^_PENDO_T_[\w^@]+$/);

    if (isAnonymousVisitor) {
      window.pendo.initialize(options);
    } else {
      // Visitor ID is not an auto-generated one by Pendo. Assuming it's an email, we need to call pendo.identify.
      window.pendo.identify(options);
    }
  }, [
    skipPendo,
    email,
    first_name,
    last_name,
    country_name,
    role,
    uid,
    name,
    created_at,
    orgV2AccountInfo,
    supportData,
  ]);

  return null;
};

class Root extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    window.intl = props.intl;
  }

  componentDidMount() {
    Mousetrap.bind('esc', () => {
      if (this.props.isDialogVisible) {
        this.props.hideDialogsRequest();
      }
      if (this.props.isImagePreviewVisible) {
        this.props.hideImagePreviewRequest();
      }
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.intl.locale !== this.props.intl.locale) {
      window.intl = this.props.intl;
    }
  }

  public render() {
    return (
      <CurrentChatSubscriptionProvider>
        <SubscriptionInfoContextProvider>
          <SupportPlanContextProvider>
            <CallsVoucherProvider>
              <FullScreenModalContextProvider>
                <DrawerContextProvider>
                  <ConnectedRouter history={history}>
                    {window.pendo && <PendoInitializer />}
                    <Switch>
                      <Route path="/auth" component={Auth} />
                      <Route path="/sso" component={SignInWithSso} />
                      <Route
                        render={() => (
                          <Suspense
                            fallback={
                              <NavigationLayout>
                                <SpinnerFull />
                              </NavigationLayout>
                            }
                          >
                            <Switch>
                              <AuthenticatedRoute path="/account" component={Account} />
                              <AuthenticatedRoute path="/settings" component={Settings} />
                              <AuthenticatedRoute path="/deactivated" component={OrganizationStatusScreen} />
                              <AuthenticatedRoute exact={true} path="/" component={Home} />
                              <AuthenticatedRoute path="/:appId" component={App} />
                            </Switch>
                          </Suspense>
                        )}
                      />
                    </Switch>
                    <FullScreenModals />
                    <Dialogs />
                    <ImagePreview />
                  </ConnectedRouter>
                  <GlobalStyles />
                </DrawerContextProvider>
              </FullScreenModalContextProvider>
            </CallsVoucherProvider>
          </SupportPlanContextProvider>
        </SubscriptionInfoContextProvider>
      </CurrentChatSubscriptionProvider>
    );
  }
}

const RootConnected = compose(connect(mapStateToProps, mapDispatchToProps), injectIntl)(Root);

export default RootConnected;
