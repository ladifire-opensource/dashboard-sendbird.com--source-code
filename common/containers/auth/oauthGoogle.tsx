import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import qs from 'qs';

import { commonActions } from '@actions';
import { logException } from '@utils/logException';

export const OAuthGoogle: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const parsed_params = qs.parse(location.hash.slice(1));
      const { id_token, state } = parsed_params;
      if (id_token !== '') {
        dispatch(commonActions.oauthGoogleRequest({ id_token, state }));
      }
    } catch (error) {
      logException(error);
      history.push('/auth/signin');
    }
  }, [dispatch, history]);

  return (
    <div className="loader-full">
      <div className="loader" />
    </div>
  );
};
