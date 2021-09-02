import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Tag, cssVariables, Body, Spinner } from 'feather';

import { DynamicPartitioningConversionState } from '@chat/containers/settings/ChannelsSettings/DynamicPartitioningConverter/useDynamicPartitioningConversion';
import { useCurrentDynamicPartitioningOption } from '@chat/containers/settings/ChannelsSettings/hooks';

import { DynamicPartitioningTooltipIcon } from './DynamicPartitioningTooltipIcon';

type Props = { className?: string; conversionState: DynamicPartitioningConversionState };

const optionNameMessageIds = {
  single_subchannel: 'chat.openChannels.list.dynamicPartitioningOption.singleSubchannel',
  multiple_subchannels: 'chat.openChannels.list.dynamicPartitioningOption.multipleSubchannels',
  custom: 'chat.openChannels.list.dynamicPartitioningOption.custom',
};

const Container = styled.div`
  display: flex;
  flex-direction: row;

  > div:first-child > div {
    line-height: 0;
  }
`;

const ConvertInProgress = styled.div`
  display: flex;
  position: relative;
  top: 2px; // align baseline
  flex-direction: row;
  padding-left: 16px;
  padding-inline-start: 16px;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};

  > * + * {
    margin-left: 8px;
  }
`;

export const DynamicPartitioningOptionTag: FC<Props> = ({ className, conversionState }) => {
  const intl = useIntl();
  const { option: currentOption, isUsingDynamicPartitioning, isLoading } = useCurrentDynamicPartitioningOption();

  const tag = useMemo(() => {
    if (isLoading) {
      return null;
    }
    if (!isUsingDynamicPartitioning) {
      switch (conversionState) {
        case 'running':
        case 'migrationDone':
        case 'retrying':
          return (
            <ConvertInProgress role="progressbar">
              <span>
                {intl.formatMessage({
                  id: 'chat.openChannels.list.dynamicPartitioningOption.classic.convertInProgress',
                })}
              </span>
              <Spinner size={16} stroke={cssVariables('neutral-6')} />
            </ConvertInProgress>
          );

        default:
          return <Tag>{intl.formatMessage({ id: 'chat.openChannels.list.dynamicPartitioningOption.classic' })}</Tag>;
      }
    }
    if (isUsingDynamicPartitioning && currentOption) {
      return <Tag>{intl.formatMessage({ id: optionNameMessageIds[currentOption] })}</Tag>;
    }
    return null;
  }, [conversionState, currentOption, intl, isLoading, isUsingDynamicPartitioning]);

  if (!tag) {
    return null;
  }

  return (
    <Container className={className}>
      {tag}
      {isUsingDynamicPartitioning && <DynamicPartitioningTooltipIcon css="margin-left: 2px;" />}
    </Container>
  );
};
