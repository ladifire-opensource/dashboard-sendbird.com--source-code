import { memo, HTMLAttributes, useCallback, useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Avatar,
  AvatarType,
  Subtitles,
  Tag,
  Body,
  AvatarProps,
  OverflowMenu,
  InlineNotification,
  transitions,
  OverflowMenuProps,
} from 'feather';
import moment from 'moment-timezone';
import qs from 'qs';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentActivationStatusValue, DeskBotDetailTab, DeskBotType, LIST_LIMIT, SortOrder } from '@constants';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShowDialog, useAppId, useAsync, useErrorToast } from '@hooks';
import { AgentActivationStatus, DeskBotTypeTag } from '@ui/components';

import { useBotWebhookLogs } from './useBotWebhookLogs';

const CardWrapper = styled.div`
  padding: 18px 24px;
  width: 100%;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  cursor: pointer;
  transition: ${transitions({ duration: 0.3, properties: ['border-color'] })};

  &:hover {
    border-color: ${cssVariables('neutral-3')};
  }
`;

const BotName = styled.h3`
  align-self: center;
  margin-left: 8px;
  margin-right: 8px;
  ${Subtitles['subtitle-03']};
`;

const BotKey = styled.span`
  margin-left: 6px;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};
`;

const GroupsWrapper = styled.div`
  margin-top: -8px;

  > div {
    margin-top: 8px;
    margin-right: 4px;
  }

  /* To ignore styles applied to tag components */
  div + div {
    margin-left: 0 !important;
  }
`;

const NoTeamsText = styled.span`
  margin-top: 8px;
  color: ${cssVariables('neutral-6')};
  ${Body['body-short-01']};
`;

const BotCreatedAt = styled.span`
  display: inline-flex;
  align-items: flex-end;
  margin-left: auto;
  padding-left: 64px;
  white-space: nowrap;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};
`;

type Props = {
  bot: DeskBot;
  onDelete: (botId: number) => void;
} & HTMLAttributes<HTMLDivElement>;

export const BotCard = memo<Props>(({ bot: botData, onDelete, ...others }) => {
  const intl = useIntl();
  const history = useHistory();
  const { pid, region } = useProjectIdAndRegion();
  const appId = useAppId();
  const { openWebhookLogs } = useBotWebhookLogs();
  const showDialog = useShowDialog();
  const [bot, setBot] = useState(botData);

  const isFAQBotPausedByFileIssue =
    bot.type === DeskBotType.FAQBOT && bot.status === AgentActivationStatusValue.PAUSED && !bot.isReadyToActivate;
  const backUrl = `${location.pathname}${location.search}`;

  const [{ status: checkWebhookLogsStatus, error: checkWebhookLogsError }, checkWebhookLogs] = useAsync(
    () => deskApi.updateDeskBot(pid, region, { id: bot.id, payload: { isUnreadError: false } }),
    [bot.id, pid, region],
  );
  useErrorToast(checkWebhookLogsError);

  const handleWebhookLogsButtonClick = useCallback(() => {
    if (bot.type === DeskBotType.CUSTOMIZED && bot.isUnreadError) {
      checkWebhookLogs();
    }
    openWebhookLogs(bot.id);
  }, [bot.id, bot.isUnreadError, bot.type, checkWebhookLogs, openWebhookLogs]);

  const handleFileButtonClick = useCallback(() => {
    if (bot.type === DeskBotType.FAQBOT) {
      const faqFileParams = {
        bot_type: bot.type,
        tab: DeskBotDetailTab.FILES,
        page: 1,
        page_size: LIST_LIMIT,
        sort_order: SortOrder.DESCEND,
        sort_by: 'created_at',
      };
      history.push(`/${appId}/desk/settings/bots/${bot.id}/edit?${qs.stringify(faqFileParams)}`);
    }
  }, [appId, bot.id, bot.type, history]);

  const handleDeleteButtonClick = useCallback(() => {
    const {
      agent: { id: botAgentId },
      id: botId,
    } = bot;
    showDialog({
      dialogTypes: DialogType.DeleteDeskBot,
      dialogProps: {
        agentId: botAgentId,
        onSuccess: () => {
          onDelete(botId);
        },
      },
    });
  }, [bot, onDelete, showDialog]);

  const handleDuplicateButtonClick = useCallback(() => {
    history.push(
      `/${appId}/desk/settings/bots/${bot.id}/duplicate?name=${intl.formatMessage(
        { id: 'desk.settings.bots.detail.form.basic.botName.input.value.duplicated' },
        { name: bot.name },
      )}&bot_type=${bot.type}`,
      { backUrl },
    );
  }, [appId, backUrl, bot.id, bot.name, bot.type, history, intl]);

  useEffect(() => {
    if (checkWebhookLogsStatus === 'success') {
      setBot((bot) => ({ ...bot, isUnreadError: false }));
    }
  }, [checkWebhookLogsStatus]);

  const overflowMenuItems: OverflowMenuProps['items'] = useMemo(() => {
    const commonItems = [
      {
        label: intl.formatMessage({ id: 'desk.settings.bots.list.item.overflowMenu.item.duplicate' }),
        onClick: handleDuplicateButtonClick,
      },
      {
        label: intl.formatMessage({ id: 'desk.settings.bots.list.item.overflowMenu.item.delete' }),
        onClick: handleDeleteButtonClick,
      },
    ];

    switch (bot.type) {
      case DeskBotType.CUSTOMIZED:
        return [
          {
            label: intl.formatMessage({ id: 'desk.settings.bots.list.item.overflowMenu.item.webhookLog' }),
            onClick: handleWebhookLogsButtonClick,
          },
          { isDivider: true },
          ...commonItems,
        ];

      case DeskBotType.FAQBOT:
        return [
          {
            label: intl.formatMessage({ id: 'desk.settings.bots.list.item.overflowMenu.item.files' }),
            onClick: handleFileButtonClick,
          },
          { isDivider: true },
          ...commonItems,
        ];

      default:
        return commonItems;
    }
  }, [
    bot.type,
    handleDeleteButtonClick,
    handleDuplicateButtonClick,
    handleFileButtonClick,
    handleWebhookLogsButtonClick,
    intl,
  ]);

  return (
    <CardWrapper role="listitem" {...others}>
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <Avatar
          type={AvatarType.Bot}
          size={32}
          profileID={bot.id}
          imageUrl={bot.agent.photoThumbnailUrl}
          status={bot.agent.connection.toLowerCase() as AvatarProps['status']}
        />
        <BotName>{bot.name}</BotName>
        <AgentActivationStatus status={bot.status} />
        <OverflowMenu
          items={overflowMenuItems}
          stopClickEventPropagation={true}
          popperProps={{ positionFixed: true }}
          css={css`
            margin-top: -4px;
            margin-right: -4px;
            margin-left: auto;
          `}
        />
      </div>
      <div
        css={css`
          display: flex;
          align-items: center;
          margin-top: 16px;
        `}
      >
        <DeskBotTypeTag type={bot.type} />
        <BotKey>{bot.key}</BotKey>
      </div>
      <div
        css={css`
          display: flex;
          margin-top: 12px;
        `}
      >
        <GroupsWrapper>
          {bot.agent.groups.length > 0 ? (
            bot.agent.groups.map((group) => <Tag key={group.id}>{group.name}</Tag>)
          ) : (
            <NoTeamsText>{intl.formatMessage({ id: 'desk.settings.bots.list.item.label.noTeams' })}</NoTeamsText>
          )}
        </GroupsWrapper>
        <BotCreatedAt>
          {intl.formatMessage(
            { id: 'desk.settings.bots.list.item.createdOn' },
            { date: moment(bot.createdAt).format('lll') },
          )}
        </BotCreatedAt>
      </div>
      {bot.isUnreadError && (
        <InlineNotification
          type="error"
          message={intl.formatMessage({ id: 'desk.settings.bots.list.item.notification.error.webhook.unread' })}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.bots.list.item.notification.error.webhook.action' }),
            onClick: (event) => {
              event.stopPropagation();
              handleWebhookLogsButtonClick();
            },
          }}
          css={css`
            margin-top: 16px;
          `}
        />
      )}
      {isFAQBotPausedByFileIssue && (
        <InlineNotification
          type="warning"
          message={intl.formatMessage({ id: 'desk.settings.bots.list.item.notification.error.file' })}
          action={{
            label: intl.formatMessage({ id: 'desk.settings.bots.list.item.notification.error.file.action' }),
            onClick: (event) => {
              event.stopPropagation();
              handleFileButtonClick();
            },
          }}
          css={css`
            margin-top: 16px;
          `}
        />
      )}
    </CardWrapper>
  );
});
