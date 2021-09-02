import { FC, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, TabbedInterface, TabSize } from 'feather';

import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { Product } from '@constants';
import { useIsCallsEnabled, useOrganization } from '@hooks';
import { useAppId } from '@hooks/useAppId';
import { LastUpdatedAt } from '@ui/components';
import { ClientStorage } from '@utils';

import { CallsProductView } from './CallsProductView';
import { CallsStatistics } from './CallsStatistics';
import { ChatProductView } from './ChatProductView';

const ProductViewContainer = styled.div`
  position: relative;
`;

const StyledLastUpdatedAt = styled(LastUpdatedAt)`
  position: absolute;
  top: 0;
  right: 0;
  height: 40px;
`;

const StyledTabbedInterface = styled(TabbedInterface)<{ isSingle: boolean }>`
  ${({ isSingle }) =>
    isSingle &&
    css`
      a[role='tab'] {
        cursor: initial;
        color: ${cssVariables('content-2')};

        &:after {
          background-color: #fff;
        }
      }
    `}
`;

const TabPanelWrapper = styled.div`
  padding-top: 16px;

  > section ~ section {
    margin-top: 32px;
  }
`;

/* utils */
const getInitialTab = (appId: string): Product | undefined =>
  ClientStorage.getObject('overviewProductViewSelectedTab')?.[appId];
const setInitialTab = (appId: string, tab: Product) =>
  ClientStorage.upsertObject('overviewProductViewSelectedTab', { [appId]: tab });

const useProducts = () => {
  const { is_self_serve } = useOrganization();
  const { currentSubscription, isLoaded } = useCurrentChatSubscription();
  const isChatEnabled = !is_self_serve || !isLoaded || currentSubscription;
  const isCallsEnabled = useIsCallsEnabled();

  return [isChatEnabled && Product.chat, isCallsEnabled && Product.calls].filter(Boolean) as Product[];
};

const useTabs = () => {
  const tabs = useProducts();
  const appId = useAppId();
  const [selected, setSelected] = useState(() => {
    const initialTab = getInitialTab(appId);
    return tabs.find((tab) => tab === initialTab) ?? tabs[0];
  });
  const [updatedAt, setUpdatedAt] = useState(0);

  const storeUpdatedAt = useCallback((timestamp = Date.now()) => setUpdatedAt(timestamp), []);

  const resetUpdatedAt = () => setUpdatedAt(0);

  const setTab = (product: Product) => {
    setSelected(product);
    setInitialTab(appId, product);
    resetUpdatedAt();
  };

  return { tabs, selected, updatedAt, setTab, storeUpdatedAt };
};

export const ProductView: FC = () => {
  const intl = useIntl();
  const { tabs, setTab, selected: tab, updatedAt, storeUpdatedAt } = useTabs();

  return (
    <ProductViewContainer data-test-id="ProductView">
      {!!updatedAt && <StyledLastUpdatedAt timestamp={updatedAt} />}

      <StyledTabbedInterface
        isSingle={tabs.length === 1}
        tabs={tabs.map((tab) => ({
          title: intl.formatMessage({
            id: {
              [Product.chat]: 'core.overview.tabs.chat',
              [Product.calls]: 'core.overview.tabs.calls',
            }[tab],
          }),
          id: tab,
        }))}
        activeTabIndex={tabs.findIndex((item) => item === tab)}
        onActiveTabChange={({ tab: _tab }) => {
          _tab.id !== tab && setTab(_tab.id as Product);
        }}
        size={TabSize.Large}
        unmountInactiveTabPanels={true}
      >
        {(_tab) => {
          switch (_tab.id) {
            case Product.chat:
              return (
                <TabPanelWrapper>
                  <ChatProductView onLoaded={storeUpdatedAt} />
                </TabPanelWrapper>
              );
            case Product.calls:
              return (
                <TabPanelWrapper>
                  <CallsProductView onLoaded={storeUpdatedAt} />
                  <CallsStatistics />
                </TabPanelWrapper>
              );
            default:
              return null;
          }
        }}
      </StyledTabbedInterface>
    </ProductViewContainer>
  );
};
