import { FC } from 'react';

import styled from 'styled-components';

import { CopyButton } from '@ui/components';

const CopyableWrapper = styled.div`
  display: inline-block;
  align-items: center;
  position: relative;

  ${CopyButton} {
    display: none;
    position: absolute;
    transform: translate(0, -2px);
  }

  &:hover ${CopyButton} {
    display: inline-flex;
  }
`;

const Copyable: FC<{ children: string }> = ({ children }) => {
  return (
    <CopyableWrapper>
      {children}
      <CopyButton copyableText={children} size="xsmall" />
    </CopyableWrapper>
  );
};

export default Copyable;
