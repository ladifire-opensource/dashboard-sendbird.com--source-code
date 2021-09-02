import { memo } from 'react';

import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables, Icon, StylesProps } from 'feather';
import numbro from 'numbro';

import { EMPTY_TEXT } from '@constants';

const CSATContainer = styled.div<StylesProps>`
  display: flex;
  align-items: center;

  ${(props) => props.styles}
`;

const Star = styled(Icon)`
  margin-right: 4px;
`;

type Props = {
  score: number | null;
  styles?: SimpleInterpolation;
};

export const TicketCSAT = memo<Props>(({ score, styles }) => {
  return (
    <CSATContainer styles={styles}>
      {score == null ? (
        EMPTY_TEXT
      ) : (
        <>
          <Star key="base_star" icon="star-filled" size={12} color={cssVariables('yellow-5')} />
          <div>{score === 0 ? 0 : numbro(score).format('0.0')}</div>
        </>
      )}
    </CSATContainer>
  );
});
