import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { ZIndexes, cssColors, Subtitles } from 'feather';
import { rgba } from 'polished';

const Container = styled.div`
  user-select: none;
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  left: 8px;
  align-items: center;
  justify-content: center;
  z-index: ${ZIndexes.dropdownMenu - 1};
  border-radius: 4px;
  background-color: ${rgba(cssColors('neutral-10'), 0.7)};
  height: 40px;
  text-align: center;
  color: white;
  pointer-events: none;
  ${Subtitles['subtitle-01']};
`;

export const ChannelFrozenStatusBar = () => {
  const intl = useIntl();
  return <Container role="status">{intl.formatMessage({ id: 'chat.channelDetail.message.channelFrozen' })}</Container>;
};
