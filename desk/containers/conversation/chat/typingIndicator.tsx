import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { SpinnerInner } from '@ui/components';

const StyledTypingIndicator = styled.div<{ isOthersTyping: boolean }>`
  padding: 2px 24px;
  height: ${(props) => (props.isOthersTyping ? 24 : 0)}px;
`;

const TypingIndicatorContent = styled.div``;

const TypingIndicatorMember = styled.div`
  display: inline-block;
  margin-left: 6px;
  color: ${cssVariables('neutral-6')};
  font-size: 11px;
`;

const TypingIndicatorLabel = styled.div`
  display: inline-block;
  margin-left: 4px;
  color: ${cssVariables('neutral-6')};
  font-size: 11px;
`;

const TypingIcon = styled.div`
  display: inline-block;
  vertical-align: middle;
  position: relative;
  width: 25px;
  height: 12px;
`;

export const TypingIndicator = ({ typingStatus }) => {
  const intl = useIntl();

  const renderTypingMembers = useCallback(() => {
    if (typingStatus.typingMembers.length === 1) {
      return typingStatus.typingMembers[0].nickname;
    }
    if (typingStatus.typingMembers.length > 1 && typingStatus.typingMembers.length <= 3) {
      return typingStatus.typingMembers.map((member) => member.nickname).join(', ');
    }
    return intl.formatMessage({
      id: 'label.others',
    });
  }, [typingStatus]);

  return (
    <StyledTypingIndicator isOthersTyping={typingStatus.othersTyping}>
      {typingStatus.othersTyping ? (
        <TypingIndicatorContent>
          <TypingIcon>
            <SpinnerInner
              isFetching={true}
              dotColor={cssVariables('neutral-6')}
              dotSize={{
                width: 4,
                height: 4,
              }}
            />
          </TypingIcon>
          <TypingIndicatorMember>{renderTypingMembers()}</TypingIndicatorMember>
          <TypingIndicatorLabel>
            <FormattedMessage id="label.isTyping" />
          </TypingIndicatorLabel>
        </TypingIndicatorContent>
      ) : (
        ''
      )}
    </StyledTypingIndicator>
  );
};
