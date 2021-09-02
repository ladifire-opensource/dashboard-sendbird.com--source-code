import { FC, lazy, Suspense, useCallback, useContext, useEffect, useRef } from 'react';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import { LeftNavigationBar, ScrollBar, ScrollBarRef, transitionDefault } from 'feather';
import moment from 'moment-timezone';

import { useAuthentication } from '@authentication';
import { AuthorizeDeskRoute } from '@authorization';
import { CallWidgetAppProvider } from '@calls/containers/widget/widgetAppContext';
import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { NoPlanError } from '@common/containers/NoPlanError';
import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION, Page } from '@constants';
import { Desk } from '@desk/containers';
import {
  useAuthorization,
  useCanEnterApplication,
  useIsCallsStudioEnabled,
  useShallowEqualSelector,
  useTypedSelector,
} from '@hooks';
import { ZIndexes } from '@ui';
import { SpinnerFull } from '@ui/components';

import { SettingsGlobalContextProvider } from '../useSettingsGlobal';
import { LNBContext, useLNBContext } from './lnbContext';
import { useAuthorizedRoutes } from './useAuthorizedRoutes';
import { useConnectSendbird } from './useConnectSendbird';
import { useDesktopNotification } from './useDesktopNotification';
import { useLNBItems } from './useLNBItems';

const CallWidget = lazy(() => import('@calls/containers/widget'));

const Container = styled.div`
  height: 100%;
  transition: padding-left ${LeftNavigationBar.collapseAnimationDurationSecond}s ${transitionDefault};
`;

const LNB = styled(LeftNavigationBar)<{ top: number }>`
  position: absolute;
  z-index: ${ZIndexes.navigation};
  top: ${(props) => props.top}px;
  bottom: 0;
  left: 0;
  transition: top ${EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION}s,
    width ${LeftNavigationBar.collapseAnimationDurationSecond}s;
  transition-timing-function: ${transitionDefault};
`;

const ContentScrollBar = styled(ScrollBar)`
  width: 100%;
  height: 100%;
  background: white;
`;

const NoPlanErrorWrapper: FC = () => (
  <div
    css={`
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      min-height: 424px;
    `}
  >
    <NoPlanError
      css={`
        margin-bottom: 96px;
      `}
    />
  </div>
);

const App: FC = () => {
  const match = useRouteMatch();
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentScrollBarRef = useRef<ScrollBarRef>(null);
  const { authenticated } = useAuthentication();
  const { isPermitted, isAccessiblePage } = useAuthorization();

  const { menuItems, activeItemKey } = useShallowEqualSelector((state) => {
    const { menuItems, activeItemKey } = state.lnb;
    return { menuItems, activeItemKey };
  });
  const application = useTypedSelector((state) => state.applicationState.data);
  const lnbContextValue = useLNBContext();
  const {
    isCollapsed: isLNBCollapsed,
    setIsCollapsed: setIsLNBCollapsed,
    isForceCollapsed: isLNBForceCollapsed,
  } = lnbContextValue;

  const isLNBHidden = isPermitted(['desk.agent']) && !isPermitted(['desk.admin']);
  const { routes: authorizedRoutes, fallbackRoutePath } = useAuthorizedRoutes(match?.url ?? '');
  const gnbHeight = useContext(GNBHeightContext);
  const isCallWidgetVisible = useIsCallsStudioEnabled();
  const { isFreeTrialMissing } = useCurrentChatSubscription();
  const canEnterApplication = useCanEnterApplication();
  const lnbWidth = (() => {
    if (isLNBHidden) {
      return 0;
    }
    return isLNBCollapsed ? LeftNavigationBar.collapsedWidth : LeftNavigationBar.defaultWidth;
  })();

  useLNBItems();
  useConnectSendbird();
  useDesktopNotification();

  useEffect(() => {
    // initialize default tz using guess
    moment.tz.setDefault(moment.tz.guess());
  }, []);

  useEffect(() => {
    contentScrollBarRef?.current?.scrollTo(0, 0);
  }, [history.location.pathname]);

  const onContentTransitionEnd = useCallback((event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.currentTarget) {
      event.currentTarget.style.willChange = 'auto';
    }
  }, []);

  const onExpandCollapseButtonClick = useCallback(
    (isCollapsed: boolean) => {
      if (containerRef.current) {
        containerRef.current.style.willChange = 'padding-left';
      }
      setIsLNBCollapsed(isCollapsed);
    },
    [setIsLNBCollapsed],
  );

  if (!canEnterApplication) {
    return <Redirect to="/" />;
  }

  return authenticated && application && application.app_id ? (
    <LNBContext.Provider value={lnbContextValue}>
      <SettingsGlobalContextProvider>
        <CallWidgetAppProvider>
          <Container
            ref={containerRef}
            onTransitionEnd={onContentTransitionEnd}
            css={`
              padding-left: ${lnbWidth}px;
            `}
          >
            {isFreeTrialMissing ? (
              <NoPlanErrorWrapper />
            ) : (
              <ContentScrollBar ref={contentScrollBarRef}>
                <Switch>
                  {authorizedRoutes}
                  <AuthorizeDeskRoute path={`${match?.url}/desk`} component={Desk} history={history} />
                  <Route
                    path={match?.url}
                    render={() => {
                      if (!isAccessiblePage(Page.application) && isPermitted(['desk.admin', 'desk.agent'])) {
                        return <Redirect to={`${match?.url}/desk`} />;
                      }
                      if (fallbackRoutePath) {
                        return <Redirect to={fallbackRoutePath} />;
                      }
                      return <Redirect to="/" />;
                    }}
                  />
                </Switch>
              </ContentScrollBar>
            )}
            {!isLNBHidden && (
              <LNB
                data-test-id="LNB"
                top={gnbHeight}
                items={menuItems}
                activeKey={activeItemKey}
                isCollapsed={isLNBCollapsed}
                onExpandCollapseButtonClick={onExpandCollapseButtonClick}
                isExpandCollapseButtonHidden={isLNBForceCollapsed}
              />
            )}
            {isCallWidgetVisible && (
              <Suspense fallback={null}>
                <CallWidget />
              </Suspense>
            )}
          </Container>
        </CallWidgetAppProvider>
      </SettingsGlobalContextProvider>
    </LNBContext.Provider>
  ) : (
    <SpinnerFull />
  );
};

export default App;
