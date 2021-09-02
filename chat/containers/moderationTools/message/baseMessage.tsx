import { Component, createRef, Fragment, MouseEvent } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { cssVariables, Icon, Tooltip, TooltipRef, Typography } from 'feather';
import isEqual from 'lodash/isEqual';

import { commonActions } from '@actions';
import { OperatorIcon } from '@chat/components/OperatorIcon';
import UserProfilePopover from '@chat/components/UserProfilePopup/UserProfilePopover';
import UserProfilePopup from '@chat/components/UserProfilePopup/UserProfilePopup';
import { useFormatDate } from '@hooks';
import { Popover } from '@ui/components';
import { shouldRenderImage, convertURLsAndEmailsToLinks, MessageType, logException, getExtension } from '@utils';

import {
  MessageWrapper,
  MessageLink,
  MessageImage,
  MessageTime,
  MessageMenu,
  MessageMenuToggle,
  MessageMenuItem,
  MessageMenuDivider,
  MessageItem,
  MessageContent,
  SenderNickname,
  MessageVideoThumbnail,
  MessageVideoThumbnailCover,
  MessageActions,
  MessageActionIconButton,
} from '.';
import { cssVariables as sizeCSSVariables } from '../defineSizeCSSVariables';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';

const mapStateToProps = (state: RootState) => ({
  moderatorUserId: state.moderations.sdkUser?.user_id,
});

const mapDispatchToProps = {
  showImagePreviewRequest: commonActions.showImagePreviewRequest,
};

export enum MessageMenuType {
  edit = 'edit',
  delete = 'delete',
  copyUrl = 'copyUrl',
  showDataInformation = 'showDataInformation',
}

const forbiddenFileMessageMenus = [MessageMenuType.edit];

type MessageSender = UserProfile;

export type BaseMessageType = {
  messageId: number;
  sender?: MessageSender;
  message?: string;
  type: MessageType;
  file?: Readonly<{
    name: string;
    type?: string;
    url: string | null;
    thumbnails?: { url: string }[];
  }>;
  createdAt: number;
  data: string;
  silent?: boolean;
};

// component props & state types
type Props = {
  message: BaseMessageType;
  isEditable?: boolean;
  isFocused?: boolean;
  deleteMessage?: (messageId: number) => void;
  deleteMessageAndMuteSender?: (message: BaseMessageType) => Promise<void>;
  editMessage?: (message: BaseMessageType, messageType: 'MESG' | 'ADMM') => void;
  showDataInformation?: (data: string) => void;
  copyUrl?: (messageId) => void;
  onRefAttached?: (ref: HTMLElement | null) => void;
  onImageLoaded?: () => void;
  messageMenus?: MessageMenuType[];
  messageItemStyles?: SimpleInterpolation;
  intl: IntlShape;
  showDeleteAndMuteAction?: boolean;
} & typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

type State = {
  isMenuOpen: boolean;
  isDeleteAndMuteActionDisabled: boolean;
};

const getVideoThumbnail = (file: BaseMessageType['file']): { url: string } | undefined => {
  const { type = '', url, thumbnails } = file || {};

  if (!url) {
    return undefined;
  }

  const fileExtension = getExtension(url);
  const videoExtensions = ['mp4', 'mov', 'avi', 'mpg', 'mpeg', 'wmv', 'asf', 'asx', 'flv', 'swf', 'mkv', 'm3u8', '3gp'];
  const isVideoType =
    type.match(/^video.+$/i) || (type === 'application/x-mpegURL' && videoExtensions.includes(fileExtension));

  return isVideoType ? thumbnails?.[0] : undefined;
};

const SilentMessageIndicator = styled.div`
  display: flex;
  align-items: center;
  flex: none;
  width: 100%;
  color: ${cssVariables('neutral-6')};
  padding-top: 2px;
  margin-bottom: ${sizeCSSVariables.spacing};

  ${Typography['label-02']};
  font-size: ${sizeCSSVariables.timeFontSize}; // override Typography['label-02']

  svg {
    width: ${sizeCSSVariables.timeFontSize};
    height: ${sizeCSSVariables.timeFontSize};
    margin-right: calc(${sizeCSSVariables.spacing} / 2);
  }
`;

const Time = withErrorBoundary<{ timestamp: number }>(
  ({ timestamp }) => {
    const formatDate = useFormatDate();
    return <MessageTime dateTime={new Date(timestamp).toISOString()}>{formatDate(timestamp, '23htime')}</MessageTime>;
  },
  { FallbackComponent: () => <MessageTime as="div" /> },
);

export class BaseMessageConnectable extends Component<Props, State> {
  private menuPopoverComponent;
  private deleteAndMuteButtonTooltipRef = createRef<TooltipRef>();

  public state: State = { isMenuOpen: false, isDeleteAndMuteActionDisabled: false };

  public shouldComponentUpdate(nextProps, nextState) {
    // messageMenu is array so compare using isEqual
    return (
      this.props.message.message !== nextProps.message.message ||
      this.props.isFocused !== nextProps.isFocused ||
      this.state.isMenuOpen !== nextState.isMenuOpen ||
      !isEqual(this.props.messageMenus, nextProps.messageMenus)
    );
  }

  private setMenuPopoverRef = (ref) => {
    this.menuPopoverComponent = ref;
  };

  private onRefAttached = (ref: HTMLDivElement | null) => {
    this.props.onRefAttached?.(ref);
  };

  private handleMenuOpen = (isMenuOpen) => () => {
    this.setState({ isMenuOpen });
  };

  private handleEditClick = () => {
    const { message, editMessage } = this.props;
    const messageType = message.type === MessageType.user ? 'MESG' : 'ADMM';
    this.menuPopoverComponent.close();
    editMessage?.(message, messageType);
  };

  private handleDeleteClick = () => {
    const { message, deleteMessage } = this.props;
    this.menuPopoverComponent.close();
    deleteMessage?.(message.messageId);
  };

  private handleCopyClick = () => {
    const { message, copyUrl } = this.props;
    this.menuPopoverComponent.close();
    copyUrl?.(message.messageId);
  };

  private handleShowDataInformation = () => {
    const { message, showDataInformation } = this.props;
    this.menuPopoverComponent.close();
    showDataInformation?.(message.data);
  };

  private handleDeleteAndMuteClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const { message, deleteMessageAndMuteSender } = this.props;
    event.currentTarget.disabled = true; // for immediate feedback

    if (deleteMessageAndMuteSender) {
      this.setState({ isDeleteAndMuteActionDisabled: true });
      await deleteMessageAndMuteSender(message); // this function doesn't throw
      this.setState({ isDeleteAndMuteActionDisabled: false });
    }
  };

  private handleImageClick = () => {
    const { message, showImagePreviewRequest } = this.props;
    if (message.file) {
      // FIXME: any
      showImagePreviewRequest([message.file as any]);
    }
  };

  private handleImageLoaded = () => {
    this.props.onImageLoaded?.();
  };

  private filterMessageMenus = (messageMenus: MessageMenuType[]) => {
    const { message } = this.props;
    return messageMenus.filter(
      (menu) => message.type !== MessageType.file || !forbiddenFileMessageMenus.includes(menu),
    );
  };

  private renderMessageMenu = (menu: MessageMenuType) => {
    switch (menu) {
      case MessageMenuType.showDataInformation:
        return (
          <Fragment key={menu}>
            <MessageMenuItem onClick={this.handleShowDataInformation}>Show Data Information</MessageMenuItem>
            <MessageMenuDivider />
          </Fragment>
        );
      case MessageMenuType.edit: {
        return (
          <MessageMenuItem key={menu} onClick={this.handleEditClick}>
            Edit
          </MessageMenuItem>
        );
      }
      case MessageMenuType.delete:
        return (
          <MessageMenuItem key={menu} onClick={this.handleDeleteClick}>
            Delete
          </MessageMenuItem>
        );
      case MessageMenuType.copyUrl:
        return (
          <MessageMenuItem key={menu} onClick={this.handleCopyClick}>
            Copy URL
          </MessageMenuItem>
        );
      default:
        return null;
    }
  };

  private renderMessageBody = () => {
    const { message } = this.props;
    switch (message.type) {
      case MessageType.user:
      case MessageType.admin:
        return <>{convertURLsAndEmailsToLinks(message.message || '')}</>;
      case MessageType.file:
        if (message.file) {
          if (!message.file.url) {
            return null;
          }
          /**
           * File message could have no name so display url when name doesn't exist
           */
          const { type = '', name, url = '' } = message.file;

          const handleVideoThumbnailClick = (url) => () => {
            window.open(url);
          };

          return (
            <MessageWrapper>
              <MessageLink href={url} target="_blank">
                <Icon icon="attach" className="file-attach-icon" size={16} />
                {name || url}
              </MessageLink>
              <ErrorBoundaryWrapper
                onError={(error, errorInfo) => {
                  logException({ error, context: { file: message.file, errorInfo } });
                }}
              >
                {() => {
                  const videoThumbnail = getVideoThumbnail(message.file);
                  return (
                    <>
                      {shouldRenderImage(type, url) && (
                        <MessageImage onClick={this.handleImageClick}>
                          <img src={url} alt={url} onLoad={this.handleImageLoaded} onError={this.handleImageLoaded} />
                        </MessageImage>
                      )}
                      {videoThumbnail && (
                        <div>
                          <MessageVideoThumbnail onClick={handleVideoThumbnailClick(url)}>
                            <MessageVideoThumbnailCover>
                              <Icon icon="call-video-filled" className="video-thumbnail-icon" size={24} color="#fff" />
                            </MessageVideoThumbnailCover>
                            <img src={videoThumbnail.url} alt={videoThumbnail.url} />
                          </MessageVideoThumbnail>
                        </div>
                      )}
                    </>
                  );
                }}
              </ErrorBoundaryWrapper>
            </MessageWrapper>
          );
        }
        return null;
      default:
        return null;
    }
  };

  private get isSentByOperator() {
    return this.props.message.sender?.role === 'operator';
  }

  private get backgroundColor() {
    const { message } = this.props;
    if (message.type === MessageType.admin) {
      return cssVariables('yellow-2');
    }
    if (message.silent) {
      return cssVariables('neutral-1');
    }
    return 'white';
  }

  private get messageTextStyle() {
    const { message } = this.props;

    if (message.type === MessageType.admin) {
      return css`
        color: ${cssVariables('neutral-10')};
        font-weight: 400;
      `;
    }

    if (message.silent) {
      return css`
        color: ${cssVariables('neutral-7')};
        font-weight: 400;
      `;
    }

    if (this.isSentByOperator) {
      return css`
        color: ${cssVariables('purple-7')};
        font-weight: 600;
      `;
    }

    return css`
      color: ${cssVariables('neutral-10')};
      font-weight: 400;
    `;
  }

  private get senderNameColor() {
    const { message } = this.props;

    if (this.isSentByOperator && !message.silent) {
      return cssVariables('purple-7');
    }

    return cssVariables('neutral-7');
  }

  private handleMouseLeave = () => {
    this.deleteAndMuteButtonTooltipRef.current?.hide();
  };

  public render() {
    const {
      message,
      isFocused = false,
      isEditable = false,
      messageMenus,
      moderatorUserId,
      intl,
      showDeleteAndMuteAction,
    } = this.props;
    const { isMenuOpen, isDeleteAndMuteActionDisabled } = this.state;

    const { messageId, type, createdAt, sender, silent } = message;

    const isAdminMessage = type === MessageType.admin;

    const renderNickname = () => {
      if (isAdminMessage || sender == null) {
        return null;
      }

      return (
        <UserProfilePopover
          popupId={String(message.messageId)}
          placement="bottom-start"
          offset="0, 8"
          popup={<UserProfilePopup user={sender} />}
        >
          {({ togglePopup }) => (
            <SenderNickname onClick={togglePopup}>
              <span>
                {sender.nickname}
                {sender.userId === moderatorUserId &&
                  ` ${intl.formatMessage({ id: 'chat.channelDetail.message.you' })}`}
              </span>
              {this.isSentByOperator && <OperatorIcon size={16} color="currentColor" css="line-height: 0;" />}
            </SenderNickname>
          )}
        </UserProfilePopover>
      );
    };

    return (
      <MessageItem
        data-test-id="Message"
        data-message-id={messageId}
        focused={isFocused}
        senderNameColor={this.senderNameColor}
        messageTextStyle={this.messageTextStyle}
        backgroundColor={this.backgroundColor}
        isSenderOperator={this.isSentByOperator}
        isMenuOpen={isMenuOpen}
        styles={this.props.messageItemStyles}
        ref={this.onRefAttached}
        onMouseLeave={this.handleMouseLeave}
      >
        {silent && (
          <SilentMessageIndicator>
            <Icon icon="hide" size={12} color="currentColor" /> Silent message
          </SilentMessageIndicator>
        )}
        <Time timestamp={createdAt} />
        <MessageContent>
          {renderNickname()}
          {this.renderMessageBody()}
        </MessageContent>
        {isEditable && (
          <MessageActions>
            {message.sender && showDeleteAndMuteAction && (
              <Tooltip
                ref={this.deleteAndMuteButtonTooltipRef}
                content={intl.formatMessage({ id: 'chat.channelDetail.message.btn.deleteAndMute' })}
                placement="top"
                portalId="portal_popup"
              >
                <MessageActionIconButton
                  onClick={this.handleDeleteAndMuteClick}
                  disabled={isDeleteAndMuteActionDisabled}
                  aria-label={intl.formatMessage({ id: 'chat.channelDetail.message.btn.deleteAndMute' })}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M13 1H22V6H13V1ZM15 3H16V4H15V3ZM19 3H20V4H19V3ZM18 3H17V4H18V3ZM6 3H12V5H8V7H12H14H17H18V9H17V22H3V9H2V7H3H6V3ZM5 9H15V20H5V9ZM7 12.171V17.171H9V12.171H7ZM11 17.171V12.171H13V17.171H11Z"
                      fill="currentColor"
                    />
                  </svg>
                </MessageActionIconButton>
              </Tooltip>
            )}
            {messageMenus && (
              <Popover
                key={`messagePopover_${messageId}`}
                ref={this.setMenuPopoverRef}
                placement="bottom-end"
                transitionDuration={0}
                isOpen={isMenuOpen}
                onOpen={this.handleMenuOpen(true)}
                onClose={this.handleMenuOpen(false)}
                target={<MessageMenuToggle isMenuOpen={isMenuOpen} />}
                content={<MessageMenu>{this.filterMessageMenus(messageMenus).map(this.renderMessageMenu)}</MessageMenu>}
                preventOpen={!isEditable}
              />
            )}
          </MessageActions>
        )}
      </MessageItem>
    );
  }
}

export const BaseMessage = connect(mapStateToProps, mapDispatchToProps)(injectIntl(BaseMessageConnectable));
