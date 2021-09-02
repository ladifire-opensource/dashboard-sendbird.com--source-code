import { Component, forwardRef, useMemo } from 'react';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { Icon, Tooltip } from 'feather';

import { commonActions } from '@actions';
import { NAVIGATION_BAR_HEIGHT } from '@constants';
import { useDimension } from '@hooks';
import { Overlay } from '@ui/components';
import { transitionDefault } from '@ui/styles';

const ImagePreviewContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  user-select: none;
`;

const ImageHolder = styled.div`
  position: static;
  display: flex;
  flex-direction: column;
  user-select: initial;
  margin: auto;
`;

const ImageTop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: ${NAVIGATION_BAR_HEIGHT}px;
  display: flex;
`;

const ImageName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 24px;
`;

const ImageMenu = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const ImageMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ${transitionDefault};
  margin-right: 16px;
  border: 0;
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  width: 40px;
  height: 40px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  &:last-child {
    margin-right: 13px;
  }
`;

const mapStateToProps = (state: RootState) => ({
  imagePreview: state.imagePreview,
});

const mapDispatchToProps = {
  hideImagePreviewRequest: commonActions.hideImagePreviewRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

const Images = forwardRef<HTMLDivElement, { images: ImagePreview[] }>(({ images }, ref) => {
  const dimension = useDimension();
  const maxHeight = dimension.y * 0.78;
  return (
    <ImageHolder ref={ref}>
      {useMemo(
        () =>
          images.map((image, index) => {
            return (
              <img
                key={`image_${index}`}
                src={image.url}
                style={{
                  maxHeight,
                }}
                alt={image.name}
              />
            );
          }),
        [images, maxHeight],
      )}
    </ImageHolder>
  );
});

class ImagePreviewConnectable extends Component<Props> {
  private holderComponent;
  private topComponent;
  private refHandlers = {
    holder: (ref) => {
      this.holderComponent = ref;
    },
    top: (ref) => {
      this.topComponent = ref;
    },
  };

  private handleContainerMouseDown = (e) => {
    const isClickInside =
      (this.holderComponent !== null && this.holderComponent.contains(e.target)) ||
      (this.topComponent !== null && this.topComponent.contains(e.target));

    if (!isClickInside) {
      this.props.hideImagePreviewRequest();
    }
  };

  private handleDownloadClick = (image) => () => {
    window.open(image.url);
  };

  public render() {
    const { imagePreview, hideImagePreviewRequest } = this.props;

    const isOpen = imagePreview.images.length > 0;

    return (
      <Overlay
        isOpen={isOpen}
        hasBackdrop={true}
        backdropStyles={css`
          background-color: rgba(0, 0, 0, 0.8);
        `}
        onClose={hideImagePreviewRequest}
      >
        {imagePreview.images.length > 0 ? (
          <ImagePreviewContainer onClick={this.handleContainerMouseDown} data-test-id="ImagePreview">
            <ImageTop ref={this.refHandlers.top}>
              <ImageName>{imagePreview.images[0].name}</ImageName>
              <ImageMenu>
                <Tooltip content="Download" placement="bottom">
                  <ImageMenuButton aria-label="Download" onClick={this.handleDownloadClick(imagePreview.images[0])}>
                    <Icon icon="download" size={24} color="white" />
                  </ImageMenuButton>
                </Tooltip>
                <Tooltip content="Close" placement="bottom">
                  <ImageMenuButton aria-label="Close" onClick={hideImagePreviewRequest}>
                    <Icon icon="close" size={24} color="white" />
                  </ImageMenuButton>
                </Tooltip>
              </ImageMenu>
            </ImageTop>
            <Images ref={this.refHandlers.holder} images={imagePreview.images} />
          </ImagePreviewContainer>
        ) : (
          ''
        )}
      </Overlay>
    );
  }
}

export const ImagePreview = connect(mapStateToProps, mapDispatchToProps)(ImagePreviewConnectable);
