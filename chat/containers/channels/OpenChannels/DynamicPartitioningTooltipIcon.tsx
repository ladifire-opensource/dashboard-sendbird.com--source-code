import { FC, useMemo, Fragment } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  TooltipTargetIcon,
  Tooltip,
  TooltipVariant,
  LinkVariant,
  Lozenge,
  Headings,
  Body,
  TooltipProps,
} from 'feather';

import {
  useAvailableDynamicPartitioningOptions,
  useCurrentDynamicPartitioningOption,
} from '@chat/containers/settings/ChannelsSettings/hooks';
import { useAppId } from '@hooks';
import { LinkWithPermissionCheck } from '@ui/components';

type Props = { className?: string } & Pick<TooltipProps, 'placement' | 'popperProps'>;

const optionNameMessageIds = {
  single_subchannel: 'chat.openChannels.list.dynamicPartitioningOption.singleSubchannel',
  multiple_subchannels: 'chat.openChannels.list.dynamicPartitioningOption.multipleSubchannels',
  custom: 'chat.openChannels.list.dynamicPartitioningOption.custom',
};

const descriptionMessageIds = {
  single_subchannel: 'chat.openChannels.list.dynamicPartitioningOption.tooltip.singleSubchannel.desc',
  multiple_subchannels: 'chat.openChannels.list.dynamicPartitioningOption.tooltip.multipleSubchannels.desc',
  custom: 'chat.openChannels.list.dynamicPartitioningOption.tooltip.custom.desc',
};

const TooltipContent = styled.div`
  dl {
    margin-bottom: 24px;
  }

  dt {
    ${Headings['heading-01']};

    ${Lozenge} {
      display: inline-block;
      margin-left: 8px;
    }
  }

  dd,
  p {
    ${Body['body-short-01']};
  }

  dt + dd {
    margin-top: 4px;
  }

  dd + dt {
    margin-top: 12px;
  }
`;

export const DynamicPartitioningTooltipIcon: FC<Props> = ({ className, placement, popperProps }) => {
  const intl = useIntl();
  const options = useAvailableDynamicPartitioningOptions();
  const { option: currentOption } = useCurrentDynamicPartitioningOption();
  const appId = useAppId();

  const tooltipContent = useMemo(() => {
    return (
      <TooltipContent>
        <dl>
          {options.map(({ key }) => {
            return (
              <Fragment key={key}>
                <dt>
                  {intl.formatMessage({ id: optionNameMessageIds[key] })}
                  {key === currentOption && (
                    <Lozenge color="purple">
                      {intl.formatMessage({
                        id: 'chat.openChannels.list.dynamicPartitioningOption.tooltip.lozenge.inUse',
                      })}
                    </Lozenge>
                  )}
                </dt>
                <dd>{intl.formatMessage({ id: descriptionMessageIds[key] })}</dd>
              </Fragment>
            );
          })}
        </dl>
        <p>
          {intl.formatMessage(
            { id: 'chat.openChannels.list.dynamicPartitioningOption.tooltip.support' },
            {
              a: (text) => (
                <LinkWithPermissionCheck
                  href={`/${appId}/settings/channels`}
                  permissions={['application.settings.view', 'application.settings.all']}
                  variant={LinkVariant.Inline}
                  useReactRouter={true}
                  alertType="dialog"
                >
                  {text}
                </LinkWithPermissionCheck>
              ),
            },
          )}
        </p>
      </TooltipContent>
    );
  }, [appId, currentOption, intl, options]);

  return (
    <Tooltip
      variant={TooltipVariant.Light}
      content={tooltipContent}
      className={className}
      placement={placement}
      popperProps={popperProps}
      tooltipContentStyle={css`
        width: 360px;
      `}
    >
      <TooltipTargetIcon icon="info" size={16} />
    </Tooltip>
  );
};
