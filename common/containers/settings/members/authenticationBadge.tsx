import styled from 'styled-components';

import { cssVariables } from 'feather';

// component props types
type Props = {
  children: string;
  className?: string;
};

const Container = styled.div`
  padding: 2px 6px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-1')};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};

  > svg {
    margin-right: 5px;
  }

  & + & {
    margin-left: 8px;
  }
`;

export const AuthenticationBadge = styled(({ children, className }: Props) => (
  <Container className={className}>
    <svg viewBox="0 0 6 6" width="6" height="6" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50%" cy="50%" r="3" fill={cssVariables('green-5')} />
    </svg>
    {children}
  </Container>
))``;
