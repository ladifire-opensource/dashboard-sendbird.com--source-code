export enum DomainFilterTypeEnum {
  none,
  pass,
  block,
  replace,
}

export enum ProfanityFilterTypeEnum {
  none,
  asterisks,
  block,
}

export enum ImageModerationTypeEnum {
  none,
  normal,
  strict,
}

export enum ProfanityTriggeredModerationActionEnum {
  noAction,
  mute,
  kick,
  ban,
}
