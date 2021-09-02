import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { commonActions } from '@actions';

const mapDispatchToProps = {
  verifyEmailRequest: commonActions.verifyEmailRequest,
};

type ActionProps = typeof mapDispatchToProps;

type Props = ActionProps & RCProps<{}>;

const VerifyEmailConnectable: React.FC<Props> = ({ history: { location }, verifyEmailRequest }) => {
  useEffect(() => {
    const { email_verification_token: token } = location.query;
    verifyEmailRequest({ token });
  }, [location.query, verifyEmailRequest]);

  return <></>;
};

export const VerifyEmail = connect(null, mapDispatchToProps)(VerifyEmailConnectable);
