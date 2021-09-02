import { memo, useMemo, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { IconName, toast, Dropdown, Icon, cssVariables, DropdownProps } from 'feather';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentActivationStatusValue } from '@constants';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, useShowDialog } from '@hooks';

import { DeskBotFormMode } from './botDetailContext';

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  padding-left: 16px;
  padding-right: 4px;

  & > svg {
    margin-right: 8px;
  }
`;

const ActivationDropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  & > svg {
    margin-right: 8px;
  }
`;

const botStatusLabelKey = {
  [AgentActivationStatusValue.ACTIVE]: 'desk.settings.bots.detail.header.title.label.status.activated',
  [AgentActivationStatusValue.INACTIVE]: 'desk.settings.bots.detail.header.title.label.status.deactivated',
  [AgentActivationStatusValue.PENDING]: 'desk.settings.bots.detail.header.title.label.status.pending',
  [AgentActivationStatusValue.PAUSED]: 'desk.settings.bots.detail.header.title.label.status.paused',
};

type DropdownItem = {
  key: AgentActivationStatusValue;
  label: string;
  icon: IconName;
  onClick?: Function;
};

type DeskBotStatusDropdownProps = {
  mode: DeskBotFormMode;
  bot?: DeskBotDetail;
  onChange: (status: AgentActivationStatusValue) => void;
};

export const DeskBotDetailStatusDropdown = memo<DeskBotStatusDropdownProps>(({ mode, bot, onChange }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const showDialog = useShowDialog();

  const [{ status: activateDeskBotStatus }, activateDeskBot] = useAsync(
    (agentId: Agent['id']) =>
      deskApi.updateAgentStatus(pid, region, {
        agentId,
        status: AgentActivationStatusValue.ACTIVE,
      }),
    [pid, region],
  );
  const [{ status: pauseDeskBotStatus }, pauseDeskBot] = useAsync(
    () =>
      deskApi.updateAgentStatus(pid, region, {
        agentId: bot?.agent.id as number,
        status: AgentActivationStatusValue.PAUSED,
      }),
    [bot, pid, region],
  );

  const activateBot = useCallback(() => {
    if (bot) {
      activateDeskBot(bot.agent.id);
    }
  }, [activateDeskBot, bot]);

  const deactivateBot = useCallback(() => {
    if (bot) {
      showDialog({
        dialogTypes: DialogType.DeactivateDeskBot,
        dialogProps: {
          agentId: bot.agent.id,
          onSuccess: () => onChange(AgentActivationStatusValue.INACTIVE),
        },
      });
    }
  }, [bot, onChange, showDialog]);

  const pauseBot = useCallback(() => {
    pauseDeskBot();
  }, [pauseDeskBot]);

  const items: DropdownItem[] = useMemo(
    () => [
      {
        key: AgentActivationStatusValue.PAUSED,
        label: intl.formatMessage({ id: 'desk.settings.bots.detail.header.button.pause' }),
        icon: 'pause' as const,
        onClick: pauseBot,
      },
      {
        key: AgentActivationStatusValue.ACTIVE,
        label: intl.formatMessage({ id: 'desk.settings.bots.detail.header.button.activate' }),
        icon: 'resume' as const,
        onClick: activateBot,
      },
      {
        key: AgentActivationStatusValue.INACTIVE,
        label: intl.formatMessage({ id: 'desk.settings.bots.detail.header.button.deactivate' }),
        icon: 'stop' as const,
        onClick: deactivateBot,
      },
    ],
    [activateBot, deactivateBot, intl, pauseBot],
  );

  const pendingItem = useMemo(
    () => ({
      key: AgentActivationStatusValue.PENDING,
      label: '',
      icon: 'pause' as const,
      onClick: undefined,
    }),
    [],
  );

  useEffect(() => {
    if (activateDeskBotStatus === 'success') {
      onChange(AgentActivationStatusValue.ACTIVE);
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.toast.activated' }) });
    }
  }, [activateDeskBotStatus, intl, onChange]);

  useEffect(() => {
    if (pauseDeskBotStatus === 'success') {
      onChange(AgentActivationStatusValue.PAUSED);
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.toast.paused' }) });
    }
  }, [pauseDeskBotStatus, intl, onChange]);

  const dropdownItemRenderer = useCallback(
    (item: DropdownItem) => (
      <ActivationDropdownItem>
        <Icon icon={item.icon} size={18} color={cssVariables('neutral-6')} />
        {item.label}
      </ActivationDropdownItem>
    ),
    [],
  );

  const selectedItem = useMemo(() => [...items, pendingItem].find((item) => item.key === bot?.status) || items[2], [
    bot?.status,
    items,
    pendingItem,
  ]);
  const flexibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (bot?.status === AgentActivationStatusValue.PENDING) {
          return item.key === AgentActivationStatusValue.ACTIVE;
        }

        return item.key !== bot?.status;
      }),
    [bot?.status, items],
  );

  const isBotNotCreated = mode === DeskBotFormMode.CREATE || mode === DeskBotFormMode.DUPLICATE;
  const isBotFileNotReady = !bot?.isReadyToActivate ?? false;
  const isDropdownDisabled = isBotNotCreated || isBotFileNotReady;

  const tooltipProps: DropdownProps<DropdownItem>['tooltipProps'] = useMemo(() => {
    if (isBotNotCreated) {
      return {
        content: intl.formatMessage({
          id: 'desk.settings.bots.detail.header.button.activate.tooltip.custom',
        }),
      };
    }

    if (isBotFileNotReady) {
      return {
        content: intl.formatMessage({
          id: 'desk.settings.bots.detail.header.button.activate.tooltip.faq',
        }),
      };
    }
    return undefined;
  }, [intl, isBotFileNotReady, isBotNotCreated]);

  return (
    <Dropdown<DropdownItem>
      size="small"
      initialSelectedItem={selectedItem}
      selectedItem={selectedItem}
      items={flexibleItems}
      disabled={isDropdownDisabled}
      tooltipProps={tooltipProps}
      toggleRenderer={({ selectedItem }) => {
        if (selectedItem) {
          return (
            <ToggleWrapper>
              <Icon
                icon={selectedItem.icon}
                size={18}
                color={isDropdownDisabled ? cssVariables('neutral-5') : 'white'}
              />
              {intl.formatMessage({ id: botStatusLabelKey[selectedItem.key] })}
            </ToggleWrapper>
          );
        }
      }}
      itemToElement={dropdownItemRenderer}
      toggleTheme={{
        contentColor: 'white',
        hoverContentColor: 'white',
        pressedContentColor: 'white',
        bgColor: cssVariables('purple-7'),
        activeBgColor: cssVariables('purple-7'),
        hoverBgColor: cssVariables('purple-8'),
        pressedBgColor: cssVariables('purple-7'),
        disabledBgColor: cssVariables('neutral-2'),
      }}
      onChange={(item) => {
        item?.onClick?.();
      }}
    />
  );
});
