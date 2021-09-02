import { HTMLAttributes, ReactNode } from 'react';

import styled from 'styled-components';

import { Body, cssVariables, transitionDefault } from 'feather';

const DotContainer = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-10')};

  &::before {
    margin-right: 8px;
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 4px;
    transition: background 0.2s ${transitionDefault};
    background: ${(props) => props.$color};
  }
`;

export const Dot = styled(
  ({ color, label, ...props }: { color: string; label: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
    return (
      <DotContainer $color={color} {...props}>
        {label}
      </DotContainer>
    );
  },
)``;
