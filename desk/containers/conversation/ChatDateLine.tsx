import styled from 'styled-components';

import { cssVariables } from 'feather';
import moment from 'moment-timezone';

const StyledChatDateLine = styled.div`
  display: block;
  position: sticky;
  top: 0;
  z-index: 200;
  padding: 8px 0;
  margin: 8px 0;
`;

const ChatDateLineTextWrapper = styled.div`
  display: flex;
  justify-content: center; /* 1:1 ui */
`;

const ChatDateLineText = styled.span`
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  padding: 2px 4px;
  background: white;
  border-radius: 4px;
`;

export const ChatDateLine = (props: { createdAt: string | number }) => {
  const { createdAt } = props;
  return (
    <StyledChatDateLine>
      <ChatDateLineTextWrapper>
        <ChatDateLineText>{moment(createdAt).format('ll')}</ChatDateLineText>
      </ChatDateLineTextWrapper>
    </StyledChatDateLine>
  );
};
