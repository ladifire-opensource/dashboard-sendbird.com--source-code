import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, IconName, Typography } from 'feather';

import { Room } from '@calls/api/types';

const Wrapper = styled.span`
  > ${Icon} {
    margin-right: 4px;
  }

  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']};
  display: flex;
  align-items: center;
`;

const roomTypes: Record<Room['room_type'], { icon: IconName; label: string }> = {
  small_room_for_video: {
    icon: 'call-video',
    label: 'calls.studio.new.body.group.table.body.row.room.type.smallVideo',
  },
  large_room_for_audio_only: {
    icon: 'call',
    label: 'calls.studio.new.body.group.table.body.row.room.type.largeAudio',
  },
};

const RoomType: FC<{ value: Room['room_type'] }> = ({ value }) => {
  const intl = useIntl();
  const { icon, label } = roomTypes[value];

  return (
    <Wrapper>
      <Icon size={12} icon={icon} color={cssVariables('neutral-6')} />
      {intl.formatMessage({ id: label })}
    </Wrapper>
  );
};

export default RoomType;
