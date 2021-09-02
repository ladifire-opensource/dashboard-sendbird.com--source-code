import React from 'react';

import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps, ZIndexes } from '@ui';
import { animationBounceDelay } from '@ui/styles';

const SpinnerWrapper = styled.div`
  position: absolute;
  z-index: ${ZIndexes.spinnerFull};
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const Spinner = styled.div`
  > div {
    width: 14px;
    height: 14px;
    background-color: ${cssVariables('neutral-5')};
    margin: -7px 2px 0;
    border-radius: 100%;
    display: inline-block;
    animation-name: ${animationBounceDelay};
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-fill-mode: both;
    opacity: 0.6;
  }
`;

const SpinnerColumn = styled.div``;

const SpinnerCover = styled.div<StyledProps>`
  position: ${(props) => (props.transparent ? 'absolute' : 'relative')};
  ${(props) =>
    props.transparent
      ? css`
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        `
      : css`
          width: 100%;
          height: 100%;
        `} min-height: 200px;

  ${SpinnerColumn} {
    flex: 1;
    ${(props) => (props.transparent ? 'background: rgba(255, 255, 255, 0.4)' : '')};
  }

  ${Spinner} {
    flex: 1;
    align-items: center;
    justify-content: center;
    display: flex;
    ${(props) => (props.transparent ? 'background: rgba(255, 255, 255, 0.4)' : '')};
  }
`;

const SpinnerDot = styled.div<StyledProps>`
  animation-delay: ${(props) => (props.delay ? props.delay : '0s')};
`;

interface SpinnerFullProps {
  style?: React.CSSProperties;
  transparent?: boolean;
}

export class SpinnerFull extends React.PureComponent<SpinnerFullProps> {
  public render() {
    return (
      <SpinnerCover {...this.props} role="progressbar" data-test-id="SpinnerFull">
        <SpinnerWrapper>
          <SpinnerColumn />
          <Spinner>
            <SpinnerDot delay="-0.32s" />
            <SpinnerDot delay="-0.16s" />
            <SpinnerDot />
          </Spinner>
          <SpinnerColumn />
        </SpinnerWrapper>
      </SpinnerCover>
    );
  }
}
