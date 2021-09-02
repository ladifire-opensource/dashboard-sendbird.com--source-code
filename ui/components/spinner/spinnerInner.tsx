import { PureComponent } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { StyledProps } from '@ui';
import { animationBounceDelay } from '@ui/styles';

const Spinner = styled.div<{
  spinnerBackground?: string;
  spinnerStyles?: SimpleInterpolation;
}>`
  flex: 1;
  justify-content: center;
  align-items: center;
  display: flex;
  background: ${(props) => props.spinnerBackground};

  ${(props) => props.spinnerStyles}
`;

const SpinnerInnerDot = styled.div<StyledProps>`
  width: 6px;
  height: 6px;
  margin: 0 1.5px;
  background: ${(props) => (props.dotColor ? props.dotColor : '#A5B3CD')};
  opacity: 0.6;
  border-radius: 100%;
  display: inline-block;
  animation: ${animationBounceDelay} 1.4s infinite ease-in-out both;
  animation-delay: ${(props) => (props.delay ? props.delay : '0s')};
  ${(props) =>
    props.dotSize
      ? css`
          width: ${props.dotSize.width}px;
          height: ${props.dotSize.height}px;
        `
      : ''};
  ${(props) => props.dotStyles};
`;

const StyledSpinnerInner = styled.div`
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  overflow: hidden;
  border-radius: 4px;
`;

interface Props {
  isFetching?: boolean;
  spinnerBackground?: string;
  spinnerStyles?: SimpleInterpolation;
  dotColor?: string;
  dotSize?: {
    width: number;
    height: number;
  };
  dotStyles?: SimpleInterpolation;
}

class SpinnerInner extends PureComponent<Props> {
  public static defaultProps: Props = {
    dotColor: '#A5B3CD',
    dotSize: {
      width: 6,
      height: 6,
    },
    spinnerBackground: 'transparent',
  };

  public render() {
    const { isFetching, spinnerStyles, spinnerBackground, dotColor, dotSize, dotStyles, ...attrs } = this.props;

    if (isFetching) {
      return (
        <StyledSpinnerInner {...attrs}>
          <Spinner spinnerBackground={spinnerBackground} spinnerStyles={spinnerStyles}>
            <SpinnerInnerDot delay="-0.32s" dotColor={dotColor} dotSize={dotSize} dotStyles={dotStyles} />
            <SpinnerInnerDot delay="-0.16s" dotColor={dotColor} dotSize={dotSize} dotStyles={dotStyles} />
            <SpinnerInnerDot dotColor={dotColor} dotSize={dotSize} dotStyles={dotStyles} />
          </Spinner>
        </StyledSpinnerInner>
      );
    }
    return null;
  }
}

export { SpinnerInner, StyledSpinnerInner, SpinnerInnerDot };
