import { FC, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, transitionDefault, Typography } from 'feather';

import { maxNewMessageCount } from '../constants';
import { zIndex as dateLineZIndex } from './DateLine';

type Props = {
  className?: string;
  count: number;
  isHidden?: boolean;
  onClick: () => void;
  onClose: () => void;
};

const Container = styled.div`
  display: flex;
  transition: 0.2s ${transitionDefault};
  border-radius: 14px;
  background: ${cssVariables('purple-7')};
  width: fit-content;
  height: 28px;
  overflow: hidden;

  &[hidden] {
    display: flex;
    opacity: 0;
    transform: translateY(-8px);
  }

  > button {
    display: flex;
    align-items: center;
    border: 0;
    background: inherit;
    cursor: pointer;
    height: 100%;
    color: white;
  }

  > button:first-child {
    padding-right: 8px;
    padding-left: 12px;
    white-space: nowrap;
    ${Typography['label-02']};

    svg {
      margin-right: 4px;
    }
  }

  > button:last-child {
    padding: 0 12px;

    &:hover {
      background: ${cssVariables('purple-8')};
    }

    &:active {
      background: ${cssVariables('purple-9')};
    }
  }
`;

const NewMessageAlert: FC<Props> = ({ className, count, isHidden, onClick, onClose }) => {
  const intl = useIntl();
  const lastNonZeroCount = useRef(count);

  useEffect(() => {
    if (count > 0) {
      lastNonZeroCount.current = count;
    }
  }, [count]);

  // ensure "0 messages" is never shown
  const displayedCount = count > 0 ? count : lastNonZeroCount.current;

  return (
    <Container hidden={isHidden} className={className}>
      <button type="button" onClick={onClick}>
        <Icon size={12} icon="arrow-down" color="currentColor" />
        {displayedCount > maxNewMessageCount
          ? intl.formatMessage(
              { id: 'chat.moderation.newMessageAlert.newMessages.many' },
              { countGreaterThan: maxNewMessageCount },
            )
          : intl.formatMessage({ id: 'chat.moderation.newMessageAlert.newMessages' }, { count: displayedCount })}
      </button>
      <button type="button" onClick={onClose}>
        <Icon size={16} icon="close" color="currentColor" />
      </button>
    </Container>
  );
};

export const NewMessageAlertWrapper = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${dateLineZIndex + 10};
`;

export default NewMessageAlert;
