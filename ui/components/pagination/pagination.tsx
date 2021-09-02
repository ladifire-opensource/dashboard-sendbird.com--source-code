import React from 'react';

import styled, { css } from 'styled-components';

import { Icon, cssVariables, transitionDefault } from 'feather';

import { StyledProps } from '@ui';
import * as utils from '@utils';

const Pages = styled.div`
  display: flex;
`;

const Page = styled.div<StyledProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  font-weight: ${(props) => (props.isActive ? '600' : 'normal')};
  width: 36px;
  height: 36px;
  cursor: pointer;
  border: 1px solid ${(props) => (props.isActive ? cssVariables('purple-7') : cssVariables('neutral-3'))};
  border-radius: 4px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 5px -2px rgba(0, 0, 0, 0.15);
  color: ${(props) => (props.isActive ? 'white' : cssVariables('neutral-5'))};
  background: ${(props) => (props.isActive ? cssVariables('purple-7') : 'white')};

  &:hover {
    background: ${(props) => (props.isActive ? cssVariables('purple-7') : cssVariables('neutral-1'))};
  }

  transition: all 0.2s ${transitionDefault};
`;

const Arrow = styled.div<StyledProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: white;
  text-align: center;
  cursor: pointer;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 5px -2px rgba(0, 0, 0, 0.15);

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  ${(props) =>
    props.direction === 'left'
      ? css`
          margin-right: 12px;
        `
      : ''};
  ${(props) =>
    props.direction === 'right'
      ? css`
          margin-left: 12px;
        `
      : ''};
`;

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;

  ${Page} + ${Page} {
    margin-left: 4px;
  }
`;

interface PaginationProps {
  pagination: BlockPagination;
  style: React.CSSProperties;
  onPageClick: (page: number) => any;
}

export const Pagination: React.SFC<PaginationProps> = ({ pagination, style, onPageClick }) => {
  const handlePageClick = (page) => () => {
    onPageClick(page);
  };

  return (
    <StyledPagination style={style}>
      {!utils.isEmpty(pagination) && (
        <Pages>
          <Arrow direction="left" onClick={handlePageClick(1)}>
            <Icon icon="chevron-left" size={20} />
          </Arrow>
          {pagination.block && pagination.block !== 1
            ? [
                <Page key="first" onClick={handlePageClick(1)}>
                  1
                </Page>,
                <Page key="previousBlock" onClick={handlePageClick(pagination.pages[0] - 1)}>
                  ...
                </Page>,
              ]
            : ''}
          {pagination.pages.map((page) => {
            return (
              <Page key={page} isActive={pagination.page === page} onClick={handlePageClick(page)}>
                {page}
              </Page>
            );
          })}
          {pagination.block && pagination.block !== pagination.totalBlock
            ? [
                <Page key="nextBlock" onClick={handlePageClick(pagination.pages[pagination.pages.length - 1] + 1)}>
                  ...
                </Page>,
                <Page key="last" onClick={handlePageClick(pagination.last)}>
                  {pagination.last}
                </Page>,
              ]
            : ''}
          <Arrow direction="right" onClick={handlePageClick(pagination.last)}>
            <Icon icon="chevron-right" size={20} />
          </Arrow>
        </Pages>
      )}
    </StyledPagination>
  );
};
