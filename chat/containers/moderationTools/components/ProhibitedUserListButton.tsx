import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Headings, Icon as FeatherIcon, IconName } from 'feather';

import Countdown from '@chat/components/Countdown';

const ProhibitedUserListButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 8px 24px;
  width: 100%;

  &:hover {
    background: ${cssVariables('neutral-2')};
  }
`;

const Nickname = styled.div`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
`;

const DetailRow = styled.div`
  display: flex;
  margin-top: 4px;
  line-height: 1;
  color: ${cssVariables('red-5')};
  font-size: 12px;
  font-weight: 500;
  padding-bottom: 4px;

  > * + * {
    margin-left: 4px;
  }
`;

const Icon: FC<{ icon: IconName }> = ({ icon }) => {
  const intl = useIntl();
  return (
    <FeatherIcon
      color="currentColor"
      icon={icon}
      size={12}
      assistiveText={intl.formatMessage({ id: 'chat.channelDetail.sidebar.userList.remainingTime' })}
    />
  );
};

const EndAtText: FC<{ endAt: number; onEnd?: () => void }> = ({ endAt, onEnd }) => {
  const intl = useIntl();
  return (
    <span>
      {endAt === -1 ? (
        intl.formatMessage({ id: 'chat.channelDetail.sidebar.userList.permanent' })
      ) : (
        <Countdown endAt={endAt} onEnd={onEnd} />
      )}
    </span>
  );
};

export default Object.assign(ProhibitedUserListButton, { Nickname, DetailRow, Icon, EndAtText });
