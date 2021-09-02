import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { colors_old, StyledProps } from '@ui';

import { StyledSpinnerInner, SpinnerInnerDot } from '../spinner';

const ButtonDefaultStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  background: transparent;
  outline: none !important;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.15);
  height: 40px;
  line-height: 1;
  padding: 0 16px;
  position: relative;
  border-radius: 4px;
  transition: all 0.2s ${transitionDefault};
  white-space: nowrap;

  &:hover,
  &:focus {
    cursor: pointer;
    text-decoration: none;
  }

  &:focus {
    outline: none;
  }

  &[disabled] {
    cursor: not-allowed;
    filter: alpha(opacity=65);
    -webkit-box-shadow: none !important;
    box-shadow: none !important;
  }
`;

const Button = styled.button<StyledProps>`
  ${ButtonDefaultStyle};
  ${(props) => props.styles};
`;

// new
const ButtonPurpleCore = styled(Button)`
  background: ${cssVariables('purple-7')};
  color: white;

  ${StyledSpinnerInner} {
    background: ${cssVariables('purple-7')};
  }
  ${SpinnerInnerDot} {
    background: white;
  }

  &:hover {
    background: ${colors_old.primary.purple.dark};
  }
  &:disabled {
    opacity: 0.4;
  }
`;

const ButtonPurpleTransparent = styled(Button)`
  color: ${cssVariables('purple-7')};
  box-shadow: none;

  ${StyledSpinnerInner} {
    background: white;
  }
  ${SpinnerInnerDot} {
    background: ${cssVariables('purple-7')};
  }

  &:hover {
    color: ${colors_old.primary.purple.dark};
  }
`;

const ButtonPurpleLineStyle = css`
  color: ${cssVariables('purple-7')};
  border: 1px solid ${cssVariables('purple-7')};
  box-shadow: none;

  ${StyledSpinnerInner} {
    background: white;
  }
  ${SpinnerInnerDot} {
    background: ${cssVariables('purple-7')};
  }
  &:hover {
    color: ${colors_old.primary.purple.dark};
    border: 1px solid ${colors_old.primary.purple.dark};
  }
`;

const ButtonPurpleLine = styled(Button)`
  ${ButtonPurpleLineStyle};
`;

const ButtonNatureGreen = styled(Button)`
  background: #29cc9e;
  color: white;

  ${StyledSpinnerInner} {
    background: #29cc9e;
  }
  ${SpinnerInnerDot} {
    background: white;
  }

  &:hover {
    background: #1f9c73;
  }
  &:disabled {
    opacity: 0.4;
  }
`;

const ButtonWhitePurple = styled(Button)`
  color: ${cssVariables('purple-7')};
  background: white;
  border: 1px solid ${cssVariables('neutral-3')};

  ${StyledSpinnerInner} {
    background: white;
  }
  ${SpinnerInnerDot} {
    background: ${cssVariables('purple-7')};
  }
`;

const ButtonDanger = styled(Button)`
  border: 1px solid #f45477;
  background: #f45477;
  color: white;

  ${StyledSpinnerInner} {
    background: #f45477;
  }
  ${SpinnerInnerDot} {
    background: white;
  }

  &:hover,
  &:focus {
    background: #d84162;
    border: 1px solid #d84162;
    color: white;
  }
  &:disabled {
    opacity: 0.4;
  }
`;

const ButtonWhiteGray = styled(Button)`
  color: ${cssVariables('neutral-7')};
  background: white;
  border: 1px solid ${cssVariables('neutral-3')};

  ${StyledSpinnerInner} {
    background: white;
  }
  ${SpinnerInnerDot} {
    background: ${cssVariables('neutral-7')};
  }

  &:hover {
    color: ${cssVariables('neutral-10')};
    background: ${cssVariables('neutral-1')};
  }

  &:disabled {
    opacity: 0.4;
  }

  ${(props) => props.styles};
`;

const ButtonGray = styled(Button)<StyledProps>`
  color: white;
  background: ${cssVariables('neutral-6')};
  border: 1px solid ${cssVariables('neutral-6')};

  ${StyledSpinnerInner} {
    background: ${cssVariables('neutral-6')};
  }
  ${SpinnerInnerDot} {
    background: white;
  }

  &:hover {
    color: white;
    background: ${cssVariables('neutral-6')};
    border: 1px solid ${cssVariables('neutral-6')};
  }
`;

const ButtonDangerWhite = styled(Button)<StyledProps>`
  color: #f45477;
  background: white;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e2e5;

  ${StyledSpinnerInner} {
    background: #f45477;
  }
  ${SpinnerInnerDot} {
    background: white;
  }

  &:hover {
    color: #d84162;
    background: ${cssVariables('neutral-1')};
  }
`;

export {
  Button,
  ButtonDefaultStyle,
  ButtonPurpleCore,
  ButtonPurpleTransparent,
  ButtonPurpleLine,
  ButtonPurpleLineStyle,
  ButtonNatureGreen,
  ButtonWhitePurple,
  ButtonDanger,
  ButtonDangerWhite,
  ButtonWhiteGray,
  ButtonGray,
};
