import React, { useCallback, ForwardRefExoticComponent, useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Headings, cssVariables, Body, Icon, Subtitles, transitionDefault, IconButton, Spinner } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { DEFAULT_DATE_FORMAT, DATE_WITHOUT_YEAR_FORMAT, DEFAULT_TIME_FORMAT } from '@constants';
import { useCharDirection } from '@hooks/useCharDirection';

import DeskAgentAvatar from '../DeskAgentAvatar';
import DeskCustomerAvatar from '../DeskCustomerAvatar';
import { WhiteBubble, Bubble } from './bubble';
import { VideoFile, ImageFile } from './fileInterfaces';
import { MediaGrid } from './mediaGrid';
import { ImageFileRenderer, VideoFileRenderer, MediaFrameSize } from './mediaRenderers';

type Props = {
  authorName?: string;
  avatar?: string;
  className?: string;
  collapsedBubbleBackgroundColor?: 'white' | 'neutral';
  collapsedMessage?: string;
  date?: Moment;
  isExpanded?: boolean;
  isFetching?: boolean;
  layoutDirection: 'horizontal' | 'vertical';
  linkURL?: string;
  maxWidth?: number;
  media?: (ImageFile | VideoFile)[];
  text?: React.ReactNode;
  onCollapseButtonClick?: () => void;
  onExpandButtonClick?: () => void;

  // embeddedSocialMediaPost prop must contain another SocialMediaPostBubbleMessage element.
  embeddedSocialMediaPost?: React.ReactComponentElement<ForwardRefExoticComponent<Props>>;
};

const horizontalLayoutMediaFrameSize: MediaFrameSize = { width: 80, height: 80 };

const PostBubble = styled(WhiteBubble)<{
  layoutDirection: 'horizontal' | 'vertical';
  hasMedia?: boolean;
  maxWidth: number;
}>`
  display: flex;
  position: relative;
  padding: 12px 16px;
  align-items: flex-start;
  ${(props) => props.layoutDirection === 'vertical' && props.hasMedia && 'padding-top: 16px;'}

  flex-direction: ${(props) => (props.layoutDirection === 'vertical' ? 'column' : 'row')};
  ${(props) => props.layoutDirection === 'vertical' && `width: ${Math.min(360, props.maxWidth)}px;`}

  > * + * {
    ${(props) => (props.layoutDirection === 'vertical' ? 'margin-top: 12px;' : 'margin-left: 16px;')}
  }

  ${(props) => {
    if (props.layoutDirection === 'vertical') {
      return css`
        flex-direction: column;
        width: ${Math.min(360, props.maxWidth)}px;

        > * + * {
          margin-top: 12px;
        }
      `;
    }
    return css`
      flex-direction: row;

      > * + * {
        margin-left: 16px;
      }

      &[data-is-narrow='true'] {
        flex-direction: column;

        > * + * {
          margin-top: 8px;
          margin-left: 0;
        }
      }
    `;
  }}
`;

const MessageContainer = styled.div<{ isCollapseButtonVisible: boolean }>`
  width: 100%;

  .MessageContainer__author {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: baseline;
    margin-bottom: 4px;

    ${(props) =>
      props.isCollapseButtonVisible &&
      css`
        // This margin-right prevents CollapseButton being overlapped with the date.
        margin-right: 28px;
      `}

    > * + * {
      margin-left: 8px;
    }
  }

  .MessageContainer__avatar {
    flex: none;
    align-self: center;
  }

  .MessageContainer__authorName {
    ${Headings['heading-01']}
    flex-shrink: 1;
    text-overflow: ellipsis;
    overflow-x: hidden;
    white-space: nowrap;
  }

  .MessageContainer__date {
    flex: none;
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-7')};

    :not([href]) {
      pointer-events: none;
    }
  }

  .MessageContainer__text {
    ${Body['body-short-01']}
    word-break: break-word;
  }
`;

const CollapsedBubble = styled(Bubble)<{ backgroundColor: 'white' | 'neutral' }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 11px 15px;
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('purple-7')};
  transition: 0.2s ${transitionDefault};
  transition-property: color, box-shadow;
  cursor: pointer;
  outline: 0;

  ${(props) => {
    if (props.backgroundColor === 'white') {
      return css`
        background-color: white;
        border-color: ${cssVariables('neutral-3')};
      `;
    }
    return css`
      background-color: ${cssVariables('neutral-2')};
      border-color: transparent;
    `;
  }}

  .CollapsedBubble__Icon {
    margin-left: 8px;
    transition: 0.2s fill ${transitionDefault};
  }
  :hover {
    color: ${cssVariables('purple-8')};
    .CollapsedBubble__Icon {
      fill: ${cssVariables('purple-8')};
    }
  }

  :active {
    color: ${cssVariables('neutral-9')};
    .CollapsedBubble__Icon {
      fill: ${cssVariables('neutral-9')};
    }
  }

  :not(:active):focus {
    box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

const CollapseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

// These event handlers will hide box-shadow appearing right after clicking on the bubble.
const collapsedBubbleEventHandlers: Partial<React.ComponentProps<typeof CollapsedBubble>> = {
  onMouseUp: ({ currentTarget }) => {
    currentTarget.style.boxShadow = 'none';
  },
  onFocus: ({ currentTarget }) => {
    currentTarget.style.boxShadow = '';
  },
  onMouseDown: ({ currentTarget }) => {
    currentTarget.style.boxShadow = '';
  },
};

const SocialMediaPostBubbleMessage = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      authorName,
      avatar,
      className,
      collapsedBubbleBackgroundColor = 'neutral',
      collapsedMessage,
      date,
      embeddedSocialMediaPost,
      isExpanded,
      isFetching,
      layoutDirection,
      linkURL,
      maxWidth = 360,
      media,
      text,
      onCollapseButtonClick,
      onExpandButtonClick,
    },
    ref,
  ) => {
    const intl = useIntl();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dir = useCharDirection();

    useLayoutEffect(() => {
      if (containerRef.current) {
        containerRef.current.setAttribute('data-is-narrow', containerRef.current.clientWidth < 320 ? 'true' : 'false');
      }
    });

    const containerRefCallback = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (ref) {
          if (typeof ref === 'object') {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          } else {
            ref(node);
          }
        }
      },
      [ref],
    );

    const formattedDate = (() => {
      if (!date) {
        return null;
      }
      const now = moment(new Date());
      if (now.isSame(date, 'date')) {
        return `at ${date.format(DEFAULT_TIME_FORMAT)}`;
      }
      if (now.isSame(date, 'year')) {
        return date.format(DATE_WITHOUT_YEAR_FORMAT);
      }
      return date.format(DEFAULT_DATE_FORMAT);
    })();

    const renderMedia = useCallback(
      (media?: Props['media']) => {
        if (!media || media.length === 0) {
          return null;
        }

        // A media preview's maximum width is the bubble's max width - sum of its horizontal paddings (16)
        const mediaMaxWidth = maxWidth - 32;
        const mediaBorderRadius = layoutDirection === 'vertical' ? 2 : 8;

        if (media.length === 1) {
          // If only one file is given, height is determined based on the file's dimension or aspect ratio.
          const [file] = media;
          if (file.type === 'image') {
            const frameSize: React.ComponentProps<typeof ImageFileRenderer>['frameSize'] = (() => {
              if (layoutDirection === 'horizontal') {
                return horizontalLayoutMediaFrameSize;
              }
              const height = (() => {
                if (file.dimension) {
                  const { width, height } = file.dimension!;
                  return (mediaMaxWidth * height) / width;
                }
                return 'auto' as const;
              })();
              return { width: mediaMaxWidth, height };
            })();
            return (
              <ImageFileRenderer
                file={file}
                frameSize={frameSize}
                maxSize={{ width: mediaMaxWidth }}
                borderRadius={mediaBorderRadius}
              />
            );
          }

          const frameSize: React.ComponentProps<typeof VideoFileRenderer>['frameSize'] = (() => {
            if (layoutDirection === 'horizontal') {
              return horizontalLayoutMediaFrameSize;
            }
            const height = (() => {
              if (file.aspectRatio) {
                const { x, y } = file.aspectRatio;
                return (mediaMaxWidth * y) / x;
              }
              return 'auto' as const;
            })();
            return { width: mediaMaxWidth, height };
          })();
          return <VideoFileRenderer file={file} frameSize={frameSize} borderRadius={mediaBorderRadius} />;
        }

        /**
         * If multiple files are given, the frame containing media previews is fixed (4:3 frame or 1:1 frame), which
         * will be split into a grid.
         */
        return (
          <MediaGrid
            files={media}
            frameSize={
              layoutDirection === 'vertical'
                ? { width: mediaMaxWidth, height: mediaMaxWidth * 0.75 }
                : horizontalLayoutMediaFrameSize
            }
            itemBorderRadius={mediaBorderRadius}
          />
        );
      },
      [layoutDirection, maxWidth],
    );

    if (isExpanded) {
      const avatarComponent =
        layoutDirection === 'vertical' ? (
          <DeskAgentAvatar
            className="MessageContainer__avatar"
            size={16}
            profileID={authorName || ''}
            imageUrl={avatar}
          />
        ) : (
          <DeskCustomerAvatar
            className="MessageContainer__avatar"
            size={16}
            profileID={authorName || ''}
            imageUrl={avatar}
          />
        );

      return (
        <PostBubble
          ref={containerRefCallback}
          layoutDirection={layoutDirection}
          hasMedia={!!media}
          maxWidth={maxWidth}
          className={className}
        >
          {renderMedia(media)}
          <MessageContainer isCollapseButtonVisible={!!onCollapseButtonClick}>
            <div className="MessageContainer__author">
              {avatarComponent}
              <div className="MessageContainer__authorName">{authorName}</div>
              <a className="MessageContainer__date" href={linkURL} target="_blank">
                {formattedDate}
              </a>
            </div>
            <div className="MessageContainer__text" dir={dir}>
              {text}
            </div>
            {embeddedSocialMediaPost}
          </MessageContainer>
          {
            // If onCollapseButtonClick prop is undefined, do not show CollapseButton
            onCollapseButtonClick && (
              <CollapseButton
                icon="minimize"
                size="xsmall"
                buttonType="tertiary"
                title={intl.formatMessage({ id: 'desk.conversation.twitter.message.collapsedMessage.hide' })}
                onClick={onCollapseButtonClick}
              />
            )
          }
        </PostBubble>
      );
    }
    return (
      <CollapsedBubble
        ref={ref}
        backgroundColor={collapsedBubbleBackgroundColor}
        as="button"
        className={className}
        onClick={onExpandButtonClick}
        {...collapsedBubbleEventHandlers}
      >
        {collapsedMessage}
        {onExpandButtonClick &&
          (isFetching ? (
            <Spinner className="CollapsedBubble__Icon" size={16} />
          ) : (
            <Icon
              className="CollapsedBubble__Icon"
              icon="maximize"
              size={16}
              color={cssVariables('purple-7')}
              assistiveText="Show"
            />
          ))}
      </CollapsedBubble>
    );
  },
);

export default SocialMediaPostBubbleMessage;
