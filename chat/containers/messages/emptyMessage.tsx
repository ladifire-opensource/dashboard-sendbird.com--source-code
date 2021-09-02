import { Component } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

const StyledEmptyMessage = styled.div`
  padding: 16px 16px 12px 16px;
  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const EmptyText = styled.div`
  height: 12px;
  background: ${cssVariables('neutral-1')};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export class EmptyMessage extends Component {
  shouldComponentUpdate() {
    return false;
  }

  getRandomPercentage() {
    const number = Math.floor(Math.random() * (100 - 10 + 1) + 10);
    return number;
  }

  render() {
    return (
      <StyledEmptyMessage>
        <div />
        <div>
          <EmptyText style={{ width: `${this.getRandomPercentage()}%` }} />
          <EmptyText style={{ width: `${this.getRandomPercentage()}%` }} />
          <EmptyText style={{ width: `${this.getRandomPercentage()}%` }} />
          <EmptyText style={{ width: `${this.getRandomPercentage()}%` }} />
        </div>
      </StyledEmptyMessage>
    );
  }
}
