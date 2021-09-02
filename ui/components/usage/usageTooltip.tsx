import { forwardRef, HTMLAttributes, ReactNode } from 'react';

import styled from 'styled-components';

import { cssVariables, elevation } from 'feather';

type Props = {
  items: {
    /**
     * Label must be unique.
     */
    label: string;
    content: ReactNode;
    color: string;
  }[];
} & HTMLAttributes<HTMLUListElement>;

const Container = styled.ul`
  display: grid;
  grid-template-columns: auto;
  grid-row-gap: 12px;
  z-index: 500;
  margin: 0;
  border-radius: 4px;
  background-color: white;
  padding: 12px 16px;
  min-width: 191px;
  list-style: none;
  pointer-events: none;
  ${elevation.popover};
`;

const Label = styled.div<{ $dotColor: string }>`
  display: flex;
  align-items: center;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
  font-size: 12px;

  &::before {
    display: block;
    margin-right: 8px;
    border-radius: 50%;
    background-color: ${({ $dotColor }) => $dotColor};
    width: 8px;
    height: 8px;
    content: '';
  }
`;

const Content = styled.div`
  position: relative;
  padding-left: 16px;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
`;

const ListItem = styled.li``;

export const UsageTooltip = forwardRef<HTMLUListElement, Props>(({ items, ...props }, ref) => {
  return (
    <Container ref={ref} {...props}>
      {items.map(({ label, content, color }) => (
        <ListItem key={label}>
          <Label $dotColor={color}>{label}</Label>
          <Content>{content}</Content>
        </ListItem>
      ))}
    </Container>
  );
});
