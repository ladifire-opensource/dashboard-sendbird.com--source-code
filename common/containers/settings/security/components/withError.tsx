import { forwardRef } from 'react';

import styled from 'styled-components';

import { BasicInput, BasicTextarea, errorInputStyles, InputError } from '@ui/components';

import { InputWithDecorator, InputWithDecoratorProps } from './inputWithDecorator';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  > * {
    width: 100%;
  }
`;

type WithErrorProps = {
  className?: string;
  error: FormError;
};

export const BasicInputWithError = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  WithErrorProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { error, className, ...restProps } = props;
  return (
    <Container className={className}>
      <BasicInput {...restProps} ref={ref} styles={error.hasError ? errorInputStyles : null} />
      {error.hasError && <InputError>{error.message}</InputError>}
    </Container>
  );
});

export const InputWithDecoratorWithError = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  WithErrorProps & InputWithDecoratorProps
>((props, ref) => {
  const { error, className, ...restProps } = props;
  return (
    <Container className={className}>
      <InputWithDecorator {...restProps} ref={ref} inputStyles={error.hasError ? errorInputStyles : null} />
      {error.hasError && <InputError>{error.message}</InputError>}
    </Container>
  );
});

export const BasicTextareaWithError = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  WithErrorProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  const { error, className, ...restProps } = props;
  return (
    <Container className={className}>
      <BasicTextarea {...restProps} ref={ref} styles={error.hasError ? errorInputStyles : null} />
      {error.hasError && <InputError>{error.message}</InputError>}
    </Container>
  );
});
