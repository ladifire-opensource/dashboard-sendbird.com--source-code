import { memo } from 'react';
import { IntlShape, useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Icon, IconProps, Spinner } from 'feather';

import { DeskBotFileStatus } from '@constants';

import { InfoTooltip } from '../InfoTooltip';

const DeskBotFileStatusContainer = styled.div<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${({ $isActive }) => ($isActive ? cssVariables('green-7') : cssVariables('neutral-10'))};
`;

type Props = {
  status: DeskBotFileStatus;
};

type StatusDefinitions = {
  intlKey: string;
  iconProps?: Pick<IconProps, 'icon' | 'color'>;
  tooltipContent?: string;
};

const intlKeys: Record<DeskBotFileStatus, StatusDefinitions> = {
  [DeskBotFileStatus.ACTIVE]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.inUse',
    iconProps: { icon: 'file-activated-filled', color: cssVariables('green-5') },
    tooltipContent: undefined,
  },
  [DeskBotFileStatus.INACTIVE]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.notInUse',
    iconProps: { icon: 'file-activated-filled', color: cssVariables('neutral-5') },
    tooltipContent: undefined,
  },
  [DeskBotFileStatus.PROCESSING]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.processing',
    iconProps: undefined,
    tooltipContent: undefined,
  },
  [DeskBotFileStatus.EXPIRED]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.expired',
    iconProps: { icon: 'warning-filled', color: cssVariables('yellow-5') },
    tooltipContent: 'desk.settings.bots.detail.files.fileStatus.expired.tooltip',
  },
  [DeskBotFileStatus.ERROR]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.error',
    iconProps: { icon: 'error-filled', color: cssVariables('red-5') },
    tooltipContent: 'desk.settings.bots.detail.files.fileStatus.error.tooltip',
  },
  [DeskBotFileStatus.DELETED]: {
    intlKey: 'desk.settings.bots.detail.files.fileStatus.deleted',
    iconProps: undefined,
    tooltipContent: undefined,
  },
};

const getStatusDefinition = (intl: IntlShape, status: DeskBotFileStatus) => {
  const definition = intlKeys[status];
  const statusLabel = definition ? intl.formatMessage({ id: definition.intlKey }) : status;
  const iconProps = definition?.iconProps;
  const tooltipContent =
    definition && typeof definition.tooltipContent === 'string'
      ? intl.formatMessage({ id: definition.tooltipContent })
      : undefined;
  return { statusLabel, iconProps, tooltipContent };
};

export const DeskBotFileStatusDefinition = memo<Props>(({ status }) => {
  const intl = useIntl();
  const { statusLabel, iconProps, tooltipContent } = getStatusDefinition(intl, status);

  return (
    <DeskBotFileStatusContainer $isActive={status === DeskBotFileStatus.ACTIVE}>
      {status === DeskBotFileStatus.PROCESSING && (
        <Spinner
          size={16}
          stroke={cssVariables('neutral-6')}
          css={css`
            margin-right: 8px;
          `}
        />
      )}
      {tooltipContent && iconProps && (
        <InfoTooltip
          content={tooltipContent}
          icon={iconProps.icon}
          iconProps={{ color: iconProps.color }}
          css={css`
            transform: translateX(-4px);
          `}
        />
      )}
      {!tooltipContent && iconProps && (
        <Icon
          {...iconProps}
          size={16}
          css={css`
            margin-right: 8px;
          `}
        />
      )}
      {statusLabel}
    </DeskBotFileStatusContainer>
  );
});
