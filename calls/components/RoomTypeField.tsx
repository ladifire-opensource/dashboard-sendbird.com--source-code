import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Radio, Typography } from 'feather';

import { RoomType } from '@calls/api/types';

const Wrapper = styled.fieldset`
  margin: 0;
  border: 0;
  padding: 0;

  legend {
    ${Typography['label-02']};
    margin-bottom: 12px;
  }
`;

const OptionList = styled.ul`
  list-style: none;

  li {
    > div {
      display: block;
    }

    > span {
      margin-top: 8px;
      padding-left: 28px;
      color: ${cssVariables('neutral-7')};
      ${Typography['caption-01']}
    }
  }

  li + li {
    margin-top: 24px;
  }
`;

type Option = {
  value: RoomType;
  label: string;
  description: string;
};

const options: Option[] = [
  {
    value: 'small_room_for_video',
    label: 'calls.groupCalls.components.roomTypeField.video.label',
    description: 'calls.groupCalls.components.roomTypeField.video.description',
  },
  {
    value: 'large_room_for_audio_only',
    label: 'calls.groupCalls.components.roomTypeField.audio.label',
    description: 'calls.groupCalls.components.roomTypeField.audio.description',
  },
];

const RoomTypeField: FC<{ selected?: RoomType; onChange?: (type: RoomType) => void }> = ({ selected, onChange }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <legend>{intl.formatMessage({ id: 'calls.groupCalls.components.roomTypeField.legend' })}</legend>
      <OptionList>
        {options.map(({ value, label, description }) => (
          <li key={value}>
            <Radio
              name="roomType"
              label={intl.formatMessage({ id: label })}
              value={value}
              checked={value === selected}
              onChange={() => onChange?.(value)}
            />
            <span>{intl.formatMessage({ id: description })}</span>
          </li>
        ))}
      </OptionList>
    </Wrapper>
  );
};

export default RoomTypeField;
