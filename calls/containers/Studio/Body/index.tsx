import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useParams, useRouteMatch } from 'react-router';

import styled from 'styled-components';

import { TabbedInterface } from 'feather';

import { NoCallsWidget } from '@calls/components/NoCallsWidget';
import { useTypedSelector } from '@hooks';

import { useOnboardingContext } from '../Onboarding/OnboardingContext';
import DirectCallsContent from './DirectCallsContent';
import GroupCallsContent from './GroupCallsContent';
import { ContentLayout } from './components';

type Tab = 'direct' | 'group';

const Layout = styled.section`
  max-width: 848px;
  padding: 24px 32px;

  ${ContentLayout} {
    margin-top: 16px;
  }
`;

const useTabFromUrl = () => {
  const params = useParams<{ tab: Tab }>();
  return params.tab as Tab | undefined;
};

const useTabToUrl = () => {
  const history = useHistory();
  const matchURL = useRouteMatch()?.url;
  const tabFromUrl = useTabFromUrl();

  return useCallback((tab: Tab) => history.replace(tabFromUrl ? `./${tab}` : `${matchURL}/${tab}`), [
    history,
    matchURL,
    tabFromUrl,
  ]);
};

const useIsDialogOpened = () => useTypedSelector((state) => !!state.dialogs.dialogTypes);

const useCoachmark = () => {
  const { isUpdated } = useOnboardingContext();
  const isDialogOpened = useIsDialogOpened();
  const [isFirstVisit, setIsFirstVisit] = useState(isUpdated);
  const showCoachmark = isFirstVisit && !isDialogOpened;
  const closeCoachmark = () => setIsFirstVisit(false);

  return [showCoachmark, closeCoachmark] as const;
};

const Body = () => {
  const intl = useIntl();
  const tabFromUrl = useTabFromUrl();
  const syncTabToUrl = useTabToUrl();
  const [selectedTab, setSelectedTab] = useState<Tab>(tabFromUrl ?? 'direct');
  const tabs: { title: string; id: Tab }[] = [
    { title: intl.formatMessage({ id: 'calls.studio.new.body.tabs.direct' }), id: 'direct' },
    { title: intl.formatMessage({ id: 'calls.studio.new.body.tabs.group' }), id: 'group' },
  ];
  const activeTabIndex = tabs.findIndex((tab) => tab.id === selectedTab);
  const [showCoachmark, closeCoachmark] = useCoachmark();

  useEffect(() => {
    if (selectedTab !== tabFromUrl) {
      syncTabToUrl(selectedTab);
    }
  }, [selectedTab, syncTabToUrl, tabFromUrl]);

  return (
    <Layout>
      <TabbedInterface
        tabs={tabs}
        activeTabIndex={activeTabIndex}
        onActiveTabChange={({ tab }) => {
          setSelectedTab(tab.id as Tab);
        }}
      >
        {(tab) => {
          if (tab.id === 'direct') {
            return <DirectCallsContent showCoachmark={showCoachmark} onCloseCoachmark={closeCoachmark} />;
          }
          if (tab.id === 'group') {
            return <GroupCallsContent showCoachmark={showCoachmark} onCloseCoachmark={closeCoachmark} />;
          }
        }}
      </TabbedInterface>
      {selectedTab === 'group' && <NoCallsWidget />}
    </Layout>
  );
};

export default Body;
