import { FC } from 'react';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';

const TypeIcon = styled(Icon).attrs({
  size: 16,
  color: cssVariables('neutral-6'),
})`
  margin: 2px;
`;
export const VoiceIcon: FC = () => <TypeIcon icon="call-filled" data-test-id="voiceIcon" />;

export const VideoIcon: FC = () => <TypeIcon icon="call-video-filled" data-test-id="videoIcon" />;

export const StunVideoIcon: FC = () => <TypeIcon icon="call-video-p2p-filled" data-test-id="stunVideoIcon" />;

export const StunVoiceIcon: FC = () => <TypeIcon icon="call-p2p-filled" data-test-id="stunVoiceIcon" />;

export const CallTypeIcon: FC<{
  isVideoCall: boolean;
  callRelay: DirectCall['call_relay'];
}> = ({ isVideoCall, callRelay }) => {
  const isStun = callRelay === 'stun';

  if (isStun) {
    return isVideoCall ? <StunVideoIcon /> : <StunVoiceIcon />;
  }

  return isVideoCall ? <VideoIcon /> : <VoiceIcon />;
};
