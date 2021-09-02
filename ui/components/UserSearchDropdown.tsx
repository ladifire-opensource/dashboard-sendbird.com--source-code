import { FC, useState, useMemo, useRef, useEffect, useCallback } from 'react';

import styled, { css } from 'styled-components';

import { useCombobox } from 'downshift';
import { cssVariables, elevation, Subtitles, IconButton, ScrollBar, toast, Icon, Typography } from 'feather';
import { DebouncedFunc } from 'lodash';
import debounce from 'lodash/debounce';

import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { QUERY_USER_ID, QUERY_USER_NICKNAME, QUERY_USER_NICKNAME_STARTSWITH } from '@constants';
import { searchUsers } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';

import { HighlightedText } from './HighlightedText';
import { SDKUserAvatar } from './SDKUserAvatar';

const INPUT_HEIGHT = 40;
const DEFAULT_MENU_MAX_HEIGHT = 136;

type OperatorKey = typeof QUERY_USER_ID | typeof QUERY_USER_NICKNAME | typeof QUERY_USER_NICKNAME_STARTSWITH;
type OperatorTarget = 'id' | 'nickname';
type OperatorItem = { key: OperatorKey; tag: OperatorTarget; title: string; subtitle: string };
type ResultItem = SDKUser;

type Props = {
  onItemSelected: (item: ResultItem) => void;
  disabled?: boolean;
  placeholder?: string;
  menuMaxHeight?: number;
};

const Check = styled(Icon).attrs({
  size: 20,
  icon: 'done',
  color: cssVariables('purple-7'),
})``;

const operatorItems: OperatorItem[] = [
  { key: QUERY_USER_NICKNAME_STARTSWITH, title: 'nickname (startswith):', subtitle: 'User Nickname', tag: 'nickname' },
  { key: QUERY_USER_ID, title: 'id (equal):', subtitle: 'User ID', tag: 'id' },
];
const defaultOperatorItem = operatorItems[0];

const menuItemSharedCSS = css`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  small {
    display: block;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    color: ${cssVariables('neutral-7')};
  }
`;

const OperatorTag = styled.div`
  ${Typography['label-02']}
  color: ${cssVariables('neutral-7')};
  padding: 4px 8px;
  border-radius: 3px;
  background-color: ${cssVariables('neutral-2')};

  margin-left: 8px;
`;

// FIXME: <form> cannot appear as a descendant of <form>.
const Container = styled.form<{ disabled?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${INPUT_HEIGHT}px;
  padding: 9px 3px 9px 0px;
  border: 1px solid ${(props) => (props.disabled ? cssVariables('neutral-2') : cssVariables('neutral-3'))};
  border-radius: 4px;

  &:focus-within {
    border-color: ${cssVariables('purple-7')};
  }

  input {
    margin-left: 16px;
    background: white;

    &::placeholder {
      color: ${cssVariables('neutral-6')};
    }

    &:disabled::placeholder {
      color: ${cssVariables('neutral-5')};
    }
  }

  ${OperatorTag} + input {
    margin-left: 8px;
  }
`;

const OperatorMenu = styled.ul`
  position: absolute;
  left: 0;
  right: 0;
  top: ${INPUT_HEIGHT}px;
  padding: 0;
  border-radius: 4px;
  background: white;
  list-style: none;
  outline: 0;
  z-index: 1;
  ${elevation.popover};
`;

const OperatorMenuItem = styled.li<{ isSelected: boolean; isHighlighted: boolean }>`
  padding: 6px 16px;
  position: relative;
  ${menuItemSharedCSS}

  ${Check} {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  ${({ isSelected }) => {
    return (
      isSelected &&
      css`
        color: ${cssVariables('purple-7')};

        small {
          color: ${cssVariables('purple-7')};
        }
      `
    );
  }}

  ${({ isHighlighted }) => {
    return (
      isHighlighted &&
      css`
        background: ${cssVariables('neutral-1')};
      `
    );
  }}
`;

const Input = styled.input`
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
`;

const ResultMenu = styled(OperatorMenu)`
  padding: 0;
`;

const SingleResultWrapper = styled.div`
  padding: 8px 0;
`;

const NoResults = styled(OperatorMenu).attrs({
  children: 'No results',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-5')};
  height: 116px;
`;

const ResultMenuItem = styled.li<{ isHighlighted: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  height: 48px;
  padding: 0 16px;

  ${({ isHighlighted }) => isHighlighted && `background: ${cssVariables('neutral-1')};`}

  ${SDKUserAvatar} {
    flex: none;
    margin-right: 12px;
  }
`;

const ResultMenuItemText = styled.div`
  flex: 1;
  ${menuItemSharedCSS}
`;

const ObserverItem = styled.div`
  position: relative;
`;

const MenuScrollbar: FC<{ maxHeight: number }> = ({ maxHeight, children }) => (
  <ScrollBar style={{ maxHeight, paddingTop: 8, paddingBottom: 8 }}>{children}</ScrollBar>
);

export const UserSearchDropdown: FC<Props> = ({
  onItemSelected,
  disabled,
  placeholder = 'Search user ID or nickname',
  menuMaxHeight = DEFAULT_MENU_MAX_HEIGHT,
}) => {
  const appId = useAppId();

  const inputRef = useRef<HTMLInputElement>();
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const handleInputChange = useRef<DebouncedFunc<(value: string) => void>>();
  const ongoingRequest = useRef<CancellableAxiosPromise | null>(null);

  const [results, setResults] = useState<ResultItem[]>([]);
  const [noResult, setNoResult] = useState(false);
  const [nextResultToken, setNextResultToken] = useState('');
  const [isOperatorMenuOpen, setIsOperatorMenuOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OperatorItem>(defaultOperatorItem);
  const [highlightedOperatorIndex, setHighlightedOperatorIndex] = useState(0);

  // FIXME: downshift: You forgot to call the getComboboxProps, getMenuProps getter function on your component / element.
  const {
    getInputProps,
    inputValue,
    setInputValue,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    isOpen: isResultMenuOpen,
    openMenu: openResultMenu,
  } = useCombobox<ResultItem>({
    items: results,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onItemSelected(selectedItem);
      }
      inputRef.current?.blur();
    },
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
        case useCombobox.stateChangeTypes.FunctionSetInputValue: {
          const { isOpen, ...restChanges } = changes;
          // If input is empty, never open the result menu.
          return { ...state, isOpen: isOpen && !!restChanges.inputValue, ...restChanges };
        }
        default: {
          const { inputValue, ...restChanges } = changes;
          return { ...state, ...restChanges };
        }
      }
    },
  });

  const isInputFocused = () => document.activeElement === inputRef.current;

  const searchUsersRequest = useCallback(
    async (query: string, nextToken?: string) => {
      if (selectedOperator == null || !query) {
        setResults([]);
        return;
      }

      // Avoid search results overwritten by previous reqeusts
      ongoingRequest.current?.cancel();

      try {
        const request = searchUsers({ appId, option: selectedOperator.key, query, next: nextToken });
        ongoingRequest.current = request;
        const result = await request;

        if (result == null) {
          // Ignore canceled requests
          return;
        }

        const { data } = result;
        const { users: newResults } = data;
        setResults(nextToken ? (results) => results.concat(newResults) : newResults);
        setNextResultToken(data.next);
        setNoResult(newResults.length === 0);
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      } finally {
        ongoingRequest.current = null;
      }
    },
    [appId, selectedOperator],
  );

  const observerItemRefCallback = (observerItem: HTMLElement | null) => {
    if (observerItem == null) {
      intersectionObserverRef.current?.disconnect();
      intersectionObserverRef.current = undefined;
      return;
    }

    if (intersectionObserverRef.current) {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          searchUsersRequest(inputValue, nextResultToken);
        }
      },
      { root: observerItem?.closest('ul[role="listbox"]') },
    );
    intersectionObserverRef.current = intersectionObserver;

    if (observerItem) {
      intersectionObserver.observe(observerItem);
    }
  };

  useEffect(() => {
    const handleInputChangeFn = async (query: string) => {
      searchUsersRequest(query);
    };
    handleInputChange.current = debounce(handleInputChangeFn, 100);
  }, [searchUsersRequest]);

  useEffect(() => {
    handleInputChange.current?.(inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (!isOperatorMenuOpen) {
      setHighlightedOperatorIndex(selectedOperator ? operatorItems.indexOf(selectedOperator) : 0);
    }
  }, [isOperatorMenuOpen, selectedOperator]);

  useEffect(() => {
    if (inputValue && isOperatorMenuOpen) {
      setIsOperatorMenuOpen(false);
    } else if (!inputValue && !isOperatorMenuOpen && isInputFocused()) {
      setIsOperatorMenuOpen(true);
    }
  }, [inputValue, isOperatorMenuOpen]);

  useEffect(() => {
    setNoResult(false);
  }, [inputValue]);

  useEffect(() => {
    if (disabled && inputValue) {
      setInputValue('');
    }
  }, [disabled, inputValue, setInputValue]);

  useEffect(() => {
    return () => {
      intersectionObserverRef.current?.disconnect();
      intersectionObserverRef.current = undefined;
    };
  });

  const shouldShowTag = inputValue || isInputFocused();

  const inputProps = useMemo(
    () =>
      getInputProps({
        placeholder: shouldShowTag ? '' : placeholder,
        onFocus: () => {
          if (!inputValue) {
            setIsOperatorMenuOpen(true);
          }
        },
        onClick: () => {
          if (!inputValue) {
            setIsOperatorMenuOpen(true);
          } else if (results.length > 0 && !isResultMenuOpen) {
            openResultMenu();
          }
        },
        onBlur: () => {
          setIsOperatorMenuOpen(false);
        },
        onKeyDown: (event) => {
          if (event.key === 'ArrowDown') {
            setHighlightedOperatorIndex((index) => Math.min(index + 1, operatorItems.length - 1));
          } else if (event.key === 'ArrowUp') {
            setHighlightedOperatorIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === 'Enter') {
            // prevent form from being submitted by enter key
            event.preventDefault();

            if (highlightedOperatorIndex > -1 && highlightedOperatorIndex <= 2) {
              setSelectedOperator(operatorItems[highlightedOperatorIndex]);
            }
          }
        },
      }),
    [
      placeholder,
      getInputProps,
      highlightedOperatorIndex,
      inputValue,
      isResultMenuOpen,
      openResultMenu,
      results.length,
      shouldShowTag,
    ],
  );

  const hasMultipleResults = results.length > 1;
  const ResultsWrapper = useMemo(() => (hasMultipleResults ? MenuScrollbar : SingleResultWrapper), [
    hasMultipleResults,
  ]);

  const renderMenu = () => {
    if (isOperatorMenuOpen) {
      return (
        <OperatorMenu>
          <MenuScrollbar maxHeight={menuMaxHeight}>
            {operatorItems.map((item, index) => (
              <OperatorMenuItem
                key={item.key}
                isHighlighted={highlightedOperatorIndex === index}
                isSelected={selectedOperator.key === item.key}
                onMouseDown={(event) => {
                  // prevent input blur
                  event.preventDefault();
                }}
                onMouseOver={() => setHighlightedOperatorIndex(index)}
                onClick={() => {
                  setSelectedOperator(item);
                  setHighlightedOperatorIndex(index);
                }}
              >
                {item.title}
                <small>{item.subtitle}</small>
                {selectedOperator.key === item.key && <Check />}
              </OperatorMenuItem>
            ))}
          </MenuScrollbar>
        </OperatorMenu>
      );
    }

    if (isResultMenuOpen && results.length > 0) {
      return (
        <ResultMenu {...getMenuProps()}>
          <ResultsWrapper maxHeight={menuMaxHeight}>
            {results.map((item, index) => (
              <ResultMenuItem
                key={item.user_id}
                isHighlighted={highlightedIndex === index}
                {...getItemProps({ item, index })}
              >
                <SDKUserAvatar size={32} userID={item.user_id} imageUrl={item.profile_url} />
                <ResultMenuItemText>
                  <HighlightedText
                    content={item.user_id}
                    highlightedText={selectedOperator.tag === 'id' ? inputValue : ''}
                  />
                  <small>
                    <HighlightedText
                      content={item.nickname}
                      highlightedText={selectedOperator.tag === 'nickname' ? inputValue : ''}
                    />
                  </small>
                </ResultMenuItemText>
              </ResultMenuItem>
            ))}
            {nextResultToken && <ObserverItem ref={observerItemRefCallback} />}
          </ResultsWrapper>
        </ResultMenu>
      );
    }

    if (inputValue && noResult) {
      return <NoResults />;
    }
  };

  return (
    <Container
      disabled={disabled}
      onSubmit={(event) => {
        event.preventDefault();
        handleInputChange.current?.(inputValue);
      }}
    >
      {shouldShowTag && <OperatorTag>{selectedOperator.tag}</OperatorTag>}

      <Input
        type="text"
        {...inputProps}
        ref={(node) => {
          inputProps.ref(node);
          inputRef.current = node ?? undefined;
        }}
        disabled={disabled}
      />
      {renderMenu()}
      <IconButton
        icon="close"
        buttonType="secondary"
        size="small"
        type="reset"
        disabled={disabled}
        onMouseDown={(event) => {
          // prevent input blur
          event.preventDefault();
        }}
        onClick={() => {
          setInputValue('');
        }}
        css={inputValue ? undefined : 'display: none;'}
      />
      <Icon
        icon="search"
        color={cssVariables('neutral-10')}
        size={20}
        css={`
          ${inputValue && 'display: none;'}
          position: relative;
          right: 6px;
        `}
      />
    </Container>
  );
};
