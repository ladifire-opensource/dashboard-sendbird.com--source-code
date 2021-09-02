import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  MutableRefObject,
  ChangeEventHandler,
  ComponentProps,
  useMemo,
  FC,
} from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  transitionDefault,
  Checkbox,
  ContextualHelp,
  ContextualHelpContent,
  TooltipTrigger,
  IconButton,
  Icon,
  Typography,
} from 'feather';

import { ModeratorActionButton } from '@chat/containers/channels/ModeratorActionButton';
import { useCurrentDynamicPartitioningOption } from '@chat/containers/settings/ChannelsSettings/hooks';
import { CHAT_HEIGHTS } from '@desk/containers/conversation/constants';
import { ContentEditable, ContentEditableRef, UnsavedPrompt } from '@ui/components';
import { PH_CHAT_INPUT, DESC_DIALOG_ADMIN_MESSAGE_LENGTH } from '@utils/text';

import { cssVariables as sizeCSSVariables } from './defineSizeCSSVariables';
import UnsentMessage from './utils/UnsentMessage';

type InputOption = 'user' | 'admin';

const { INPUT_MAX_HEIGHT } = CHAT_HEIGHTS;

type Props = {
  isUserMessageDisabled?: boolean;
  isDisabled?: boolean;
  channelType: ChannelType;
  className?: string;

  sendFileMessage?: ChangeEventHandler<HTMLInputElement>;
  onResizeTextInput?: NonNullable<ComponentProps<typeof ContentEditable>['onResize']>;
  onSubmit: (submitPayload: {
    message: string;
    inputOption: InputOption;
    sendPush?: boolean; // Only for admin message
  }) => void;
};

type ChatInputSelectorProps = Pick<Props, 'channelType' | 'isUserMessageDisabled'> & {
  inputOption: InputOption;
  setInputOption: (value: InputOption) => void;
  handleSendPushChange: () => void;
};

const FileInput = styled.label`
  position: absolute;
  top: 56px;
  right: 16px;
  cursor: pointer;
  margin-bottom: 0;

  input[type='file'] {
    display: none;
  }
`;

const ChatInputExplanation = styled.div`
  position: absolute;
  top: 3px;
  right: 16px;
`;

const ChatInputSelectorItem = styled.div<{ isActive: boolean }>`
  cursor: pointer;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: ${cssVariables('neutral-7')};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  text-align: center;
  transition: all 0.2s ${transitionDefault};
  height: 40px;
  margin-right: 24px;
  border-bottom: 2px solid transparent;
  &:hover {
    color: ${cssVariables('purple-7')};
  }

  ${(props) => {
    if (props.isActive) {
      return css`
        color: ${cssVariables('purple-7')};
        border-bottom: 2px solid ${cssVariables('purple-7')};
      `;
    }
  }};
`;

const ChatInputSelectors = styled.div`
  position: relative;
  display: flex;
  height: 40px;
  padding-left: 16px;
  border-bottom: 1px solid ${cssVariables('neutral-2')};
`;

const ChatInputSDKUser = styled.div`
  position: absolute;
  top: 0;
  right: 64px;
  cursor: pointer;
`;

const CEWrapper = styled.div`
  overflow: auto;
  max-height: ${INPUT_MAX_HEIGHT}px;
`;

const DisabledCover = styled.div<{ isDisabled?: boolean }>`
  display: ${(props) => (props.isDisabled ? 'block' : 'none')};
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: ${cssVariables('neutral-1')};
  opacity: 0.4;
  border-radius: 4px;
  z-index: 1;
`;

const ChatInputSendPush = styled.div`
  display: flex;
  align-items: center;

  margin-right: 56px;
  margin-left: auto;
  overflow: hidden;

  > label {
    color: ${cssVariables('neutral-10')};
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const RoundInlineNotification: FC<{ className?: string }> = ({ children, className }) => (
  <div
    role="status"
    className={className}
    css={`
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      background: ${cssVariables('neutral-2')};
      padding: 6px 12px;
      border-radius: 14px;
      color: ${cssVariables('neutral-7')};
    `}
  >
    <Icon icon="info-filled" color={cssVariables('neutral-6')} size={16} css="flex: none;" />
    <div
      css={`
        margin-left: 8px;
        ${Typography['label-02']}
      `}
    >
      {children}
    </div>
  </div>
);

const StyledRoundInlineNotification = styled(RoundInlineNotification)``;

const StyledChatInput = styled.div<{ $isSendingAdminMessage: boolean }>`
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: ${({ $isSendingAdminMessage }) => ($isSendingAdminMessage ? cssVariables('yellow-2') : 'white')};
  box-shadow: 0 1px 5px 0 rgba(33, 34, 66, 0.12), 0 0 1px 0 rgba(33, 34, 66, 0.08), 0 2px 1px 0 rgba(33, 34, 66, 0.08);
  transition: background 0.2s ${transitionDefault};

  input[type='checkbox']:not(:checked) {
    background-color: transparent;
  }

  ${StyledRoundInlineNotification} {
    background: ${({ $isSendingAdminMessage }) =>
      $isSendingAdminMessage ? cssVariables('yellow-4') : cssVariables('neutral-2')};
    transition: background 0.2s ${transitionDefault};
  }
`;

const ChatInputSelector: FC<ChatInputSelectorProps> = ({
  channelType,
  inputOption,
  setInputOption,
  handleSendPushChange,
  isUserMessageDisabled,
}) => {
  const isUserMessageVisible = !isUserMessageDisabled;

  const chatInputActions = useMemo(() => {
    const sendPushCheckbox = (
      <ChatInputSendPush>
        <Checkbox onChange={handleSendPushChange} id="moderation-tool-send-push" />
        <label htmlFor="moderation-tool-send-push">Send push notification</label>
      </ChatInputSendPush>
    );

    if (inputOption === 'user') {
      return (
        <ChatInputSDKUser
          css={`
            right: 56px;
            top: 3px;
          `}
        >
          <ModeratorActionButton
            css={`
              @media (max-width: 1180px) {
                display: none;
              }
            `}
          />
        </ChatInputSDKUser>
      );
    }

    // send_push is supported only in group channels.
    return channelType === 'group_channels' ? sendPushCheckbox : null;
  }, [channelType, handleSendPushChange, inputOption]);

  return (
    <ChatInputSelectors role="tablist">
      {isUserMessageVisible && (
        <ChatInputSelectorItem role="tab" isActive={inputOption === 'user'} onClick={() => setInputOption('user')}>
          User message
        </ChatInputSelectorItem>
      )}
      <ChatInputSelectorItem role="tab" isActive={inputOption === 'admin'} onClick={() => setInputOption('admin')}>
        Admin message
      </ChatInputSelectorItem>
      {chatInputActions}
      <ChatInputExplanation>
        <ContextualHelp
          tooltipContentStyle="max-width: 360px;"
          content={
            <>
              <ContextualHelpContent.Header>User message</ContextualHelpContent.Header>
              <ContextualHelpContent.Body>
                is a message sent to this channel on behalf of Dashboard Administrator.
              </ContextualHelpContent.Body>
              <ContextualHelpContent.Header>Admin message</ContextualHelpContent.Header>
              <ContextualHelpContent.Body>
                is a message sent to this channel without a sender.
              </ContextualHelpContent.Body>
            </>
          }
          trigger={TooltipTrigger.Click}
        >
          <IconButton icon="info" size="small" buttonType="tertiary" data-test-id="InfoButton" />
        </ContextualHelp>
      </ChatInputExplanation>
    </ChatInputSelectors>
  );
};

export const ChatInput = memo<Props>(
  ({ isUserMessageDisabled, isDisabled, channelType, onResizeTextInput, onSubmit, sendFileMessage, className }) => {
    const intl = useIntl();
    const contentEditable = useRef<ContentEditableRef>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const [inputOption, setInputOption] = useState<InputOption>('user');
    const [messageText, setMessageText] = useState('');
    const [sendPush, setSendPush] = useState(false);
    const { isUsingDynamicPartitioning, maxSubchannels = 0 } = useCurrentDynamicPartitioningOption();

    useEffect(() => {
      if (isUserMessageDisabled) {
        setInputOption('admin');
      }
    }, [isUserMessageDisabled]);

    useEffect(() => {
      const preservedMessage = UnsentMessage.get();
      if (preservedMessage) {
        contentEditable.current?.setText(preservedMessage);
      }
    }, []);

    useEffect(() => {
      if (isDisabled) {
        contentEditable.current?.blur();
      } else {
        contentEditable.current?.focus();
      }
    }, [isDisabled]);

    const handleChange = () => {
      const message = contentEditable.current ? contentEditable.current.getText() : '';
      setMessageText(message);
    };

    const handleSubmit = () => {
      const message = contentEditable.current ? contentEditable.current.getText() : '';
      onSubmit({ message, inputOption, sendPush });
    };

    const handleSendPushChange = useCallback(() => {
      setSendPush((prevSendPush) => !prevSendPush);
    }, []);

    const handleFileIconClick = (e) => {
      e.stopPropagation();
      if (fileInput.current) {
        fileInput.current.click();
      }
    };

    return (
      <StyledChatInput className={className} data-test-id="ChatInput" $isSendingAdminMessage={inputOption === 'admin'}>
        <UnsavedPrompt when={messageText.trim() !== ''} />
        <DisabledCover isDisabled={isDisabled} />
        <ChatInputSelector
          isUserMessageDisabled={isUserMessageDisabled}
          channelType={channelType}
          setInputOption={setInputOption}
          inputOption={inputOption}
          handleSendPushChange={handleSendPushChange}
        />
        <CEWrapper>
          <ContentEditable
            ref={contentEditable as MutableRefObject<ContentEditableRef>}
            placeholder={inputOption === 'user' ? PH_CHAT_INPUT : DESC_DIALOG_ADMIN_MESSAGE_LENGTH}
            onResize={onResizeTextInput}
            onSubmit={handleSubmit}
            onKeyUp={handleChange}
            styles={css`
              ${inputOption === 'user' &&
              css`
                // prevent messages from overlapping with the file attachment button
                margin-right: 48px;
              `}
              background: transparent;
              padding: 16px;
              min-height: 64px;
              font-size: ${sizeCSSVariables.fontSize};
            `}
            aria-disabled={isDisabled}
          />
          {channelType === 'open_channels' && isUsingDynamicPartitioning && maxSubchannels > 1 && (
            <StyledRoundInlineNotification
              css={`
                margin-left: 16px;
                margin-right: 16px;
                margin-bottom: 8px;
                align-self: flex-start;
              `}
            >
              {intl.formatMessage({ id: 'chat.moderationTool.chatInput.operatorMessageSubchannelWarning' })}
            </StyledRoundInlineNotification>
          )}
          {inputOption !== 'admin' && sendFileMessage ? (
            <FileInput>
              <IconButton
                icon="attach"
                size="small"
                buttonType="tertiary"
                title="Send file message"
                onClick={handleFileIconClick}
              />
              <input ref={fileInput} type="file" onChange={sendFileMessage} data-test-id="FileInput" />
            </FileInput>
          ) : (
            ''
          )}
        </CEWrapper>
      </StyledChatInput>
    );
  },
);
