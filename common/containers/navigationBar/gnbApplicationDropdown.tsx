import { FC, MouseEventHandler, useRef, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { GNBDropdown, Button, cssVariables, DropdownProps } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { useApplicationSearch, useApplicationRegionsSelector, useAuthorization } from '@hooks';

import { AppListItem } from './appListItem';

type Props = {
  isSelectionDisabled: boolean;
  onItemSelected: (item: ApplicationSummary) => void;
  onCreateAppButtonClick: MouseEventHandler;
};

const NoResults = styled.div`
  width: 248px;
  height: 48px;
  font-size: 14px;
  line-height: 48px;
  font-weight: 500;
  color: ${cssVariables('neutral-5')};
  text-align: center;
  user-select: none;
`;

const ApplicationDropdownFooter = styled.div`
  width: 240px;
`;

export const GNBApplicationDropdown: FC<Props> = ({
  isSelectionDisabled = false,
  onItemSelected,
  onCreateAppButtonClick,
}) => {
  const currentApplication = useSelector(
    (state: RootState) => state.applicationState.data || state.applicationState.applicationSummary,
  );

  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const { fetchNextResults, isSearchResultVisible, items, searchQuery, updateSearchQuery } = useApplicationSearch();
  const intersectionObserverCallback = useRef(() => {});
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    intersectionObserverCallback.current = () => {
      fetchNextResults();
    };
  }, [fetchNextResults]);

  const lastAppListItemRefCallback = (node: HTMLDivElement | null) => {
    if (node) {
      const { current: currentIntersectionObserver } = intersectionObserverRef;
      if (currentIntersectionObserver) {
        currentIntersectionObserver.disconnect();
      }
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry && entry.isIntersecting) {
            intersectionObserverCallback.current();
          }
        },
        { root: node.parentNode!.parentElement },
      );
      intersectionObserverRef.current.observe(node);
    }
  };

  const appRegions = useApplicationRegionsSelector(items);

  return useMemo(() => {
    const onChange: DropdownProps<ApplicationSummary>['onChange'] = (item) => {
      if (item == null) {
        return;
      }
      onItemSelected(item);
    };

    return (
      <GNBDropdown<ApplicationSummary>
        selectedItem={isEmpty(currentApplication) ? null : (currentApplication as ApplicationSummary)}
        onChange={onChange}
        useSearch={true}
        searchPlaceholder={intl.formatMessage({ id: 'ph.searchApplications' })}
        onSearchChange={updateSearchQuery}
        isItemDisabled={() => isSelectionDisabled}
        items={items}
        itemToString={(item) => item.app_id}
        itemToElement={(item) => {
          return (
            <AppListItem
              ref={items[items.length - 1] === item ? lastAppListItemRefCallback : undefined}
              name={item.app_name}
              region={appRegions[item.app_id]}
              highlightedText={searchQuery}
            />
          );
        }}
        emptyView={
          <NoResults>
            {isSearchResultVisible
              ? intl.formatMessage({ id: 'navigationBar.applicationSelect_lbl.noResults' })
              : intl.formatMessage({ id: 'navigationBar.applicationSelect_lbl.noApplications' })}
          </NoResults>
        }
        toggleRenderer={({ selectedItem }) => {
          return selectedItem ? selectedItem.app_name : intl.formatMessage({ id: 'label.selectApplication' });
        }}
        footer={
          isPermitted(['organization.applications.all']) ? (
            <ApplicationDropdownFooter>
              <Button
                variant="ghost"
                buttonType="primary"
                icon="plus-circle"
                size="small"
                onClick={onCreateAppButtonClick}
              >
                {intl.formatMessage({ id: 'common.createApplication' })}
              </Button>
            </ApplicationDropdownFooter>
          ) : undefined
        }
      />
    );
  }, [
    appRegions,
    currentApplication,
    intl,
    isPermitted,
    isSearchResultVisible,
    isSelectionDisabled,
    items,
    onCreateAppButtonClick,
    onItemSelected,
    searchQuery,
    updateSearchQuery,
  ]);
};
