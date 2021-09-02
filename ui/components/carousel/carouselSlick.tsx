import { Component } from 'react';
import Slider from 'react-slick';

import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables } from 'feather';

interface CarouselProps {
  settings: any;
  styles?: {
    SLIDER?: SimpleInterpolation;
    DOT_CONTAINER?: SimpleInterpolation;
  };
}

interface DotContainerProps {
  styles: SimpleInterpolation;
}

const DefaultDotConatainer = styled.div<DotContainerProps>`
  position: relative;
  bottom: 0;

  ${(props) => (props.styles ? props.styles : null)};
`;
const DefaultDotUl = styled.ul`
  li {
    margin: 0 10px;
    width: 12px;
    height: 12px;

    &.slick-active {
      i {
        background: ${cssVariables('purple-5')};
      }
    }
  }
`;
const DefaultDot = styled.i`
  display: block;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 12px;
  transition: background 0.2s ease-in-out;
  will-change: background;
`;

export class CarouselSlick extends Component<CarouselProps, any> {
  public render() {
    const { settings, styles = {}, children } = this.props;

    const defaultSettings = {
      className: 'sb-carousel-center',
      arrows: false,
      dots: true,
      speed: 300,
      appendDots: (dots) => (
        <DefaultDotConatainer styles={styles.DOT_CONTAINER}>
          <DefaultDotUl>{dots}</DefaultDotUl>
        </DefaultDotConatainer>
      ),
      customPaging: () => <DefaultDot />,
    };

    const mergedSetting = Object.assign(defaultSettings, settings);

    return <Slider {...mergedSetting}>{children}</Slider>;
  }
}
