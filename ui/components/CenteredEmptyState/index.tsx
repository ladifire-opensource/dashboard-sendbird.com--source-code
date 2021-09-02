import { FC } from 'react';

import styled from 'styled-components';

import { EmptyState, EmptyStateProps, EmptyStateSize } from 'feather';

const EmptyWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 90px 16px;
`;

type Props = Omit<EmptyStateProps, 'size'> & { size?: 'large' | 'small' };

const CenteredEmptyState: FC<Props> = ({ size = 'large', className, ...props }) => {
  const emptyStateSize = size === 'small' ? EmptyStateSize.Small : EmptyStateSize.Large;

  return (
    <EmptyWrapper className={className}>
      <EmptyState size={emptyStateSize} {...props} />
    </EmptyWrapper>
  );
};

export default CenteredEmptyState;
