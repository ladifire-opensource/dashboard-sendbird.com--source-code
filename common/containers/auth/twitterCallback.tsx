import React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';

import { SpinnerFull } from '@ui/components';
import { ClientStorage } from '@utils';

type Props = RouteComponentProps;

export const TwitterCallback: React.FC<Props> = ({ location }) => {
  const twitterCallbackRedirectPathname = ClientStorage.get('twitterCallbackRedirectPathname');

  return (
    <>
      <SpinnerFull transparent={true} />
      <Redirect
        to={
          twitterCallbackRedirectPathname
            ? { pathname: twitterCallbackRedirectPathname, search: location.search }
            : { pathname: '/' }
        }
      />
    </>
  );
};
