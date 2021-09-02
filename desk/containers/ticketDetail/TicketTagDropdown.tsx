import { FC, ButtonHTMLAttributes, useMemo, useReducer, useEffect, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Dropdown, IconButton, Icon, cssVariables, Subtitles, Spinner, toast, DropdownProps } from 'feather';
import debounce from 'lodash/debounce';

import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { getProjectTags } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAuthorization } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

import { CreateTagFormView } from './CreateTagFormView';
import { TicketTagDropdownItem } from './TicketTagDropdownItem';

type Props = {
  className?: string;
  ticketId?: Ticket['id'];
  currentTicketTags: TicketTag[];
  onTagAdded: (tag: TicketTag) => void;
};

type State = {
  query: string;
  tags: TicketTag[];
  ongoingLoadTagsRequest: CancellableAxiosPromise<any> | null;
  currentView: 'list' | 'createTagForm';
  isDropdownOpen: boolean;
};

type Action =
  | { type: 'LOAD_TAGS_START'; payload: { request: State['ongoingLoadTagsRequest'] } }
  | { type: 'LOAD_TAGS_DONE'; payload: { tags: TicketTag[] } }
  | { type: 'LOAD_TAGS_FAIL' }
  | { type: 'SET_QUERY'; payload: { query: string } }
  | { type: 'SET_CURRENT_VIEW'; payload: { currentView: State['currentView'] } }
  | { type: 'SET_IS_DROPDOWN_OPEN'; payload: { isDropdownOpen: boolean } };

type ViewBasedDropdownProps = Pick<
  DropdownProps<TicketTag>,
  'header' | 'useSearch' | 'items' | 'isMenuScrollable' | 'emptyView'
> & { stateReducer: NonNullable<DropdownProps<TicketTag>['stateReducer']> };

const Wrapper = styled.div`
  // override dropdown toggle width
  width: 32px;

  & > *,
  & > * > button {
    width: 100%;
  }
`;

const StyledCreateTagButton = styled.button`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-gap: 8px;
  grid-auto-flow: column;
  align-items: center;
  width: 280px;
  padding: 6px 16px;
  padding-right: 12px;
  margin: 4px -4px;
  white-space: nowrap;

  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};
  text-align: left;

  background: transparent;
  border: 0;
  border-radius: 0;
  outline: 0;
  cursor: pointer;

  &:hover,
  &:focus {
    background: ${cssVariables('neutral-1')};
  }
`;

const EmptyView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-5')};
`;
const CreateTagButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const intl = useIntl();

  return (
    <StyledCreateTagButton {...props}>
      <Icon icon="plus" size={20} color={cssVariables('neutral-10')} />
      {intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.menu.createNewTag' })}
      <Icon icon="chevron-right" size={16} color={cssVariables('neutral-10')} />
    </StyledCreateTagButton>
  );
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'LOAD_TAGS_START':
      return { ...state, ongoingLoadTagsRequest: action.payload.request };
    case 'LOAD_TAGS_DONE':
      return { ...state, ongoingLoadTagsRequest: null, tags: action.payload.tags };
    case 'LOAD_TAGS_FAIL':
      return { ...state, ongoingLoadTagsRequest: null };
    case 'SET_QUERY':
      return { ...state, query: action.payload.query };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload.currentView };
    case 'SET_IS_DROPDOWN_OPEN':
      return { ...state, isDropdownOpen: action.payload.isDropdownOpen };
    default:
      return state;
  }
};

export const TicketTagDropdown: FC<Props> = ({ className, currentTicketTags, ticketId, onTagAdded }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const { isPermitted } = useAuthorization();
  const isDeskAdmin = isPermitted(['desk.admin']);
  const [state, dispatch] = useReducer(reducer, {
    query: '',
    tags: [],
    ongoingLoadTagsRequest: null,
    currentView: 'list',
    isDropdownOpen: false,
  });
  const { query, tags, ongoingLoadTagsRequest, currentView, isDropdownOpen } = state;
  const latestStateRef = useRef(state);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const fetchTags = useMemo(() => {
    const sendRequest = async (query: string) => {
      latestStateRef.current.ongoingLoadTagsRequest?.cancel();

      try {
        const request = getProjectTags(pid, region, { status: 'ACTIVE', q: query });
        dispatch({ type: 'LOAD_TAGS_START', payload: { request } });
        const response = await request;

        if (response) {
          dispatch({ type: 'LOAD_TAGS_DONE', payload: { tags: response.data.results } });
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        dispatch({ type: 'LOAD_TAGS_FAIL' });
      }
    };

    return debounce(sendRequest, 100);
  }, [getErrorMessage, pid, region]);

  useEffect(() => {
    fetchTags(query);
  }, [fetchTags, query]);

  useEffect(() => {
    if (!isDropdownOpen && currentView !== 'list') {
      // When dropdown is closed, reset the current view to "list" after the fade transition.
      const setTimeoutId = window.setTimeout(() => {
        dispatch({ type: 'SET_CURRENT_VIEW', payload: { currentView: 'list' } });
      }, 200);

      return () => {
        clearTimeout(setTimeoutId);
      };
    }
  }, [currentView, isDropdownOpen]);

  const reloadTags = useCallback(() => fetchTags(latestStateRef.current.query), [fetchTags]);
  const handleClickAddButton = useCallback(
    () => dispatch({ type: 'SET_CURRENT_VIEW', payload: { currentView: 'createTagForm' } }),
    [],
  );

  const addedTags = useMemo(() => tags.filter((item) => currentTicketTags.some(({ id }) => id === item.id)), [
    currentTicketTags,
    tags,
  ]);

  const viewBasedDropdownProps: ViewBasedDropdownProps = useMemo(
    () =>
      currentView === 'createTagForm'
        ? {
            header: undefined,
            useSearch: false,
            items: [] as TicketTag[],
            isMenuScrollable: false,
            emptyView: (
              <CreateTagFormView
                onTagCreated={() => {
                  reloadTags();
                  dispatch({
                    type: 'SET_CURRENT_VIEW',
                    payload: { currentView: 'list' },
                  });
                }}
                onBackButtonClick={() =>
                  dispatch({
                    type: 'SET_CURRENT_VIEW',
                    payload: { currentView: 'list' },
                  })
                }
              />
            ),
            stateReducer: (state, changes) => {
              switch (changes.type) {
                case Dropdown.stateChangeTypes.keyDownEnter:
                case Dropdown.stateChangeTypes.keyDownArrowUp:
                case Dropdown.stateChangeTypes.keyDownArrowDown:
                case Dropdown.stateChangeTypes.keyDownEscape:
                case Dropdown.stateChangeTypes.keyDownSpaceButton:
                  // Ignore changes triggered by keyboard events on createTagForm view
                  return { type: changes.type };
                default:
                  return changes;
              }
            },
          }
        : {
            header: isDeskAdmin ? <CreateTagButton onClick={handleClickAddButton} /> : undefined,
            useSearch: true,
            // While fetching tags, pass an empty array to show empty view drawing a spinner.
            items: ongoingLoadTagsRequest ? [] : tags,
            isMenuScrollable: true,
            emptyView: (
              <EmptyView>
                {ongoingLoadTagsRequest ? (
                  <Spinner size={20} stroke={cssVariables('neutral-10')} />
                ) : (
                  intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.empty' })
                )}
              </EmptyView>
            ),
            stateReducer: (state, changes) => {
              if (changes.type === Dropdown.stateChangeTypes.clickItem) {
                return { ...changes, isOpen: state.isOpen };
              }
              return changes;
            },
          },
    [currentView, handleClickAddButton, intl, isDeskAdmin, ongoingLoadTagsRequest, reloadTags, tags],
  );

  return (
    <Wrapper className={className}>
      <Dropdown<TicketTag>
        {...viewBasedDropdownProps}
        stateReducer={(state, changes) => {
          const result = viewBasedDropdownProps.stateReducer(state, changes);

          if (typeof result.isOpen === 'boolean') {
            // Observe dropdown open state changes.
            dispatch({ type: 'SET_IS_DROPDOWN_OPEN', payload: { isDropdownOpen: result.isOpen } });
          }
          return result;
        }}
        placement="bottom-end"
        disabled={ticketId == null}
        selectedItem={null}
        toggleRenderer={({ isOpen }) => (
          <IconButton
            buttonType="secondary"
            size="small"
            icon="tag"
            aria-pressed={isOpen}
            // Hide tooltip when dropdown is open to avoid overlap
            title={isDropdownOpen ? undefined : intl.formatMessage({ id: 'desk.tickets.action.lbl.ticketTag' })}
            tooltipPlacement="bottom"
          />
        )}
        onSearchChange={(keyword) => {
          if (query !== keyword) {
            // dispatch only when the query changes
            dispatch({ type: 'SET_QUERY', payload: { query: keyword } });
          }
        }}
        searchPlaceholder={intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.searchInputPlaceholder' })}
        itemToString={(item) => item.name}
        width={280}
        itemHeight={32}
        itemToElement={(item) => (
          <TicketTagDropdownItem
            tag={item}
            isAdded={addedTags.includes(item)}
            ticketId={ticketId}
            data-test-id="TicketTagDropdownItem"
            onTagAdded={onTagAdded}
          />
        )}
        isItemDisabled={(item) => addedTags.includes(item)}
        showArrow={false}
        variant="inline"
        size="small"
      />
    </Wrapper>
  );
};
