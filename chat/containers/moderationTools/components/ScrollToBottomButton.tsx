import { ButtonHTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { shadow, cssVariables, Icon, Tooltip, TooltipVariant } from 'feather';

const Button = styled.button`
  position: absolute;
  right: 0;
  bottom: 0;
  transition: 0.2s;
  z-index: 300;
  outline: 0;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  width: 100%;
  height: 100%;

  line-height: 0;
  ${shadow[2]}

  &:hover {
    background-color: ${cssVariables('neutral-1')};
  }

  &:active {
    background-color: ${cssVariables('neutral-3')};
  }

  &:not(:active):focus {
    box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

const ScrollToBottomButton = ({ className, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) => {
  const intl = useIntl();
  return (
    <Tooltip
      content={intl.formatMessage({ id: 'chat.channelDetail.btn.goToBottom' })}
      variant={TooltipVariant.Dark}
      placement="top"
      className={className}
      css={`
        position: absolute;
        right: 16px;
        bottom: 8px;
        width: 40px;
        height: 40px;
      `}
    >
      <Button {...props}>
        <Icon icon="chevron-down" size={24} color={cssVariables('neutral-6')} />
      </Button>
    </Tooltip>
  );
};

export default ScrollToBottomButton;
