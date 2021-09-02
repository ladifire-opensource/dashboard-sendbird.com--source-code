import { FC, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio } from 'feather';

type Value = CreateAnnouncementAPIPayloadV15['message']['type'];
type Props = {
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
};

const RadioList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  & > * + * {
    margin-top: 8px;
  }
`;

export const MessageTypeRadioOptions: FC<Props> = ({ value, onChange, disabled }) => {
  const intl = useIntl();

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.checked) {
      onChange(event.currentTarget.value as Value);
    }
  };

  return (
    <RadioList>
      <Radio
        name="message.type"
        label={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.type_lbl.mesg' })}
        value="MESG"
        checked={value === 'MESG'}
        onChange={handleChange}
        disabled={disabled}
      />
      <Radio
        name="message.type"
        label={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.type_lbl.brdm' })}
        value="ADMM"
        checked={value === 'BRDM' || value === 'ADMM'}
        onChange={handleChange}
        disabled={disabled}
      />
    </RadioList>
  );
};
