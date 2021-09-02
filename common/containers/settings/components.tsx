import styled from 'styled-components';

import { cssVariables } from 'feather';

import { NewSearchInput } from '@ui/components';

export const SearchInput = styled(NewSearchInput)``;

export const SearchInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  height: 32px;

  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-8')};
  font-weight: 500;

  ${SearchInput} {
    margin-left: auto;
  }
`;
