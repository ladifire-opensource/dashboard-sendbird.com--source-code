export function getCallOption(callOption) {
  return Object.assign({
    localMediaView: null,
    remoteMediaView: null,
    videoEnabled: true,
    audioEnabled: true
  }, callOption);
}

export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}