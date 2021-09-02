import React, { forwardRef } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { HighlightedText } from '@ui/components';

const AppName = styled(HighlightedText)`
  max-width: 100%;
  min-width: 0;

  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const AppRegionName = styled.div`
  max-width: 100%;
  min-width: 0;

  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: ${cssVariables('neutral-7')};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 220px;

  ${AppName}, ${AppRegionName} {
    color: inherit;
  }
`;

type Props = {
  className?: string;
  name: string;
  region: string | null;
  highlightedText?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const AppListItem = forwardRef<HTMLDivElement, Props>(
  ({ className, name, region, highlightedText = '', onClick = () => {} }, ref) => {
    return (
      <Container className={className} onClick={onClick} ref={ref}>
        <AppName title={name} content={name} highlightedText={highlightedText} />
        <AppRegionName>{region}</AppRegionName>
      </Container>
    );
  },
);
