import React from 'react';

import styled, { SimpleInterpolation } from 'styled-components';

import { Icon } from 'feather';

import { BasicInput } from '@ui/components';
import { PropsOf } from '@utils';

const InputWithDecoratorWrapper = styled.div`
  position: relative;
`;

const InputDecoratorIcon = styled(Icon)<{ position: 'left' | 'right' }>`
  position: absolute;
  ${(props) => props.position}: 12px;
  top: 50%;
  margin-top: -10px;
`;

const InputWithDecoratorControl = styled(BasicInput)<{
  decoratorPosition: 'left' | 'right';
}>`
  padding-${(props) => props.decoratorPosition}: 40px;
`;

export type InputWithDecoratorProps = {
  decoratorPosition: 'left' | 'right';
  icon?: PropsOf<typeof Icon>;
  children?: React.ReactNode;
  inputStyles?: ReadonlyArray<SimpleInterpolation> | null;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputWithDecorator = React.forwardRef(
  (
    { decoratorPosition, icon, children, inputStyles, ...inputProps }: InputWithDecoratorProps,
    ref: React.RefObject<any>,
  ) => (
    <InputWithDecoratorWrapper>
      {icon && <InputDecoratorIcon position={decoratorPosition} {...icon} />}
      <InputWithDecoratorControl ref={ref} decoratorPosition={decoratorPosition} styles={inputStyles} {...inputProps} />
      {children}
    </InputWithDecoratorWrapper>
  ),
);
