import { AxiosError } from 'axios';

import { commonActions } from '@actions';
import { logException } from '@utils/logException';

export const getErrorMessage = (
  error: any,
  fallbackMessage: string = 'Something went wrong. Please try again.',
): string => {
  let errorMessage;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (
    error &&
    error.status &&
    (String(error.status).startsWith('4') || String(error.status).startsWith('5')) &&
    error.data
  ) {
    errorMessage = error.data.message || error.data.detail;
  } else if (error?.message) {
    // can be either Error or AxiosError object
    errorMessage = error.message;
  } else {
    logException({
      error: new Error('Unclassified error type in generateBadRequest'),
      context: { error },
    });
  }

  return errorMessage || fallbackMessage;
};

export const generateBadRequest = (error) => {
  const { BUILD_MODE } = process.env;
  if (BUILD_MODE === 'local' || BUILD_MODE === 'staging') {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  if (error && (error as AxiosError).isAxiosError) {
    // Return an action ignored by reducers
    return { type: '' };
  }

  return commonActions.addNotificationsRequest({
    status: 'warning',
    message: getErrorMessage(error),
  });
};

export const alertBadRequest = (error) => {
  if (!!error.status && (String(error.status).startsWith('4') || String(error.status).startsWith('5'))) {
    const errorMessage = getErrorMessage(error);
    return commonActions.showAlert({ message: errorMessage });
  }
  return commonActions.hideAlert();
};
