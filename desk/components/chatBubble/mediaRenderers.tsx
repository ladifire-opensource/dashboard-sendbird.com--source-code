import React, { useState } from 'react';

import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { cssVariables, Icon, ScrollBarRef, Spinner } from 'feather';

import { ImageFile, VideoFile, GeneralFile } from './fileInterfaces';

// The max width or height of a media preview is 360px if not given.
const DEFAULT_MAX_SIZE = 360;

/**
 * the maximum size of a media frame can be given as a number or an object with `width` property.
 * When given as a number, both the width and the height of the media frame is bound to the value.
 * When given as an object, only the width of the media frame is bound to the value.
 */
type MaxSize = number | { width: number };

/**
 * a frame size can be given in three ways. 1) both width and height is given as number 2) only width is specified and
 * height is auto 3) only height is specified and width is auto; the GIF previews in SocialInput is sized in this
 * way because their heights are fixed.
 */
export type MediaFrameSize =
  | { width: number; height: number }
  | { width: number; height: 'auto' }
  | { width: 'auto'; height: number };

const imageLoadingSpinner = <Spinner size={24} stroke={cssVariables('neutral-3')} />;

const Placeholder = styled.div`
  position: relative;
  background-color: ${cssVariables('neutral-2')};
  border: 1px solid ${cssVariables('neutral-3')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
`;

const Image = styled.img`
  object-fit: cover;

  &[data-clickable='true'] {
    cursor: pointer;
  }
`;

const Video = styled.video`
  display: block;
  object-fit: cover;
`;

export const ChatBubblesScrollBarRefContext = React.createContext<{
  ref: React.MutableRefObject<ScrollBarRef | undefined> | undefined;
  updateRef: (ref: ScrollBarRef | null) => void;
}>({ ref: undefined, updateRef: () => {} });

const getImageFrameSize = (
  dimension: { width: number; height: number },
  maxSize: MaxSize = DEFAULT_MAX_SIZE,
): { width: number; height: number } => {
  const { width, height } = dimension;
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }
  if (width > height) {
    const maxWidth = typeof maxSize === 'number' ? maxSize : maxSize.width;
    return { width: maxWidth, height: (maxWidth * height) / width };
  }
  if (typeof maxSize === 'number') {
    return { width: (maxSize * width) / height, height: maxSize };
  }
  return { width: maxSize.width, height: (maxSize.width * height) / width };
};

const getVideoFrameSize = (aspectRatio: { x: number; y: number }, maxSize = DEFAULT_MAX_SIZE) => {
  const { x: apsectRatioX, y: aspectRatioY } = aspectRatio;
  if (apsectRatioX > aspectRatioY) {
    return { width: maxSize, height: (maxSize * aspectRatioY) / apsectRatioX };
  }
  return { width: (maxSize * apsectRatioX) / aspectRatioY, height: maxSize };
};

export const ImageFileRenderer = (props: {
  file: ImageFile;
  frameSize?: MediaFrameSize;

  /**
   * If both the width and height of frameSize are number, or the dimension of the image is known, the placeholder
   * will be sized based on these values. Or, it will be sized based on maxSize prop and this prop, keeping the
   * ratio between width and height its size smaller than the maximum size.
   */
  placeholderRatio?: 1 | 0.75;

  maxSize?: MaxSize;
  borderRadius?: number;
  className?: string;
}) => {
  const { file, frameSize, maxSize = DEFAULT_MAX_SIZE, borderRadius = 0, placeholderRatio = 0.75, className } = props;
  const { fetchStatus, dimension, onClick } = file;
  const [isImgOnErrorCalled, setIsImgOnErrorCalled] = useState(false);

  const mediaFrameSize = frameSize || (dimension ? getImageFrameSize(dimension, maxSize) : undefined);
  const didFailToLoadImage = fetchStatus === 'failed' || isImgOnErrorCalled;
  const maxFrameWidth = typeof maxSize === 'number' ? maxSize : maxSize.width;
  const maxFrameHeight = typeof maxSize === 'number' ? maxSize : undefined;

  if (fetchStatus === 'fetching' || didFailToLoadImage) {
    // Should display the placeholder component
    const { width, height } = (() => {
      if (mediaFrameSize) {
        if (typeof mediaFrameSize.width === 'number' && typeof mediaFrameSize.height === 'number') {
          return mediaFrameSize;
        }
        if (typeof mediaFrameSize.width === 'number') {
          return { width: mediaFrameSize.width, height: mediaFrameSize.width * placeholderRatio };
        }
        if (typeof mediaFrameSize.height === 'number') {
          return { height: mediaFrameSize.height, width: mediaFrameSize.height / placeholderRatio };
        }
      }
      return { width: maxFrameWidth, height: maxFrameWidth * placeholderRatio };
    })();
    return (
      <Placeholder
        className={className}
        data-src={file.url}
        css={css`
          border-radius: ${borderRadius}px;
          width: ${width}px;
          height: ${height}px;
        `}
      >
        {fetchStatus === 'fetching' ? (
          imageLoadingSpinner
        ) : (
          <Icon icon="no-thumbnail" size={48} color={cssVariables('neutral-3')} />
        )}
      </Placeholder>
    );
  }

  const onImgError = () => {
    setIsImgOnErrorCalled(true);
  };
  return (
    <Image
      className={className}
      src={file.url}
      css={css`
        ${mediaFrameSize &&
        css`
          width: ${typeof mediaFrameSize.width === 'number' ? `${mediaFrameSize.width}px` : mediaFrameSize.width};
          height: ${typeof mediaFrameSize.height === 'number' ? `${mediaFrameSize.height}px` : mediaFrameSize.height};
        `}
        max-width: ${maxFrameWidth}px;
        max-height: ${maxFrameHeight && `${maxFrameHeight}px`};
        border-radius: ${borderRadius}px;
      `}
      data-clickable={!!onClick}
      onClick={onClick}
      onError={onImgError}
      data-test-id="ImageFileMessage"
    />
  );
};

export const VideoFileRenderer = (props: {
  file: VideoFile;
  frameSize?: MediaFrameSize;
  maxSize?: number;
  borderRadius?: number;
  className?: string;
}) => {
  const { file, frameSize, maxSize = DEFAULT_MAX_SIZE, borderRadius = 0, className } = props;
  const { aspectRatio, type, sources, url } = file;
  const mediaFrameSize = frameSize || (aspectRatio ? getVideoFrameSize(aspectRatio, maxSize) : undefined);
  const videoProps: Partial<React.VideoHTMLAttributes<HTMLVideoElement>> & Pick<React.Attributes, 'css'> = {
    autoPlay: type === 'twitter-gif',
    loop: type === 'twitter-gif',
    controls: type !== 'twitter-gif',
    preload: 'auto',
    muted: true,
    width: mediaFrameSize ? mediaFrameSize.width : undefined,
    height: mediaFrameSize && typeof mediaFrameSize.height === 'number' ? mediaFrameSize.height : undefined,
    className,
  };
  const inlineCSS = css`
    width: ${mediaFrameSize && typeof mediaFrameSize.width === 'number' ? `${mediaFrameSize.width}px` : undefined};
    height: ${mediaFrameSize && typeof mediaFrameSize.height === 'number' ? `${mediaFrameSize.height}px` : undefined};
    max-width: ${maxSize}px;
    max-height: ${maxSize}px;
    border-radius: ${borderRadius}px;
  `;

  return sources ? (
    <Video {...videoProps} css={inlineCSS}>
      {sources.map((source, index) =>
        typeof source === 'string' ? (
          <source key={`source_${source}_${index}`} src={source} />
        ) : (
          <source key={`source_${source.url}_${index}`} type={source.contentType} src={source.url} />
        ),
      )}
    </Video>
  ) : (
    <Video {...videoProps} css={inlineCSS}>
      <source src={url} />
    </Video>
  );
};

export const AudioFileRenderer = (props: {
  file: GeneralFile;
  maxSize?: number;
  styles?: FlattenSimpleInterpolation;
}) => {
  const { file, maxSize = DEFAULT_MAX_SIZE, styles } = props;
  const { url } = file;

  const cssProp = css`
    display: block;
    max-width: ${maxSize}px;
    max-height: ${maxSize}px;
    ${styles}
  `;

  // eslint-disable-next-line
  return <audio preload="auto" controls={true} src={url} css={cssProp} />;
};
