import { createRef, Component } from 'react';
import { connect } from 'react-redux';

import { ScrollBar, ScrollBarRef } from 'feather';

import { chatActions, coreActions } from '@actions';
import { uuid, isEmpty, shouldRenderDateLine, PropsOf } from '@utils';

import DateLine from '../components/DateLine';
import OpenChannelMessage from '../message/OpenChannelMessage';

const mapStateToProps = (state: RootState) => ({
  messages: state.openChannels.messages,
  isModeratorInfoInAdminMessage: state.settings.isModeratorInfoInAdminMessage,
  isConnected: state.sendbird.isConnected,
  scrollLock: state.openChannels.scrollLock,
});

const mapDispatchToProps = {
  toggleOpenChannelScrollLock: chatActions.toggleOpenChannelScrollLock,
  fetchModeratorInfoADMMRequest: coreActions.fetchModeratorInfoADMMRequest,
};

type OwnProps = {
  scrollLock: boolean;
  fetchPrevMessages: (onSuccess: (messageCount: number) => void) => void;
  getNextMessages: () => void;
} & Pick<
  PropsOf<typeof OpenChannelMessage>,
  'deleteMessage' | 'deleteMessageAndMuteSender' | 'editMessage' | 'showDataInformation'
>;

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps & OwnProps;

class OpenChannelMessages extends Component<Props> {
  private scrollBar = createRef<ScrollBarRef>();
  private messageContainerRef = createRef<HTMLDivElement>();
  private getNextMessagesSuccessCallback: any = null;

  shouldComponentUpdate(nextProps) {
    return (
      this.props.messages !== nextProps.messages ||
      this.props.scrollLock !== nextProps.scrollLock ||
      this.props.isModeratorInfoInAdminMessage !== nextProps.isModeratorInfoInAdminMessage ||
      this.props.isConnected !== nextProps.isConnected
    );
  }

  componentDidMount() {
    this.props.fetchModeratorInfoADMMRequest();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.messages !== this.props.messages && this.getNextMessagesSuccessCallback) {
      this.getNextMessagesSuccessCallback();
      this.getNextMessagesSuccessCallback = null;
    }
  }

  private handleScroll = () => {
    if (!this.scrollBar.current) {
      return;
    }

    const { scrollLock } = this.props;

    const targetScrollTop = this.scrollBar.current.scrollTop + this.scrollBar.current.clientHeight;
    const targetScrollHeight = this.scrollBar.current.scrollHeight;

    if (targetScrollHeight - targetScrollTop > 10 && !scrollLock) {
      this.props.toggleOpenChannelScrollLock(true);
    } else if (targetScrollHeight - targetScrollTop === 0 && scrollLock) {
      this.props.toggleOpenChannelScrollLock(false);
    }

    if (this.scrollBar.current.scrollTop === 0) {
      const firstMessageId = this.props.messages.length > 0 ? this.props.messages[0].messageId : undefined;
      this.props.fetchPrevMessages((messagesLength) => {
        if (messagesLength === 0 || firstMessageId === undefined) {
          return;
        }
        const firstMessageNode = document.querySelector(`[data-message-id="${firstMessageId}"]`);
        if (firstMessageNode) {
          firstMessageNode.scrollIntoView();
          this.scrollBar.current && this.scrollBar.current.scrollBy(0, -33);
        }
      });
      return;
    }

    if (
      this.scrollBar.current.scrollTop ===
      this.scrollBar.current.scrollHeight - this.scrollBar.current.clientHeight
    ) {
      setTimeout(() => {
        const lastMessageId = this.props.messages[this.props.messages.length - 1].messageId;
        const lastMessageNode =
          this.messageContainerRef.current &&
          this.messageContainerRef.current.querySelector(`[data-message-id="${lastMessageId}"]`);

        this.getNextMessagesSuccessCallback = () => {
          lastMessageNode && lastMessageNode.scrollIntoView(false);
        };
        this.props.getNextMessages();
      }, 0);
    }
  };

  private renderMessages = () => {
    const { messages, editMessage, deleteMessage, deleteMessageAndMuteSender } = this.props;
    let previousMessage;
    const messagesArray: any[] = [];
    messages.forEach((message, index) => {
      if (!previousMessage) {
        messagesArray.push(<DateLine key={`dateline_${index}`} timestamp={message.createdAt} />);
      } else if (previousMessage && previousMessage.createdAt && message.createdAt) {
        if (
          shouldRenderDateLine({
            previousDate: previousMessage.createdAt,
            nextDate: message.createdAt,
          })
        ) {
          messagesArray.push(<DateLine key={`dateline_${index}`} timestamp={message.createdAt} />);
        }
      }
      previousMessage = message;
      if (!isEmpty(message)) {
        messagesArray.push(
          <OpenChannelMessage
            key={`open_channel_message_${message.messageId}_${message.createdAt ? message.createdAt : uuid()}`}
            editMessage={editMessage}
            deleteMessage={deleteMessage}
            deleteMessageAndMuteSender={deleteMessageAndMuteSender}
            showDataInformation={this.props.showDataInformation}
            message={message}
            isModeratorInfoInAdminMessage={this.props.isModeratorInfoInAdminMessage}
            isConnected={this.props.isConnected}
          />,
        );
      }
    });
    return messagesArray;
  };

  public scrollToBottom() {
    if (this.scrollBar.current) {
      this.scrollBar.current.scrollToBottom();
    }
  }

  public render() {
    return (
      <ScrollBar ref={this.scrollBar} onScroll={this.handleScroll}>
        <div ref={this.messageContainerRef}>{this.renderMessages()}</div>
      </ScrollBar>
    );
  }
}

export const OpenChannelMessagesConnected = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
  OpenChannelMessages,
);
