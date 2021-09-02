import React from 'react';

import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables, Icon, transitionDefault } from 'feather';

const Success = styled.div<{
  show: Props['show'];
  position?: Props['position'];
  styles: Props['styles'];
}>`
  display: flex;
  align-items: center;
  height: ${(props) => (props.show ? 'auto' : 0)};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: height 0.2s ${transitionDefault}, opacity 0.2s ${transitionDefault}, transform 0.2s ${transitionDefault};

  ${(props) => props.styles}
`;

const SuccessMessage = styled.span`
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('content-primary')};
`;

type Props = {
  innerRef?: React.RefObject<HTMLDivElement>;
  show: boolean;
  message: string;
  position?: 'static' | 'absolute' | 'relative';
  styles?: SimpleInterpolation;
};

export const MessageSuccess: React.FC<Props> = ({ innerRef, show, message, position, styles }) => {
  return (
    <Success data-test-id="password_message_success" ref={innerRef} show={show} position={position} styles={styles}>
      <Icon icon="success-filled" size={14} color={cssVariables('content-primary')} />
      <SuccessMessage>{message}</SuccessMessage>
    </Success>
  );
};
