import React from 'react';
import * as ReactDOM from 'react-dom';

import { ZIndexes } from '@ui';

export interface PortalProps extends React.HTMLProps<HTMLDivElement> {
  isOpen?: boolean;
  zIndex?: number;
}

export interface PortalState {
  hasMounted: boolean;
}

const createContainerComponent = (props) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.right = '0';
  container.style.left = '0';
  container.style.zIndex = props.zIndex || ZIndexes.portal;
  return container;
};

export class Portal extends React.Component<PortalProps, PortalState> {
  public state = { hasMounted: false };

  private targetComponent: HTMLElement = createContainerComponent(this.props);

  public render() {
    return this.state.hasMounted ? ReactDOM.createPortal(this.props.children, this.targetComponent) : null;
  }

  public componentDidMount() {
    const portalRoot = document.getElementById('portal_root');
    portalRoot!.appendChild(this.targetComponent);
    this.setState({ hasMounted: true });
  }

  public componentWillUnmount() {
    const portalRoot = document.getElementById('portal_root');
    portalRoot!.removeChild(this.targetComponent);
  }
}
