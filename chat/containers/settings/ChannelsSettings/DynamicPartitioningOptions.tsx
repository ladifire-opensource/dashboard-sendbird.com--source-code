import { FC, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Link, Subtitles, Grid, GridItem, LinkVariant, cssVariables } from 'feather';

import { SettingsGridCard, SettingsRadioGrid } from '@common/containers/layout';
import { useErrorToast } from '@hooks';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LinkWithPermissionCheck } from '@ui/components';

import { DynamicPartitioningConverter } from './DynamicPartitioningConverter';
import { useDynamicPartitioningConversion } from './DynamicPartitioningConverter/useDynamicPartitioningConversion';
import { useAvailableDynamicPartitioningOptions, useCurrentDynamicPartitioningOption } from './hooks';
import { useUpdateDynamicPartitioningOption } from './useUpdateDynamicPartitioningOption';

const messageIds = {
  single_subchannel: {
    label: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.singleSubchannel',
    description: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.singleSubchannel.desc',
  },
  multiple_subchannels: {
    label: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.multipleSubchannels',
    description: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.multipleSubchannels.desc',
  },
  custom: {
    label: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.custom',
    description: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.options.custom.desc',
  },
};

const Support = styled.div`
  ${Subtitles['subtitle-01']};
  white-space: pre-line;

  hr {
    position: relative;
    top: -24px;
    border: 0;
    background: ${cssVariables('neutral-3')};
    height: 1px;
  }
`;

export const DynamicPartitioningOptions: FC<{ setUnsaved: (unsaved: boolean) => void }> = ({ setUnsaved }) => {
  const intl = useIntl();
  const options = useAvailableDynamicPartitioningOptions();
  const { isLoading, option: currentOption, isUsingDynamicPartitioning } = useCurrentDynamicPartitioningOption();
  const { confirmConversion, conversionState } = useDynamicPartitioningConversion();
  const [{ isLoading: isSaving, error }, updateDynamicPartitioningOption] = useUpdateDynamicPartitioningOption();
  const [value, setValue] = useState(currentOption);

  const isValueChanged = currentOption !== value;
  useEffect(() => {
    setUnsaved(isValueChanged);
  }, [isValueChanged, setUnsaved]);

  useErrorToast(error);

  const title = intl.formatMessage({ id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions' });

  const description = intl.formatMessage(
    { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.desc' },
    {
      a: (text) => (
        <Link
          variant={LinkVariant.Inline}
          iconProps={{ icon: 'open-in-new', size: 16 }}
          target="_blank"
          href="https://sendbird.com/docs/chat/v3/platform-api/guides/open-channel"
          css={`
            svg {
              vertical-align: top;
              margin-top: 1px;
            }
          `}
        >
          {text}
        </Link>
      ),
    },
  );

  if (!isUsingDynamicPartitioning) {
    return (
      <SettingsGridCard title={title} description={description} gridItemConfig={{ subject: { alignSelf: 'start' } }}>
        <DynamicPartitioningConverter onConvertButtonClick={confirmConversion} conversionState={conversionState} />
      </SettingsGridCard>
    );
  }

  const handleSave = () => {
    if (!value) {
      return;
    }
    updateDynamicPartitioningOption(value);
  };

  return (
    <SettingsRadioGrid<DynamicPartitioningOption>
      title={title}
      description={description}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      extra={
        <Grid gap={['0', '32px']}>
          <GridItem colSpan={6}></GridItem>
          <GridItem colSpan={6}>
            <Support>
              <hr />
              {intl.formatMessage(
                { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.support' },
                {
                  a: (text) => (
                    <LinkWithPermissionCheck
                      variant={LinkVariant.Inline}
                      permissions={CONTACT_US_ALLOWED_PERMISSIONS}
                      useReactRouter={true}
                      href="/settings/contact_us?category=technical_issue"
                    >
                      {text}
                    </LinkWithPermissionCheck>
                  ),
                },
              )}
            </Support>
          </GridItem>
        </Grid>
      }
      isFetching={isLoading || isSaving}
      initialValue={currentOption}
      selectedValue={value}
      onChange={(value) => setValue(value)}
      onReset={() => setValue(currentOption)}
      onSave={handleSave}
      radioItems={options.map(({ key, max_channel_participants }) => {
        return {
          value: key,
          label: intl.formatMessage({ id: messageIds[key].label }),
          description: intl.formatMessage(
            { id: messageIds[key].description },
            { max_channel_participants: intl.formatNumber(max_channel_participants) },
          ),
        };
      })}
    />
  );
};
