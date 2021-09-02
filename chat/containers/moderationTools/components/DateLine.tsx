import { FC } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { useFormatDate } from '@hooks';

import { cssVariables as sizeCssVariables } from '../defineSizeCSSVariables';

export const zIndex = 290;

const StyledDateLine = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: ${zIndex};

  margin-top: calc(${sizeCssVariables.spacing} * 0.375);

  background: white;
  padding: 0 calc(${sizeCssVariables.spacing} * 2);
  height: calc(${sizeCssVariables.spacing} * 4);

  line-height: calc(${sizeCssVariables.spacing} * 4);
  letter-spacing: -0.3px;
  color: ${cssVariables('neutral-8')};
  font-size: ${sizeCssVariables.dateFontSize};
  font-weight: 600;
`;

type Props = {
  timestamp: number;
  className?: string;
};

const DateLine: FC<Props> = ({ className, timestamp }) => {
  const formatDate = useFormatDate();
  return <StyledDateLine className={className}>{formatDate(timestamp, 'shortDate')}</StyledDateLine>;
};

export default DateLine;
