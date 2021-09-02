import React, { useState, useRef, useCallback } from 'react';

import styled from 'styled-components';

import { InputText, transitions, IconButton } from 'feather';

const SearchContainer = styled.div`
  position: relative;
`;

const SearchButton = styled(IconButton)<{ isShow: boolean }>`
  position: absolute;
  top: 4px;
  right: 8px;
  z-index: ${({ isShow }) => (isShow ? 30 : 10)};
  opacity: ${({ isShow }) => (isShow ? 1 : 0)};
  transform: translateX(${({ isShow }) => (isShow ? 0 : 8)}px);
  transition: ${transitions({ properties: ['transform', 'opacity'], duration: 0.3 })};
  pointer-events: ${({ isShow }) => (isShow ? 'auto' : 'none')};
`;

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
  onSubmit: (value: string) => void;
  onClear?: () => void;
};

export const BasicSearchBar = React.memo<Props>(
  ({ name, defaultValue, placeholder, disabled, width, onSubmit, onClear }) => {
    const queryRef = useRef<HTMLInputElement>(null);
    const [isQueryExist, setIsQueryExist] = useState(!!defaultValue);

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        if (e.target.value.trim().length === 0) {
          isQueryExist && setIsQueryExist(false);
        } else {
          !isQueryExist && setIsQueryExist(true);
        }
      },
      [isQueryExist],
    );

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        if (e.key === 'Enter' && queryRef.current) {
          onSubmit(queryRef.current.value);
        }
      },
      [onSubmit],
    );

    /**
     * Do not remove onSubmit method.
     * The reason why this component is not using <form> tag inside of it is that.
     * this component can be used with other inputs and can be wrapped by form tag outside of it.
     */
    const handleQuerySubmit = useCallback(() => {
      queryRef.current && onSubmit(queryRef.current.value);
    }, [onSubmit]);

    const handleQueryClear = useCallback(() => {
      queryRef.current && (queryRef.current.value = '');
      setIsQueryExist(false);
      onSubmit('');
      onClear && onClear();
    }, [onClear, onSubmit]);

    return (
      <SearchContainer>
        <InputText
          ref={queryRef}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          size="small"
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ width }}
        />
        <SearchButton
          icon="search"
          size="xsmall"
          type="submit"
          isShow={!isQueryExist}
          buttonType="secondary"
          disabled={disabled}
          onClick={handleQuerySubmit}
          data-test-id="Submit"
        />
        <SearchButton
          icon="close"
          size="xsmall"
          buttonType="secondary"
          disabled={disabled}
          isShow={isQueryExist}
          onClick={handleQueryClear}
          data-test-id="Clear"
        />
      </SearchContainer>
    );
  },
);
