import React from 'react';

import styled, { css } from 'styled-components';

import { ImageFile, VideoFile } from './fileInterfaces';
import { ImageFileRenderer, VideoFileRenderer } from './mediaRenderers';

type Props = {
  files: (ImageFile | VideoFile)[];
  frameSize: { width: number; height: number };
  itemBorderRadius: number;
};

const GridContainer = styled.div<{ gap: number }>`
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  grid-gap: ${(props) => props.gap}px;
`;

const MediaItemRenderer: React.FC<
  Pick<React.ComponentProps<typeof ImageFileRenderer>, 'frameSize' | 'borderRadius' | 'className'> & {
    file: VideoFile | ImageFile;
  }
> = ({ file, frameSize, borderRadius, className }) => {
  if (file.type === 'image') {
    return (
      <ImageFileRenderer
        key={file.url}
        file={file}
        frameSize={frameSize}
        borderRadius={borderRadius}
        className={className}
      />
    );
  }
  return (
    <VideoFileRenderer
      key={file.url}
      file={file}
      frameSize={frameSize}
      borderRadius={borderRadius}
      className={className}
    />
  );
};

export const MediaGrid: React.FC<Props> = ({ files, frameSize, itemBorderRadius }) => {
  const { width: gridWidth, height: gridHeight } = frameSize;
  const itemSpacing = gridWidth > 200 ? 4 : 2;

  // show up to 4 files
  const visibleFiles = files.slice(0, 4);
  const quarterFrameSize = { width: (gridWidth - itemSpacing) / 2, height: (gridHeight - itemSpacing) / 2 };
  const halfFrameSize = { width: quarterFrameSize.width, height: gridHeight };
  const children = (() => {
    switch (visibleFiles.length) {
      case 4: {
        return visibleFiles.map((file) => (
          <MediaItemRenderer
            key={file.url}
            file={file}
            frameSize={quarterFrameSize}
            borderRadius={itemBorderRadius}
            css={css`
              grid-row: auto / span 1;
              grid-column: auto / span 1;
            `}
          />
        ));
      }
      case 3: {
        const [firstFile, secondFile, thirdFile] = visibleFiles;
        return (
          <>
            <MediaItemRenderer
              file={firstFile}
              frameSize={halfFrameSize}
              borderRadius={itemBorderRadius}
              css={css`
                grid-row: 1 / 3;
                grid-column: 1 / 2;
              `}
            />
            <MediaItemRenderer
              file={secondFile}
              frameSize={quarterFrameSize}
              borderRadius={itemBorderRadius}
              css={css`
                grid-row: 1 / 2;
                grid-column: 2 / 3;
              `}
            />
            <MediaItemRenderer
              file={thirdFile}
              frameSize={quarterFrameSize}
              borderRadius={itemBorderRadius}
              css={css`
                grid-row: 2 / 3;
                grid-column: 2 / 3;
              `}
            />
          </>
        );
      }
      case 2:
        return visibleFiles.map((file) => (
          <MediaItemRenderer
            key={file.url}
            file={file}
            frameSize={halfFrameSize}
            borderRadius={itemBorderRadius}
            css={css`
              grid-row: 1 / 3;
              grid-column: auto / span 1;
            `}
          />
        ));
      case 1: {
        const [file] = visibleFiles;
        return (
          <MediaItemRenderer
            file={file}
            frameSize={frameSize}
            borderRadius={itemBorderRadius}
            css={css`
              grid-row: auto / span 2;
              grid-column: auto / span 2;
            `}
          />
        );
      }
      default:
        return null;
    }
  })();

  return <GridContainer gap={itemSpacing}>{children}</GridContainer>;
};
