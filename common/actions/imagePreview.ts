import { createAction } from '@actions/createAction';
import { ImagePreviewActionTypes } from '@actions/types';

export const ImagePreviewActions = {
  showImagePreviewRequest: (
    payload: {
      name: string;
      type?: string;
      url: string;
      thumbnails?: string[];
      createdAt?: number;
    }[],
  ) => createAction(ImagePreviewActionTypes.SHOW_IMAGE_PREVIEW_REQUEST, payload),
  hideImagePreviewRequest: () => createAction(ImagePreviewActionTypes.HIDE_IMAGE_PREVIEW_REQUEST),
};
