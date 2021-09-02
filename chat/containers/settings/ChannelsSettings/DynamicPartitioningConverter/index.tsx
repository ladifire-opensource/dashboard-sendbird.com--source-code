import { FC, MouseEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, InlineNotification, Spinner, cssVariables, LinkVariant, Link } from 'feather';

import { DynamicPartitioningConversionState } from './useDynamicPartitioningConversion';

type Props = {
  onConvertButtonClick: MouseEventHandler;
  conversionState: DynamicPartitioningConversionState;
};

const ConvertInProgress = styled.div`
  display: flex;
  flex-direction: row;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};

  > * + * {
    margin-left: 8px;
  }
`;

const Running = styled.div`
  > * + * {
    margin-top: 24px;
  }
`;

export const DynamicPartitioningConverter: FC<Props> = ({ onConvertButtonClick, conversionState }) => {
  const intl = useIntl();

  switch (conversionState) {
    case 'never':
    case 'failed':
      // Show "Convert" button for users to start(restart) the conversion
      return (
        <InlineNotification
          type="info"
          message={intl.formatMessage(
            { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.convertNow' },
            {
              convert: (text) => (
                <Link variant={LinkVariant.Inline} role="button" onClick={onConvertButtonClick}>
                  {text}
                </Link>
              ),
            },
          )}
        />
      );

    case 'running':
    case 'migrationDone':
    case 'retrying':
      return (
        <Running>
          <ConvertInProgress role="progressbar">
            <span>
              {intl.formatMessage({
                id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.convertInProgress',
              })}
            </span>
            <Spinner size={16} stroke={cssVariables('neutral-6')} />
          </ConvertInProgress>
          <InlineNotification
            type="info"
            message={intl.formatMessage({
              id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.convertInProgress.description',
            })}
          />
        </Running>
      );

    default:
      // Status unknown - wait until the status is fetched
      return (
        <Spinner
          size={24}
          stroke={cssVariables('neutral-6')}
          css={`
            margin: 0 auto;
            align-self: center;
          `}
        />
      );
  }
};
