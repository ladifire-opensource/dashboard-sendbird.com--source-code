import { FC } from 'react';

import styled from 'styled-components';

import { SpinnerFull } from 'feather';

import { UsageItem } from './usageItem';

const Usages = styled.div`
  display: grid;
  grid-template-rows: 96px 96px auto;
`;

type Props = {
  usage: Usage[];
  isFetching: boolean;
};

export const SummaryView: FC<Props> = ({ usage, isFetching }) => {
  return (
    <>
      {isFetching && <SpinnerFull transparent={true} />}
      <Usages>
        {usage.map((usageItem) => (
          <UsageItem key={`usage_${usageItem.label}`} {...usageItem} />
        ))}
      </Usages>
    </>
  );
};
