import { useState, useRef, useEffect, useCallback, useMemo, memo, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled, { css, SimpleInterpolation } from 'styled-components';

import {
  Dropdown,
  cssVariables,
  Subtitles,
  Spinner,
  Icon,
  DropdownProps,
  transitionDefault,
  ContextualHelp,
} from 'feather';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import unionBy from 'lodash/unionBy';

import { deskApi } from '@api';
import { LIST_LIMIT, AgentTier, EMPTY_TEXT, AgentType, AgentActivationStatusValue, AgentRole } from '@constants';
import DeskAgentAvatarByType from '@desk/components/DeskAgentAvatarByType';
import { useBotTypeLabel } from '@desk/hooks';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskAgent, useAsync, useErrorToast } from '@hooks';
import { HighlightedText, TextWithOverflowTooltip } from '@ui/components';

import { AgentBadge } from './agents/AgentBadge';

const AgentName = styled.span`
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

const AgentEmail = styled.span`
  display: block;
  font-style: normal;
  color: ${cssVariables('neutral-6')};
  line-height: 1.33;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AgentBotType = styled(AgentEmail)`
  display: block;
`;

const DropdownItemWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;

  & > div,
  & > svg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 12px;
    font-size: 12px;
    overflow-x: hidden;

    ${AgentName} {
      color: ${({ isSelected }) => (isSelected ? cssVariables('purple-7') : cssVariables('neutral-10'))};

      & > div:first-child {
        max-width: calc(100% - 20px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    ${AgentEmail} {
      color: ${({ isSelected }) => (isSelected ? cssVariables('purple-4') : cssVariables('neutral-6'))};
    }
  }

  & > svg {
    margin-left: 6px;
    margin-right: 6px;
  }
`;

const AgentInfoContainer = styled.div`
  flex: 1;
`;

const GroupItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ isSelected }) => (isSelected ? cssVariables('purple-7') : cssVariables('neutral-10'))};
`;

const DropdownToggleWrapper = styled.div<{
  isOpen: boolean;
  variant?: DropdownProps<Agent>['variant'];
  isToggleFullWidth?: boolean;
  disabled: boolean;
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
    ${({ disabled }) => disabled && `fill: ${cssVariables('neutral-3')};`}
  }
`;

const ToggleAgent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;
const ToggleAgentName = styled(TextWithOverflowTooltip)<Pick<ToggleAgentInfoProps, 'isToggleFullWidth'>>`
  max-width: ${({ isToggleFullWidth }) => (isToggleFullWidth ? '100%' : '120px')};
`;

const EmptyViewWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104px;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-5')};
`;

const ALL_AGENT_ID = -1;

type ToggleAgentInfoProps = {
  selectedItem: Agent | undefined;
  placeholder?: string;
  agentType?: AgentType;
  textWhenAllAgentsSelected?: string;
  isOpen: boolean;
  isToggleFullWidth?: boolean;
};

const ToggleAgentInfo = memo<ToggleAgentInfoProps>(
  ({ selectedItem, placeholder, agentType, textWhenAllAgentsSelected, isToggleFullWidth, isOpen }) => {
    const intl = useIntl();
    const currentAgent = useDeskAgent();

    const isAllAgentSelected = selectedItem?.id === ALL_AGENT_ID;
    const isBotOnly = agentType === AgentType.BOT;

    /**
     * FIXME:
     * Remove this email tweak when Desk back-end team fixes email sync delay issue.
     * https://sendbird.atlassian.net/browse/DESK-259
     */
    const isSelectedAgentAsMySelf = selectedItem?.id === currentAgent.id;
    const selectedAgent = isSelectedAgentAsMySelf ? currentAgent : selectedItem;

    const agentIdentity = useMemo(() => {
      if (selectedAgent) {
        if (isAllAgentSelected) {
          return {
            agentThumbnail: null,
            agentName:
              textWhenAllAgentsSelected || intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allAgents' }),
          };
        }

        return {
          agentThumbnail: <DeskAgentAvatarByType isBotOnly={isBotOnly} agent={selectedAgent} size={20} />,
          agentName: selectedAgent.displayName || EMPTY_TEXT,
        };
      }

      return {
        agentThumbnail: (
          <Icon
            icon={isBotOnly ? 'bot' : 'user-avatar'}
            size={20}
            color={(!isOpen && cssVariables('neutral-6')) || undefined}
          />
        ),
        agentName: placeholder || intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.placeholder' }),
      };
    }, [intl, isAllAgentSelected, isBotOnly, isOpen, placeholder, selectedAgent, textWhenAllAgentsSelected]);

    return (
      <ToggleAgent data-test-id="SelectedAgent">
        {agentIdentity.agentThumbnail}
        <ToggleAgentName
          testId="SelectedAgentName"
          tooltipDisplay="inline-block"
          isToggleFullWidth={isToggleFullWidth}
          css={isAllAgentSelected ? undefined : 'margin-left: 8px;'}
        >
          {agentIdentity.agentName}
        </ToggleAgentName>
      </ToggleAgent>
    );
  },
);

type AgentGroupDropdownProps = {
  selectedGroup: AgentGroup<'listItem'> | null;
  groups: AgentGroup<'listItem'>[];
  isLoading: boolean;
  disabled: boolean;
  hasMoreGroups: boolean;
  onItemSelected: (item: AgentGroup<'listItem'>) => void;
  fetchAgentGroups: ({ offset: number }) => void;
};

export const AgentGroupDropdown = memo<AgentGroupDropdownProps>(
  ({ groups, isLoading, selectedGroup, disabled, hasMoreGroups, onItemSelected, fetchAgentGroups }) => {
    const intl = useIntl();
    const intersectionObserverAgentGroupsRef = useRef<IntersectionObserver | null>(null);
    const intersectionAgentGroupsObserverCallback = useRef(() => {});
    const allAgentGroupsOption: AgentGroup<'listItem'> = useMemo(
      () => ({
        id: -1,
        name: intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allTeams' }),
        key: 'all',
        description: null,
        project: 0,
        createdAt: '',
        createdBy: 0,
        memberCount: 0,
      }),
      [intl],
    );

    const lastAgentGroupRefCallback = (node: HTMLDivElement | null) => {
      if (node) {
        const { current: currentIntersectionObserver } = intersectionObserverAgentGroupsRef;
        if (currentIntersectionObserver) {
          currentIntersectionObserver.disconnect();
        }
        intersectionObserverAgentGroupsRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry && entry.isIntersecting) {
              intersectionAgentGroupsObserverCallback.current();
            }
          },
          { root: node.parentNode?.parentElement },
        );
        intersectionObserverAgentGroupsRef.current.observe(node);
      }
    };

    const fetchNextGroupsRequest = useCallback(() => {
      throttle(() => {
        if (hasMoreGroups) {
          fetchAgentGroups({ offset: groups.length });
        }
      }, 200);
    }, [fetchAgentGroups, groups.length, hasMoreGroups]);

    useEffect(() => {
      intersectionAgentGroupsObserverCallback.current = () => {
        fetchNextGroupsRequest();
      };
    }, [fetchNextGroupsRequest]);

    return (
      <Dropdown<AgentGroup<'listItem'>>
        size="small"
        variant="inline"
        placement="bottom-end"
        items={groups}
        itemToString={(group) => {
          const isDefaultGroup = group.key == null;
          if (isDefaultGroup) {
            return intl.formatMessage({ id: 'desk.team.defaultTeam' });
          }

          if (group.id === allAgentGroupsOption.id) {
            return intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allTeams' });
          }

          return group.name;
        }}
        itemToElement={(group) => {
          const isDefaultGroup = group.key == null;
          if (isDefaultGroup) {
            return intl.formatMessage({ id: 'desk.team.defaultTeam' });
          }

          if (group.id === allAgentGroupsOption.id) {
            return intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allTeams' });
          }
          return (
            <GroupItem
              ref={groups[groups.length - 1].id === group.id && hasMoreGroups ? lastAgentGroupRefCallback : undefined}
              isSelected={selectedGroup?.id === group.id}
            >
              {group.name}
            </GroupItem>
          );
        }}
        selectedItem={selectedGroup}
        disabled={disabled || isLoading}
        onItemSelected={onItemSelected}
        css={css`
          margin-left: 4px;
        `}
      />
    );
  },
);

type Props = {
  selectedAgent?: Agent | null;
  selectedAgentId?: Agent['id'] | null;
  selectedAgentGroup?: AgentGroup<'listItem'> | null;
  agentType?: AgentType;
  agentActivationStatus?: AgentActivationStatusValue | AgentActivationStatusValue[];
  role?: AgentRole;
  placeholder?: string;
  contextualHelpContent?: ReactNode;
  textWhenAllAgentsSelected?: string;
  isToggleFullWidth?: boolean;
  isAllAgentOptionAvailable?: boolean;
  isAgentGroupDropdownHidden?: boolean;
  isSearchHidden?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  dropdownProps?: Pick<DropdownProps<Agent>, 'size' | 'variant' | 'placement' | 'width' | 'disabled'>;
  styles?: SimpleInterpolation;
  onItemSelected?: (item: Agent) => void;
};

export const AgentsSearchDropdown = memo<Props>(
  ({
    selectedAgent = null,
    selectedAgentId = null,
    selectedAgentGroup = null,
    agentType,
    role,
    agentActivationStatus = AgentActivationStatusValue.ACTIVE,
    placeholder,
    contextualHelpContent,
    textWhenAllAgentsSelected,
    isToggleFullWidth = false,
    isAllAgentOptionAvailable = false,
    isAgentGroupDropdownHidden = false,
    isSearchHidden = false,
    disabled = false,
    hasError = false,
    dropdownProps,
    styles,
    onItemSelected,
  }) => {
    const intl = useIntl();
    const { pid, region } = useProjectIdAndRegion();
    const getBotTypeLabel = useBotTypeLabel();
    const allAgentGroupsOption: AgentGroup<'listItem'> = useMemo(
      () => ({
        id: -1,
        name: intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allTeams' }),
        key: 'all',
        description: null,
        project: 0,
        createdAt: '',
        createdBy: 0,
        memberCount: 0,
      }),
      [intl],
    );

    const allAgentsOption: Agent = useMemo(
      () => ({
        id: ALL_AGENT_ID,
        bot: null,
        displayName: intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allAgents' }),
        user: -1,
        agentType: AgentType.USER,
        sendbirdId: 'all',
        role: AgentRole.AGENT,
        createdAt: '0',
        status: AgentActivationStatusValue.ACTIVE,
        connection: 'ONLINE' as Agent['connection'],
        email: 'all@sendbird.com',
        phoneNumber: '',
        photoThumbnailUrl: '',
        project: 0,
        connectionUpdatedAt: '',
        connectionUpdatedTs: 0,
        tier: AgentTier.INTERMEDIATE,
        groups: [],
      }),
      [intl],
    );

    const isControlledAgent = typeof selectedAgent === 'object';
    const isControlledAgentId = typeof selectedAgentId === 'number' && selectedAgentId > 0;
    const initialAgent = useMemo(() => {
      if (isControlledAgent) return selectedAgent;
      if (isAllAgentOptionAvailable) return allAgentsOption;
      return null;
    }, [allAgentsOption, isAllAgentOptionAvailable, isControlledAgent, selectedAgent]);

    const [agent, setAgent] = useState<Agent | null>(initialAgent);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [groups, setGroups] = useState<AgentGroup<'listItem'>[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<AgentGroup<'listItem'> | null>(
      isAgentGroupDropdownHidden ? null : allAgentGroupsOption,
    );

    const agentsRef = useRef(agents);
    const totalAgentsCountRef = useRef(0);
    const totalAgentGroupsCountRef = useRef(0);
    const queryRef = useRef('');
    const intersectionObserverCallback = useRef(() => {});
    const intersectionObserverDropdownRef = useRef<IntersectionObserver | null>(null);

    const hasMoreAgents = totalAgentsCountRef.current > agents.length;
    const hasMoreGroups = totalAgentGroupsCountRef.current > groups.length;

    const currentAgent = useDeskAgent();
    const isBotOnly = agentType === AgentType.BOT;

    const lastAgentDropdownItemRefCallback = (node: HTMLDivElement | null) => {
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

    const agentGroupParam = useMemo(() => {
      if (isAgentGroupDropdownHidden && selectedAgentGroup != null) {
        return selectedAgentGroup.id;
      }

      if (selectedGroup != null && selectedGroup.id > -1) {
        return selectedGroup.id;
      }

      return undefined;
    }, [isAgentGroupDropdownHidden, selectedAgentGroup, selectedGroup]);

    const [
      { data: fetchAgentsData, status: fetchAgentsStatus, error: fetchAgentsError },
      fetchAgentsRequest,
    ] = useAsync(
      async ({ offset, query }: { offset: number; query?: string }) =>
        deskApi.fetchAgents(pid, region, {
          offset,
          limit: LIST_LIMIT,
          group: agentGroupParam,
          order: 'display_name',
          agentType,
          role,
          status: agentActivationStatus,
          query,
        }),
      [agentActivationStatus, agentGroupParam, agentType, pid, region, role],
      {
        status: 'loading',
      },
    );

    const [{ data: fetchAgentData, status: fetchAgentStatus, error: fetchAgentError }, fetchAgentRequest] = useAsync(
      async ({ agentId }: { agentId: Agent['id'] }) =>
        deskApi.fetchAgent(pid, region, {
          agentId,
          status: agentActivationStatus,
        }),
      [agentActivationStatus, pid, region],
    );

    const [
      { data: fetchAgentGroupsData, status: fetchAgentGroupsStatus, error: fetchAgentGroupsError },
      fetchAgentGroupsRequest,
    ] = useAsync(
      async ({ offset }: { offset: number }) =>
        deskApi.fetchAgentGroups(pid, region, {
          offset,
          limit: 50, // FIXME: Temporarily set limit to 50 because of infinite scroll issue / Before: LIST_LIMIT
        }),
      [pid, region],
    );

    const fetchNextAgentsRequest = useMemo(
      () =>
        throttle(() => {
          if (hasMoreAgents) {
            fetchAgentsRequest({
              offset: agentsRef.current.length === 1 ? 0 : agentsRef.current.length,
              query: queryRef.current.trim(),
            });
          }
        }, 200),
      [fetchAgentsRequest, hasMoreAgents],
    );

    const isLoading =
      fetchAgentsStatus === 'loading' || fetchAgentStatus === 'loading' || fetchAgentGroupsStatus === 'loading';
    const hasServerError = fetchAgentsStatus === 'error' || fetchAgentGroupsStatus === 'error';

    useErrorToast(fetchAgentsError || fetchAgentGroupsError, { ignoreDuplicates: true });

    useEffect(() => {
      if (isControlledAgentId) fetchAgentRequest({ agentId: selectedAgentId as number });
    }, [fetchAgentRequest, isControlledAgentId, selectedAgentId]);

    useEffect(() => {
      if (fetchAgentError) {
        setAgent(null);
      }
    }, [fetchAgentError]);

    useEffect(() => {
      if (fetchAgentData) {
        const { data } = fetchAgentData;
        /**
         * If selectedAgentGroup prop exist, selectedAgentId should be in the team.
         * It selectedAgentId is not included in the selectedAgentGroup, it should not display agent as selected on dropdown toggle renderer
         */
        if (selectedAgentGroup != null && data.groups.every((group) => group.id !== selectedAgentGroup.id)) {
          setAgent(null);
          return;
        }

        if (selectedAgentId === fetchAgentData.data.id) {
          /**
           * FIXME:
           * Remove this tweak for displayName, email, photoThumbnailUrl, connection when Desk back-end team fixes email sync delay issue.
           * https://sendbird.atlassian.net/browse/DESK-259
           */
          setAgent(
            data.id === currentAgent.id
              ? {
                  ...data,
                  displayName: currentAgent.displayName,
                  email: currentAgent.email,
                  photoThumbnailUrl: currentAgent.photoThumbnailUrl,
                  connection: currentAgent.connection,
                }
              : data,
          );
        }
      }
    }, [
      currentAgent.connection,
      currentAgent.displayName,
      currentAgent.email,
      currentAgent.id,
      currentAgent.photoThumbnailUrl,
      fetchAgentData,
      selectedAgentGroup,
      selectedAgentId,
    ]);

    useEffect(() => {
      if (fetchAgentsData) {
        const {
          data: { count, previous, results },
        } = fetchAgentsData;
        /**
         * FIXME:
         * Remove this tweak for displayName, email, photoThumbnailUrl, connection when Desk back-end team fixes email sync delay issue.
         * https://sendbird.atlassian.net/browse/DESK-259
         */
        const refinedAgents = results.map((result) =>
          result.id === currentAgent.id
            ? {
                ...result,
                displayName: currentAgent.displayName,
                email: currentAgent.email,
                photoThumbnailUrl: currentAgent.photoThumbnailUrl,
                connection: currentAgent.connection,
              }
            : result,
        );

        if (previous == null) {
          setAgents(refinedAgents);
          totalAgentsCountRef.current = count;
          return;
        }

        setAgents((prevAgents) => unionBy(prevAgents, refinedAgents, 'id'));
        totalAgentsCountRef.current = count;
      }
    }, [
      currentAgent.connection,
      currentAgent.displayName,
      currentAgent.email,
      currentAgent.id,
      currentAgent.photoThumbnailUrl,
      fetchAgentsData,
    ]);

    useEffect(() => {
      if (fetchAgentGroupsData) {
        const {
          data: { count, previous, results },
        } = fetchAgentGroupsData;

        if (previous == null) {
          setGroups([allAgentGroupsOption, ...results]);
          totalAgentGroupsCountRef.current = count;
          return;
        }

        setGroups((prevGroups) => [...prevGroups, ...results]);
        totalAgentGroupsCountRef.current = count;
      }
    }, [allAgentGroupsOption, fetchAgentGroupsData]);

    useEffect(() => {
      if (selectedAgentGroup && selectedAgentGroup.id !== selectedGroup?.id) {
        setSelectedGroup(selectedAgentGroup);
      }
    }, [selectedAgentGroup, selectedGroup]);

    useEffect(() => {
      if (selectedAgent) {
        setAgent(selectedAgent);
        return;
      }

      if (isAllAgentOptionAvailable && (!selectedAgentId || selectedAgentId === ALL_AGENT_ID)) {
        setAgent(allAgentsOption);
      }
    }, [allAgentsOption, isAllAgentOptionAvailable, selectedAgent, selectedAgentId]);

    const agentItems = useMemo(() => {
      const isSearchMode = !!queryRef.current;
      if (isAllAgentOptionAvailable && !isSearchMode) {
        return [allAgentsOption, ...(agents ?? [])];
      }
      return agents;
    }, [agents, allAgentsOption, isAllAgentOptionAvailable]);

    useEffect(() => {
      agentsRef.current = agents;
    }, [agents]);

    useEffect(() => {
      fetchAgentsRequest({ offset: 0, query: queryRef.current || undefined });
    }, [fetchAgentsRequest]);

    useEffect(() => {
      if (!isAgentGroupDropdownHidden) {
        fetchAgentGroupsRequest({ offset: 0 });
      }
    }, [fetchAgentGroupsRequest, isAgentGroupDropdownHidden]);

    useEffect(() => {
      intersectionObserverCallback.current = () => {
        fetchNextAgentsRequest();
      };
    }, [agents, fetchNextAgentsRequest]);

    const debounceFetchAgentsRequest = useMemo(
      () =>
        debounce((query: string) => {
          if (query.trim().length > 0) {
            fetchAgentsRequest({ query, offset: 0 });
            return;
          }
          fetchAgentsRequest({ offset: 0 });
        }, 200),
      [fetchAgentsRequest],
    );

    const handleSearchChange = useCallback(
      (query: string) => {
        queryRef.current = query;
        debounceFetchAgentsRequest(query);
      },
      [debounceFetchAgentsRequest],
    );

    const handleItemSelected = useCallback(
      (item: Agent) => {
        // escape 'ESC' key
        if (item && onItemSelected) {
          !isControlledAgent && !isControlledAgentId && setAgent(item);
          onItemSelected(item);
        }
        setTimeout(() => {
          fetchAgentsRequest({ offset: 0 });
        }, 300);
      },
      [fetchAgentsRequest, isControlledAgent, isControlledAgentId, onItemSelected],
    );

    const handleAgentGroupSelected = useCallback((item: AgentGroup<'listItem'>) => {
      setSelectedGroup(item);
    }, []);

    const dropdown = useMemo(
      () => (
        <Dropdown<Agent>
          size="small"
          variant="inline"
          placement="bottom-start"
          {...dropdownProps}
          selectedItem={agent}
          useSearch={!isSearchHidden}
          searchPlaceholder={intl.formatMessage({ id: 'desk.agentSelect.dropdown.search.placeholder' })}
          onSearchChange={handleSearchChange}
          onItemSelected={handleItemSelected}
          items={agentItems}
          isItemDisabled={(item) => item.id === agent?.id}
          disabled={disabled || isLoading}
          hasError={hasError || hasServerError}
          itemToString={(agent) => `${agent.id}`}
          itemToElement={(agentItem) => {
            const isAllAgent = agentItem.id === ALL_AGENT_ID;
            const isAgentSelected = agentItem?.id === agent?.id;
            return (
              <DropdownItemWrapper
                ref={
                  agents[agents.length - 1].id === agentItem.id && hasMoreAgents
                    ? lastAgentDropdownItemRefCallback
                    : undefined
                }
                isSelected={isAgentSelected}
              >
                {isAllAgent ? (
                  <Icon
                    icon={isBotOnly ? 'bot' : 'user-avatar'}
                    size={20}
                    color={isAgentSelected ? cssVariables('purple-7') : cssVariables('neutral-10')}
                    css={css`
                      margin-left: 0;
                      padding-left: 0;
                    `}
                  />
                ) : (
                  <DeskAgentAvatarByType isBotOnly={isBotOnly} agent={agentItem} />
                )}
                <AgentInfoContainer>
                  <AgentName data-test-id="AgentOptionName">
                    {isAllAgent ? (
                      textWhenAllAgentsSelected ||
                      intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allAgents' })
                    ) : (
                      <TextWithOverflowTooltip>
                        <HighlightedText
                          highlightedText={queryRef.current}
                          content={agentItem.displayName}
                          isWrapper={false}
                        />
                      </TextWithOverflowTooltip>
                    )}
                    <AgentBadge
                      agentType={agentItem.agentType}
                      role={agentItem.role}
                      tier={agentItem.tier}
                      css={`
                        transform: translateY(-1px);
                      `}
                    />
                  </AgentName>
                  {!isAllAgent && agentItem.agentType === AgentType.USER && (
                    <AgentEmail data-test-id="AgentOptionEmail">
                      <HighlightedText
                        highlightedText={queryRef.current}
                        content={agentItem.email.trim() === '' ? EMPTY_TEXT : agentItem.email}
                      />
                    </AgentEmail>
                  )}
                  {!isAllAgent && agentItem.agentType === AgentType.BOT && agentItem.bot && (
                    <AgentBotType as="span">{getBotTypeLabel(agentItem.bot.type)}</AgentBotType>
                  )}
                </AgentInfoContainer>
              </DropdownItemWrapper>
            );
          }}
          emptyView={
            <EmptyViewWrapper>
              {isLoading ? (
                <Spinner />
              ) : (
                intl.formatMessage({
                  id: isBotOnly ? 'desk.agentSelect.dropdown.noBots' : 'desk.agentSelect.dropdown.noAgents',
                })
              )}
            </EmptyViewWrapper>
          }
          toggleRenderer={({ selectedItem, isOpen }) => (
            <DropdownToggleWrapper
              isOpen={isOpen}
              variant={dropdownProps?.variant}
              isToggleFullWidth={isToggleFullWidth}
              disabled={disabled}
            >
              <ToggleAgentInfo
                selectedItem={selectedItem ?? undefined}
                agentType={agentType}
                isOpen={isOpen}
                textWhenAllAgentsSelected={textWhenAllAgentsSelected}
                placeholder={placeholder}
                isToggleFullWidth={isToggleFullWidth}
              />
            </DropdownToggleWrapper>
          )}
          header={
            !isAgentGroupDropdownHidden && (
              <AgentGroupDropdown
                selectedGroup={selectedGroup}
                groups={groups}
                isLoading={isLoading}
                disabled={disabled || isLoading}
                hasMoreGroups={hasMoreGroups}
                onItemSelected={handleAgentGroupSelected}
                fetchAgentGroups={fetchAgentGroupsRequest}
              />
            )
          }
          css={css`
            width: ${isToggleFullWidth ? '100%' : 'auto'};
            & + ul {
              width: ${dropdownProps?.width || '320px'};
            }

            div li:hover {
              svg {
                fill: ${dropdownProps?.variant === 'default' ? cssVariables('purple-7') : cssVariables('neutral-10')};
              }
            }

            ${styles}
          `}
        />
      ),
      [
        agent,
        agentItems,
        agentType,
        agents,
        disabled,
        dropdownProps,
        fetchAgentGroupsRequest,
        getBotTypeLabel,
        groups,
        handleAgentGroupSelected,
        handleItemSelected,
        handleSearchChange,
        hasError,
        hasMoreAgents,
        hasMoreGroups,
        hasServerError,
        intl,
        isAgentGroupDropdownHidden,
        isBotOnly,
        isLoading,
        isSearchHidden,
        isToggleFullWidth,
        placeholder,
        selectedGroup,
        styles,
        textWhenAllAgentsSelected,
      ],
    );

    if (contextualHelpContent !== undefined) {
      return (
        <ContextualHelp content={contextualHelpContent} placement="bottom">
          {dropdown}
        </ContextualHelp>
      );
    }

    return dropdown;
  },
);
