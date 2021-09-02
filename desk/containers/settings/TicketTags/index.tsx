import { FC, useEffect, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';

import { Button, EmptyState, EmptyStateSize } from 'feather';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { TabMenu } from '@ui/components';

import { SearchForm } from './SearchForm';
import { TicketTagTable } from './TicketTagTable';
import { useFetchTags } from './useFetchTags';
import { useQueryParams, QueryParamsContext } from './useQueryParams';
import { useTabStateChangeEffect } from './useTabStateChangeEffect';
import { useTicketTagsReducer, TicketTagsReducerContextProvider } from './useTicketTagsReducer';

export const TicketTags: FC = () => {
  const intl = useIntl();
  const useQueryParamsResult = useQueryParams();
  const [queryParams, updateParams] = useQueryParamsResult;

  const useReducerResult = useTicketTagsReducer({
    query: queryParams.q,
    selectedTab: queryParams.status,
    tabs: (['ACTIVE', 'ARCHIVE'] as const).map((key) =>
      Object.assign(
        {
          key,
          data: { results: [], count: 0 },
          status: 'idle' as const,
          error: null,
        },
        queryParams.status === key
          ? { page: queryParams.page, pageSize: queryParams.pageSize, order: queryParams.order }
          : ({ page: 1, pageSize: 10, order: '-created_at' } as const),
      ),
    ),
    isAddMode: false,
    createTagRequest: { status: 'idle', newTag: null, error: null },
  });
  const [state, dispatch] = useReducerResult;

  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    const { query } = latestStateRef.current;

    dispatch({
      type: 'UPDATE_STATE_BY_QUERY_PARAMS',
      payload: { queryParams, resetTheOtherTabToFirstPage: queryParams.q !== query },
    });
  }, [dispatch, queryParams]);

  const {
    isAddMode,
    query,
    selectedTab,
    tabs,
    createTagRequest: { newTag, status: createTagRequestStatus },
  } = state;
  const [activeTabState, archivedTabState] = tabs;

  useTabStateChangeEffect(activeTabState, query, dispatch);
  useTabStateChangeEffect(archivedTabState, query, dispatch);

  const fetchTags = useFetchTags(dispatch);

  useEffect(() => {
    if (newTag == null) {
      return;
    }

    const { selectedTab, tabs, query } = latestStateRef.current;
    const activeTab = tabs.find((tab) => tab.key === 'ACTIVE');

    if (selectedTab === 'ACTIVE' && activeTab?.order === '-created_at' && activeTab?.page === 1 && !query) {
      fetchTags({ ...activeTab, status: 'ACTIVE', query });
    } else {
      // Update the params so the new tag will be visible on reload.
      updateParams({ status: 'ACTIVE', order: '-created_at', page: 1, q: '' });
    }

    // Exit from Add mode
    dispatch({ type: 'SET_ADD_MODE', payload: { isAddMode: false } });
  }, [newTag, fetchTags, latestStateRef, updateParams, dispatch]);

  const onAddModeExit = () => {
    // clear server error when exiting from Add mode
    dispatch({ type: 'CREATE_TAG_CLEAR_ERROR' });
    dispatch({ type: 'SET_ADD_MODE', payload: { isAddMode: false } });
  };

  const commonTableProps = { query, updateParams, isAddMode, onAddModeExit };

  const activeTabTable = (
    <TicketTagTable
      {...{
        ...activeTabState,
        data: {
          ...activeTabState.data,
          results:
            // While reloading the list after creating a new tag, insert the pending item at the top of the list.
            newTag && createTagRequestStatus === 'reloading'
              ? [newTag, ...activeTabState.data.results]
              : activeTabState.data.results,
        },
      }}
      {...commonTableProps}
      emptyView={
        <EmptyState
          size={EmptyStateSize.Large}
          icon="no-data"
          title={intl.formatMessage({ id: 'desk.settings.tags.emptyView.active.title' })}
          description={intl.formatMessage({ id: 'desk.settings.tags.emptyView.active.description' })}
          withoutMarginBottom={true}
        />
      }
    />
  );
  const archivedTabTable = (
    <TicketTagTable
      {...archivedTabState}
      {...commonTableProps}
      emptyView={
        <EmptyState
          size={EmptyStateSize.Large}
          icon="no-data"
          title={intl.formatMessage({ id: 'desk.settings.tags.emptyView.archived.title' })}
          description={intl.formatMessage({ id: 'desk.settings.tags.emptyView.archived.description' })}
          withoutMarginBottom={true}
        />
      }
    />
  );

  const handleAddButtonClick = useCallback(() => {
    const FIRST_PAGE = 1;
    const { pageSize, order } = tabs[0];
    updateParams({ status: 'ACTIVE', page: FIRST_PAGE, pageSize, order });
    dispatch({ type: 'SET_ADD_MODE', payload: { isAddMode: true } });
  }, [dispatch, tabs, updateParams]);

  const handleTabClick = useCallback(
    (index: number, status: TicketTag['status']) => {
      const { page, pageSize, order } = tabs[index];
      updateParams({ status, page, pageSize, order });
      dispatch({ type: 'SET_ADD_MODE', payload: { isAddMode: false } });
    },
    [dispatch, tabs, updateParams],
  );

  return (
    <QueryParamsContext.Provider value={useQueryParamsResult}>
      <TicketTagsReducerContextProvider value={useReducerResult}>
        <AppSettingsContainer
          isTableView={true}
          css={`
            ${AppSettingPageHeader} + * {
              margin-top: 4px;
            }

            > *:last-child {
              margin-top: 24px;
            }
          `}
        >
          <AppSettingPageHeader>
            <AppSettingPageHeader.Title>
              {intl.formatMessage({ id: 'desk.settings.tags.title' })}
            </AppSettingPageHeader.Title>
            <AppSettingPageHeader.Actions>
              <SearchForm
                defaultInputValue={query}
                onSubmit={(value) => {
                  if ((query || '') !== value.trim()) {
                    updateParams({ q: value.trim(), page: 1 });
                  }
                }}
                onReset={() => updateParams({ q: '', page: 1 })}
              />
              <Button
                buttonType="primary"
                icon="plus"
                size="small"
                disabled={isAddMode}
                onClick={handleAddButtonClick}
                css={`
                  flex: none;
                  margin-left: 8px;
                `}
              >
                {intl.formatMessage({ id: 'desk.settings.tags.btn.createTag' })}
              </Button>
            </AppSettingPageHeader.Actions>
          </AppSettingPageHeader>
          <TabMenu
            tabs={[
              {
                label: intl.formatMessage(
                  { id: 'desk.settings.tags.tabs.active' },
                  { count: activeTabState.data.count },
                ),
                value: 'ACTIVE',
              },
              {
                label: intl.formatMessage(
                  { id: 'desk.settings.tags.tabs.archived' },
                  { count: archivedTabState.data.count },
                ),
                value: 'ARCHIVE',
              },
            ]}
            activeTab={Math.max(
              0,
              tabs.findIndex((tab) => tab.key === selectedTab),
            )}
            handleTabClick={handleTabClick}
            hasBorder={false}
            styles={{ tabMenus: 'padding-top: 0;' }}
          />
          {selectedTab === 'ACTIVE' && activeTabTable}
          {selectedTab === 'ARCHIVE' && archivedTabTable}
        </AppSettingsContainer>
      </TicketTagsReducerContextProvider>
    </QueryParamsContext.Provider>
  );
};
