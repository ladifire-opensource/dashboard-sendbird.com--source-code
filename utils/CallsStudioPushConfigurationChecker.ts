const callsStudioIosAppBundleId = 'com.sendbird.calls.quickstart';
const callsStudioFcmServerApiKey =
  'AAAAND1Gdyo:APA91bHG4Ci2XUxxP6RHaWPrMfuOax0Lc0uvZgtUdONjVtxML2WxZmsSM-sfKvq1Q9Pfs0hHTggV9eyt1jS3P0qpW_zF6p35Q3gtnOYzeNBqDFHwHQCxlxL7CxlQLCV4Sfr2DHwgiCjs';

export const isCallsStudioAPNs = (bundleId: string) => {
  return bundleId === callsStudioIosAppBundleId;
};

export const isCallsStudioFCM = (apiKey: string) => {
  return apiKey === callsStudioFcmServerApiKey;
};
