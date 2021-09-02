import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { IconButton, toast, IconButtonProps } from 'feather';

type Props = Partial<Omit<IconButtonProps, 'onClick'>> & { copyableText: string };

const CopyButtonComponent: React.FC<Props> = ({
  icon = 'copy',
  size = 'small',
  buttonType = 'tertiary',
  title,
  copyableText,
  ...props
}) => {
  const intl = useIntl();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    copy(copyableText);
    toast.success({ message: intl.formatMessage({ id: 'ui.toast.copied' }) });
  };

  return (
    <IconButton
      size={size}
      title={title ?? intl.formatMessage({ id: 'ui.button.copy' })}
      icon={icon}
      buttonType={buttonType}
      onClick={handleClick}
      {...props}
      data-test-id="CopyButton"
    />
  );
};

export const CopyButton = styled(CopyButtonComponent)``;
