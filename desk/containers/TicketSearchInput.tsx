import {
  HTMLAttributes,
  useEffect,
  MouseEventHandler,
  useState,
  KeyboardEventHandler,
  useRef,
  forwardRef,
  RefObject,
  FormEventHandler,
  createContext,
  useContext,
  ChangeEventHandler,
  FocusEventHandler,
  useImperativeHandle,
  createRef,
  ClipboardEventHandler,
  useCallback,
  useMemo,
  DOMAttributes,
} from 'react';
import { useIntl } from 'react-intl';
import { Popper, Manager, Reference, PopperProps } from 'react-popper';
import { useSelector } from 'react-redux';

import styled, { css } from 'styled-components';

import Downshift, { DownshiftProps, ControllerStateAndHelpers } from 'downshift';
import emojiRegex from 'emoji-regex';
import {
  IconButton,
  Icon,
  cssVariables,
  Tag,
  transitionDefault,
  elevation,
  Spinner,
  ScrollBar,
  Typography,
  TagVariant,
  Subtitles,
  toast,
  IconButtonProps,
} from 'feather';
import concat from 'lodash/concat';
import qs from 'qs';

import { IS_INTEGER_REGEX } from '@constants';
import { fetchTicketFields, fetchCustomerFields } from '@desk/api';
import { useAsync, useErrorToast } from '@hooks';

import { SIDEBAR_MAXIMUM_WIDTH } from './DeskChatLayout';

enum TicketSearchFilterItemCategory {
  Default = 'default_category',
  TicketField = 'ticket_field_category',
  CustomerField = 'customer_field_category',
}

export enum DefaultFilterItemId {
  TicketSubject,
  TicketID,
  CustomerName,
  SendbirdID,
}

enum TicketSearchInternalErrorType {
  InvalidTextValue,
  StringFieldInvalidValue,
  IntegerFieldInvalidValue,
  DropdownFieldInvalidValue,
  RegularSearchWithFilter,
  KeywordRequired,
}

const TICKET_SEARCH_TAGS_LIMIT = 3;

const defaultFilterItemKeys: Record<DefaultFilterItemId, string> = {
  [DefaultFilterItemId.TicketSubject]: 'channel_name',
  [DefaultFilterItemId.TicketID]: 'ticket',
  [DefaultFilterItemId.CustomerName]: 'customer__display_name',
  [DefaultFilterItemId.SendbirdID]: 'customer__sendbird_id',
} as const;

const defaultFilterLabelSet: Record<DefaultFilterItemId, string> = {
  [DefaultFilterItemId.TicketSubject]: 'desk.tickets.search.dropdown.defaultFilter.ticketSubject',
  [DefaultFilterItemId.TicketID]: 'desk.tickets.search.dropdown.defaultFilter.ticketId',
  [DefaultFilterItemId.CustomerName]: 'desk.tickets.search.dropdown.defaultFilter.customerName',
  [DefaultFilterItemId.SendbirdID]: 'desk.tickets.search.dropdown.defaultFilter.userId',
};

type DefaultTicketSearchFilterItem = {
  id: number;
  name: string;
  category: TicketSearchFilterItemCategory;
  key: typeof defaultFilterItemKeys[keyof typeof defaultFilterItemKeys] | CustomField['key'];
  // It means if true, it cannot search with other queries
  isExclusive?: boolean;
};

type TicketSearchFilterItem = DefaultTicketSearchFilterItem & Partial<CustomField>;

type TicketSearchQueryError = {
  type: TicketSearchInternalErrorType;
};

export interface TicketSearchQuery extends TicketSearchFilterItem {
  value: string;
  isInitialized?: boolean;
  error?: TicketSearchQueryError;
}

export type TicketSearchURLQuery = Record<
  TicketSearchQuery['id'],
  { name: TicketSearchQuery['name']; value: TicketSearchQuery['value']; category: TicketSearchFilterItemCategory }
>;

type TicketSearchQueryJSON = {
  [key in 'channel_name' | 'ticket' | 'customer__display_name' | 'customer__sendbird_id']?: string | number;
} & {
  ticket_fields?: Record<number, string | number>;
  customer_fields?: Record<number, string | number>;
};

const defaultFilterItems: DefaultTicketSearchFilterItem[] = [
  {
    id: DefaultFilterItemId.TicketSubject,
    key: defaultFilterItemKeys[DefaultFilterItemId.TicketSubject],
    name: 'desk.tickets.search.dropdown.defaultFilter.ticketSubject',
    category: TicketSearchFilterItemCategory.Default,
  },
  {
    id: DefaultFilterItemId.TicketID,
    key: defaultFilterItemKeys[DefaultFilterItemId.TicketID],
    name: 'desk.tickets.search.dropdown.defaultFilter.ticketId',
    category: TicketSearchFilterItemCategory.Default,
    isExclusive: true,
  },
  {
    id: DefaultFilterItemId.CustomerName,
    key: defaultFilterItemKeys[DefaultFilterItemId.CustomerName],
    name: 'desk.tickets.search.dropdown.defaultFilter.customerName',
    category: TicketSearchFilterItemCategory.Default,
  },
  {
    id: DefaultFilterItemId.SendbirdID,
    key: defaultFilterItemKeys[DefaultFilterItemId.SendbirdID],
    name: 'desk.tickets.search.dropdown.defaultFilter.userId',
    category: TicketSearchFilterItemCategory.Default,
  },
];

// FIXME: may be it declared in feather code
export enum TicketSearchInputType {
  Default,
  Inline,
}

export enum TicketSearchType {
  IntegratedSearch,
  TagsSearch,
}

const DownshiftContext = createContext<ControllerStateAndHelpers<TicketSearchFilterItem>>(undefined as any);

const Wrapper = styled.div<{ inputType: TicketSearchInputType; hasError: boolean }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  ${({ inputType }) =>
    inputType === TicketSearchInputType.Default &&
    css`
      padding-left: 16px;
      border: 1px solid ${cssVariables('neutral-4')};
      border-radius: 4px;
    `}
  ${({ inputType, hasError }) =>
    hasError &&
    inputType === TicketSearchInputType.Default &&
    css`
      border-color: ${cssVariables('red-5')};
    `}
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320px;
`;

const DropdownPlaceholder = styled.p`
  margin: 14px 16px;
  color: ${cssVariables('neutral-5')};
  ${Subtitles['subtitle-01']};
`;

const DropdownMenuItemList = styled.ul`
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  width: 100%;
  border-radius: 4px;
  background-color: white;
  z-index: 999; // feather.ZIndexes.dropdownMenu: 999
  transition: opacity 0.1s ${transitionDefault};
  ${elevation.popover};
`;

const BlockItem = styled.div<{ isHighlighted: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 6px 16px;
  cursor: pointer;

  &:hover {
    background: ${cssVariables('neutral-1')};

    ${Tag} {
      background: ${cssVariables('neutral-3')};
      border-color: ${cssVariables('neutral-3')};
    }
  }

  ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      background: ${cssVariables('neutral-1')};

      ${Tag} {
        background: ${cssVariables('neutral-3')};
        border-color: ${cssVariables('neutral-3')};
      }
    `}
`;

const DefaultFilterItems = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid ${cssVariables('neutral-2')};
`;

const CustomFieldItems = styled.div`
  padding: 8px 16px;

  ${Tag} {
    margin-left: 0;
    margin-right: 8px;
    margin-top: 12px;
  }
`;

const SectionBTitle = styled.div`
  padding-top: 8px;
  padding-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-6')};
`;

const FilterItem = styled.span<{ isHighlighted: boolean }>`
  cursor: pointer;

  ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      ${Tag} {
        background: ${cssVariables('neutral-3')};
        border-color: ${cssVariables('neutral-3')};
      }
    `}
`;

const StyledScrollBar = styled(ScrollBar)`
  max-height: 320px;

  @media (max-width: ${SIDEBAR_MAXIMUM_WIDTH}px) {
    max-height: 480px;
  }
`;

/** search input */
const SearchArea = styled.div`
  display: flex;
  width: 100%;
  min-height: 32px;
  max-height: 96px;
`;

const SearchInput = styled.input`
  width: 100%;
  min-width: 8px;
  height: 32px;
  padding: 4px 0;
  outline: 0;
  border: 0; // inline search input style
  font-size: 14px;

  &::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${cssVariables('neutral-6')};
    opacity: 1; /* Firefox */
  }

  /* Microsoft Edge & Internet Explorer 10-11 */
  :-ms-input-placeholder,
  ::-ms-input-placeholder {
    color: ${cssVariables('neutral-6')};
  }
`;

const SearchIcon = styled(Icon)`
  margin: 6px;
`;

const ErrorText = styled.p`
  text-align: left;
  margin-top: 4px;
  color: ${cssVariables('red-5')};
  ${Typography['caption-01']};
`;

/** filter item tag */
const SearchQueryTagRemoveButton = styled.button`
  width: 16px;
  height: 16px;
  padding: 2px;
  margin-left: 4px;
  margin-right: 2px;
  border: 0;
  border-radius: 2px;
  background-color: ${cssVariables('neutral-2')};
  outline: 0;
  cursor: pointer;

  &:hover {
    background-color: ${cssVariables('neutral-3')};
  }
`;

const SearchQueryTagWrapper = styled.span<{ hasError: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding-left: 8px;
  margin-top: 6px;
  margin-right: 8px;
  background-color: ${cssVariables('neutral-2')};
  border-radius: 3px;
  white-space: nowrap;
  color: ${cssVariables('neutral-7')};
  ${Typography['label-02']};

  &:focus-within {
    background-color: ${cssVariables('purple-2')};
    border: 1px solid ${cssVariables('purple-7')};
  }

  &[data-is-editing='false'] {
    user-select: none;
    cursor: text;

    & > span {
      max-width: 210px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  span {
    display: inline;
    outline: 0;
  }

  ${({ hasError }) =>
    hasError &&
    css`
      background-color: ${cssVariables('red-5')};
      color: white;

      ${SearchQueryTagRemoveButton} {
        background-color: ${cssVariables('red-5')};

        svg {
          fill: white;
        }
      }
    `}
`;

const SearchedItemsWrapper = styled.div`
  padding: 8px 0;
`;

type SearchQueryTagRef = {
  id: number;
  updateQueryValue: (value: string) => void;
};

type SearchQueryTagProps = {
  query: TicketSearchQuery;
  isInitialized?: boolean;
  onFocus: (query: TicketSearchQuery) => FocusEventHandler<HTMLSpanElement>;
  onBlur: FocusEventHandler<HTMLSpanElement>;
  onSubmit: (query: TicketSearchQuery) => void;
  onRemove: (query: TicketSearchQuery) => void;
};

const SearchQueryTag = forwardRef<SearchQueryTagRef, SearchQueryTagProps>(
  ({ query, onFocus, onBlur, onSubmit, onRemove }, forwardedRef) => {
    const intl = useIntl();
    const { isInitialized = false } = query;

    const [isContentEditable, setIsContentEditable] = useState(!isInitialized);
    const valueRef = useRef<HTMLSpanElement>(null);
    const { highlightedIndex, setHighlightedIndex } = useContext(DownshiftContext);

    const updateQueryValue = (value: string) => {
      if (valueRef.current) {
        valueRef.current.innerText = value;
        onSubmit({ ...query, value: value.trim() });
        setIsContentEditable(false);
      }
    };

    const handleSubmit = () => {
      if (valueRef.current) {
        if (query.fieldType === 'DROPDOWN' && highlightedIndex != null) {
          updateQueryValue(query.options?.[highlightedIndex] ?? '');
          setHighlightedIndex(-1, { isOpen: true });
          return;
        }

        const value = (valueRef.current.textContent ?? '').trim();
        const emoji = emojiRegex();

        const getError = () => {
          if (!value) {
            return { type: TicketSearchInternalErrorType.KeywordRequired };
          }
          if (query.fieldType === 'DROPDOWN' && !query.options?.includes(value)) {
            return { type: TicketSearchInternalErrorType.DropdownFieldInvalidValue };
          }
          if (query.fieldType === 'INTEGER' && (!IS_INTEGER_REGEX.test(value) || emoji.test(value))) {
            return { type: TicketSearchInternalErrorType.IntegerFieldInvalidValue };
          }
          if (emoji.test(value)) {
            return { type: TicketSearchInternalErrorType.StringFieldInvalidValue };
          }
          return undefined;
        };

        onSubmit({ ...query, value, error: getError() });
        setIsContentEditable(false);
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
      if (event.key === 'Backspace') {
        if (valueRef.current) {
          const value = valueRef.current.textContent ?? '';
          if (value.trim() === '') {
            onRemove(query);
          }
        }
      }
      if (event.key === 'ArrowDown') {
        if (highlightedIndex != null) {
          setHighlightedIndex(highlightedIndex + 1);
          return;
        }
        setHighlightedIndex(0);
      }
      if (event.key === 'ArrowUp') {
        if (highlightedIndex != null && highlightedIndex > -1) {
          setHighlightedIndex(highlightedIndex - 1);
        }
      }
    };

    const handleInput: FormEventHandler<HTMLSpanElement> = (event) => {
      if (event.currentTarget.textContent?.length === 0) {
        onRemove(query);
      }
    };

    const handleClick = () => {
      if (!isContentEditable) {
        setIsContentEditable(true);
      }
    };

    const handlePaste: ClipboardEventHandler<HTMLDivElement> = (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, text);
    };

    const handleRemoveButtonClick = () => {
      onRemove(query);
    };

    const handleBlur: FocusEventHandler<HTMLSpanElement> = (event) => {
      handleSubmit();
      onBlur(event);
    };

    useEffect(() => {
      if (isContentEditable) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount && valueRef.current && valueRef.current.firstChild) {
          const range = document.createRange();
          range.setStartAfter(valueRef.current.firstChild);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, [isContentEditable]);

    useEffect(() => {
      /** Set caret(cursor) position to after filter name */
      const selection = window.getSelection();
      if (selection && selection.rangeCount && valueRef.current) {
        const emptyTextNode = document.createTextNode('\u00A0');
        valueRef.current.appendChild(emptyTextNode);
        const range = document.createRange();
        range.setStartAfter(emptyTextNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, []);

    useEffect(() => {
      if (isInitialized && valueRef.current) {
        valueRef.current.innerText = `\u00A0${query.value}`;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(forwardedRef, () => ({ id: query.id, updateQueryValue }));

    const queryName = useMemo(() => {
      if (query.category === TicketSearchFilterItemCategory.Default) {
        return intl.formatMessage({ id: defaultFilterLabelSet[query.id] });
      }
      return query.name;
    }, [intl, query]);

    const ignoreEvents: Pick<DOMAttributes<HTMLDivElement>, 'onDragOver' | 'onDrop'> = {
      onDragOver: (event) => {
        event.preventDefault();
      },
      onDrop: (event) => {
        event.preventDefault();
      },
    };

    return (
      <SearchQueryTagWrapper
        data-is-editing={isContentEditable}
        data-test-id="SearchQueryTagWrapper"
        hasError={!isContentEditable && query.error != null}
        onFocus={onFocus(query)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        <span>
          <span>{queryName}:</span>
          <span
            ref={valueRef}
            contentEditable={isContentEditable}
            data-test-id="SearchQueryTagContentEditable"
            onInput={handleInput}
            onPaste={handlePaste}
            {...(isContentEditable ? ignoreEvents : {})}
          />
        </span>
        {!isContentEditable && (
          <SearchQueryTagRemoveButton onClick={handleRemoveButtonClick}>
            <Icon icon="close" size={12} color={cssVariables('neutral-6')} />
          </SearchQueryTagRemoveButton>
        )}
      </SearchQueryTagWrapper>
    );
  },
);

const filterLinkTypeField = (field: CustomField) => field.fieldType !== 'LINK';

/** it return query string for search API */
export const getTicketSearchQueryString = (queries: TicketSearchQuery[]) =>
  JSON.stringify(
    queries.reduce<TicketSearchQueryJSON>((json, query) => {
      if (query.category === TicketSearchFilterItemCategory.Default) {
        return { ...json, [query.key]: query.value };
      }
      if (query.category === TicketSearchFilterItemCategory.TicketField) {
        return { ...json, ticket_fields: { ...json.ticket_fields, [query.id]: query.value } };
      }
      if (query.category === TicketSearchFilterItemCategory.CustomerField) {
        return { ...json, customer_fields: { ...json.customer_fields, [query.id]: query.value } };
      }
      return json;
    }, {}),
  );

/** it return query string for update URL query */
export const getTicketSearchURLQueryString = (queries: TicketSearchQuery[]) =>
  qs.stringify(
    queries.reduce((queryObject, query) => {
      queryObject[query.id] = { name: query.name, value: query.value, category: query.category };
      return queryObject;
    }, {}),
  );

export const getDefaultTicketSearchQueryParam = (defaultFilterItemId: DefaultFilterItemId, value?: string): string => {
  const match = defaultFilterItems.find((filterItem) => filterItem.id === defaultFilterItemId);
  if (match) {
    const { id, key, isExclusive, ...filterItem } = match;
    return qs.stringify({ q: { [id]: { ...filterItem, value: value ?? '' } } });
  }
  return '';
};

type Props = {
  defaultQueryString?: string;
  initialSearchQuery?: {
    value: string;
    type: TicketSearchType | null;
  };
  showResetButton?: boolean;
  showBackButton?: boolean;
  backButtonProps?: Partial<IconButtonProps>;
  inputType?: TicketSearchInputType;
  popperProps?: Partial<Omit<PopperProps, 'placement' | 'children'>>;
  onSearch: (queries: TicketSearchQuery[] | string) => void;
  onResetButtonClick?: MouseEventHandler<HTMLButtonElement>;
} & HTMLAttributes<HTMLInputElement>;

const TicketSearchInputComponent = forwardRef<HTMLInputElement, Props>(
  (
    {
      defaultQueryString,
      initialSearchQuery,
      showResetButton,
      showBackButton = true,
      backButtonProps,
      inputType = TicketSearchInputType.Default,
      popperProps,
      className,
      onSearch,
      onResetButtonClick,
      ...inputProps
    },
    inputRef,
  ) => {
    const { pid, region } = useSelector((state: RootState) => ({
      pid: state.desk.project.pid,
      region: state.applicationState.data?.region ?? '',
    }));
    const [
      { data: loadTicketFieldsResponse, status: loadTicketFieldsStatus, error: loadTicketFieldsError },
      loadTicketFields,
    ] = useAsync(async () => await fetchTicketFields(pid, region, { offset: 0, limit: 100 }), [pid, region]);
    const [
      { data: loadCustomerFieldsResponse, status: loadCustomerFieldsStatus, error: loadCustomerFieldsError },
      loadCustomerFields,
    ] = useAsync(async () => await fetchCustomerFields(pid, region, { offset: 0, limit: 100 }), [pid, region]);
    const intl = useIntl();
    const {
      isOpen,
      highlightedIndex,
      openMenu,
      closeMenu,
      clearSelection,
      getInputProps,
      getMenuProps,
      getItemProps,
    } = useContext(DownshiftContext);

    const [queries, setQueries] = useState<TicketSearchQuery[]>([]);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [currentFocusedQuery, setCurrentFocusedQuery] = useState<TicketSearchQuery | null>(null);
    const [searchQueryTagRefs, setSearchQueryTagRefs] = useState<RefObject<SearchQueryTagRef>[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isSearched, setIsSearched] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const searchInputRef = (inputRef ?? useRef<HTMLInputElement>(null)) as RefObject<HTMLInputElement>;
    const searchAreaRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    const updateQuery = (updatedQuery: TicketSearchQuery) => {
      setQueries(queries.map((query) => (query.id === updatedQuery.id ? updatedQuery : query)));
    };

    const initializeSearchStates = () => {
      setQueries([]);
      setSearchInputValue('');
      setHasError(false);
    };

    const filterAlreadySelectedQueries = (filter: TicketSearchFilterItem) =>
      !queries.some((query) => query.id === filter.id);

    const isLoading = loadTicketFieldsStatus === 'loading' || loadCustomerFieldsStatus === 'loading';
    const isSucceed = loadTicketFieldsStatus === 'success' && loadCustomerFieldsStatus === 'success';
    const ticketFields =
      loadTicketFieldsResponse?.data.results
        .filter(filterLinkTypeField)
        .map((field) => ({ ...field, category: TicketSearchFilterItemCategory.TicketField })) ?? [];
    const customerFields =
      loadCustomerFieldsResponse?.data.results
        .filter(filterLinkTypeField)
        .map((field) => ({ ...field, category: TicketSearchFilterItemCategory.CustomerField })) ?? [];
    const intledDefaultFilterItems = defaultFilterItems.map((item) => ({
      ...item,
      name: intl.formatMessage({ id: defaultFilterLabelSet[item.id] }),
    }));
    const defaultFields =
      queries.length > 0 ? intledDefaultFilterItems.filter((field) => !field.isExclusive) : intledDefaultFilterItems;
    const allFilters: TicketSearchFilterItem[] = concat(defaultFields, ticketFields, customerFields).filter(
      filterAlreadySelectedQueries,
    );

    const getFieldTypeShowingText = (fieldType?: CustomFieldType) => {
      if (fieldType === 'STRING') {
        return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.text' });
      }
      if (fieldType === 'INTEGER') {
        return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.integer' });
      }
      if (fieldType === 'DROPDOWN') {
        return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.dropdown' });
      }
      if (fieldType === 'LINK') {
        return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.link' });
      }
      return '';
    };

    const getHighlightedItem = () => {
      if (highlightedIndex == null) {
        return null;
      }
      if (currentFocusedQuery?.options) {
        return currentFocusedQuery.options[highlightedIndex];
      }
      if (searchInputValue !== '') {
        if (allFilters.some((filter) => filter.name.toLowerCase() === searchInputValue.toLowerCase())) {
          return allFilters.filter((filter) => searchInputValue.toLowerCase() === filter.name.toLowerCase())[
            highlightedIndex
          ];
        }
        if (queries.length === 0) {
          return null;
        }
        return null;
      }
      return allFilters[highlightedIndex];
    };

    const getErrorMessage = useCallback(() => {
      const emoji = emojiRegex();

      if (queries.length > TICKET_SEARCH_TAGS_LIMIT) {
        return intl.formatMessage({ id: 'desk.tickets.search.error.fieldLimit' });
      }
      if (queries.length > 0) {
        if (searchInputValue !== '') {
          return intl.formatMessage({ id: 'desk.tickets.search.error.regularSearchWithFilter' });
        }
        const errors = queries.filter((query) => query.error !== undefined).map((query) => query.error);
        const hasKeywordRequiredError = errors.some(
          (error) => error?.type === TicketSearchInternalErrorType.KeywordRequired,
        );
        const hasStringFieldError = errors.some(
          (error) => error?.type === TicketSearchInternalErrorType.StringFieldInvalidValue,
        );
        const hasIntegerFieldError = errors.some(
          (error) => error?.type === TicketSearchInternalErrorType.IntegerFieldInvalidValue,
        );
        const hasDropdownFieldError = errors.some(
          (error) => error?.type === TicketSearchInternalErrorType.DropdownFieldInvalidValue,
        );

        if (hasKeywordRequiredError) {
          return intl.formatMessage({ id: 'desk.tickets.search.error.keywordRequired' });
        }
        if (
          (hasStringFieldError && hasIntegerFieldError) ||
          (hasStringFieldError && hasDropdownFieldError) ||
          (hasIntegerFieldError && hasDropdownFieldError)
        ) {
          return intl.formatMessage({ id: 'desk.tickets.search.error.invalidValues' });
        }
        if (hasIntegerFieldError) {
          return intl.formatMessage({ id: 'desk.tickets.search.error.invalidValue.integer' });
        }
        if (hasDropdownFieldError) {
          return intl.formatMessage({ id: 'desk.tickets.search.error.invalidValue.dropdown' });
        }
        if (hasStringFieldError) {
          return intl.formatMessage({ id: 'desk.tickets.search.error.invalidValue.text' });
        }
        return '';
      }
      if (searchInputValue === '') {
        return intl.formatMessage({ id: 'desk.tickets.search.error.keywordRequired' });
      }
      if (emoji.test(searchInputValue)) {
        return intl.formatMessage({ id: 'desk.tickets.search.error.invalidValue.integratedSearch' });
      }
      return '';
    }, [intl, queries, searchInputValue]);

    const getPlaceholder = () => {
      if (queries.length > 0) {
        if (!isSearched && !isEditing) {
          return intl.formatMessage({ id: 'desk.tickets.search.guideText' });
        }
        return '';
      }
      return inputProps.placeholder;
    };

    const handleInputClick: MouseEventHandler<HTMLInputElement> = (event) => {
      inputProps.onClick?.(event);
      openMenu();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === 'Enter') {
        const highlightedItem = getHighlightedItem();
        if (highlightedItem && typeof highlightedItem !== 'string' && searchAreaRef.current) {
          const query: TicketSearchQuery = { ...highlightedItem, value: '' };
          setQueries([...queries, query]);
          highlightedItem.fieldType !== 'DROPDOWN' && closeMenu();
          searchInputValue !== '' && setSearchInputValue('');
          setIsSearched(false);
          return;
        }

        const emoji = emojiRegex();
        closeMenu();
        clearSelection();
        searchInputRef.current?.blur();

        const isIntegratedSearch = searchInputValue !== '' && queries.length === 0 && !emoji.test(searchInputValue);
        const isTagsSearch =
          searchInputValue === '' && queries.length > 0 && queries.every((query) => query.error == null);

        if (queries.length <= TICKET_SEARCH_TAGS_LIMIT && (isIntegratedSearch || isTagsSearch)) {
          const searchValue = isIntegratedSearch ? searchInputValue : queries;
          onSearch(searchValue);
          setHasError(false);
          setIsSearched(true);
          return;
        }
        setHasError(true);
        toast.error({ message: getErrorMessage() });
        return;
      }
      if (event.key === 'Backspace' && searchInputValue === '') {
        const newQueries = [...queries];
        newQueries.pop();
        setQueries(newQueries);
      }
    };

    const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      inputProps.onChange?.(event);
      setSearchInputValue(event.target.value);
      setIsSearched(false);
    };

    const handleFilterItemClick = (filter: TicketSearchFilterItem) => () => {
      if (searchAreaRef.current) {
        const query: TicketSearchQuery = { ...filter, value: '' };
        setQueries([...queries, query]);
        setIsSearched(false);
        filter.fieldType !== 'DROPDOWN' && closeMenu();
      }
    };

    const handleSearchedFilterItemClick = (filter: TicketSearchFilterItem) => () => {
      setSearchInputValue('');
      handleFilterItemClick(filter)();
    };

    const handleResetButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onResetButtonClick?.(event);
      initializeSearchStates();
    };

    const handleBackButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      backButtonProps?.onClick?.(event);
      initializeSearchStates();
    };

    const handleSearchQueryTagSubmit = (submittedQuery: TicketSearchQuery) => {
      setCurrentFocusedQuery(null);
      updateQuery(submittedQuery);
      openMenu();
      // Use `setTimeout` to prevent the Korean input issue
      setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    const handleSearchQueryTagFocus = (query: TicketSearchQuery) => () => {
      setCurrentFocusedQuery(query);
    };

    const handleSearchQueryTagBlur: FocusEventHandler<HTMLSpanElement> = () => {
      setCurrentFocusedQuery(null);
    };

    const handleSearchQueryTagRemove = (removedQuery: TicketSearchQuery) => {
      setQueries(queries.filter((query) => query.id !== removedQuery.id));
      if (currentFocusedQuery?.id === removedQuery.id) {
        setCurrentFocusedQuery(null);
      }
    };

    /** Use mousedown event instead of click event: https://stackoverflow.com/a/10653160 */
    const handleDropdownOptionMouseDown = (option: string) => () => {
      const currentFocusedQueryRef = searchQueryTagRefs.find((ref) => ref.current?.id === currentFocusedQuery?.id);
      currentFocusedQueryRef?.current?.updateQueryValue(`\u00A0${option}`);
      setCurrentFocusedQuery(null);
    };

    const renderMenuItems = () => {
      const exclusiveQuery = queries.find((query) => query.isExclusive);
      if (isLoading) {
        return (
          <SpinnerWrapper>
            <Spinner size={32} />
          </SpinnerWrapper>
        );
      }
      if (exclusiveQuery) {
        return (
          <DropdownPlaceholder>
            {intl.formatMessage(
              { id: 'desk.tickets.search.dropdown.placeholder.exclusive' },
              { field: intl.formatMessage({ id: exclusiveQuery.name, defaultMessage: exclusiveQuery.name }) },
            )}
          </DropdownPlaceholder>
        );
      }
      if (currentFocusedQuery?.options) {
        return currentFocusedQuery.options.map((option, index) => (
          <BlockItem
            key={option}
            isHighlighted={highlightedIndex === index}
            onMouseDown={handleDropdownOptionMouseDown(option)}
          >
            <Tag variant={TagVariant.Dark}>{`${currentFocusedQuery.name}: ${option}`}</Tag>
          </BlockItem>
        ));
      }
      if (searchInputValue.length > 0) {
        if (allFilters.some((filter) => filter.name.toLowerCase() === searchInputValue.toLowerCase())) {
          return (
            <SearchedItemsWrapper>
              {allFilters
                .filter((filter) => searchInputValue.toLowerCase() === filter.name.toLowerCase())
                .map((filter, index) => (
                  <BlockItem
                    key={filter.id}
                    isHighlighted={highlightedIndex === index}
                    {...getItemProps({
                      item: filter,
                      index,
                      onClick: handleSearchedFilterItemClick(filter),
                    })}
                  >
                    <FilterItem isHighlighted={highlightedIndex === index}>
                      <Tag variant={TagVariant.Dark}>
                        {filter.fieldType
                          ? `${filter.name}: ${getFieldTypeShowingText(filter.fieldType)}`
                          : filter.name}
                      </Tag>
                    </FilterItem>
                  </BlockItem>
                ))}
            </SearchedItemsWrapper>
          );
        }
        if (queries.length === 0) {
          return (
            <DropdownPlaceholder>
              {intl.formatMessage({ id: 'desk.tickets.search.dropdown.placeholder' })}
            </DropdownPlaceholder>
          );
        }
      } else {
        const selectableDefaultFilterItems = allFilters.filter(
          (filter) =>
            filter.category === TicketSearchFilterItemCategory.Default && (queries.length === 0 || !filter.isExclusive),
        );
        const selectableTicketFields = allFilters.filter(
          (filter) => filter.category === TicketSearchFilterItemCategory.TicketField,
        );
        const selectableCustomerFields = allFilters.filter(
          (filter) => filter.category === TicketSearchFilterItemCategory.CustomerField,
        );
        return (
          <StyledScrollBar>
            <DefaultFilterItems>
              {selectableDefaultFilterItems.filter(filterAlreadySelectedQueries).map((filter, index) => (
                <BlockItem
                  key={filter.id}
                  isHighlighted={highlightedIndex === index}
                  {...getItemProps({ item: filter, index, onClick: handleFilterItemClick(filter) })}
                >
                  <Tag variant={TagVariant.Dark}>{filter.name}</Tag>
                </BlockItem>
              ))}
            </DefaultFilterItems>
            {isSucceed && (
              <>
                {selectableTicketFields.length > 0 && (
                  <CustomFieldItems>
                    <SectionBTitle>
                      {intl.formatMessage({
                        id: 'desk.tickets.search.dropdown.filter.ticketField.title',
                      })}
                    </SectionBTitle>
                    {selectableTicketFields.filter(filterAlreadySelectedQueries).map((filter, index) => (
                      <FilterItem
                        key={filter.id}
                        isHighlighted={highlightedIndex === selectableDefaultFilterItems.length + index}
                        {...getItemProps({
                          item: filter,
                          index: defaultFilterItems.length + index,
                          onClick: handleFilterItemClick({
                            ...filter,
                            category: TicketSearchFilterItemCategory.TicketField,
                          }),
                        })}
                      >
                        <Tag variant={TagVariant.Dark}>
                          {`${filter.name}: ${getFieldTypeShowingText(filter.fieldType)}`}
                        </Tag>
                      </FilterItem>
                    ))}
                  </CustomFieldItems>
                )}
                {selectableCustomerFields.length > 0 && (
                  <CustomFieldItems>
                    <SectionBTitle>
                      {intl.formatMessage({
                        id: 'desk.tickets.search.dropdown.filter.customerField.title',
                      })}
                    </SectionBTitle>
                    {selectableCustomerFields.filter(filterAlreadySelectedQueries).map((filter, index) => (
                      <FilterItem
                        key={filter.id}
                        isHighlighted={
                          highlightedIndex ===
                          selectableDefaultFilterItems.length + selectableTicketFields.length + index
                        }
                        {...getItemProps({
                          item: filter,
                          index: defaultFilterItems.length + ticketFields.length + index,
                          onClick: handleFilterItemClick({
                            ...filter,
                            category: TicketSearchFilterItemCategory.CustomerField,
                          }),
                        })}
                      >
                        <Tag variant={TagVariant.Dark}>
                          {`${filter.name}: ${getFieldTypeShowingText(filter.fieldType)}`}
                        </Tag>
                      </FilterItem>
                    ))}
                  </CustomFieldItems>
                )}
              </>
            )}
          </StyledScrollBar>
        );
      }
    };

    useEffect(() => {
      loadTicketFields();
      loadCustomerFields();
    }, [loadCustomerFields, loadTicketFields]);

    useEffect(() => {
      if (initialSearchQuery?.value !== '' && initialSearchQuery?.type != null) {
        if (!isInitialized.current) {
          const { type, value } = initialSearchQuery;
          if (type === TicketSearchType.IntegratedSearch) {
            setSearchInputValue(value);
            onSearch(value);
            isInitialized.current = true;
            return;
          }
          if (type === TicketSearchType.TagsSearch) {
            const urlQuery: TicketSearchURLQuery = qs.parse(value);
            const queryIds = Object.keys(urlQuery).map((queryId) => Number(queryId));
            const isSearchDefaultFilterItemsOnly = queryIds.every(
              (queryId) =>
                urlQuery[`${queryId}`].category === TicketSearchFilterItemCategory.Default &&
                Object.values(DefaultFilterItemId).includes(queryId),
            );
            const filterItemToQuery = (filterItem: TicketSearchFilterItem): TicketSearchQuery => ({
              ...filterItem,
              value: urlQuery[`${filterItem.id}`].value,
              isInitialized: true,
            });

            if (isSearchDefaultFilterItemsOnly) {
              const queries = defaultFilterItems
                .filter((filter) => queryIds.includes(filter.id))
                .map(filterItemToQuery);
              setQueries(queries);
              onSearch(queries);
              isInitialized.current = true;
              return;
            }
            if (isSucceed) {
              const queries = allFilters
                .filter((filter) => queryIds.includes(filter.id) && filter.category === urlQuery[filter.id].category)
                .map(filterItemToQuery);
              setQueries(queries);
              onSearch(queries);
              isInitialized.current = true;
              return;
            }
          }
        }
      } else {
        isInitialized.current = true;
      }
    }, [allFilters, initialSearchQuery, isSucceed, onSearch]);

    useEffect(() => {
      if (searchQueryTagRefs.length !== queries.length) {
        setSearchQueryTagRefs(
          Array.from({ length: queries.length }).map((_, index) => {
            if (searchQueryTagRefs[index]) {
              return searchQueryTagRefs[index];
            }
            return createRef<SearchQueryTagRef>();
          }),
        );
      }
    }, [queries.length, searchQueryTagRefs]);

    useEffect(() => {
      // If it doesn't have any search words, it should clear errors.
      if (searchInputValue === '' && queries.length === 0) {
        setHasError(false);
      }
    }, [queries.length, searchInputValue]);

    useEffect(() => {
      if (!currentFocusedQuery) {
        setIsEditing(false);
        return;
      }
      setIsEditing(true);
    }, [currentFocusedQuery]);

    useErrorToast(loadTicketFieldsError);
    useErrorToast(loadCustomerFieldsError);

    return (
      <Reference>
        {({ ref: popperReferenceRef }) => (
          <>
            <Wrapper ref={popperReferenceRef} className={className} inputType={inputType} hasError={hasError}>
              {showBackButton && (
                <IconButton
                  data-test-id="BackButton"
                  icon="arrow-left"
                  buttonType="secondary"
                  size="small"
                  onClick={handleBackButtonClick}
                  {...backButtonProps}
                />
              )}
              <ScrollBar
                css={css`
                  display: flex;
                  justify-content: stretch;
                  flex: 1;
                `}
              >
                <SearchArea ref={searchAreaRef}>
                  {queries.map((query, index) => (
                    <SearchQueryTag
                      ref={searchQueryTagRefs[index]}
                      key={query.id}
                      query={query}
                      onFocus={handleSearchQueryTagFocus}
                      onBlur={handleSearchQueryTagBlur}
                      onSubmit={handleSearchQueryTagSubmit}
                      onRemove={handleSearchQueryTagRemove}
                    />
                  ))}
                  {/* FIXME
                      // @ts-ignore */}
                  <SearchInput
                    {...{
                      ...getInputProps({
                        ref: searchInputRef,
                        ...inputProps,
                        value: searchInputValue,
                        placeholder: getPlaceholder(),
                        onClick: handleInputClick,
                        onChange: handleSearchInputChange,
                        onKeyDown: handleKeyDown,
                      }),
                    }}
                    data-test-id="SearchInput"
                  />
                </SearchArea>
              </ScrollBar>
              {showResetButton || searchInputValue.length > 0 || queries.length > 0 ? (
                <IconButton
                  data-test-id="ClearButton"
                  icon="close"
                  buttonType="secondary"
                  size="small"
                  onClick={handleResetButtonClick}
                />
              ) : (
                <SearchIcon icon="search" size={20} color={cssVariables('neutral-9')} />
              )}
            </Wrapper>
            {inputType === TicketSearchInputType.Default && hasError && (
              <ErrorText data-test-id="ErrorText">{getErrorMessage()}</ErrorText>
            )}
            <Popper placement="bottom-start" {...popperProps}>
              {({ ref: popperRef, style }) =>
                isOpen && (
                  <DropdownMenuItemList
                    {...getMenuProps({ ref: popperRef, style })}
                    data-test-id="DropdownMenuItemList"
                  >
                    {renderMenuItems()}
                  </DropdownMenuItemList>
                )
              }
            </Popper>
          </>
        )}
      </Reference>
    );
  },
);

const stateReducer: DownshiftProps<TicketSearchFilterItem>['stateReducer'] = (state, changes) => {
  switch (changes.type) {
    case Downshift.stateChangeTypes.itemMouseEnter:
      return {
        ...changes,
        highlightedIndex: null,
      };
    case Downshift.stateChangeTypes.blurInput: {
      return {
        ...changes,
        inputValue: state.inputValue,
        isOpen: state.selectedItem?.fieldType === 'DROPDOWN',
      };
    }
    case Downshift.stateChangeTypes.mouseUp:
      return {
        ...changes,
        inputValue: state.inputValue,
      };
    default:
      return changes;
  }
};

export const TicketSearchInput = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <Downshift stateReducer={stateReducer} itemToString={(item) => item?.name ?? ''}>
    {(downshiftProps) => (
      <Manager {...downshiftProps.getRootProps(undefined, { suppressRefError: true })}>
        <DownshiftContext.Provider value={downshiftProps}>
          <TicketSearchInputComponent ref={ref} {...props} />
        </DownshiftContext.Provider>
      </Manager>
    )}
  </Downshift>
));
