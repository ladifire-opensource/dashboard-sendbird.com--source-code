import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { commonActions } from '@actions';

const mapDispatchToProps = {
  signoutRequest: commonActions.signoutRequest,
};

type Props = typeof mapDispatchToProps;

class SignOutConnectable extends PureComponent<Props> {
  componentDidMount() {
    this.props.signoutRequest();
  }

  public render() {
    return <div />;
  }
}

export const SignOut = connect(null, mapDispatchToProps)(SignOutConnectable);
