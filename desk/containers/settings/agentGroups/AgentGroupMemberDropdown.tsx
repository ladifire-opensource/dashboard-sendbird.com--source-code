import React, { InputHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Manager, Popper, Reference } from 'react-popper';

import styled, { css } from 'styled-components';

import Downshift, { DownshiftProps as DownshiftPropsGeneric } from 'downshift';
import { cssVariables, elevation, InputText, Link, ScrollBar, Spinner, Subtitles } from 'feather';

import { getDashboardURL } from '@api';
import { AgentActivationStatusValue, AgentType } from '@constants';
import { fetchAgents } from '@desk/api';
import { EmptyView } from '@desk/containers/AgentOrTeamDropdown/EmptyView';
import { useAsyncList } from '@desk/containers/AgentOrTeamDropdown/useAsyncList';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useLatestValue, useResizeObserver } from '@hooks';
import { PropsOf } from '@utils';

import { AgentGroupMemberListItem } from './AgentGroupMemberListItem';

type DownshiftProps = DownshiftPropsGeneric<AgentGroupMember>;

type Props = {
  className?: string;
  isBlock?: boolean;
  selectedMembers: AgentGroupMember[];
  onChange: (member: AgentGroupMember | null) => void;
};

const PAGE_SIZE = 30;

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

const AgentSearchListContainer = styled.ul``;

const SearchInputWrapper = styled.div``;

const SpinnerWrapper = styled.div`
  padding: 32px;
  text-align: center;
  line-height: 0;

  > * {
    display: inline-block;
  }
`;

const EmptyViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('neutral-5')};

  a,
  a:hover {
    font-weight: 600;
  }
`;

const EmptyViewInvitationDescription = styled.span`
  display: block;
  margin-bottom: 4px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-6')};
  text-align: center;
`;

const SearchInput: React.FC<Omit<PropsOf<typeof InputText>, 'icons'> & { isOpen: boolean; onClear: () => void }> = ({
  isOpen,
  onClear,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      ref.current?.blur();
    }
  }, [isOpen]);
  return (
    <InputText
      role="search"
      {...props}
      ref={ref}
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
      data-test-id="AgentSearchInput"
    />
  );
};

const stateReducer: DownshiftProps['stateReducer'] = (state, changes) => {
  switch (changes.type) {
    case Downshift.stateChangeTypes.clickItem:
    case Downshift.stateChangeTypes.keyDownEnter:
      return { ...changes, isOpen: true };

    default:
      return changes;
  }
};

const useAgents = (query?: string) => {
  const { pid, region } = useProjectIdAndRegion();
  return useAsyncList(
    (query) =>
      fetchAgents(pid, region, {
        limit: PAGE_SIZE,
        offset: 0,
        status: [AgentActivationStatusValue.ACTIVE, AgentActivationStatusValue.PENDING],
        query,
      }),
    query,
  );
};

export const AgentGroupMemberDropdown = React.memo<Props>(
  ({ className, selectedMembers, isBlock = false, onChange }) => {
    const intl = useIntl();

    const containerRef = useRef<HTMLDivElement | null>(null);

    const [query, setQuery] = useState('');
    const [width, setWidth] = useState(containerRef.current?.clientWidth ?? 0);
    const [itemSelectionList, setItemSelectionList] = useState<Record<number, boolean>>({});

    const itemSelectionListRef = useLatestValue(itemSelectionList);

    const agentList = useAgents(query);
    const { items } = agentList;

    const resizeObserverRefHandler = useResizeObserver(
      isBlock
        ? (entry) => {
            setWidth(entry.target.clientWidth);
          }
        : undefined,
    );

    useEffect(() => {
      /**
       * When you try to update team, if selected agents are exactly same with fetched dropdown agents, it does not trigger loadMore
       * because its filtered dropdown agent list is 0 and shows empty view.
       
       * This code below triggers loadMore event though empty view is displayed if there is more to load (agentList.hasNext)
       */
      if (
        items.filter((agent) => selectedMembers.every((selectedMember) => selectedMember.id !== agent.id)).length ===
          0 &&
        agentList.hasNext
      ) {
        agentList.loadMore();
      }

      if (itemSelectionListRef.current) {
        Object.keys(itemSelectionListRef.current)
          .filter((key) => !!itemSelectionListRef.current[key])
          /**
           * TODO
           * Can be improved with ES6 Map since the member.id is not string
           * https://medium.com/@jalalazimi/es6-map-with-react-usestate-9175cd7b409b
           */
          .filter((key) => !selectedMembers.find((member) => member.id.toString() === key))
          .forEach((key) => {
            setTimeout(() => {
              setItemSelectionList({ ...itemSelectionListRef.current, [key]: false });
            }, 300);
          });
      }
    }, [agentList, itemSelectionListRef, items, selectedMembers]);

    useEffect(() => {
      const itemSelections = items.reduce((selection, item) => {
        selection[item.id] = false;
        return selection;
      }, {} as Record<string, boolean>);
      setItemSelectionList(itemSelections);
    }, [items]);

    const handleAgentGroupMemberItemClick = useCallback(
      (agentGroupMember) => () => {
        setItemSelectionList({ ...itemSelectionList, [agentGroupMember.id]: true });

        // Wait for the animation removing the selected agent from the dropdown option list
        setTimeout(() => {
          onChange(agentGroupMember);
        }, 300);
      },
      [itemSelectionList, onChange],
    );

    return (
      <Downshift<AgentGroupMember>
        itemToString={() => 'Search team member'}
        stateReducer={stateReducer}
        onChange={(selectedItem) => handleAgentGroupMemberItemClick(selectedItem)()}
      >
        {({
          getRootProps,
          getInputProps,
          getItemProps,
          isOpen,
          highlightedIndex,
          openMenu,
          closeMenu,
          selectItemAtIndex,
          setHighlightedIndex,
        }) => {
          const { ref: downshiftRefHandler, ...rootProps } = getRootProps(undefined, { suppressRefError: true });
          const {
            scrollBarRef,
            spinnerWrapperRef,
            isSearchResultsVisible,
            status,
            hasNext,
            loadMoreError,
            loadMore,
          } = agentList;

          const inputProps: InputHTMLAttributes<HTMLInputElement> = getInputProps({
            'aria-label': isOpen ? 'Close menu' : 'Open menu',
            onFocus: openMenu,
            onBlur: closeMenu,
          });

          const agentGroupMembers: AgentGroupMember[] =
            isSearchResultsVisible || query === ''
              ? items
                  .map(({ id, email, displayName, photoThumbnailUrl, agentType, tier, status, role, bot }) => ({
                    id,
                    email,
                    displayName,
                    photoThumbnailUrl,
                    agentType,
                    tier,
                    status,
                    role,
                    botType: bot?.type ?? null,
                    autoRoutingEnabled: status === AgentActivationStatusValue.ACTIVE && role === 'AGENT' && bot == null,
                    isReadyToActivate: agentType === AgentType.BOT && bot ? bot.isReadyToActivate : null,
                  }))
                  .filter((agent) => selectedMembers.every((selectedMember) => selectedMember.id !== agent.id))
              : [];

          return (
            <Manager>
              <Container
                {...rootProps}
                ref={(node) => {
                  downshiftRefHandler(node);
                  resizeObserverRefHandler(node);
                  containerRef.current = node;
                }}
                className={className}
                $isBlock={isBlock}
              >
                <Reference>
                  {({ ref }) => (
                    <SearchInputWrapper ref={ref}>
                      <SearchInput
                        {...inputProps}
                        isOpen={isOpen}
                        placeholder={intl.formatMessage({ id: 'desk.team.form.addAgents.placeholder' })}
                        value={query}
                        size="medium"
                        onChange={(event) => {
                          setQuery(event.target.value);
                        }}
                        onClear={() => {
                          setQuery('');
                        }}
                      />
                    </SearchInputWrapper>
                  )}
                </Reference>
                {isOpen && (
                  <Popper
                    key={agentGroupMembers.length < 7 ? 'repaint' : 'render'}
                    placement="bottom-start"
                    modifiers={{
                      preventOverflow: { boundariesElement: 'viewport' },
                      offset: { offset: '0, 2' },
                    }}
                    positionFixed={true}
                  >
                    {({ ref, style }) => (
                      <PopoverContainer ref={ref} style={style} $width={width}>
                        <ScrollBar
                          style={{ maxHeight: 312 }}
                          ref={(instance) => {
                            scrollBarRef(instance?.node ?? null);
                          }}
                        >
                          <AgentSearchListContainer data-test-id="AgentSearchListContainer">
                            {agentGroupMembers.map((member, index) => {
                              return (
                                <AgentGroupMemberListItem
                                  key={member.id}
                                  agentGroupMember={member}
                                  query={query}
                                  index={index}
                                  isItemSelected={itemSelectionList[member.id] || false}
                                  isHighlighted={highlightedIndex === index}
                                  downshiftHelpers={{
                                    setHighlightedIndex,
                                    selectItemAtIndex,
                                    getItemProps,
                                  }}
                                />
                              );
                            })}
                          </AgentSearchListContainer>
                          {hasNext &&
                            agentGroupMembers.length > 0 &&
                            (loadMoreError ? (
                              <EmptyView
                                isLoading={status === 'loadmore-pending'}
                                error={loadMoreError}
                                onRetry={loadMore}
                              />
                            ) : (
                              <SpinnerWrapper ref={spinnerWrapperRef}>
                                <Spinner size={20} stroke={cssVariables('neutral-9')} />
                              </SpinnerWrapper>
                            ))}
                          {!hasNext && agentGroupMembers.length === 0 && (
                            <EmptyViewWrapper data-test-id="AgentSearchEmpty">
                              {items.length > 0 && items.length === selectedMembers.length && query === '' ? (
                                <>
                                  <EmptyViewInvitationDescription>
                                    {intl.formatMessage({ id: 'desk.team.form.addAgents.empty.invite.description' })}
                                  </EmptyViewInvitationDescription>
                                  <Link
                                    href={`${getDashboardURL()}/settings/members`}
                                    target="_blank"
                                    iconProps={{ icon: 'users', size: 16 }}
                                    css="font-size: 14px;"
                                  >
                                    {intl.formatMessage({ id: 'desk.team.form.addAgents.empty.invite' })}
                                  </Link>
                                </>
                              ) : (
                                intl.formatMessage({ id: 'desk.team.form.addAgents.empty.noResults' })
                              )}
                            </EmptyViewWrapper>
                          )}
                        </ScrollBar>
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
  },
);
