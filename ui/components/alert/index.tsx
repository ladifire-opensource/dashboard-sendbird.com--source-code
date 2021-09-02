import { Component } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, cssVariables } from 'feather';

import { StyledProps } from '@ui';

const alertTheme = {
  success: {
    background: '#48c076',
    color: 'white',
    borderColor: 'transparent',
  },
  info: {
    background: '#e1feff',
    color: '#0081fe',
    borderColor: 'transparent',
  },
  warning: {
    background: '#fff4e6',
    color: '#e8590c',
    borderColor: '#ffd8a8',
  },
  error: {
    background: cssVariables('red-2'),
    color: cssVariables('red-5'),
  },
};

const StyledAlert = styled.div<StyledProps>`
  padding: 24px 65px 24px 25px;
  line-height: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  border: 1px solid ${(props) => props.theme.borderColor || 'transparent'};
  border-radius: 5px;
  color: ${(props) => props.theme.color || 'white'};
  background: ${(props) => props.theme.background || 'white'};
  text-align: left;
  position: relative;
  a {
    color: #aaeaf4;
    text-decoration: underline;
    margin: 0 8px;
    &:hover,
    &:focus {
      color: #aaeaf4;
    }
  }

  ${(props) => (props.status === 'warning' ? 'padding: 13px 24px;' : '')}
  ${(props) => (props.status === 'warning' ? 'margin-bottom: 0;' : '')}
  ${(props) => (props.status === 'warning' ? 'font-size: 15px;' : '')}
  ${(props) => props.styles}
`;

const AlertIcon = styled.div<StyledProps>`
  ${(props) =>
    props.isMultiline
      ? css`
          position: absolute;
        `
      : ''};
`;

const Message = styled.span<StyledProps>`
  ${(props) => (props.status === 'warning' ? 'margin-left: 12px;' : '')};

  ${(props) =>
    props.isMultiline
      ? css`
          line-height: 1.35;
        `
      : ''};

  ${(props) =>
    props.status === 'warning'
      ? css`
          margin-left: 12px;
          padding-left: 32px;
          line-height: 1.2;
        `
      : ''};
`;

export type AlertStatus = 'success' | 'info' | 'warning' | 'error';

type Props = {
  removeAllAlert?: () => {};
  status: AlertStatus;
  message?: string;
  multiline?: boolean;
  styles?: ReadonlyArray<SimpleInterpolation>;
};

type State = {
  isVisible: true;
};

export class Alert extends Component<Props, State> {
  public render() {
    const { status, message, multiline, styles } = this.props;

    return (
      <StyledAlert theme={status && alertTheme[status]} status={status} styles={styles} data-test-id="Alert">
        {status === 'warning' ? (
          <AlertIcon isMultiline={multiline}>
            <Icon icon="warning-filled" size={16} color={cssVariables('neutral-10')} />
          </AlertIcon>
        ) : (
          ''
        )}
        <Message status={status} isMultiline={multiline}>
          {message}
        </Message>
      </StyledAlert>
    );
  }
}
