import React, { ComponentProps } from 'react';

import styled from 'styled-components';

import { Icon, cssVariables, Subtitles } from 'feather';

const StyledStars = styled.div`
  display: flex;
  align-items: center;
  .stars {
    &__wrapper {
      position: relative;
    }
    &__value {
      ${Subtitles['subtitle-01']}
      margin-left: 8px;
      color: ${cssVariables('neutral-10')};
      font-weight: 500;
    }
  }
`;

const StarBaseArea = styled.div``;

const StarScoredArea = styled.div`
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  z-index: 1;
`;

type Props = {
  current: number;
  max?: number; // default: 5
  size?: ComponentProps<typeof Icon>['size'];
  showValue?: boolean;
  toFixed?: number;
};

export const Stars: React.FC<Props> = ({ current, max = 5, size = 20, showValue = false, toFixed = 2 }) => {
  const scoredStarCount = Math.ceil(current) || 0;
  if (current > max) {
    return null;
  }
  return (
    <StyledStars>
      <div className="stars__wrapper">
        <StarScoredArea style={{ width: `${(current / max) * 100}%` }}>
          {Array(scoredStarCount)
            .fill(0)
            .map((_, index) => (
              <Icon key={`scored_star_${index}`} icon="star-filled" size={size} color={cssVariables('yellow-5')} />
            ))}
        </StarScoredArea>
        <StarBaseArea>
          {Array(max)
            .fill(0)
            .map((_, index) => (
              <Icon key={`base_star_${index}`} icon="star-filled" size={size} color={cssVariables('neutral-3')} />
            ))}
        </StarBaseArea>
      </div>
      {showValue && <div className="stars__value">{current.toFixed(toFixed)}</div>}
    </StyledStars>
  );
};
