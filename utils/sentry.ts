import { CaptureContext, Severity } from '@sentry/types';

// https://github.com/getsentry/sentry-javascript/blob/84890724c49318b4854f6aef0491242937d7423b/packages/minimal/src/index.ts#L37
export const captureException = (exception: any, captureContext?: CaptureContext) => {
  if (!window.Sentry) {
    return;
  }
  return window.Sentry.captureException(exception, captureContext);
};

// https://github.com/getsentry/sentry-javascript/blob/84890724c49318b4854f6aef0491242937d7423b/packages/minimal/src/index.ts#L58
export const captureMessage = (message: string, captureContext?: CaptureContext | Severity) => {
  if (!window.Sentry) {
    return;
  }
  return window.Sentry.captureMessage(message, captureContext);
};

window.addEventListener('unhandledrejection', (event) => {
  if (!window.Sentry) {
    return;
  }

  const { reason } = event;
  if (reason) {
    const error = new Error();
    error.name = 'UnhandledRejection';
    error.message = reason.message;
    error.stack = reason.stack;

    captureException(error, { extra: { reason } });
    event.preventDefault();
  }
});
