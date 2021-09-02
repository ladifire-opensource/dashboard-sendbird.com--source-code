import { FC, ReactNode, useRef, useEffect, useState, useMemo, useCallback, LiHTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { Reference, Popper, Manager } from 'react-popper';

import styled, { css } from 'styled-components';

import Downshift, { DownshiftProps as DownshiftPropsGeneric } from 'downshift';
import {
  elevation,
  cssVariables,
  DropdownToggleButton,
  Subtitles,
  Icon,
  InputText,
  Link,
  Spinner,
  ScrollBar,
  TabbedInterface,
} from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { fetchAgents, fetchAgentGroups, fetchAgentGroup, fetchAgent } from '@desk/api';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import {
  useAppId,
  useAuthorization,
  useShowDialog,
  useOrganization,
  useAsync,
  useResizeObserver,
  useDeskAgent,
} from '@hooks';
import { TextWithOverflowTooltip } from '@ui/components';
import { PropsOf, PropOf } from '@utils';

import { AgentItem, TeamItem } from './DropdownItem';
import { EmptyView } from './EmptyView';
import { convertAgentConnectionToAvatarStatus } from './convertAgentConnectionToAvatarStatus';
import { useAsyncList } from './useAsyncList';

type Team = AgentGroup;
type DropdownItem = Agent | Team | null;
type ItemType = 'agent' | 'team';
type DownshiftProps = DownshiftPropsGeneric<DropdownItem>;

/**
 * @param isActive Pass true if the current section or the corresponding tab is active.
 */
type SectionRenderer = (isActive: boolean) => ReactNode;

type Props = {
  className?: string;
  selectedItem?: DropdownItem;
  onChange?: (...args: [Agent | null, 'agent'] | [Team, 'team']) => void;
  disabled?: boolean;

  /**
   * Label for "Unselect" item, which triggers onChange with `null`. e.g. All agents
   */
  unselectItemLabel?: string;

  /**
   * Shown when the agent/team corresponding to `selectedItemId` is being fetched or cannot be found.
   */
  placeholder?: string;

  /**
   * Use this prop if only ID of the selected item is known (for example, the selected item is read from a URL
   * search params), instead of `selectedItem` prop.
   */
  selectedItemId?: { type: ItemType; id: number };

  /**
   * If true, it becomes as wide as its container.
   */
  isBlock?: boolean;
};

enum TabId {
  Teams = 'teams',
  Agents = 'agents',
}

const PAGE_SIZE = 20;

const Container = styled.div<{ $isBlock: boolean }>`
  ${({ $isBlock }) =>
    $isBlock &&
    css`
      button[aria-haspopup='true'] {
        width: 100%;
      }
    `}
`;

const PopoverContainer = styled.div<{ $width?: number }>`
  // FIXME: expose z-index constants from feather
  z-index: 999;
  border-radius: 2px;
  background: white;
  width: ${({ $width }) => $width || 320}px;
  overflow: hidden;
  ${elevation.popover};
`;

const ItemList = styled.ul<{ $hasPadding?: boolean }>`
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  list-style: none;

  ${({ $hasPadding }) => $hasPadding && 'padding: 8px 0;'}
`;

const EmptyViewLink = styled(Link)`
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.15px;
  font-weight: 600;
`;

const SpinnerWrapper = styled.div`
  padding: 32px;
  text-align: center;
  line-height: 0;

  > * {
    display: inline-block;
  }
`;

const SearchInputWrapper = styled.div`
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  input {
    border: 0;
    border-radius: 0;
    box-shadow: none !important;
  }
`;

const SearchInput: FC<Omit<PropsOf<typeof InputText>, 'icons'> & { onClear: () => void }> = ({ onClear, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <InputText
      role="search"
      ref={ref}
      {...props}
      icons={[
        {
          buttonType: 'secondary',
          icon: props.value ? 'close' : 'search',
          'data-test-id': props.value ? 'ClearSearchQueryButton' : 'SearchButton',
          onClick: () => {
            onClear();
            ref.current?.focus();
          },
        },
      ]}
    />
  );
};

const useTeams = (query?: string) => {
  const { pid, region } = useProjectIdAndRegion();
  return useAsyncList((query) => fetchAgentGroups(pid, region, { limit: PAGE_SIZE, offset: 0, query }), query);
};

const useAgents = (query?: string) => {
  const { pid, region } = useProjectIdAndRegion();
  return useAsyncList((query) => fetchAgents(pid, region, { limit: PAGE_SIZE, offset: 0, query }), query);
};

const getItemType = (item: DropdownItem) => {
  if (item && typeof item === 'object' && Object.keys(item).includes('key')) {
    return 'team';
  }
  return 'agent';
};

const useSelectedItem = (
  options: Pick<Props, 'selectedItem' | 'selectedItemId'> & { teams: Team[]; agents: Agent[] },
) => {
  const { pid, region } = useProjectIdAndRegion();
  const { selectedItem, selectedItemId, teams, agents } = options;

  const [state, fetchSelectedItem] = useAsync(async () => {
    if (selectedItemId == null || selectedItem) {
      return selectedItem || null;
    }

    const { id, type } = selectedItemId;
    const cachedItem = type === 'agent' ? agents.find((item) => item.id === id) : teams.find((item) => item.id === id);

    if (cachedItem) {
      return cachedItem;
    }

    const { data } = await (type === 'team'
      ? fetchAgentGroup(pid, region, { groupId: id })
      : fetchAgent(pid, region, { agentId: id }));

    return data;
  }, [agents, pid, region, selectedItem, selectedItemId, teams]);

  useEffect(() => {
    fetchSelectedItem();
  }, [fetchSelectedItem]);

  return {
    ...state,
    // suppress warning: 'A component has changed the uncontrolled prop "selectedItem" to be controlled.
    data: state.data || null,
  };
};

const stateReducer: DownshiftProps['stateReducer'] = (state, changes) => {
  if (changes.type === Downshift.stateChangeTypes.blurButton) {
    // Override to keep the menu open when the focus is passed to the active tab.
    return {};
  }
  return changes;
};

export const AgentOrTeamDropdown: FC<Props> = ({
  className,
  disabled,
  onChange,
  unselectItemLabel: unselectItemLabelProp,
  placeholder: placeholderProp,
  selectedItemId,
  selectedItem: selectedItemProp,
  isBlock = false,
}) => {
  const intl = useIntl();
  const appId = useAppId();

  const showInviteAgentDialog = useShowDialog({
    dialogTypes: DialogType.InviteMember,
    dialogProps: { role: 'DESK_AGENT', uid: useOrganization().uid },
  });

  const currentAgent = useDeskAgent();

  /**
   * FIXME:
   * Remove this email tweak when Desk back-end team fixes email sync delay issue.
   * https://sendbird.atlassian.net/browse/DESK-259
   */

  const containerRef = useRef<HTMLDivElement | null>(null);
  const latestCloseMenu = useRef<() => void>();
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>('');
  const [width, setWidth] = useState(containerRef.current?.clientWidth ?? 0);

  const { isPermitted } = useAuthorization();
  const canInviteMember = isPermitted(['organization.members.all']);
  const canCreateTeam = isPermitted(['desk.admin']);

  const resizeObserverRefHandler = useResizeObserver(
    isBlock
      ? (entry) => {
          setWidth(entry.target.clientWidth);
        }
      : undefined,
  );

  const teamList = useTeams(teamSearchQuery);
  const { items: teams } = teamList;

  const agentList = useAgents(agentSearchQuery);
  const { items: agents } = agentList;

  const { status: fetchSelectedItemStatus, data: selectedItem } = useSelectedItem({
    selectedItemId,
    selectedItem: selectedItemProp,
    teams,
    agents,
  });

  const sections = useMemo(() => {
    const isSearchingTeam = teamList.isSearchResultsVisible;

    // when not searching, "Unselect" item is listed at the top of the list.
    const teamsTabItemCount = teams.length + (isSearchingTeam ? 0 : 1);

    return [
      {
        id: TabId.Teams,
        title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.tab.teams' }),
        items: teams,
        baseIndex: 0,
      },
      {
        id: TabId.Agents,
        title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.tab.agents' }),
        /**
         * FIXME:
         * Remove this email tweak when Desk back-end team fixes email sync delay issue.
         * https://sendbird.atlassian.net/browse/DESK-259
         */
        items: agents.map((agent) => (agent.id === currentAgent.id ? { ...agent, email: currentAgent.email } : agent)),
        baseIndex: teamsTabItemCount,
      },
    ];
  }, [agents, currentAgent.email, currentAgent.id, intl, teamList.isSearchResultsVisible, teams]);

  const unselectItemLabel =
    unselectItemLabelProp || intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.allAgents' });

  const placeholder = placeholderProp || intl.formatMessage({ id: 'desk.agentSelect.dropdown.item.placeholder' });

  useEffect(() => {
    const listener = (event) => {
      const dropdownHasFocus = containerRef.current?.contains(event.target);
      if (!dropdownHasFocus) {
        latestCloseMenu.current?.();
      }
    };
    window.addEventListener('focusin', listener);

    return () => {
      window.removeEventListener('focusin', listener);
    };
  }, []);

  const renderSelectedAgent = (agent: Agent) => {
    return (
      <>
        <DeskAgentAvatar
          profileID={agent.email}
          imageUrl={agent.photoThumbnailUrl}
          size={20}
          status={convertAgentConnectionToAvatarStatus(agent.connection)}
          css={`
            margin-left: -8px !important;
            margin-right: 8px;
          `}
        />
        <span
          css={`
            flex: 1;
          `}
        >
          <TextWithOverflowTooltip
            css={`
              max-width: ${!isBlock && '160px'};
            `}
          >
            {agent.displayName}
          </TextWithOverflowTooltip>
        </span>
      </>
    );
  };

  const renderSelectedItem = (selectedItem?: DropdownItem | null) => {
    if (fetchSelectedItemStatus !== 'success') {
      return (
        <>
          <Icon
            icon="user-avatar"
            size={20}
            color="currentColor"
            css={`
              margin-left: -8px;
              margin-right: 8px;
            `}
          />
          <span>{placeholder}</span>
        </>
      );
    }

    if (selectedItem == null) {
      return unselectItemLabel;
    }

    if (getItemType(selectedItem) === 'team') {
      return (selectedItem as Team).name;
    }
    return renderSelectedAgent(selectedItem as Agent);
  };

  const handleChange: DownshiftProps['onChange'] = (selectedItem) => {
    if (onChange == null) {
      return;
    }

    if (selectedItem == null) {
      onChange(selectedItem, 'agent');
      return;
    }

    const itemType = getItemType(selectedItem);
    if (itemType === 'agent') {
      onChange(selectedItem as Agent, itemType);
      return;
    }

    onChange(selectedItem as Team, itemType);
  };

  const itemToString: DownshiftProps['itemToString'] = useCallback(
    (item) => {
      if (item == null) {
        return unselectItemLabel;
      }
      if (getItemType(item) === 'agent') {
        return (item as Agent).displayName;
      }
      return (item as Team).name;
    },
    [unselectItemLabel],
  );

  const renderTab = (sectionRenderers: SectionRenderer[]): PropOf<typeof TabbedInterface, 'children'> => (
    tab,
    index,
    isActive,
  ) => {
    const { items, query, setQuery, status, error, reload, emptyViewContent } =
      tab.id === TabId.Teams
        ? {
            ...teamList,
            query: teamSearchQuery,
            setQuery: setTeamSearchQuery,
            emptyViewContent: canCreateTeam
              ? {
                  title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.teams.title' }),
                  description: (
                    <EmptyViewLink
                      href={`/${appId}/desk/settings/teams/form`}
                      target="_blank"
                      iconProps={{ icon: 'open-in-new', size: 20 }}
                    >
                      {intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.teams.btn.createTeam' })}
                    </EmptyViewLink>
                  ),
                }
              : { title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.teams.title.withoutAction' }) },
          }
        : {
            ...agentList,
            query: agentSearchQuery,
            setQuery: setAgentSearchQuery,
            emptyViewContent: canInviteMember
              ? {
                  title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.agents.title' }),
                  description: (
                    <EmptyViewLink
                      role="button"
                      onClick={() => {
                        showInviteAgentDialog();
                      }}
                      target="_blank"
                      iconProps={{ icon: 'plus', size: 20 }}
                    >
                      {intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.agents.btn.addAgent' })}
                    </EmptyViewLink>
                  ),
                }
              : { title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.agents.title.withoutAction' }) },
          };

    const searchInput = (
      <SearchInput
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder={intl.formatMessage({ id: 'desk.agentSelect.dropdown.search.placeholder' })}
        onClear={() => {
          setQuery('');
        }}
      />
    );

    const emptyView = (
      <EmptyView
        isLoading={status === 'init' || status === 'loading'}
        error={error}
        onRetry={reload}
        title={
          query ? intl.formatMessage({ id: 'desk.agentSelect.dropdown.emptyView.noResults' }) : emptyViewContent.title
        }
        description={query ? undefined : emptyViewContent.description}
      />
    );

    return (
      <>
        <SearchInputWrapper>{searchInput}</SearchInputWrapper>
        {error || items.length === 0 ? emptyView : sectionRenderers[index](isActive)}
      </>
    );
  };

  return (
    <Downshift<DropdownItem>
      onChange={handleChange}
      selectedItem={selectedItem as Team}
      itemToString={itemToString}
      stateReducer={stateReducer}
    >
      {({
        getRootProps,
        getToggleButtonProps,
        getItemProps,
        isOpen,
        highlightedIndex,
        closeMenu,
        clearSelection,
        selectItemAtIndex,
        setHighlightedIndex,
      }) => {
        latestCloseMenu.current = closeMenu;
        const { sectionRenderers } = sections.reduce(
          (result, section, sectionIndex) => {
            result.sectionRenderers.push((isActive: boolean) => {
              const {
                isSearchResultsVisible,
                scrollBarRef,
                spinnerWrapperRef,
                hasNext,
                loadMoreError,
                status,
                loadMore,
              } = section.id === TabId.Teams ? teamList : agentList;

              // Hide "All agents" when searching
              const items = isSearchResultsVisible ? section.items : [null, ...section.items];

              return (
                <ScrollBar
                  style={{ maxHeight: 320 }}
                  ref={(instance) => {
                    scrollBarRef(instance?.node ?? null);
                  }}
                >
                  <ItemList key={sectionIndex} $hasPadding={section.id === TabId.Teams}>
                    {items.map((item, itemIndex) => {
                      const isUnselectItem = item == null;
                      const index = section.baseIndex + itemIndex;
                      const isTeam = sectionIndex === 0;
                      const isSelected = isUnselectItem ? selectedItem == null : selectedItem === item;

                      const itemProps: LiHTMLAttributes<HTMLLIElement> = getItemProps({
                        item,
                        index,
                        disabled: !isActive,
                        onFocus: () => {
                          setHighlightedIndex(index);
                        },
                        onClick: isUnselectItem
                          ? () => {
                              clearSelection();
                            }
                          : undefined,
                        onKeyDown: (event) => {
                          switch (event.key) {
                            case 'Up': // IE/Edge specific value
                            case 'ArrowUp':
                              event.preventDefault();
                              event.stopPropagation();
                              (event.currentTarget.previousElementSibling ||
                                event.currentTarget.parentNode?.lastElementChild)?.['focus']?.();
                              break;

                            case 'Down': // IE/Edge specific value
                            case 'ArrowDown':
                              event.preventDefault();
                              (event.currentTarget.nextElementSibling ||
                                event.currentTarget.parentNode?.firstElementChild)?.['focus']?.();
                              break;

                            case 'Enter':
                              selectItemAtIndex(index);
                              break;

                            default:
                              break;
                          }
                        },
                      });

                      const sharedProps = {
                        isHighlighted: highlightedIndex === index,
                        isSelected,
                        unselectItemLabel,
                        ...itemProps,
                      };

                      if (isTeam) {
                        return <TeamItem key={itemIndex} item={item as Team} {...sharedProps} />;
                      }
                      return <AgentItem key={itemIndex} item={item as Agent} {...sharedProps} />;
                    })}
                    {hasNext &&
                      (loadMoreError ? (
                        <EmptyView isLoading={status === 'loadmore-pending'} error={loadMoreError} onRetry={loadMore} />
                      ) : (
                        <SpinnerWrapper ref={spinnerWrapperRef}>
                          <Spinner size={20} stroke={cssVariables('neutral-9')} />
                        </SpinnerWrapper>
                      ))}
                  </ItemList>
                </ScrollBar>
              );
            });
            result.indexOffset += section.items.length;
            return result;
          },
          { sectionRenderers: [] as ((isActive: boolean) => ReactNode)[], indexOffset: 0 },
        );

        const { ref: downshiftRefHandler, ...rootProps } = getRootProps(undefined, { suppressRefError: true });

        return (
          <Manager>
            <Container
              {...rootProps}
              ref={(node) => {
                downshiftRefHandler(node);
                containerRef.current = node;
                resizeObserverRefHandler(node);
              }}
              className={className}
              $isBlock={isBlock}
            >
              <Reference>
                {({ ref }) => (
                  <DropdownToggleButton
                    ref={ref}
                    size="small"
                    variant="default"
                    disabled={disabled || fetchSelectedItemStatus === 'loading'}
                    aria-pressed={isOpen}
                    css={`
                      padding-left: 16px;
                      ${Subtitles['subtitle-01']};

                      // give "disabled" appearance until after fetching the selected item or when failed to fetch it.
                      ${fetchSelectedItemStatus !== 'success' &&
                      css`
                        color: ${cssVariables('neutral-6')};
                      `}
                    `}
                    {...getToggleButtonProps()}
                  >
                    {renderSelectedItem(selectedItem as Team)}
                  </DropdownToggleButton>
                )}
              </Reference>
              {isOpen && (
                <Popper
                  placement="bottom-start"
                  modifiers={{ preventOverflow: { boundariesElement: 'viewport' } }}
                  positionFixed={true}
                >
                  {({ ref, style }) => (
                    <PopoverContainer ref={ref} style={style} $width={width}>
                      <TabbedInterface
                        css={`
                          [role='tablist'] {
                            padding: 0 22px;
                          }
                        `}
                        initialActiveTabIndex={
                          selectedItem &&
                          typeof selectedItem === 'object' &&
                          Object.keys(selectedItem).includes('displayName')
                            ? 1 // Agents
                            : 0 // Teams
                        }
                        hasBorder={true}
                        tabs={[
                          {
                            title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.tab.teams' }),
                            id: TabId.Teams,
                          },
                          {
                            title: intl.formatMessage({ id: 'desk.agentSelect.dropdown.tab.agents' }),
                            id: TabId.Agents,
                          },
                        ]}
                      >
                        {renderTab(sectionRenderers)}
                      </TabbedInterface>
                    </PopoverContainer>
                  )}
                </Popper>
              )}
            </Container>
          </Manager>
        );
      }}
    </Downshift>
  );
};
