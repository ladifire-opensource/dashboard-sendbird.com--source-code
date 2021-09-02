import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { NotificationType, InlineNotification, transitionDefault } from 'feather';

import { useResizeObserver } from '@hooks';

const mapStateToProps = (state: RootState) => ({
  isConnected: state.sendbird.isConnected,
  isReconnectFailed: state.sendbird.isReconnectFailed,
});

export interface ReconnectionStatus {
  status: NotificationType;
  message: string;
}

type Props = ReturnType<typeof mapStateToProps>;

const ReconnectNotificationWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-top: 16px;
  padding-right: 16px;
  padding-left: 16px;
  padding-bottom: 8px;
`;

const Container = styled.div<{ $isOpen: boolean; $height: number }>`
  position: relative;
  width: 100%;
  height: ${({ $isOpen, $height }) => ($isOpen ? `${$height}px` : 0)};
  transition-property: height;
  transition: 0.5s ${transitionDefault};
`;

const ReconnectNotificationConnectable: React.FC<Props> = ({ isConnected, isReconnectFailed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const [height, setHeight] = useState(0);
  const intl = useIntl();
  const observeNotificationResize = useResizeObserver(
    (entry) => {
      const { height } = entry.contentRect;
      if (height > 0) {
        setHeight(height);
      }
    },
    { mode: 'height' },
  );

  const handleConnectionRetryActionClick = () => {
    window.dashboardSB.reconnect();
  };

  useEffect(() => {
    if (isReconnectFailed) {
      setIsOpen(true);
      setNotification({
        type: 'error',
        message: intl.formatMessage({ id: 'common.reconnection.failed.inline_notification' }),
      });
    } else if (isConnected) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setNotification({
        type: 'warning',
        message: intl.formatMessage({ id: 'common.reconnection.try.inline_notification' }),
      });
    }
  }, [isConnected, isReconnectFailed, intl]);

  if (notification) {
    return (
      <Container $isOpen={isOpen} $height={height}>
        <ReconnectNotificationWrapper ref={observeNotificationResize}>
          <InlineNotification
            type={notification.type}
            message={notification.message}
            action={
              notification.type === 'error' ? { label: 'Retry', onClick: handleConnectionRetryActionClick } : undefined
            }
          />
        </ReconnectNotificationWrapper>
      </Container>
    );
  }

  return null;
};

export const ReconnectNotification = connect(mapStateToProps)(ReconnectNotificationConnectable);
