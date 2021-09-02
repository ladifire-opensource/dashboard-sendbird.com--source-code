import { PureComponent } from 'react';

import styled, { css } from 'styled-components';

import { Icon, cssVariables, transitionDefault, cssColors } from 'feather';
import moment from 'moment-timezone';

import { StyledProps } from '@ui';
import { Column, InputCheckbox, UserProfile } from '@ui/components';

const StyledMessage = styled.div`
  flex: 1;
`;

const MessageChannel = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-5')};
  margin-bottom: 6px;
`;

const MessageWrapper = styled.div`
  position: relative;
  padding-left: 46px;
`;

const MessageBlock = styled.div<StyledProps>`
  ${(props) =>
    props.isRemoved
      ? css`
          opacity: 0.5;
        `
      : ''};
`;

const MessageProfile = styled.div`
  position: absolute;
  left: 0;
  img {
    width: 34px;
    height: 34px;
  }
`;

const MessageBody = styled.div`
  display: flex;
  align-items: center;
`;

const MessageText = styled.div`
  display: inline-block;
  padding: 8px 16px 6px 16px;
  background: #eceff1;
  margin-top: 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  word-break: break-all;
  cursor: text;
  font-size: 15px;
  line-height: 1.5;
`;

const UserWrapper = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #3d464d;
  line-height: 1;
  margin-bottom: 4px;
`;

const Time = styled.div<StyledProps>`
  width: 180px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 13px;
  color: ${cssVariables('neutral-6')};
  ${(props) =>
    props.isRemoved
      ? css`
          opacity: 0.5;
        `
      : ''};
`;

const TimeValue = styled.div`
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
`;

const UserId = styled.div``;

const UserIdLabel = styled.div`
  display: inline-block;
  font-size: 11px;
  color: #8290b5;
  border: 1px solid #e5e5e5;
  width: 50px;
  height: 16px;
  text-align: center;
  line-height: 1.2;
  margin-right: 8px;
  border-radius: 2px;
`;

const UserIdText = styled.div`
  display: inline-block;
  font-size: 15px;
  color: #8290b5;
`;

const DeletedMessageAction = styled.div`
  margin-top: 16px;
  padding-left: 44px;
`;

const DeletedMessageActionButton = styled.div`
  font-size: 13px;
  color: ${cssVariables('purple-7')};
  margin-right: 20px;
  display: flex;
  align-items: center;
  &:hover,
  &:focus {
    cursor: pointer;
  }
`;

const DeletedMessageActionButtonText = styled.span`
  margin-left: 8px;
`;

const MessageRow = styled.div<StyledProps>`
  cursor: ${(props) => (props.messageRemovable ? 'pointer' : 'default')};
  padding: 24px;
  display: flex;
  align-items: flex-start;
  background: white;
  position: relative;
  font-size: 14px;
  transition: all 0.2s ${transitionDefault};
  &:first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    &:hover {
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
    }
  }
  &:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    &:hover {
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
  &:hover {
    background: #f5f7fa;
  }
  & + & {
    border-top: 1px solid #e5e5e5;
  }
`;

interface MessageProps {
  // props
  message: any;
  checked: boolean;
  messageRemovable: boolean;
  recoverMessageRequest: (messageId) => void;
  index: number;
  handleCheck: (checked, index, message) => void;
}

export class Message extends PureComponent<MessageProps> {
  private handleMessageRowCheck = () => {
    const { checked, index, message, messageRemovable } = this.props;

    if (!message.removed && messageRemovable) {
      this.props.handleCheck(!checked, index, message);
    }
  };

  private recoverMessage = (messageId) => () => {
    this.props.recoverMessageRequest(messageId);
  };

  public render() {
    const { message, user, created_at, channel_url, message_id, removed } = this.props.message;

    const { checked, messageRemovable } = this.props;

    const renderCheckbox = () => {
      if (messageRemovable) {
        if (removed) {
          return <Icon icon="deleted-message" size={16} color={cssColors('neutral-5')} />;
        }
        return <InputCheckbox checked={checked} useDiv={true} />;
      }
      return '';
    };

    return (
      <MessageRow
        key={user ? `${user.user_id}_${message_id}` : message_id}
        messageRemovable={messageRemovable}
        onClick={this.handleMessageRowCheck}
      >
        <Column>{renderCheckbox()}</Column>
        <StyledMessage>
          <MessageChannel>#{channel_url.includes('.') ? channel_url.split('.')[1] : channel_url}</MessageChannel>
          <MessageBlock isRemoved={removed}>
            <MessageWrapper>
              <MessageProfile>
                <UserProfile user={user} />
              </MessageProfile>
              <MessageBody>
                <UserWrapper>
                  <UserName>{user ? user.nickname : 'Admin Message'}</UserName>
                  {user ? (
                    <UserId>
                      <UserIdLabel>USER ID</UserIdLabel>
                      <UserIdText>{user.user_id}</UserIdText>
                    </UserId>
                  ) : (
                    ''
                  )}
                </UserWrapper>
                <Time isRemoved={removed}>
                  <Icon icon="time" size={16} color={cssColors('neutral-6')} />
                  <TimeValue>{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</TimeValue>
                </Time>
              </MessageBody>
              <MessageText>{message}</MessageText>
            </MessageWrapper>
          </MessageBlock>
          {removed && messageRemovable ? (
            <DeletedMessageAction>
              <DeletedMessageActionButton onClick={this.recoverMessage(message_id)}>
                <Icon icon="rollback" size={16} color={cssColors('purple-6')} />{' '}
                <DeletedMessageActionButtonText>RECOVER</DeletedMessageActionButtonText>
              </DeletedMessageActionButton>
            </DeletedMessageAction>
          ) : (
            ''
          )}
        </StyledMessage>
      </MessageRow>
    );
  }
}
