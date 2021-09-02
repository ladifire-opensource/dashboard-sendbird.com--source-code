export const REGION_TYPE_MAX_PARTICIPANTS_MAP = {
  SHARED: {
    single_subchannel: 2000,
    multiple_subchannels: {
      max_subchannel_participants: 2000,
      max_channel_participants: 20000,
    },
  },
  DEDICATED: {
    single_subchannel: 5000,
    multiple_subchannels: {
      max_subchannel_participants: 3000,
      max_channel_participants: 60000,
    },
  },
};
