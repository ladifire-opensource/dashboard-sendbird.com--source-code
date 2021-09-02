import React, { KeyboardEventHandler } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, IconName, IconButton, cssVariables, transitionDefault, elevation } from 'feather';
import isEqual from 'lodash/isEqual';

import { StyledProps } from '@ui';
import { PH_SEARCH_CHANNELS } from '@utils/text';

import { SpinnerInner } from '../spinner';

const SearchScope = styled.div<StyledProps>`
  white-space: nowrap;
  padding: 0 8px;
  ${(props) => props.styles};
`;

const SearchInputInput = styled.input<StyledProps>`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  padding-right: 26px;
  &:focus {
    outline: none;
  }

  &::-webkit-input-placeholder {
    color: ${cssVariables('neutral-6')};
  }

  &:-moz-placeholder {
    /* Firefox 18- */
    color: ${cssVariables('neutral-6')};
  }

  &::-moz-placeholder {
    /* Firefox 19+ */
    color: ${cssVariables('neutral-6')};
  }

  &:-ms-input-placeholder {
    color: ${cssVariables('neutral-6')};
  }

  transition: width 0.2s ${transitionDefault};

  ${(props) => props.styles};
`;

const SearchOption = styled.span`
  line-height: 1;
  color: ${cssVariables('content-2')};
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${cssVariables('border-2')};
  border-radius: 10px;
`;

const SearchClear = styled.button<StyledProps>`
  display: flex;
  margin-right: 12px;
  margin-left: auto;
  border: 0;
  background: transparent;

  ${(props) => props.styles};
`;

// search options box
const SearchOptionsBox = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  font-size: 1rem;
  text-align: left;
  list-style: none;
  background: white;
  border-radius: 4px;
  width: 100%;
  padding: 8px 0;
  margin-top: 1px;
  overflow: visible;
  max-height: 960px;
  white-space: nowrap;
  ${elevation.popover};
`;

const SearchOptionsBoxItem = styled.div<{ isActive: boolean }>`
  padding: 6px 16px;
  cursor: pointer;
  transition: 0.3s ${transitionDefault};
  transition-property: box-shadow;

  &:focus {
    outline: 0;
  }

  &:focus:not(:active) {
    box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
    position: relative; // prevent the background of the adjacent item hiding box-shadow
  }

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  ${(props) =>
    props.isActive &&
    css`
      color: ${cssVariables('purple-7')};
      background: ${cssVariables('neutral-2')};
      box-shadow: 2px 0 0 0 ${cssVariables('purple-7')} inset;

      &:focus:not(:active) {
        box-shadow: 2px 0 0 0 ${cssVariables('purple-7')} inset, 0 0 0 2px ${cssVariables('purple-7')};
        position: relative; // prevent the background of the adjacent item hiding box-shadow
      }
    `}
`;

const SearchOptionsBoxItemOption = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-right: 4px;
  line-height: 1.43;
  transition: color 0.3s ${transitionDefault};
`;

const SearchOptionsBoxItemDescription = styled.div`
  color: ${cssVariables('neutral-7')};
  line-height: 1.33;
  font-size: 12px;
  transition: color 0.3s ${transitionDefault};
`;

const SearchLoading = styled.div`
  position: relative;
  width: 16px;
  height: 18px;
  padding-top: 2px;
  padding-right: 4px;
  display: inline-block;
  vertical-align: middle;
`;

const ScopeIcon = styled(Icon)`
  display: inline-block;
`;
const ClearIcon = styled(Icon)`
  display: inline-flex;
`;

const SearchIcon = styled(IconButton)<{ styles?: SimpleInterpolation }>`
  margin-right: 4px;
  &:focus:not(:active),
  &:focus,
  &:active {
    border: none;
  }
  ${(props) => props.styles}
`;

const StyledSearchInput = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
  background: white;
  border: 1px solid ${cssVariables('neutral-4')};
  border-radius: 4px;
  transition: all 0.2s ${transitionDefault};
  ${(props) => props.styles.normal};

  ${(props) =>
    props.mode === 'icon'
      ? css`
          width: 40px;
          justify-content: center;
          ${SearchInputInput} {
            width: 0;
            padding: 0;
            flex: none;
          }
          ${SearchScope} {
            width: 0;
            padding: 0;
          }
          ${SearchIcon} {
            margin-right: 0;
          }
        `
      : ''};

  ${(props) =>
    props.searching
      ? css`
          border: 1px solid ${cssVariables('purple-7')};
          ${SearchInputInput} {
            &:focus {
            }

            &::-webkit-input-placeholder {
            }

            &:-moz-placeholder {
              /* Firefox 18- */
            }

            &::-moz-placeholder {
              /* Firefox 19+ */
            }

            &:-ms-input-placeholder {
            }
          }
          ${props.styles.searching};
        `
      : ''};

  ${(props) => {
    if (props.type === 'default') {
      return css``;
    }
    if (props.type === 'inline') {
      return css`
        border: 1px solid transparent;
      `;
    }
  }}
`;

interface OptionalSearchInputProps {
  handleDocumentClick?: (isOut) => void;
  handleFocus?: (e) => void;
  handleBlur?: (e) => void;
  handleChange?: (value: string) => void;
  handleSearchClear?: (e: React.MouseEvent) => void;
  handleSubmit?: (value: string, option: SearchInputOption) => void;
  handleOptionChange?: (option: SearchInputOption) => void;
  handleSearchClick?: (e) => void;

  isFetching?: boolean;
  ph?: string;
  icon?: IconName;
  clearIcon?: IconName;
  styles?: {
    SearchInput?: SimpleInterpolation;
    SearchScope?: SimpleInterpolation;
    SearchInputInput?: SimpleInterpolation;
    SearchClear?: SimpleInterpolation;
    SearchInputSearching?: SimpleInterpolation;
    SearchIcon?: SimpleInterpolation;
  };
  defaultOption?: SearchInputOption;
  value?: string;
  options?: SearchInputOption[];
  className?: string;
  type?: 'default' | 'inline' | 'legacy';
  mode?: 'default' | 'icon'; // show icon only or show input
  debug?: boolean;

  preventBlur?: boolean;
}

interface Props extends OptionalSearchInputProps {}

const initialOption = {
  label: '',
  suffix: '',
  key: '',
  description: '',
};

type State = {
  isOptionsOpen: boolean;
  option: SearchInputOption;
};

export class SearchInput extends React.Component<Props, State> {
  public static defaultProps: OptionalSearchInputProps = {
    isFetching: false,
    ph: PH_SEARCH_CHANNELS,
    styles: {
      SearchInput: css``,
      SearchScope: css``,
      SearchInputInput: css``,
      SearchClear: css``,
      SearchInputSearching: css``,
      SearchIcon: css``,
    },
    defaultOption: initialOption,
    options: [],
    value: '',
    type: 'default',
    mode: 'default',
    preventBlur: false,
    debug: false,
  };

  private searchInput = React.createRef<any>();
  private searchInputWrapper = React.createRef<any>();

  public state: State = {
    isOptionsOpen: false,
    option:
      this.props.defaultOption ||
      (this.props.options && this.props.options.length > 0 ? this.props.options[0] : initialOption),
  };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsCheck =
      this.props.isFetching !== nextProps.isFetching ||
      this.props.value !== nextProps.value ||
      this.props.mode !== nextProps.mode ||
      this.props.type !== nextProps.type;

    const stateCheck = !isEqual(this.state, nextState);
    return propsCheck || stateCheck;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, false);
  }

  private handleDocumentClick = (e) => {
    if (this.searchInputWrapper.current && !this.searchInputWrapper.current.contains(e.target)) {
      if (!this.props.debug) {
        this.setState({ isOptionsOpen: false });

        if (this.props.handleDocumentClick) {
          this.props.handleDocumentClick(true); // isOut
        }
      }

      // blur force
      this.searchInput.current && this.searchInput.current.blur();
    }
  };

  private handleFocus = (e) => {
    if (this.props.handleFocus) {
      this.props.handleFocus(e);
    }
    this.setState({ isOptionsOpen: true });
  };

  private handleBlur = (e?) => {
    if (!this.state.isOptionsOpen && this.props.value === '') {
      if (this.props.handleBlur) {
        this.props.handleBlur(e);
      }
    }
  };

  private handleChange = (e) => {
    const { value } = e.target;

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }
  };

  private handleSubmit: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (this.props.handleSubmit) {
        this.props.handleSubmit(event.currentTarget.value, this.state.option);
      }
      this.searchInput.current && this.searchInput.current.blur();
      this.setState({ isOptionsOpen: false });
    }
  };

  private handleOptionChange = (option) => () => {
    this.searchInput.current && this.searchInput.current.focus();
    this.setState({ option }, () => {
      if (this.props.handleOptionChange) {
        this.props.handleOptionChange(option);
      }
    });
  };

  private handleSearchOptionItemKeyDown = (option: SearchInputOption): KeyboardEventHandler<HTMLDivElement> => (
    event,
  ) => {
    if (event.key === ' ' || event.key === 'Enter') {
      this.handleOptionChange(option);
    }
  };

  private handleSearchClear = (e: React.MouseEvent) => {
    this.searchInput.current && this.searchInput.current.focus();
    if (!this.props.preventBlur) {
      this.setState({ isOptionsOpen: false }, () => {
        this.handleBlur();
      });
    }

    if (this.props.handleSearchClear) {
      this.props.handleSearchClear(e);
    }
  };

  private isInputFocused = () => {
    return this.searchInput.current === document.activeElement;
  };

  public render() {
    const { isOptionsOpen, option } = this.state;
    const { type, mode, value, isFetching, ph, icon, styles, options, className, clearIcon } = this.props;

    const renderScope = () => {
      return (
        <SearchScope styles={styles && styles.SearchScope}>
          {type === 'legacy' &&
            (isFetching ? (
              <SearchLoading>
                <SpinnerInner
                  isFetching={true}
                  dotStyles={css`
                    width: 4px;
                    height: 4px;
                    margin: 0 1px;
                  `}
                />
              </SearchLoading>
            ) : (
              <ScopeIcon icon={icon || 'search'} size={20} />
            ))}
          {options && options.length > 0 && (value !== '' || this.isInputFocused()) ? (
            <SearchOption>{option.label}</SearchOption>
          ) : (
            ''
          )}
        </SearchScope>
      );
    };

    const renderIcon = () => {
      const isClearable = value !== '';

      // mode is icon, and not focused
      const isIconInitialState = mode === 'icon' && !this.isInputFocused();

      const handleSearchClick = (e) => {
        this.props.handleSearchClick && this.props.handleSearchClick(e);
        this.searchInput.current && this.searchInput.current.focus();
      };

      let handleSearchIconClick;
      if (isClearable) {
        handleSearchIconClick = this.handleSearchClear;
      } else if (isIconInitialState) {
        handleSearchIconClick = handleSearchClick;
      } else {
        handleSearchIconClick = this.handleSubmit;
      }

      return (
        <SearchIcon
          data-test-id="SearchInputClearButton"
          icon={isClearable ? 'close' : 'search'}
          buttonType="secondary"
          size="xsmall"
          onClick={handleSearchIconClick}
          styles={this.props.styles && this.props.styles.SearchIcon}
        />
      );
    };

    return (
      <StyledSearchInput
        ref={this.searchInputWrapper}
        searching={this.isInputFocused()}
        value={value}
        styles={{
          normal: styles && styles.SearchInput,
          searching: styles && styles.SearchInputSearching,
        }}
        className={className}
        type={type}
        mode={mode}
        data-test-id="SearchInputWrapper"
      >
        {renderScope()}
        <SearchInputInput
          ref={this.searchInput}
          type="text"
          placeholder={ph}
          value={value}
          onClick={this.handleFocus}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleSubmit}
          styles={styles && styles.SearchInputInput}
          data-test-id="SearchInput"
        />

        {type !== 'legacy' && renderIcon()}
        {type === 'legacy' && (value || this.isInputFocused()) && (
          <SearchClear styles={styles && styles.SearchClear} onClick={this.handleSearchClear} aria-label="Clear">
            <ClearIcon icon={clearIcon || 'search'} size={20} />
          </SearchClear>
        )}

        {(isOptionsOpen || this.isInputFocused()) && options && options.length > 0 ? (
          <SearchOptionsBox>
            {options.length > 0
              ? options.map((optionItem) => {
                  return (
                    <SearchOptionsBoxItem
                      role="option"
                      tabIndex={0}
                      key={optionItem.key}
                      onClick={this.handleOptionChange(optionItem)}
                      onKeyDown={this.handleSearchOptionItemKeyDown(optionItem)}
                      isActive={option.key === optionItem.key}
                    >
                      <SearchOptionsBoxItemOption>
                        {optionItem.label}
                        {optionItem.suffix || ''}:
                      </SearchOptionsBoxItemOption>
                      <SearchOptionsBoxItemDescription>{optionItem.description}</SearchOptionsBoxItemDescription>
                    </SearchOptionsBoxItem>
                  );
                })
              : ''}
          </SearchOptionsBox>
        ) : (
          ''
        )}
      </StyledSearchInput>
    );
  }
}

export const NewSearchInput = (props: Props) => {
  const {
    styles = {
      SearchInput: null,
      SearchClear: null,
      SearchScope: null,
      SearchInputInput: null,
    },
    ...restProps
  } = props;

  return (
    <SearchInput
      {...restProps}
      type={props.type || 'legacy'}
      icon="search"
      clearIcon="remove"
      styles={{
        SearchInput: css`
          flex: 0 1 248px;
          min-width: 0;
          height: 32px;
          border-color: ${cssVariables('neutral-4')};

          ${ScopeIcon} svg {
            stroke: ${cssVariables('neutral-6')};
          }
          ${styles.SearchInput}
        `,
        SearchInputSearching: css`
          box-shadow: none;
        `,
        SearchClear: css`
          top: 7px;
          ${styles.SearchClear}
        `,
        SearchScope: css`
          padding-left: 12px;
          padding-right: 8px;
          ${styles.SearchScope}
        `,
        SearchInputInput: css`
          line-height: 20px;
          padding-top: 0;
          padding-bottom: 0;

          ::placeholder {
            color: ${cssVariables('neutral-6')};
            opacity: 1;
          }
          ${styles.SearchInputInput}
        `,
      }}
    />
  );
};
