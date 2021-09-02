import { useMemo } from 'react';

import { useShallowEqualSelector, useTypedSelector } from '@hooks';

import { REGION_TYPE_MAX_PARTICIPANTS_MAP } from './constants';
import { useRegionType } from './useRegionType';

export const useAvailableDynamicPartitioningOptions = () => {
  const getRegionType = useRegionType();
  const region = useTypedSelector((state) => state.applicationState.data?.region);
  const state = useShallowEqualSelector((state) => {
    const application = state.applicationState.data;

    if (application == null) {
      return null;
    }

    const { use_dynamic_partitioning_by_default } = application?.attrs.open_channel;
    const { dashboard_options } = application?.attrs.feature_control_by_gate.open_channel || {};

    return {
      use_dynamic_partitioning_by_default,
      dashboard_options,
    };
  });

  const regionType = region ? getRegionType(region) : null;

  return useMemo(() => {
    if (state == null || !state.dashboard_options) {
      return [];
    }

    const { custom } = state.dashboard_options;
    const options: {
      max_channel_participants: number;
      max_subchannel_participants: number;
      key: DynamicPartitioningOption;
    }[] = [
      {
        key: 'single_subchannel',
        max_subchannel_participants:
          regionType === 'DEDICATED'
            ? REGION_TYPE_MAX_PARTICIPANTS_MAP.DEDICATED.single_subchannel
            : REGION_TYPE_MAX_PARTICIPANTS_MAP.SHARED.single_subchannel,
        max_channel_participants:
          regionType === 'DEDICATED'
            ? REGION_TYPE_MAX_PARTICIPANTS_MAP.DEDICATED.single_subchannel
            : REGION_TYPE_MAX_PARTICIPANTS_MAP.SHARED.single_subchannel,
      },
      {
        key: 'multiple_subchannels',
        max_subchannel_participants:
          regionType === 'DEDICATED'
            ? REGION_TYPE_MAX_PARTICIPANTS_MAP.DEDICATED.multiple_subchannels.max_subchannel_participants
            : REGION_TYPE_MAX_PARTICIPANTS_MAP.SHARED.multiple_subchannels.max_subchannel_participants,
        max_channel_participants:
          regionType === 'DEDICATED'
            ? REGION_TYPE_MAX_PARTICIPANTS_MAP.DEDICATED.multiple_subchannels.max_channel_participants
            : REGION_TYPE_MAX_PARTICIPANTS_MAP.SHARED.multiple_subchannels.max_channel_participants,
      },
    ];

    if (custom.max_subchannel_participants > 0 && custom.max_channel_participants > 0) {
      options.push({ key: 'custom', ...custom });
    }

    return options;
  }, [regionType, state]);
};
