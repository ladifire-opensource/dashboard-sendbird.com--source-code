import { forwardRef, useState } from 'react';

import styled, { css } from 'styled-components';

import { InputTextarea, cssVariables, transitionDefault } from 'feather';
import numbro from 'numbro';

import { PropsOf } from '@utils';

type Props = PropsOf<typeof InputTextarea>;

export const MAX_TARGET_COUNT = 10000;

const formatNumber = (value: number) => numbro(value).format({ thousandSeparated: true });

const TargetCount = styled.div<{ isOverLimit: boolean; isErrorVisible: boolean }>`
  position: relative;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
  text-align: right;
  margin-top: 4px;
  transition: margin-top 0.2s ${transitionDefault};

  &:not(:last-child) {
    margin-bottom: 16px;
  }

  i {
    font-style: initial;
  }

  ${({ isErrorVisible }) =>
    isErrorVisible &&
    css`
      margin-top: -16px;
    `}

  ${({ isOverLimit }) =>
    isOverLimit &&
    css`
      i {
        color: ${cssVariables('red-5')};
      }
    `}
`;

export const getTargetCount = (value: string) =>
  value
    .trim()
    .split(',')
    .filter((v) => !!v).length;

export const TargetListTextarea = forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const [targetCount, setTargetCount] = useState(0);

  return (
    <>
      <InputTextarea ref={ref} {...props} onChange={(event) => setTargetCount(getTargetCount(event.target.value))} />
      <TargetCount isOverLimit={targetCount > MAX_TARGET_COUNT} isErrorVisible={!!props.error?.hasError}>
        <i>{formatNumber(targetCount)}</i> / {formatNumber(MAX_TARGET_COUNT)}
      </TargetCount>
    </>
  );
});
