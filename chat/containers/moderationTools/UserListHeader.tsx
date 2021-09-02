import { ReactNode, FC, MouseEventHandler } from 'react';

import styled from 'styled-components';

import { cssVariables, IconButton, Headings } from 'feather';

type Props = {
  badge?: ReactNode;
  onBackButtonClick: MouseEventHandler<HTMLButtonElement>;
};

const MTInfoSectionHeader = styled.div`
  display: flex;
  flex: none; // avoid being shrinked by flexbox parent
  align-items: center;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  padding-right: 16px;
  padding-left: 8px;
  height: 48px;
`;

const MTInfoSectionTitle = styled.div`
  flex: 1;
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
  margin-left: 4px;
`;

export const UserListHeader: FC<Props> = ({ children, badge, onBackButtonClick }) => {
  return (
    <MTInfoSectionHeader>
      <IconButton icon="arrow-left" buttonType="secondary" size="small" onClick={onBackButtonClick} aria-label="Back" />
      <MTInfoSectionTitle>{children}</MTInfoSectionTitle>
      {badge}
    </MTInfoSectionHeader>
  );
};
