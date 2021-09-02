import React, { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import 'css.escape';
import {
  Body,
  cssVariables,
  Icon,
  IconButton,
  Subtitles,
  animationFadeIn,
  transitionDefault,
  Spinner,
  AvatarProps,
  AvatarType,
  Avatar,
  IconName,
} from 'feather';
import { Moment } from 'moment-timezone';

import { useCharDirection } from '@hooks/useCharDirection';
import { convertURLsAndEmailsToLinks } from '@utils';

import SocialMediaPostBubbleMessage from './SocialMediaPostBubbleMessage';
import { Bubble, WhiteBubble } from './bubble';
import { ChatBubbleRenderer, CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as avatarSize } from './chatBubbleRenderer';
import { ImageFile, VideoFile, GeneralFile, File } from './fileInterfaces';
import { ImageFileRenderer, AudioFileRenderer, VideoFileRenderer } from './mediaRenderers';

export interface ChatBubbleAction {
  label: string;
  onClick: () => void;
}

interface Reaction {
  icon: IconName;
  count: number;
  participated?: boolean;
  activeColor?: string;
  tooltipContent?: React.ReactNode;
}

type Props = {
  messageId?: React.Key;
  isOwn?: boolean;
  senderName?: string;
  twitterScreenName?: string;
  avatar?: Pick<AvatarProps, 'imageUrl' | 'type' | 'profileID'>;
  isSenderHidden?: boolean;
  isAvatarHidden?: boolean;
  isStatusHidden?: boolean;
  message?: React.ReactNode;
  date?: Moment;
  isDimmed?: boolean;
  isDeleted?: boolean;
  isRemoved?: boolean;
  status?: React.ReactNode;
  actions?: readonly ChatBubbleAction[];
  deliveryStatus?: 'sending' | 'sent' | 'read' | 'fail';
  backgroundColor?: 'white' | 'neutral' | 'yellow' | 'green' | 'red';
  socialMediaLink?: { type: 'facebook' | 'twitter'; url: string };
  reactions?: Reaction[];
  files?: readonly File[];
  mediaMaxSize?: number;
  className?: string;
  urlPreview?: { imageURL: string; title: string; description: string; url: string };
  embeddedSocialMediaPost?: React.ReactComponentElement<typeof SocialMediaPostBubbleMessage>;
  renderStatus?: () => React.ReactNode;
  onAvatarClick?: () => void;
  children?: ReactNode;
};

const middleDot = (
  <span aria-hidden={true} style={{ width: 8, textAlign: 'center' }}>
    ∙
  </span>
);

const spinner = <Spinner size={16} stroke={cssVariables('purple-7')} />;

const MessageText = styled.div`
  word-break: break-word;
  white-space: pre-line;
  > a {
    // always show underline
    text-decoration: underline;
  }
`;

const MessageBubble = styled(Bubble)<{
  isDimmed: Props['isDimmed'];
  isDeleted: Props['isDeleted'];
  $isRemoved: boolean;
}>`
  padding: 11px 15px;
  max-width: 100%;
  min-height: 44px;
  color: ${cssVariables('neutral-10')};
  ${Subtitles['subtitle-01']};

  ${MessageText} {
    ${(props) =>
      props.isDimmed &&
      css`
        color: ${cssVariables('neutral-5')};
      `}

    ${(props) =>
      props.isDeleted &&
      css`
        text-decoration: line-through;
        color: ${cssVariables('neutral-5')};
      `}
    
    ${({ $isRemoved }) =>
      $isRemoved &&
      css`
        color: ${cssVariables('neutral-6')};
      `}

    ${(props) =>
      props.isOwn &&
      css`
        > a {
          // override link color because text colored purple-300 is not legible on purple-100.
          color: inherit;
        }
      `}
  }
`;

const AvatarWrapper = styled.div<{ $isCursorPointer?: boolean }>`
  cursor: ${({ $isCursorPointer }) => $isCursorPointer && 'pointer'};
`;

const SenderNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`;

const SenderName = styled.div`
  flex: none;
  max-width: 100%;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
`;

const TwitterScreenName = styled.span`
  min-width: 0;
  flex-shrink: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 12px;
  color: ${cssVariables('neutral-7')};
  line-height: 1;
  font-weight: 400;
  margin-left: 8px;
`;

const FileBubble = styled(WhiteBubble)<{ shouldHideBorder?: boolean }>`
  max-width: 100%;
  overflow: hidden;

  img,
  video {
    display: block;
  }

  ${(props) =>
    props.shouldHideBorder &&
    css`
      border-radius: 0;
      border: none;
      background-color: transparent;
      overflow: auto;
    `}
`;

const URLPreviewBubble = styled(WhiteBubble)`
  display: flex;
  flex-direction: column;
  width: 224px;
  overflow: hidden;
  padding-bottom: 16px;

  .URLPreviewBubble__image {
    width: 100%;
    height: auto;
    border-bottom: 1px solid ${cssVariables('neutral-3')};
    margin-bottom: 12px;
  }

  .URLPreviewBubble__title {
    ${Subtitles['subtitle-01']}
    color: ${cssVariables('neutral-10')};
    margin-bottom: 4px;
    max-height: 40px;
    overflow: hidden;
    padding: 0 16px;
  }

  .URLPreviewBubble__description {
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-7')};
    max-height: 48px;
    overflow: hidden;
    padding: 0 16px;
  }

  :hover {
    .URLPreviewBubble__title,
    .URLPreviewBubble__description {
      text-decoration: underline;
      text-decoration-color: currentColor;
    }
  }
`;

const GeneralFileContainer = styled.div`
  padding: 11px 15px;
  display: flex;
  flex-direction: row;
  align-items: center;

  > * + * {
    margin-left: 12px;
  }

  .GeneralFileContainer__icon {
    padding: 10px;
    background-color: ${cssVariables('neutral-1')};
    border-radius: 6px;
  }

  .GeneralFileContainer__name {
    ${Subtitles['subtitle-01']}
    min-width: 0;
    word-break: break-all;
  }

  .GeneralFileContainer__size {
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-7')};
    margin-top: 4px;
    min-width: 0;
  }
`;

const DownloadButton = styled(IconButton)`
  flex: none;
`;

const ReactionItem = styled.div<{
  activeColor: Reaction['activeColor'];
  participated: Reaction['participated'];
  hasTooltip: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${(props) =>
    props.participated &&
    css`
      color: ${props.activeColor};
      font-weight: 600;
    `}

  ${(props) =>
    props.hasTooltip &&
    css`
      :hover {
        .ReactionItem__tooltip {
          visibility: visible;
        }

        .ReactionItem__count {
          text-decoration: underline;
        }
      }
    `}

  .ReactionItem__count {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .ReactionItem__icon {
    margin-right: 4px;
  }

  .ReactionItem__tooltip {
    position: absolute;
    bottom: calc(100% + 4px);
    background-color: ${cssVariables('neutral-10')};
    border-radius: 4px;
    padding: 12px 16px;

    ${Body['body-short-01']}
    color: white;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;

    opacity: 0;
    animation: ${animationFadeIn} 0.2s ${transitionDefault} forwards;
    visibility: hidden;

    ::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      margin-left: -6px;
      bottom: -12px;
      width: 0;
      height: 0;
      box-sizing: content-box;
      border: 6px solid transparent;
      border-top-color: ${cssVariables('neutral-10')};

      opacity: 0;
      animation: ${animationFadeIn} 0.2s ${transitionDefault} forwards;
    }
  }
`;

const SocialMediaIconWrapper = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  :hover::before {
    content: '${(props) => CSS.escape((props.href || '').trim())}';
    display: block;
    position: absolute;
    bottom: calc(100% + 4px);
    background-color: ${cssVariables('neutral-10')};
    border-radius: 4px;
    padding: 8px 16px;

    font-size: 13px;
    line-height: 16px;
    font-weight: 600;
    color: white;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;

    opacity: 0;
    animation: ${animationFadeIn} 0.2s ${transitionDefault} forwards;
  }

  :hover::after {
    content: '';
    display: block;
    position: absolute;
    bottom: calc(100% - 8px);
    width: 0;
    height: 0;
    box-sizing: content-box;
    border: 6px solid transparent;
    border-top-color: ${cssVariables('neutral-10')};

    opacity: 0;
    animation: ${animationFadeIn} 0.2s ${transitionDefault} forwards;
  }
`;

const DeliveryStatusIconWrapper = styled.div<{ isOwn: boolean }>`
  ${(props) => (props.isOwn ? 'margin-left: 4px;' : 'margin-right: 4px;')}
`;

const FileBubbleContent = (props: { file: File; mediaMaxSize: number }) => {
  const { file, mediaMaxSize } = props;
  const { type, name, url, onClick } = file;
  switch (type) {
    case 'image': {
      return <ImageFileRenderer file={file as ImageFile} maxSize={mediaMaxSize} borderRadius={8} />;
    }

    case 'video':
    case 'twitter-gif': {
      return <VideoFileRenderer file={file as VideoFile} maxSize={mediaMaxSize} borderRadius={8} />;
    }

    case 'audio':
      return <AudioFileRenderer file={file as GeneralFile} maxSize={mediaMaxSize} />;

    default: {
      const fileTypeIcon = {
        audio: 'audio-filled' as const,
        archive: 'zip-filled' as const,
        document: 'document-filled' as const,
        video: 'video-filled' as const,
        misc: 'file-filled' as const,
      }[type];
      return (
        <GeneralFileContainer>
          <div className="GeneralFileContainer__icon">
            <Icon icon={fileTypeIcon} size={20} color={cssVariables('neutral-6')} />
          </div>
          <div>
            <div className="GeneralFileContainer__name">{name || url}</div>
            {file.formattedSize && <div className="GeneralFileContainer__size">{file.formattedSize}</div>}
          </div>
          <DownloadButton
            icon="download"
            size="small"
            buttonType="secondary"
            onClick={onClick}
            data-test-id="DownloadButton"
          />
        </GeneralFileContainer>
      );
    }
  }
};

const ChatBubbleStyleable = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      actions = [],
      avatar,
      backgroundColor,
      className,
      date,
      deliveryStatus,
      files = [],
      isAvatarHidden,
      isDeleted,
      isRemoved = false,
      isDimmed,
      isOwn = false,
      isSenderHidden,
      isStatusHidden,
      mediaMaxSize = 360,
      message,
      messageId,
      reactions = [],
      senderName,
      twitterScreenName,
      socialMediaLink,
      status,
      urlPreview,
      embeddedSocialMediaPost,
      renderStatus,
      onAvatarClick,
      children,
    },
    ref,
  ) => {
    const intl = useIntl();
    const dir = useCharDirection();
    const deliveryStatusIcon = (() => {
      switch (deliveryStatus) {
        case 'sending':
          return spinner;
        case 'sent':
          return <Icon icon="done" color={cssVariables('green-5')} size={16} />;
        case 'read':
          return <Icon icon="done-all" color={cssVariables('green-5')} size={16} />;
        case 'fail':
          return <Icon icon="warning-filled" color={cssVariables('red-5')} size={16} />;
        default:
          return null;
      }
    })();

    const messageContent = useMemo(() => {
      if (isRemoved) {
        return intl.formatMessage({ id: 'desk.conversation.sendbird.message.deleted' });
      }
      if (typeof message === 'string') {
        return convertURLsAndEmailsToLinks(message);
      }
      return message;
    }, [intl, isRemoved, message]);

    return (
      <ChatBubbleRenderer
        ref={ref}
        isOwn={isOwn}
        isStatusHidden={isStatusHidden}
        renderAvatar={({ className }) => {
          const { profileID = senderName || '', imageUrl = '', type = AvatarType.User } = avatar || {};

          return (
            <AvatarWrapper
              className={className}
              $isCursorPointer={typeof onAvatarClick === 'function'}
              onClick={onAvatarClick}
            >
              <Avatar type={type} size={avatarSize} profileID={profileID} imageUrl={imageUrl} />
            </AvatarWrapper>
          );
        }}
        renderMessageArea={() => (
          <>
            {!isRemoved &&
              files &&
              files.map((file, index) => (
                <FileBubble
                  key={`${file.type}_${file.url || index}`}
                  style={{ maxWidth: mediaMaxSize, maxHeight: mediaMaxSize }}
                  /**
                   * Embedded audio player has its own border radius. So it's natural to hide the border of the bubble.
                   * For images, videos, twitter-gifs, ImageFileRenderer and VideoFileRenderer will draw its own border.
                   */
                  shouldHideBorder={['audio', 'video', 'image', 'twitter-gif'].includes(file.type)}
                  data-test-id="FileBubble"
                >
                  <FileBubbleContent file={file} mediaMaxSize={mediaMaxSize} />
                </FileBubble>
              ))}
            {(message || isRemoved) && (
              <MessageBubble
                isOwn={isOwn}
                backgroundColor={backgroundColor}
                isDeleted={isDeleted}
                $isRemoved={isRemoved}
                isDimmed={isDimmed}
              >
                {senderName && !isSenderHidden && (
                  <SenderNameContainer>
                    <SenderName>{senderName}</SenderName>
                    {twitterScreenName && <TwitterScreenName>{twitterScreenName}</TwitterScreenName>}
                  </SenderNameContainer>
                )}
                <MessageText dir={dir}>{messageContent}</MessageText>
                {embeddedSocialMediaPost}
              </MessageBubble>
            )}
            {urlPreview && (
              // @ts-ignore suppress complaint about using "as" polymorphic prop
              <URLPreviewBubble as="a" href={urlPreview.url} target="_blank">
                <img className="URLPreviewBubble__image" src={urlPreview.imageURL} alt="" />
                <div className="URLPreviewBubble__title">{urlPreview.title}</div>
                <div className="URLPreviewBubble__description">{urlPreview.description}</div>
              </URLPreviewBubble>
            )}
            {children}
          </>
        )}
        renderStatus={
          renderStatus ||
          (() => (
            <>
              {deliveryStatusIcon && (
                <DeliveryStatusIconWrapper isOwn={isOwn}>{deliveryStatusIcon}</DeliveryStatusIconWrapper>
              )}
              <span>{date && date.format('HH:mm')}</span>
              {reactions.length > 0 &&
                reactions.map((reaction) => {
                  const { icon, participated, activeColor = cssVariables('green-5'), count, tooltipContent } = reaction;
                  const key = [messageId, icon].filter((x) => x).join('-');
                  const tooltipId = `${key}-tooltip`;
                  return (
                    <React.Fragment key={key}>
                      {middleDot}
                      <ReactionItem
                        activeColor={activeColor}
                        participated={participated}
                        aria-labelledby={tooltipContent ? tooltipId : undefined}
                        hasTooltip={!!tooltipContent}
                      >
                        <Icon
                          className="ReactionItem__icon"
                          icon={icon}
                          size={12}
                          color={participated ? activeColor : cssVariables('neutral-6')}
                        />
                        <div className="ReactionItem__count">
                          {count}
                          {tooltipContent && (
                            <div className="ReactionItem__tooltip" id={tooltipId}>
                              {tooltipContent}
                            </div>
                          )}
                        </div>
                      </ReactionItem>
                    </React.Fragment>
                  );
                })}
              {status && (
                <>
                  {middleDot}
                  <span>{status}</span>
                </>
              )}
              {socialMediaLink && !isDeleted && (
                <>
                  {middleDot}
                  <SocialMediaIconWrapper href={socialMediaLink.url} target="_blank">
                    <Icon icon={socialMediaLink.type} size={12} color={cssVariables('neutral-6')} />
                  </SocialMediaIconWrapper>
                </>
              )}
            </>
          ))
        }
        isAvatarHidden={isAvatarHidden}
        actions={actions}
        className={className}
      />
    );
  },
);

const ChatBubble = styled(ChatBubbleStyleable)``;

export default ChatBubble;
