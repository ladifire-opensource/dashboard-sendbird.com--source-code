import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';

export const useGoogleOneTap = () => {
  const dispatch = useDispatch();
  const handleCredentialResponse = (response) => {
    if (response) {
      dispatch(commonActions.oauthGoogleRequest({ id_token: response.credential }));
    }
  };
  const loadOneTap = () => {
    window.google.accounts.id.initialize({
      client_id: '45411407729-jjelgac8298ug989b94ltmqp4bhr5jpo.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false,
    });
    window.google.accounts.id.prompt();
  };

  useEffect(() => {
    if (window.google) {
      loadOneTap();
    }
    return () => {
      if (window.google) {
        // https://developers.google.com/identity/one-tap/web/reference/js-reference#google.accounts.id.prompt
        window.google.accounts.id.cancel();
      }
    };
  }, []);
};
