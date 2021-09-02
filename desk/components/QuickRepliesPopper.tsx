import { useState, useEffect, useRef, useCallback, useMemo, useContext, memo } from 'react';
import ReactDOM from 'react-dom';
import { useIntl } from 'react-intl';
import { Popper, PopperProps } from 'react-popper';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import {
  cssVariables,
  ScrollBar,
  ScrollBarProps,
  transitionDefault,
  IconButton,
  transitions,
  Button,
  toast,
  elevation,
  Tooltip,
} from 'feather';
import throttle from 'lodash/throttle';

import { deskApi } from '@api';
import { replacePropertiesToTicketValue } from '@desk/containers/conversation/input/constants';
import { QuickReplyTemplate } from '@desk/hooks/useQuickReply';
import { useShallowEqualSelector } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { QuickRepliesContext } from '../containers/settings/quickReplies/QuickRepliesContext';
import { getBoundingClientRectAt } from '../containers/settings/quickReplies/caretUtils';

const PopperContainer = styled.div<{ isShow: boolean }>`
  position: absolute;
  overflow: hidden;
  background: white;
  border-radius: 4px;
  ${elevation.popover};
`;

const PopperContent = styled.div``;

const SearchQueryContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding-right: 4px;
  padding-left: 16px;
  height: 40px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const SearchBar = styled.input`
  flex: 1;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  border: 0;
  outline: 0;

  &::placeholder {
    color: ${cssVariables('neutral-6')};
  }
`;

const SearchIcon = styled(IconButton)<{ isDisplayed: boolean }>`
  position: absolute;
  top: 4px;
  right: 8px;
  z-index: ${(props) => (props.isDisplayed ? 30 : 10)};
  opacity: ${(props) => (props.isDisplayed ? 1 : 0)};
  transform: translateX(${(props) => (props.isDisplayed ? 0 : '16px')});
  transition: ${transitions({ duration: 0.3, properties: ['opacity', 'transform'] })};
`;

const FlexChild = styled.div`
  flex: 1;
  height: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  width: 480px;

  ${FlexChild} + ${FlexChild} {
    border-left: 1px solid ${cssVariables('neutral-2')};
  }
`;

const TeamsContainer = styled.ul`
  margin: 8px;
  width: 148px;
`;

const Team = styled.li<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => (props.isSelected ? cssVariables('purple-7') : cssVariables('neutral-7'))};
  background: ${(props) => props.isSelected && cssVariables('neutral-2')};
  border-radius: 4px;
  transition: ${transitions({ duration: 0.3, properties: ['color', 'background'] })};

  &:hover {
    background: ${cssVariables('neutral-1')};
    cursor: pointer;
  }

  & + & {
    margin-top: 4px;
  }
`;

const TeamDivider = styled.li`
  margin: 8px 0;
  width: 100%;
  height: 1px;
  background: ${cssVariables('neutral-2')};
`;
const ItemContainer = styled.ul``;

const QuickReplyName = styled.span`
  display: block;
  overflow: hidden;
  max-width: 248px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-word;
`;

const QuickReplyMessage = styled.p`
  display: block;
  margin: 0;
  padding: 0;
  max-width: 248px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.33;
  color: ${cssVariables('neutral-7')};
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-word;
`;

const Item = styled.li<{ isHighlighted: boolean }>`
  padding: 6px 16px;
  outline: 0;
  background: ${(props) => (props.isHighlighted ? cssVariables('neutral-1') : 'transparent')};
  transition: background 0.2s ${transitionDefault};
  cursor: pointer;

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  &:focus {
    box-shadow: inset 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const ButtonCreateContainer = styled.div`
  flex: 1;
`;

const ButtonAdd = styled(Button)`
  min-width: 44px;
`;

type ClientRect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

const defaultRect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
};

class VirtualReference {
  private rects = defaultRect;

  constructor(clientRect?: ClientRect) {
    if (clientRect) {
      this.rects = clientRect;
    }
  }

  getBoundingClientRect() {
    return this.rects;
  }

  get clientWidth() {
    return this.getBoundingClientRect().width;
  }

  get clientHeight() {
    return this.getBoundingClientRect().height;
  }
}

type Props = {
  isOpen: boolean;
  ticket: Ticket;
  searchQuery: string;
  className?: string;
  children?: React.ReactElement;
  toggleRef?: React.RefObject<HTMLElement>;
  popperProps?: PopperProps;
  scrollbarProps?: ScrollBarProps;
  onItemClick: (item: QuickReplyTemplate) => (event: React.MouseEvent<HTMLLIElement>) => void;
};

type QuickReplyItem = {
  message: string;
  name: string;
  value: number;
};

type QuickReplyOptionProps = {
  item: QuickReplyItem;
  itemRef?: React.Ref<HTMLLIElement>;
  ticket: Ticket;
  isHighlighted: boolean;
  onItemClick: Props['onItemClick'];
};

const QuickReplyOption = memo<QuickReplyOptionProps>(({ item, itemRef, ticket, isHighlighted, onItemClick }) => {
  return (
    <Tooltip
      content={replacePropertiesToTicketValue(ticket, item.message)}
      portalId="QuickRepliesTooltip"
      placement="right"
    >
      <Item
        ref={itemRef}
        role="option"
        aria-selected={isHighlighted}
        isHighlighted={isHighlighted}
        onClick={onItemClick(item)}
      >
        <QuickReplyName>{item.name}</QuickReplyName>
        <QuickReplyMessage>{item.message}</QuickReplyMessage>
      </Item>
    </Tooltip>
  );
});

const QuickRepliesPopper = memo<Props>(
  ({ className, isOpen, ticket, searchQuery, toggleRef, popperProps, scrollbarProps, onItemClick }) => {
    const {
      quickReplies: items,
      hasMore: hasMoreItems,
      searchCounts,
      isSearched,
      activeQuickReplyTypeId,
      setActiveQuickReplyTypeId: onTypeTabClick,
      setDropdownQuickReplyQuery,
      highlightedIndex,
      setHighlightedIndex,
      popperContentRef,
      itemScrollRef: scrollbarRef,
      itemContainerRef,
      handleQuickReplyDropdownSearchChange: onSearchChange,
      searchQuickRepliesRequest,
      fetchSearchCountsRequest,
    } = useContext(QuickRepliesContext);

    const intl = useIntl();
    const history = useHistory();
    const { appId, pid, region, agentId } = useShallowEqualSelector((state: RootState) => ({
      appId: state.applicationState.data?.app_id ?? '',
      pid: state.desk.project.pid,
      region: state.applicationState.data?.region ?? '',
      agentId: state.desk.agent.id,
    }));
    const { getErrorMessage } = useDeskErrorHandler();
    const dir = useCharDirection();

    const [virtualReference, setVirtualReference] = useState(new VirtualReference());
    const [agentGroups, setAgentGroups] = useState<AssignedGroup[]>([]);

    const intersectionObserverCaretCallback = useRef(() => {});
    const intersectionObserverCaretRef = useRef<IntersectionObserver | null>(null);

    const queryRef = useRef<HTMLInputElement>(null);
    const isUsingCaretAsReference = !toggleRef?.current;

    const pageSize = 10;

    const lastQuickReplyCaretItemRefCallback = (node: HTMLLIElement | null) => {
      if (node) {
        const { current: currentIntersectionObserver } = intersectionObserverCaretRef;
        if (currentIntersectionObserver) {
          currentIntersectionObserver.disconnect();
        }
        intersectionObserverCaretRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry && entry.isIntersecting) {
              intersectionObserverCaretCallback.current();
            }
          },
          { root: node.parentNode?.parentElement?.parentElement },
        );
        intersectionObserverCaretRef.current.observe(node);
      }
    };

    const fetchAgentGroupsRequest = useCallback(async () => {
      try {
        const { data } = await deskApi.fetchAgent(pid, region, { agentId });
        setAgentGroups(data.groups);
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      }
    }, [agentId, getErrorMessage, pid, region]);

    const searchNextResults = useMemo(
      () =>
        throttle(() => {
          if (!hasMoreItems && isOpen) {
            return;
          }

          searchQuickRepliesRequest({
            offset: items.length,
            limit: pageSize,
            name: searchQuery,
            isNext: true,
          });
        }, 200),
      [hasMoreItems, isOpen, searchQuickRepliesRequest, items.length, searchQuery],
    );

    const fetchAndSearch = useCallback(
      async () =>
        await Promise.all([
          fetchAgentGroupsRequest(),
          fetchSearchCountsRequest({ name: searchQuery.trim() }),
          searchQuickRepliesRequest({
            offset: 0,
            limit: pageSize,
            name: searchQuery.trim(),
          }),
        ]),
      [fetchAgentGroupsRequest, fetchSearchCountsRequest, searchQuery, searchQuickRepliesRequest],
    );

    useEffect(() => {
      const toggleRect = toggleRef?.current?.getBoundingClientRect() || defaultRect;
      const caretRect = getBoundingClientRectAt();

      const rect = isUsingCaretAsReference ? caretRect : toggleRect;
      const virtualRect = virtualReference.getBoundingClientRect();

      if (
        isOpen &&
        searchQuery.length >= 0 &&
        rect.left > 0 &&
        rect.top > 0 &&
        (virtualRect.top !== rect.top || virtualRect.left !== rect.left)
      ) {
        setVirtualReference(new VirtualReference(rect));
      }
    }, [isOpen, isUsingCaretAsReference, searchQuery, toggleRef, virtualReference]);

    useEffect(() => {
      if (isOpen) {
        fetchAndSearch();
        queryRef.current?.focus();
      }
      /** DO NOT ADD fetchAndSearch in the dependency list
       * DO NOT EDIT the dependency list
       * It will cause unnecessary API call and wrong behavior
       */
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, searchQuery, activeQuickReplyTypeId]);

    useEffect(() => {
      intersectionObserverCaretCallback.current = () => {
        searchNextResults();
      };
    }, [searchNextResults]);

    const handleQueryChange = (e) => {
      e?.preventDefault();
      onSearchChange?.(queryRef.current?.value || '');
    };

    const handleTypeTabClick = (typeTabId: number) => () => {
      onTypeTabClick(typeTabId);
      setHighlightedIndex(0);
    };

    const handleSearchCancelClick = () => {
      setDropdownQuickReplyQuery('');
      queryRef.current && (queryRef.current.value = '');
    };

    const goToQuickRepliesSettings = useCallback(() => {
      history.push(`/${appId}/desk/settings/quick-replies`);
    }, [appId, history]);

    const createQuickReply = useCallback(() => {
      history.push(`/${appId}/desk/settings/quick-replies/create`);
    }, [appId, history]);

    const quickReplyItems = useMemo(
      () =>
        items.map((item) => ({
          message: item.message,
          name: item.name,
          value: item.id,
        })),
      [items],
    );

    const shouldShowTeam = (typeId, groupName) => activeQuickReplyTypeId === typeId || searchCounts[groupName] > 0;
    const shouldShowTabs = (typeId, groupName) =>
      !isSearched || activeQuickReplyTypeId === typeId || searchCounts[groupName] > 0;
    const shouldShowDivider =
      !isSearched ||
      activeQuickReplyTypeId === 0 ||
      activeQuickReplyTypeId === -1 ||
      searchCounts['all'] > 0 ||
      searchCounts['myself'] > 0;

    const getSearchCountsByGroupName = useCallback(
      (groupName) => {
        const counts = searchCounts[groupName];
        if (isSearched) {
          if (counts > 0) {
            return `(${counts > 999 ? '999+' : counts})`;
          }
          return '(0)';
        }
        return '';
      },
      [isSearched, searchCounts],
    );

    const sortAlphabetically = (a: AssignedGroup, b: AssignedGroup) => a.name.localeCompare(b.name);

    if (!isOpen) {
      return null;
    }

    return ReactDOM.createPortal(
      <>
        <div id="QuickRepliesTooltip" />
        <Popper
          placement={isUsingCaretAsReference ? 'top' : 'top-end'}
          referenceElement={virtualReference}
          {...popperProps}
        >
          {({ ref, style }) => (
            <PopperContainer
              className={className}
              ref={ref}
              style={style}
              isShow={isOpen}
              data-test-id="QuickRepliesPopup"
            >
              <PopperContent ref={popperContentRef}>
                {!isUsingCaretAsReference && (
                  <SearchQueryContainer>
                    {/* eslint-disable */}
                    <SearchBar
                      dir={dir}
                      ref={queryRef}
                      type="text"
                      name="query"
                      placeholder={intl.formatMessage({
                        id: 'desk.conversation.input.quickReplies.search.placeholder',
                      })}
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus={true}
                      onChange={handleQueryChange}
                      data-test-id="QuickRepliesSearchQuery"
                      style={{ marginRight: '40px' }}
                    />
                    {/* eslint-disable */}
                    <SearchIcon
                      type="button"
                      buttonType="secondary"
                      icon="search"
                      size="small"
                      disabled={isSearched}
                      isDisplayed={!isSearched}
                      data-test-id="ButtonSearchQuickReplies"
                    />
                    <SearchIcon
                      type="button"
                      buttonType="secondary"
                      icon="close"
                      size="small"
                      disabled={!isSearched}
                      isDisplayed={isSearched}
                      onClick={handleSearchCancelClick}
                      data-test-id="ButtonCancelSearchingQuickReplies"
                    />
                  </SearchQueryContainer>
                )}
                <FlexContainer>
                  <FlexChild>
                    <ScrollBar style={{ height: 320 }}>
                      <TeamsContainer>
                        {shouldShowTabs(0, 'all') && (
                          <Team
                            key="all"
                            isSelected={activeQuickReplyTypeId === 0}
                            onClick={handleTypeTabClick(0)}
                            data-test-id="QuickReplyTeamOptionAll"
                          >
                            {`${intl.formatMessage({
                              id: 'desk.conversation.input.quickReplies.tab.allAgents',
                            })} ${getSearchCountsByGroupName('all')}`}
                          </Team>
                        )}
                        {shouldShowTabs(-1, 'myself') && (
                          <Team
                            key="myself"
                            isSelected={activeQuickReplyTypeId === -1}
                            onClick={handleTypeTabClick(-1)}
                            data-test-id="QuickReplyTeamOptionMyself"
                          >
                            {`${intl.formatMessage({
                              id: 'desk.conversation.input.quickReplies.tab.myself',
                            })} ${getSearchCountsByGroupName('myself')}`}
                          </Team>
                        )}
                        {shouldShowDivider && <TeamDivider />}
                        {agentGroups
                          .filter((group) => shouldShowTeam(group.id, group.name))
                          .sort(sortAlphabetically)
                          .map(({ id, key, name }) => (
                            <Team
                              key={key || 'default'}
                              isSelected={activeQuickReplyTypeId === id}
                              onClick={handleTypeTabClick(id)}
                            >
                              {name} {getSearchCountsByGroupName(name)}
                            </Team>
                          ))}
                      </TeamsContainer>
                    </ScrollBar>
                  </FlexChild>
                  <FlexChild>
                    <ScrollBar ref={scrollbarRef} style={{ width: 320, height: 320 }} {...scrollbarProps}>
                      {quickReplyItems.length > 0 ? (
                        <ItemContainer ref={itemContainerRef}>
                          {quickReplyItems.map((item, index) => (
                            <QuickReplyOption
                              key={item.value}
                              item={item}
                              itemRef={
                                quickReplyItems[quickReplyItems.length - 1] === item && isOpen && hasMoreItems
                                  ? lastQuickReplyCaretItemRefCallback
                                  : undefined
                              }
                              ticket={ticket}
                              isHighlighted={highlightedIndex === index}
                              onItemClick={onItemClick}
                            />
                          ))}
                        </ItemContainer>
                      ) : (
                        <CenteredEmptyState
                          icon="no-search"
                          size="small"
                          title={intl.formatMessage({ id: 'desk.conversation.input.quickReplies.noResults.title' })}
                          description={intl.formatMessage(
                            { id: 'desk.conversation.input.quickReplies.noResults.description' },
                            { query: searchQuery },
                          )}
                        />
                      )}
                    </ScrollBar>
                  </FlexChild>
                </FlexContainer>
                <FooterContainer>
                  <ButtonCreateContainer>
                    <ButtonAdd
                      size="small"
                      buttonType="primary"
                      variant="ghost"
                      icon="plus-circle"
                      onClick={createQuickReply}
                    >
                      {intl.formatMessage({ id: 'desk.conversation.input.quickReplies.button.create' })}
                    </ButtonAdd>
                  </ButtonCreateContainer>
                  <IconButton size="small" buttonType="tertiary" icon="settings" onClick={goToQuickRepliesSettings} />
                </FooterContainer>
              </PopperContent>
            </PopperContainer>
          )}
        </Popper>
      </>,

      document.getElementById('portal_popup') as HTMLDivElement,
    );
  },
);

export default QuickRepliesPopper;
