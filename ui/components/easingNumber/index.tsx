import { Component } from 'react';

import * as eases from 'eases';

const getValue = (value) => (Number.isNaN(value) ? 0 : value);

interface EasingNumberProps {
  value: number;
  speed: number;
  ease?: string;
  useLocaleString?: boolean;
}

export class EasingNumber extends Component<EasingNumberProps> {
  public static defaultProps = {
    speed: 500,
    ease: 'quintInOut',
    useLocaleString: false,
  };
  private timeout;
  private delayTimeout;
  private startAnimationTime;

  public state = {
    previousValue: getValue(this.props.value),
    displayValue: getValue(this.props.value),
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { value } = this.props;

    if (parseInt(nextProps.value, 10) === value) return;

    this.setState({
      previousValue: this.state.displayValue,
    });

    this.startAnimationTime = new Date().getTime();
    this.updateNumber();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.displayValue !== this.state.displayValue;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    clearTimeout(this.delayTimeout);
  }

  private updateNumber = () => {
    const { value } = this.props;

    const now = new Date().getTime();
    const elapsedTime = Math.min(this.props.speed, now - this.startAnimationTime);
    const progress = eases[this.props.ease](elapsedTime / this.props.speed);

    const currentDisplayValue = Number(
      this.state.previousValue + Math.round((value - this.state.previousValue) * progress),
    );

    this.setState({
      displayValue: currentDisplayValue,
    });

    if (elapsedTime < this.props.speed) {
      this.timeout = setTimeout(this.updateNumber, 16);
    } else {
      this.setState({
        previousValue: value,
      });
    }
  };

  public render() {
    const { useLocaleString, ...other } = this.props;
    const { displayValue } = this.state;

    const classes = 'react-number-easing';

    return (
      <span {...other} className={classes}>
        {useLocaleString ? displayValue.toLocaleString() : displayValue}
      </span>
    );
  }
}
