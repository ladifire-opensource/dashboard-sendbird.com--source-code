import { forwardRef, memo, useCallback, useMemo, useState, useContext, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, IconButton, transitionDefault, Spinner, Icon, Button, Subtitles, shadow } from 'feather';

import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { IFRAME_SIDEBAR_STATE, DEFAULT_IFRAME_WIDTH } from '@constants';
import { useIframeApp } from '@hooks';
import { ZIndexes } from '@ui';
import { logException, ClientStorage } from '@utils';

import { IframeLayoutContext } from '../DeskChatLayout';

const COLLAPSED_WIDTH = 24;

export enum IframeSidebarState {
  COLLAPSED = 'collapsed',
  EXPANDED = 'expanded',
}

const IframeContainer = styled.div`
  grid-row: ticket-list-top / bottom;
  background: white;
  border-top: 1px solid ${cssVariables('neutral-3')};
  transition: border-width 0.2s ${transitionDefault}, opacity 0.2s ${transitionDefault};
  will-change: border-width, opacity;
  overflow: hidden;
`;
const IframePlaceholder = styled.div`
  display: grid;
  width: ${COLLAPSED_WIDTH}px;
  grid-row: ticket-list-top / bottom;
`;

const HeaderTitle = styled.span`
  color: ${cssVariables('neutral-10')};
  font-size: 14px;
  font-weight: 600;

  transition: width 0.2s ${transitionDefault}, opacity 0.2s ${transitionDefault};
  will-change: width, opacity;
`;

const Header = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-row: top / ticket-list-top;
  padding-left: 16px;
  padding-right: 8px;
  background: white;

  transition: padding 0.2s ${transitionDefault};
  will-change: padding;

  & > button {
    transition: width 0.2s ${transitionDefault};
    will-change: width;
  }

  ${(props) =>
    props.isCollapsed &&
    css`
      justify-content: flex-end;
      padding: 0;

      ${IconButton} {
        width: ${COLLAPSED_WIDTH}px;

        & > button {
          width: ${COLLAPSED_WIDTH}px;
        }
      }
    `}
`;

const AnimateContainer = styled.div<{ isCollapsed: boolean; isOverlap: boolean; top: number }>`
  display: grid;
  grid-template-rows: inherit;
  grid-row: top / bottom;
  transition: width 0.2s ${transitionDefault}, box-shadow 0.2s ${transitionDefault};
  will-change: width, box-shadow;
  background: white;
  border-left: none;

  ${(props) =>
    props.isCollapsed &&
    css`
      ${IframeContainer} {
        opacity: 0;
      }

      ${HeaderTitle} {
        overflow: hidden;
        width: 0;
        opacity: 0;
      }
    `}

  ${(props) =>
    props.isOverlap &&
    css`
      position: fixed;
      top: ${props.top}px;
      right: 0;
      height: calc(100vh - ${props.top}px);
      z-index: ${ZIndexes.drawer};
      border-left: 1px solid ${cssVariables('neutral-3')};
    `}

  ${(props) =>
    !props.isCollapsed &&
    props.isOverlap &&
    css`
      ${shadow[12]};
      border-left: none;
    `}
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ErrorContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 8%;
  color: ${cssVariables('neutral-7')};
  ${Subtitles['subtitle-02']}

  & > svg {
    margin-bottom: 12px;
  }

  & > button {
    margin-top: 18px;
  }
`;

const SandBoxIframe = forwardRef<
  HTMLIFrameElement,
  Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, 'sandbox' | 'allow'>
>((props, ref) => {
  return (
    <StyledIframe
      {...props}
      ref={ref}
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
      allow="camera;microphone"
    />
  );
});

type Props = {
  ticketId?: Ticket['id'];
};

const getIframeSidebarInitState = () => {
  const storedState = ClientStorage.get(IFRAME_SIDEBAR_STATE);
  const isValidState = [IframeSidebarState.COLLAPSED, IframeSidebarState.EXPANDED].some(
    (state) => state === storedState,
  );
  if (isValidState) {
    return storedState as IframeSidebarState;
  }
  ClientStorage.set(IFRAME_SIDEBAR_STATE, IframeSidebarState.EXPANDED);
  return IframeSidebarState.EXPANDED; // Default value
};

export const IframeSidebar = memo<Props>(({ ticketId }) => {
  const intl = useIntl();
  const history = useHistory<{ forceReload: boolean } | undefined>();
  const { isIframeOverlap, setIframeLayoutWidth } = useContext(IframeLayoutContext);
  const gnbHeight = useContext(GNBHeightContext);
  const [iframeSidebarState, setIframeSidebarState] = useState(getIframeSidebarInitState());

  const {
    iframeApp,
    isKeyFetching,
    isKeyVerifying,
    generateKeyError,
    verifyUrlError,
    generateHtmlKey,
    url,
  } = useIframeApp(ticketId);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (history.location.state?.forceReload) {
      if (iframeRef.current) {
        try {
          /**
           * @description It will trigger force reload of iframe src contents
           * @link https://stackoverflow.com/a/4062084
           */
          const { src: currentIframeSrc } = iframeRef.current;
          iframeRef.current.src = currentIframeSrc;
        } catch (error) {
          logException({ error });
        }
      }
    }
  }, [history.location.state]);

  const isCollapsed = iframeSidebarState === IframeSidebarState.COLLAPSED;
  const iframeWidth = isCollapsed ? `${COLLAPSED_WIDTH}px` : `${iframeApp?.width}px`;

  useEffect(() => {
    if (iframeApp) {
      setIframeLayoutWidth(iframeApp.isEnabled && !isCollapsed ? iframeApp.width : DEFAULT_IFRAME_WIDTH);
    } else {
      setIframeLayoutWidth(DEFAULT_IFRAME_WIDTH);
    }
  }, [iframeApp, isCollapsed, setIframeLayoutWidth]);

  const handleClick = useCallback(() => {
    localStorage.setItem(
      IFRAME_SIDEBAR_STATE,
      isCollapsed ? IframeSidebarState.EXPANDED : IframeSidebarState.COLLAPSED,
    );
    setIframeSidebarState((currentValue) =>
      currentValue === IframeSidebarState.COLLAPSED ? IframeSidebarState.EXPANDED : IframeSidebarState.COLLAPSED,
    );
  }, [isCollapsed]);

  const renderHeader = useMemo(() => {
    return (
      <Header isCollapsed={isCollapsed}>
        <HeaderTitle>{iframeApp?.title}</HeaderTitle>
        <IconButton
          type="button"
          buttonType="tertiary"
          icon={isCollapsed ? 'collapse' : 'expand'}
          size="small"
          onClick={handleClick}
          title={
            isCollapsed
              ? intl.formatMessage({ id: 'desk.apps.iframe.btn.expand.tooltip' })
              : intl.formatMessage({ id: 'desk.apps.iframe.btn.collapse.tooltip' })
          }
          tooltipPlacement="bottom-end"
        />
      </Header>
    );
  }, [handleClick, iframeApp, intl, isCollapsed]);

  const renderIframe = useMemo(() => {
    if (isKeyFetching || isKeyVerifying) {
      return (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      );
    }

    if (verifyUrlError || generateKeyError) {
      return (
        <ErrorContainer>
          <ErrorContent>
            <Icon icon="error" size={65} color={cssVariables('neutral-5')} />
            <div>{intl.formatMessage({ id: 'desk.apps.iframe.error' })}</div>
            <Button buttonType="tertiary" icon="refresh" size="small" onClick={generateHtmlKey}>
              {intl.formatMessage({ id: 'desk.apps.iframe.btn.reload' })}
            </Button>
          </ErrorContent>
        </ErrorContainer>
      );
    }

    if (iframeApp) {
      return (
        <SandBoxIframe ref={iframeRef} src={url} title={iframeApp.title} style={{ width: `${iframeApp.width}px` }} />
      );
    }
  }, [verifyUrlError, generateKeyError, iframeApp, intl, generateHtmlKey, isKeyFetching, isKeyVerifying, url]);

  return iframeApp?.isEnabled ? (
    <>
      {isIframeOverlap && <IframePlaceholder />}
      <AnimateContainer
        style={{
          width: iframeWidth,
        }}
        isCollapsed={isCollapsed}
        isOverlap={isIframeOverlap}
        top={gnbHeight}
      >
        {renderHeader}
        <IframeContainer>{renderIframe}</IframeContainer>
      </AnimateContainer>
    </>
  ) : null;
});
