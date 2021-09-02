import { useMemo } from 'react';

import { useShallowEqualSelector } from '@hooks';

import { useAvailableDynamicPartitioningOptions } from './useAvailableDynamicPartitioningOptions';

export const useCurrentDynamicPartitioningOption = () => {
  const state = useShallowEqualSelector((state) => {
    const application = state.applicationState.data;

    if (application == null) {
      return null;
    }
    const {
      use_dynamic_partitioning_by_default,
      max_participants_per_subchannel,
      max_total_participants,
    } = application?.attrs.open_channel;

    return {
      use_dynamic_partitioning_by_default,
      max_participants_per_subchannel,
      max_total_participants,
    };
  });

  const options = useAvailableDynamicPartitioningOptions();

  const option: DynamicPartitioningOption | undefined = useMemo(() => {
    if (state == null || options.length === 0) {
      return undefined;
    }

    const { max_participants_per_subchannel, max_total_participants } = state;

    const customOption = options.find((item) => item.key === 'custom');
    if (
      customOption &&
      customOption.max_subchannel_participants > 0 &&
      customOption.max_channel_participants > 0 &&
      max_participants_per_subchannel === customOption.max_subchannel_participants &&
      max_total_participants === customOption.max_channel_participants
    ) {
      return 'custom';
    }

    const singleSubchannelOption = options.find((item) => item.key === 'single_subchannel');
    if (
      singleSubchannelOption &&
      max_participants_per_subchannel === singleSubchannelOption.max_subchannel_participants &&
      max_total_participants === singleSubchannelOption.max_subchannel_participants
    ) {
      return 'single_subchannel';
    }

    const multipleSubchannelsOption = options.find((item) => item.key === 'multiple_subchannels');
    if (
      multipleSubchannelsOption &&
      max_participants_per_subchannel === multipleSubchannelsOption.max_subchannel_participants &&
      max_total_participants === multipleSubchannelsOption.max_channel_participants
    ) {
      return 'multiple_subchannels';
    }

    return undefined;
  }, [options, state]);

  if (state == null) {
    return { isLoading: true };
  }

  const {
    max_participants_per_subchannel: maxParticipantsPerSubchannel,
    max_total_participants: maxTotalParticipants,
  } = state;

  return {
    isLoading: false,
    isUsingDynamicPartitioning: state.use_dynamic_partitioning_by_default,
    maxParticipantsPerSubchannel,
    maxTotalParticipants,
    maxSubchannels: maxTotalParticipants / maxParticipantsPerSubchannel,
    option,
  };
};
