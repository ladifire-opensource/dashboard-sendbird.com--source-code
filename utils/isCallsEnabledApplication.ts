export const isCallsEnabledApplication = (application: Application) =>
  application.attrs.sendbird_calls?.enabled ?? false;
