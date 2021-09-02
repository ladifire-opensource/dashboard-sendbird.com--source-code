import { ComponentProps, forwardRef, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, elevation, Headings, Icon, transitionDefault } from 'feather';

import { useAppId, useShallowEqualSelector } from '@hooks';
import { ZIndexes } from '@ui';

import { initSound, onLoadedHandler } from './js/widget';
import { useCallWidgetAppUpdater } from './widgetAppContext';

type WidgetPage = 'index' | 'login_view' | 'dial_view' | 'call_view';

const WidgetContainer = styled.div`
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: ${ZIndexes.callsWidget};
`;

const WidgetIconWrapper = styled.div<{ isHidden: boolean }>`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 0;

  display: ${(props) => (props.isHidden ? 'none' : 'flex')};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${cssVariables('purple-7')};
  border-radius: 28px;
  border-bottom-right-radius: 0;
  height: 48px;
  padding-left: 16px;
  padding-right: 16px;
  white-space: nowrap;
  cursor: pointer;
  transform-origin: right bottom;
  transition: 0.2s margin-bottom ${transitionDefault};

  ${Headings['heading-01']}
  color: white;
  ${elevation.modal}

  ${WidgetContainer}:not([data-is-loaded="true"]) & {
    display: none;
  }
`;

const useSoundEffect = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleClick = () => {
      if (initSound()) {
        isInitialized.current = true;
        document.removeEventListener('click', handleClick);
      }
    };

    document.addEventListener('click', handleClick);
  }, []);
};

const WidgetIcon = forwardRef<HTMLDivElement, ComponentProps<typeof WidgetIconWrapper>>((props, ref) => {
  const intl = useIntl();
  return (
    <WidgetIconWrapper ref={ref} {...props}>
      <Icon icon="call-filled" size={16} color="#FFFFFF" css="margin-right: 8px;" />
      {intl.messages['calls.widget_lbl.collapsedLabel']}
    </WidgetIconWrapper>
  );
});

const CallWidget = () => {
  const appId = useAppId();
  const { pathname } = useLocation();
  const isOutsideCalls = !pathname.startsWith(`/${appId}/calls`);
  const isOnDirectCalls = pathname.replace(/\/$/, '') === `/${appId}/calls/direct-calls`;
  const isOnGroupCalls = pathname.startsWith(`/${appId}/calls/group-calls`);

  const [currentPage, setCurrentPage] = useState<WidgetPage>('index');
  const [isMainAppOpen, setIsMainAppOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { userId, accessToken, isUserActive, nickname, profileUrl } = useShallowEqualSelector((state) => {
    const {
      user_id: userId = '',
      access_token: accessToken = '',
      is_active: isUserActive = false,
      nickname,
      profile_url: profileUrl,
    } = state.moderations.sdkUser || {};
    return { userId, accessToken, isUserActive, nickname, profileUrl };
  });

  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIconRef = useRef<HTMLDivElement>(null);
  const updateWidgetApp = useCallWidgetAppUpdater();

  const { current: widgetContainerElement } = widgetContainerRef;
  const { current: widgetIconElement } = widgetIconRef;

  useEffect(() => {
    let newWidgetApp;
    if (widgetContainerElement && widgetIconElement && appId && userId && isUserActive) {
      newWidgetApp = onLoadedHandler({
        appId,
        userId,
        // we have to pass the access token if it's already issued.
        isAccessTokenNeeded: !!accessToken,
        accessToken,
        icon: widgetIconElement,
      });

      newWidgetApp.onPageChange = (pageName) => {
        setCurrentPage(pageName);
      };

      newWidgetApp.onMainAppOpened = () => {
        setIsMainAppOpen(true);
      };

      newWidgetApp.onMainAppClosed = () => {
        setIsMainAppOpen(false);
      };

      newWidgetApp.onLoginSuccess = () => {
        setIsLoggedIn(true);
      };

      newWidgetApp.onLoginFailure = () => {
        setIsLoggedIn(false);
      };

      updateWidgetApp(newWidgetApp);

      // data-is-loaded attribute is used to hide the widget container before the widget is loaded.
      widgetContainerElement.setAttribute('data-is-loaded', 'true');
    }

    return () => {
      // If widget container elements or user, application is updated, clear the current widget and load a new one.
      newWidgetApp?.closeWidget();
      if (widgetContainerElement) {
        widgetContainerElement.setAttribute('data-is-loaded', 'false');
        widgetContainerElement.innerHTML = '';
      }
    };
  }, [
    accessToken,
    appId,
    isUserActive,
    updateWidgetApp,
    widgetContainerElement,
    widgetIconElement,
    userId,
    nickname,
    profileUrl,
  ]);

  useSoundEffect();

  return (
    <>
      <WidgetContainer id="widget" ref={widgetContainerRef} />
      <WidgetIcon
        id="widgetIcon"
        data-test-id="WidgetIcon"
        ref={widgetIconRef}
        // When the current page is call_view, we have to keep the widget icon visible to let the user to navigate back
        // to dial_view. Users will only be able to receive a call when they're on dial_view.
        isHidden={!isLoggedIn || isMainAppOpen || (isOutsideCalls && currentPage !== 'call_view')}
        css={`
          ${(isOnDirectCalls || isOnGroupCalls) && 'margin-bottom: 48px;'}
        `}
      />
    </>
  );
};

export default CallWidget;
