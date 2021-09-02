import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { sanitize } from 'dompurify';
import { from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { commonActions } from '@actions';
import { getEmailChange } from '@common/api';
import { generateBadRequest } from '@epics';
import { FormInput } from '@ui/components';

import { AuthTopBar } from './AuthTopBar';
import { AuthWrapper, AuthBox, AuthBoxCenter, AuthBoxHeader, AuthBoxTitle, AuthButton } from './components';

const mapDispatchToProps = {
  confirmEmailChangeRequest: commonActions.confirmEmailChangeRequest,
  pushHistory: commonActions.pushHistory,
  generateBadRequest,
};

interface HandlePasswordChange {
  (event: React.ChangeEvent<HTMLInputElement>): void;
}

interface HandleSubmit {
  (event: React.FormEvent<HTMLFormElement>): void;
}

type ActionProps = typeof mapDispatchToProps;

type Props = ActionProps & RCProps<ActionProps>;

const Form = styled.form`
  padding-top: 40px;
`;

export const ConfirmEmailChangeConnectable: React.FC<Props> = ({
  history: { location },
  confirmEmailChangeRequest,
  generateBadRequest,
  pushHistory,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  let token = '';
  if ('email_change_token' in location.query) {
    token = sanitize(location.query.email_change_token);
  }

  useEffect(() => {
    if (!token) {
      pushHistory('/');
      return;
    }
    setIsFetching(true);
    const request = getEmailChange({
      token,
    });
    const subscription = from(request)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          generateBadRequest(error);
          pushHistory('/');
          return from([]);
        }),
      )
      .subscribe({
        next: (data) => {
          setNewEmail(data.new_email);
          setIsFetching(false);
        },
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePasswordChange = useCallback<HandlePasswordChange>((event) => {
    setPassword(event.target.value);
  }, []);

  const handleSubmit = useCallback<HandleSubmit>(
    (event) => {
      event.preventDefault();
      confirmEmailChangeRequest({
        token,
        password,
      });
    },
    [password],
  );

  if (!isFetching) {
    return (
      <AuthWrapper>
        <AuthBox>
          <AuthTopBar />
          <AuthBoxCenter>
            <AuthBoxHeader>
              <AuthBoxTitle>Confirm email change</AuthBoxTitle>
            </AuthBoxHeader>
            <Form onSubmit={handleSubmit}>
              <FormInput type="text" name="email" label="New email address" value={newEmail} disabled={true} />
              <FormInput
                type="password"
                name="password"
                label="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <AuthButton buttonType="primary" type="submit" size="large">
                Confirm
              </AuthButton>
            </Form>
          </AuthBoxCenter>
        </AuthBox>
      </AuthWrapper>
    );
  }

  return <></>;
};

export const ConfirmEmailChange = connect(null, mapDispatchToProps)(ConfirmEmailChangeConnectable);
