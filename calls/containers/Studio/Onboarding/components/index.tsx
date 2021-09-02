import styled from 'styled-components';

import { cssVariables } from 'feather';

import Progress from './Progress';

const sizes = {
  title: 104,
};

export const Header = styled.header`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  height: 80px;
  display: flex;
  align-items: center;
  padding: 24px 32px;

  > ${Progress} {
    width: 100%;
    padding-right: ${sizes.title / 2}px;
    display: flex;
    justify-content: center;
  }
`;

export const Layout = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 1024px;
  height: 100%;
`;
