import React, { isValidElement, useMemo } from 'react';

import { Avatar, AvatarProps, AvatarType } from 'feather';
import { Moment } from 'moment-timezone';

import SocialMediaPostBubbleMessage from './SocialMediaPostBubbleMessage';
import { ChatBubbleRenderer } from './chatBubbleRenderer';
import { VideoFile, ImageFile } from './fileInterfaces';
import twitterAvatar from './twitterAvatar';

type Props = {
  isOwn?: boolean;
  avatar?: Pick<AvatarProps, 'imageUrl' | 'type' | 'profileID'> | typeof twitterAvatar;
  authorName?: string;
  authorAvatar?: string | null;
  className?: string;
  media?: (ImageFile | VideoFile)[];
  date?: Moment;
  text?: React.ReactNode;
  linkURL?: string;
  maxWidth?: number;
  isExpanded?: boolean;
  isFetching?: boolean;
  onToggleExpandButtonClick?: (newExpanded: boolean) => void;
  embeddedSocialMediaPost?: React.ReactComponentElement<typeof SocialMediaPostBubbleMessage>;

  /**
   * The message to be shown on collapsed state
   */
  collapsedMessage?: string;

  collapsedBubbleBackgroundColor?: 'white' | 'neutral';
};

const isAvatarElementType = (avatar: Props['avatar']): avatar is typeof twitterAvatar => {
  return isValidElement(avatar);
};

const SocialMediaPostBubble = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      isOwn = false,
      avatar,
      media,
      authorName,
      authorAvatar,
      className,
      collapsedBubbleBackgroundColor = 'neutral',
      collapsedMessage,
      date,
      embeddedSocialMediaPost,
      text,
      linkURL,
      maxWidth: maxWidthProp = 360,
      isFetching = false,
      isExpanded = true,
      onToggleExpandButtonClick,
    },
    ref,
  ) => {
    const maxWidth = Math.min(360, maxWidthProp);

    const onExpandButtonClick = useMemo(() => {
      if (onToggleExpandButtonClick) {
        return () => onToggleExpandButtonClick(true);
      }
      return undefined;
    }, [onToggleExpandButtonClick]);

    const onCollapseButtonClick = useMemo(() => {
      if (onToggleExpandButtonClick) {
        return () => onToggleExpandButtonClick(false);
      }
      return undefined;
    }, [onToggleExpandButtonClick]);

    return (
      <ChatBubbleRenderer
        ref={ref}
        isOwn={isOwn}
        className={className}
        renderAvatar={({ className }) => {
          if (isAvatarElementType(avatar)) {
            // avatarProps contains className prop that positions the avatar.
            return <div className={className}>{avatar}</div>;
          }
          const { profileID = authorName || '', imageUrl = '', type = AvatarType.User } = avatar || {};
          return <Avatar type={type} size={32} profileID={profileID} imageUrl={imageUrl} className={className} />;
        }}
        renderMessageArea={() => {
          const avatarImageURL = (() => {
            if (authorAvatar) {
              return authorAvatar;
            }
            if (typeof avatar === 'string') {
              // If authorAvatar prop is undefined and avatar prop is a URL, it defaults to the URL.
              return avatar;
            }
            return undefined;
          })();
          return (
            <SocialMediaPostBubbleMessage
              authorName={authorName}
              avatar={avatarImageURL}
              collapsedBubbleBackgroundColor={collapsedBubbleBackgroundColor}
              collapsedMessage={collapsedMessage}
              date={date}
              isExpanded={isExpanded}
              isFetching={isFetching}
              layoutDirection={isOwn ? 'vertical' : 'horizontal'}
              linkURL={linkURL}
              maxWidth={maxWidth}
              media={media}
              text={text}
              onCollapseButtonClick={onCollapseButtonClick}
              onExpandButtonClick={onExpandButtonClick}
              embeddedSocialMediaPost={embeddedSocialMediaPost}
            />
          );
        }}
      />
    );
  },
);

export default SocialMediaPostBubble;
