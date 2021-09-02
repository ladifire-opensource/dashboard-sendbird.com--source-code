import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deskActions } from '@actions';
import { IntegrationContext, TwitterReducer } from '@desk/contexts/integrationContext';
import { usePrevious } from '@hooks';

export type SocialComponentProps = {
  socialReducer: {
    twitter: TwitterReducer;
  };
};

type Props = {};

export const withSocial = (WrappedComponent): React.FC<Props> => (props) => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector((state: RootState) => state.customers.current);
  const { twitterReducer } = useContext(IntegrationContext);

  const previousCurrentId = usePrevious(currentCustomer.id);

  useEffect(() => {
    if (currentCustomer.sendbirdId && previousCurrentId !== currentCustomer.id) {
      switch (currentCustomer.channelType) {
        case 'TWITTER_USER': {
          const { twitterUsers } = twitterReducer.state;
          if (twitterUsers.length > 0) {
            const agentTwitterUser = twitterUsers[0];
            const twitterUserIdDivider = '//';
            const customerTwitterUserId = currentCustomer.sendbirdId.split(twitterUserIdDivider)[1];

            dispatch(
              deskActions.fetchTwitterUserDetailRequest({
                agentTwitterUserId: agentTwitterUser.id,
                customerTwitterUserId,
              }),
            );
          }
        }
        // case 'FACEBOOK_PAGE': {
        // }
        // case 'SENDBIRD': {
        // }
        default: {
        }
      }
    }
  }, [currentCustomer, twitterReducer.state, previousCurrentId, dispatch]);

  return <WrappedComponent socialReducer={{ twitter: twitterReducer }} {...props} />;
};
