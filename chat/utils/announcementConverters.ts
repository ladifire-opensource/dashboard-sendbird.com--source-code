import invert from 'lodash/invert';

type ModeV10 = AnnouncementV10['mode'];
type TargetDistinctV10 = AnnouncementV10['target_distinct'];

const modeTargetAtMap: Record<ModeV10, AnnouncementV16['target_at']> = {
  my_channels: 'sender_all_channels',
  target_channels: 'target_channels',
  target_users_include_in: 'target_users_included_channels',
  target_users_exactly_in: 'target_users_only_channels',
};

const targetAtModeMap = invert(modeTargetAtMap) as Record<AnnouncementV16['target_at'], ModeV10>;

const targetDistinctTargetChannelTypeMap: Record<TargetDistinctV10, AnnouncementV16['target_channel_type']> = {
  all: 'all',
  distinct: 'distinct',
  nondistinct: 'non_distinct',
};

const targetChannelTypeTargetDistinctMap = invert(targetDistinctTargetChannelTypeMap) as Record<
  AnnouncementV16['target_channel_type'],
  TargetDistinctV10
>;

export const ConvertersToLegacyProperties = {
  targetAt: (v: string): ModeV10 => targetAtModeMap[v],
  // FIXME: consider non_distinct and distinct on v1.6
  targetChannelType: (v: AnnouncementV16['target_channel_type']) => targetChannelTypeTargetDistinctMap[v],
};

export const normalizeOpenRate = (data: any, version: AnnouncementVersion): AnnouncementOpenRate => {
  if (version === 'v1.0') {
    const { accum_open_counts, accum_open_rates, ...sharedProperties } = data;
    return { ...sharedProperties, cumulative_open_counts: accum_open_counts, cumulative_open_rates: accum_open_rates };
  }
  return data;
};
