import { AuthenticationActionTypes, ImagePreviewActionTypes } from '@actions/types';

const initialState = {
  images: [],
};

export const imagePreviewReducer = (state: ImagePreviewState = initialState, action) => {
  switch (action.type) {
    case ImagePreviewActionTypes.SHOW_IMAGE_PREVIEW_REQUEST:
      return { images: action.payload };
    case ImagePreviewActionTypes.HIDE_IMAGE_PREVIEW_REQUEST:
      return initialState;
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
