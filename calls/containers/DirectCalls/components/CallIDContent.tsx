import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

import styled from 'styled-components';

type Props = {
  callID: string;
};

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 100%;

  a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const CallIDContent: FC<Props> = ({ callID }) => {
  const { pathname, search } = useLocation();
  return (
    <ContentContainer data-test-id="CallIDContent">
      <Link to={{ pathname: `direct-calls/${callID}`, state: { backUrl: `${pathname}${search}` } }}>{callID}</Link>
    </ContentContainer>
  );
};
