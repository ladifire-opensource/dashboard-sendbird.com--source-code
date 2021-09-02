import { useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Lozenge, Headings } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import { useAvailableDynamicPartitioningOptions } from '../../hooks';

const Description = styled.div`
  white-space: pre-line;
`;

const OptionsDefinitionList = styled.dl`
  margin-top: 16px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  padding: 16px;

  dt {
    display: flex;
    flex-direction: row;
    ${Headings['heading-01']};

    ${Lozenge} {
      margin-left: 8px;
    }
  }

  dd {
    margin-top: 4px;
    color: ${cssVariables('neutral-7')};

    b {
      font-weight: 500;
    }
  }

  dd + dt {
    margin-top: 16px;
  }
`;

export const useConvertDialog = () => {
  const intl = useIntl();
  const onConfirmRef = useRef<() => void>();
  const options = useAvailableDynamicPartitioningOptions();

  const singleParticipantCount =
    options.find((option) => option.key === 'single_subchannel')?.max_channel_participants ?? 0;
  const multipleChannelsOption = options.find((option) => option.key === 'multiple_subchannels');
  const multipleParticipantCount = multipleChannelsOption?.max_channel_participants ?? 0;
  const multipleMaxSubchannelCount = multipleChannelsOption
    ? Math.ceil(multipleChannelsOption.max_channel_participants / multipleChannelsOption.max_subchannel_participants)
    : 0;
  const maxParticipantCount = options.reduce((result, option) => Math.max(option.max_channel_participants, result), 0);
  const showDialog = useShowDialog({
    dialogTypes: DialogType.Confirm,
    dialogProps: {
      title: intl.formatMessage({
        id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.title',
      }),
      description: (
        <div>
          <Description>
            {intl.formatMessage(
              { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.body' },
              {
                maxParticipantCount,
                red: (text) => (
                  <em
                    css={`
                      font-style: normal;
                      color: ${cssVariables('red-5')};
                    `}
                  >
                    {text}
                  </em>
                ),
              },
            )}
          </Description>
          <OptionsDefinitionList>
            <dt>
              {intl.formatMessage(
                { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.options.single' },
                { tag: ([text]) => <Lozenge color="neutral">{text}</Lozenge> },
              )}
            </dt>
            <dd>
              {intl.formatMessage(
                {
                  id:
                    'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.options.single.desc',
                },
                {
                  maxParticipantCount: singleParticipantCount,
                  b: (text) => <b>{text}</b>,
                },
              )}
            </dd>
            <dt>
              {intl.formatMessage({
                id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.options.multiple',
              })}
            </dt>
            <dd>
              {intl.formatMessage(
                {
                  id:
                    'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.options.multiple.desc',
                },
                {
                  maxSubchannelCount: multipleMaxSubchannelCount,
                  maxParticipantCount: multipleParticipantCount,
                  b: (text) => <b>{text}</b>,
                },
              )}
            </dd>
          </OptionsDefinitionList>
        </div>
      ),

      confirmText: intl.formatMessage({
        id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.convert.btn.confirm',
      }),
      onConfirm: async (setIsPending) => {
        setIsPending(true);
        await onConfirmRef.current?.();
      },
    },
  });

  return useCallback(
    (onConfirm: () => void) => {
      onConfirmRef.current = onConfirm;
      showDialog();
    },
    [showDialog],
  );
};
