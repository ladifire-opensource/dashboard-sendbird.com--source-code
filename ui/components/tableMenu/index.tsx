import styled from 'styled-components';

import { cssVariables } from 'feather';

const TableMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;

  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-7')};
  font-weight: 500;
`;

const TableMenuSelected = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-7')};
`;

const TableMenuDivider = styled.div`
  width: 1px;
  height: 28px;
  margin: 0 16px;
  background: ${cssVariables('neutral-3')};
`;

const TableMenuItems = styled.div`
  display: flex;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`;

export { TableMenu, TableMenuSelected, TableMenuDivider, TableMenuItems };
