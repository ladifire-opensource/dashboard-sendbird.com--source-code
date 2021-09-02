import React, { forwardRef } from 'react';

import { Button, ButtonProps, ButtonType } from 'feather';

interface ConfirmButtonProps {
  isFetching?: boolean;
  children: any;
  [key: string]: any;
}

export const CancelButton = (props: Omit<ButtonProps, 'buttonType'> & { buttonType?: ButtonType }) => {
  const { buttonType = 'tertiary', ...buttonProps } = props;
  return <Button buttonType={buttonType} {...buttonProps} />;
};

export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  ({ isFetching, children, ...rest }, ref) => {
    return (
      <Button
        type="submit"
        ref={ref}
        buttonType="primary"
        isLoading={isFetching}
        data-test-id="DialogConfirmButton"
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export const DeleteButton: React.FC<Partial<ButtonProps>> = ({ children, ...rest }) => {
  return (
    <Button type="submit" buttonType="danger" {...rest}>
      {children}
    </Button>
  );
};
