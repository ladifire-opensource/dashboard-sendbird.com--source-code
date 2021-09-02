import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  Avatar,
  AvatarType,
  AvatarProps,
  Dropdown,
  cssVariables,
  Subtitles,
  Spinner,
  Icon,
  DropdownProps,
  transitionDefault,
  ContextualHelp,
  EmptyState,
  EmptyStateSize,
  toast,
} from 'feather';
import throttle from 'lodash/throttle';
import unionBy from 'lodash/unionBy';

import { LIST_LIMIT, EMPTY_TEXT, AgentActivationStatusValue } from '@constants';
import { fetchDeskBot, fetchDeskBots } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskAgent } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { HighlightedText, TextWithOverflowTooltip } from '@ui/components';
import { logException } from '@utils/logException';

type ToggleBotInfoProps = {
  selectedItem: DeskBot | undefined;
  placeholder?: string;
  textWhenAllBotsSelected?: string;
  isOpen: boolean;
  isToggleFullWidth?: boolean;
};

const BotName = styled.span`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  line-height: 1.14;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropdownItemWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;

  & > div,
  & > svg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 8px;
    font-size: 12px;
    overflow-x: hidden;
  }

  ${BotName} {
    color: ${({ isSelected }) => (isSelected ? cssVariables('purple-7') : cssVariables('neutral-10'))};

    & > div {
      max-width: calc(100% - 20px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  & > svg {
    margin-left: 6px;
    margin-right: 6px;
  }
`;

const DropdownToggleWrapper = styled.div<{
  isOpen: boolean;
  variant?: DropdownProps<Agent>['variant'];
  isToggleFullWidth?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${({ variant }) => (variant === 'inline' ? 0 : '0 4px 0 16px')};
  max-width: ${({ isToggleFullWidth }) => (isToggleFullWidth ? 'calc(100% - 48px)' : '190px')};
  min-width: 96px;
  ${Subtitles['subtitle-01']};

  svg {
    transition: fill 0.2s ${transitionDefault};
    ${({ isOpen }) => isOpen && `fill: ${cssVariables('purple-7')};`}
  }
`;

const ToggleBot = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const ToggleBotName = styled(TextWithOverflowTooltip)<Pick<ToggleBotInfoProps, 'isToggleFullWidth'>>`
  max-width: ${({ isToggleFullWidth }) => (isToggleFullWidth ? '100%' : '120px')};
`;

const EmptyViewWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 206px;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-5')};
`;

const ALL_BOT_ID = -1;

const ToggleBotInfo = React.memo<ToggleBotInfoProps>(
  ({ selectedItem, placeholder, textWhenAllBotsSelected: textWhenAllAgentsSelected, isToggleFullWidth, isOpen }) => {
    const intl = useIntl();

    const [botThumbnail, setBotThumbnail] = useState<React.ReactNode | null>(null);
    const [botName, setBottName] = useState(selectedItem?.name ?? EMPTY_TEXT);

    const isAllBotsSelected = selectedItem?.id === ALL_BOT_ID;

    /**
     * FIXME:
     * Remove this email tweak when Desk back-end team fixes email sync delay issue.
     * https://sendbird.atlassian.net/browse/DESK-259
     */

    const generateBotIdentity = useCallback(() => {
      if (selectedItem) {
        if (isAllBotsSelected) {
          setBotThumbnail(null);
          setBottName(textWhenAllAgentsSelected || intl.formatMessage({ id: 'desk.botSelect.dropdown.item.allBots' }));
          return;
        }

        setBotThumbnail(
          <Avatar
            size={20}
            // The code below dynamically sync email, profile image and connection when it is updated
            profileID={selectedItem.id}
            imageUrl={selectedItem.photoUrl}
            type={AvatarType.Bot}
            status={selectedItem.agent.connection?.toLowerCase() as AvatarProps['status']}
          />,
        );
        setBottName(selectedItem.name);
        return;
      }

      setBotThumbnail(
        <Icon icon="user-avatar" size={20} color={(!isOpen && cssVariables('neutral-6')) || undefined} />,
      );
      setBottName(placeholder || intl.formatMessage({ id: 'desk.botSelect.dropdown.item.placeholder' }));
    }, [intl, isAllBotsSelected, isOpen, placeholder, selectedItem, textWhenAllAgentsSelected]);

    useEffect(() => {
      generateBotIdentity();
    }, [generateBotIdentity]);

    return (
      <ToggleBot data-test-id="SelectedBot">
        {botThumbnail}
        <ToggleBotName
          testId="SelectedBotName"
          tooltipDisplay="inline-block"
          isToggleFullWidth={isToggleFullWidth}
          css={isAllBotsSelected ? undefined : 'margin-left: 8px;'}
        >
          {botName}
        </ToggleBotName>
      </ToggleBot>
    );
  },
);

type Props = {
  selectedBotId?: DeskBot['id'];
  placeholder?: string;
  isToggleFullWidth?: boolean;
  disabled?: boolean;
  contextualHelpContent?: React.ReactNode;

  botStatuses?: AgentActivationStatusValue[];
  // FIXME: unused - always true
  isAllBotOptionAvailable?: boolean;
  textWhenAllBotsSelected?: string;
  dropdownProps?: Pick<DropdownProps<DeskBot>, 'size' | 'variant' | 'placement' | 'width' | 'disabled'>;
  onItemSelected: (item: DeskBot) => void;
};

export const BotsSearchDropdown = React.memo<Props>(
  ({
    selectedBotId,
    placeholder,
    textWhenAllBotsSelected,
    isToggleFullWidth,
    isAllBotOptionAvailable,
    dropdownProps,
    onItemSelected,
    botStatuses,
    disabled = false,
    contextualHelpContent,
  }) => {
    const intl = useIntl();
    const { pid, region } = useProjectIdAndRegion();
    const { getErrorMessage } = useDeskErrorHandler();

    const [selectedBot, setSelectedBot] = useState<DeskBot | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [bots, setBots] = useState<DeskBot[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const botsRef = useRef(bots);
    const offsetRef = useRef(0);
    const countRef = useRef(0);
    const queryRef = useRef('');
    const intersectionObserverCallback = useRef(() => {});
    const intersectionObserverDropdownRef = useRef<IntersectionObserver | null>(null);
    const hasMoreBots = countRef.current > bots.length;

    const currentBot = useDeskAgent();

    const allBotsOption = {
      id: ALL_BOT_ID,
      name: intl.formatMessage({ id: 'desk.botSelect.dropdown.item.allBots' }),
      status: 'ACTIVE' as DeskBot['status'],
      photoUrl: '',
      project: 0,
    } as DeskBot;

    const lastBotDropdownItemRefCallback = (node: HTMLDivElement | null) => {
      if (node) {
        const { current: currentIntersectionObserver } = intersectionObserverDropdownRef;
        if (currentIntersectionObserver) {
          currentIntersectionObserver.disconnect();
        }
        intersectionObserverDropdownRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry && entry.isIntersecting) {
              intersectionObserverCallback.current();
            }
          },
          { root: node.parentNode?.parentElement },
        );
        intersectionObserverDropdownRef.current.observe(node);
      }
    };

    const fetchBotsRequest = useCallback(
      async ({ offset }) => {
        setIsFetching(true);
        try {
          const {
            data: { results, count },
          } = await fetchDeskBots(pid, region, {
            offset,
            limit: LIST_LIMIT,
            order: '-created_at',
            status: botStatuses,
          });

          setIsEmpty(results.length === 0);

          if (offset === 0) {
            setBots(results);
          } else {
            if (offset !== offsetRef.current) {
              setBots(unionBy(botsRef.current, results, 'id'));
            }
          }
          offsetRef.current = offset;
          countRef.current = count;
        } catch (error) {
          const message = getErrorMessage(error);
          toast.error({ message });
          logException({ error: message, context: { error } });
        } finally {
          setIsFetching(false);
        }
      },
      [botStatuses, getErrorMessage, pid, region],
    );

    const fetchNextBotsRequest = useMemo(
      () =>
        throttle(() => {
          if (hasMoreBots) {
            fetchBotsRequest({ offset: bots.length === 1 ? 0 : bots.length });
          }
        }, 200),
      [bots.length, fetchBotsRequest, hasMoreBots],
    );

    const fetchBotRequest = useCallback(
      async ({ botId }) => {
        setIsFetching(true);
        try {
          const { data } = await fetchDeskBot(pid, region, { id: botId });
          setSelectedBot(data);
        } catch (error) {
          const message = getErrorMessage(error);
          toast.error({ message });
          logException({ error: message, context: { error } });
        }
      },
      [getErrorMessage, pid, region],
    );

    const handleItemSelected = useCallback(
      (item: DeskBot) => {
        // escape 'ESC' key
        if (item) {
          setSelectedBot(item);
          onItemSelected(item);
        }
      },
      [onItemSelected],
    );

    const handleToggleClick = useCallback(
      (isOpen) => () => {
        if (isOpen) {
          setBots([]);
        } else {
          fetchBotsRequest({ offset: 0 });
        }
      },
      [fetchBotsRequest],
    );

    useEffect(() => {
      if (isAllBotOptionAvailable && !isEmpty && !bots.some((agent) => agent.id === ALL_BOT_ID)) {
        setBots([allBotsOption, ...bots]);
      }
    }, [bots, allBotsOption, currentBot.email, currentBot.id, isAllBotOptionAvailable, isEmpty]);

    useEffect(() => {
      if ((isAllBotOptionAvailable && !selectedBotId) || selectedBotId === null) {
        setSelectedBot(allBotsOption);
        return;
      }

      if (selectedBotId) {
        const botInList = bots.find((item) => item.id === selectedBotId) || null;
        setSelectedBot(botInList);
        if (!botInList) {
          fetchBotRequest({ botId: selectedBotId });
        }

        return;
      }

      if (!selectedBot) {
        setSelectedBot(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBotId]);

    useEffect(() => {
      botsRef.current = bots;
    }, [bots]);

    useEffect(() => {
      intersectionObserverCallback.current = () => {
        fetchNextBotsRequest();
      };
    }, [bots, fetchNextBotsRequest]);

    useEffect(() => {
      fetchBotsRequest({ offset: 0 });
    }, [fetchBotsRequest]);

    const isHiddenTooltip = !disabled;

    return (
      <ContextualHelp content={contextualHelpContent} placement="bottom" disabled={isHiddenTooltip}>
        <Dropdown<DeskBot>
          size="small"
          variant="inline"
          placement="bottom-start"
          {...dropdownProps}
          selectedItem={selectedBot}
          onItemSelected={handleItemSelected}
          items={bots}
          isItemDisabled={(item) => item.id === selectedBot?.id}
          disabled={disabled}
          itemToString={(bot) => `${bot.id}`}
          itemToElement={(bot) => {
            const isAllBots = bot.id === ALL_BOT_ID;
            const isBotSelected = selectedBot?.id === bot.id;

            return (
              <DropdownItemWrapper
                ref={bots[bots.length - 1].id === bot.id && hasMoreBots ? lastBotDropdownItemRefCallback : undefined}
                isSelected={isBotSelected}
              >
                {!isAllBots && (
                  <Avatar
                    size="medium"
                    profileID={bot.id}
                    imageUrl={bot.photoUrl || undefined}
                    type={AvatarType.Bot}
                    status={bot.agent?.connection?.toLowerCase() as AvatarProps['status']}
                  />
                )}

                <BotName data-test-id="BotOptionName">
                  {isAllBots ? (
                    textWhenAllBotsSelected || intl.formatMessage({ id: 'desk.botSelect.dropdown.item.allBots' })
                  ) : (
                    <TextWithOverflowTooltip>
                      <HighlightedText highlightedText={queryRef.current} content={bot.name} isWrapper={false} />
                    </TextWithOverflowTooltip>
                  )}
                </BotName>
              </DropdownItemWrapper>
            );
          }}
          emptyView={
            <EmptyViewWrapper>
              {isFetching ? (
                <Spinner />
              ) : (
                <EmptyState
                  size={EmptyStateSize.Small}
                  icon="bot"
                  title={intl.formatMessage({ id: 'desk.botSelect.dropdown.noResult' })}
                  description="" // FIXME: Need to change description props to optional
                  withoutMarginBottom={true}
                />
              )}
            </EmptyViewWrapper>
          }
          toggleRenderer={({ selectedItem, isOpen }) => (
            <DropdownToggleWrapper
              isOpen={isOpen}
              variant={dropdownProps?.variant}
              isToggleFullWidth={isToggleFullWidth}
              onClick={handleToggleClick(isOpen)}
            >
              <ToggleBotInfo
                selectedItem={selectedItem ?? undefined}
                isOpen={isOpen}
                textWhenAllBotsSelected={
                  bots.length > 0
                    ? textWhenAllBotsSelected
                    : intl.formatMessage({ id: 'desk.botSelect.dropdown.item.noItem' })
                }
                placeholder={placeholder}
                isToggleFullWidth={isToggleFullWidth}
              />
            </DropdownToggleWrapper>
          )}
          css={css`
            width: ${isToggleFullWidth ? '100%' : 'auto'};
            & + ul {
              width: ${dropdownProps?.width || '190px'};
            }

            div li:hover {
              svg {
                fill: ${dropdownProps?.variant === 'default' ? cssVariables('purple-7') : cssVariables('neutral-10')};
              }
            }
          `}
        />
      </ContextualHelp>
    );
  },
);
