import React from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, transitionDefault, Icon } from 'feather';

type Props = {
  text: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
  componentAbove?: React.ReactElement<HTMLElement>;
  componentBelow?: React.ReactElement<HTMLElement>;
};

const BackContainer = styled.div`
  padding: 24px 0;
  text-align: center;
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;

  svg {
    fill: ${cssVariables('purple-7')};
    transition: transform 0.2s ${transitionDefault};
  }

  &:hover {
    svg {
      transform: translateX(-3px);
    }
  }
`;
const BackText = styled.span`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: ${cssVariables('purple-7')};
`;

export const HistoryBackText: React.FunctionComponent<Props> = ({
  text,
  href,
  componentAbove,
  componentBelow,
  onClick = () => {},
}) => {
  return (
    <BackContainer>
      {componentAbove}
      <Back to={href} onClick={onClick}>
        <Icon icon="arrow-left" size={16} />
        <BackText>{text}</BackText>
      </Back>
      {componentBelow}
    </BackContainer>
  );
};
