import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ScrollBar } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { useCurrentChatSubscription } from '../CurrentChatSubscriptionProvider';
import { NoPlanError } from '../NoPlanError';
import { Applications } from './Applications';
import { HomeContextProvider } from './HomeContext';
import { OrganizationInformation } from './OrganizationInformation';
import { OrganizationUsage } from './OrganizationUsage';

const Home: FC = () => {
  const organization = useSelector((state: RootState) => state.organizations.current);
  const { isFreeTrialMissing } = useCurrentChatSubscription();
  return (
    <ScrollBar>
      {!isEmpty(organization) && organization.is_self_serve && (
        <HomeContextProvider>
          <OrganizationInformation organization={organization} />
          {isFreeTrialMissing ? null : <OrganizationUsage organization={organization} />}
        </HomeContextProvider>
      )}
      {isFreeTrialMissing ? (
        <NoPlanError
          css={`
            margin: 128px auto;
          `}
        />
      ) : (
        <Applications />
      )}
    </ScrollBar>
  );
};

export default Home;
