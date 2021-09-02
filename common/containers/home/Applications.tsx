import React, { useEffect, useState, useCallback, useRef, useMemo, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { cssVariables, Button, Table, OverflowMenu, TableProps, TableColumnProps, Avatar, AvatarType } from 'feather';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';
import moment from 'moment-timezone';

import { commonActions, coreActions, deskActions } from '@actions';
import { APPLICATION_LIST_LIMIT, TIME_DATE_FORMAT } from '@constants';
import {
  useAuthorization,
  useApplicationSearch,
  useApplicationRegionsSelector,
  usePrevious,
  useCanEnterApplication,
} from '@hooks';
import { useShowConvertFreeNotification } from '@hooks/useShowConvertFreeNotification';
import { SpinnerFull, NewSearchInput, Tooltip, makeGrid, SpinnerInner } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { ConvertFreePlanNotification } from '@ui/components/ConvertFreePlanNotification';

import { DialogType } from '../dialogs/DialogType';

const { ResponsiveContainer, wideGridMediaQuery } = makeGrid({
  wideWidth: 1008,
  narrowMaxWidth: 820,
});

const Header = styled.div`
  margin-bottom: 24px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled.h4`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
`;

const TitleActions = styled.div`
  display: flex;
  flex-direction: row;
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-7')};
  strong {
    font-weight: 500;
  }
`;

const Wrapper = styled(ResponsiveContainer)`
  display: block;
  padding-top: 32px !important;
  padding-bottom: 32px !important;

  ${wideGridMediaQuery`
    padding-left: 16px !important;
    padding-right: 16px !important;
  `}
`;

const AppItemIcon = styled(Avatar)`
  margin-right: 14px;
`;

const AppInfo = styled.div`
  display: flex;
  flex-direction: column;

  & > p:first-child {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.43;
    color: ${cssVariables('neutral-10')};
  }

  & > p:last-child {
    font-size: 12px;
    line-height: 1.33;
    color: ${cssVariables('neutral-7')};
  }
`;

const AppSearchInput = styled(NewSearchInput)`
  width: 240px;
`;

const CreateAppButton = styled(Button)``;

const RowOverflowMenu = styled(OverflowMenu)`
  margin-right: 8px;
`;

const ApplicationTable = (props: TableProps<ApplicationSummary>) => Table<ApplicationSummary>(props);

const StyledApplicationTable = styled(ApplicationTable)`
  background-color: transparent;
  border: 0;

  thead {
    position: sticky;
    background-color: white;
  }
`;

const FooterWrapper = styled.div`
  position: relative;
  height: 32px;
  margin-top: 8px;
  text-align: center;
`;

const mapStateToProps = (state: RootState) => ({
  auth: state.auth,
  authenticated: state.auth.authenticated,
  currentOrganization: state.organizations.current as Organization,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  changeApplicationRequest: coreActions.changeApplicationRequest,
  resetApplicationRequest: coreActions.resetApplicationRequest,
  resetDesk: deskActions.resetDesk,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

export const getScrollingElement = () => document.querySelector('.ps');

const useFooterLoadMore = (fetchNextResults: () => void) => {
  const footerRef = useRef<HTMLDivElement>(null);

  const intersectionObserverCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    intersectionObserverCallback.current = fetchNextResults;
  }, [fetchNextResults]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        intersectionObserverCallback.current?.();
      }
    });

    if (footerRef.current) {
      intersectionObserver.observe(footerRef.current);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  return { footerRef };
};

const useCreateFirstAppTooltip = () => {
  const [isClosed, setIsClosed] = useState(false); // is closed by user?
  const closeCreateAppTooltip = useCallback(() => setIsClosed(true), []);

  return [isClosed, closeCreateAppTooltip] as const;
};

export const ApplicationsConnectable: React.FC<Props> = ({
  authenticated,
  currentOrganization,
  showDialogsRequest,
  changeApplicationRequest,
  resetApplicationRequest,
  resetDesk,
}) => {
  const intl = useIntl();
  const { isPermitted, isSelfService } = useAuthorization();
  const [isCreateFirstAppTooltipClosed, closeCreateFirstAppTooltip] = useCreateFirstAppTooltip();

  const [order, setOrder] = useState<FetchAppliationsOrderParam>('app_name');

  const {
    clearSearchQuery,
    fetchNextResults,
    hasMore,
    isFetching,
    isSearchResultVisible,
    items,
    rawSearchQuery,
    searchQuery,
    updateSearchQuery,
  } = useApplicationSearch(APPLICATION_LIST_LIMIT, order);

  const { footerRef } = useFooterLoadMore(fetchNextResults);

  const canEnterApplication = useCanEnterApplication();
  const showConvertFreePlanNotification = useShowConvertFreeNotification();

  const previousItemLength = usePrevious(items.length);
  useEffect(() => {
    if (previousItemLength && items.length < previousItemLength) {
      const scrollingElement = getScrollingElement();
      scrollingElement?.scrollTo(0, 0);
    }
  }, [items.length, previousItemLength]);

  useEffect(() => {
    if (isEmpty(currentOrganization)) {
      showDialogsRequest({ dialogTypes: DialogType.Onboarding, dialogProps: { overlayZIndex: 10000 } });
      return;
    }
  }, [currentOrganization, showDialogsRequest]);

  useEffect(() => {
    resetApplicationRequest();
    resetDesk();
    if (window.dashboardSB) {
      window.dashboardSB.disconnect(() => {});
    }
  }, [resetApplicationRequest, resetDesk]);

  const handleCreateApp = useCallback(
    (e) => {
      e.stopPropagation();
      if (isEmpty(currentOrganization)) {
        return;
      }
      showDialogsRequest({
        dialogTypes: DialogType.CreateApp,
        dialogProps: {
          organization: currentOrganization as Organization,
        },
      });
    },
    [currentOrganization, showDialogsRequest],
  );

  const handleSearchChange = useCallback(
    (query) => {
      updateSearchQuery(query);
    },
    [updateSearchQuery],
  );

  const handleSearchClear = useCallback(() => {
    clearSearchQuery();
  }, [clearSearchQuery]);

  const onSortByUpdated = useCallback((column, order) => {
    if (!column) {
      setOrder('app_name');
      return;
    }
    setOrder(`${order === 'descend' ? '-' : ''}${column.dataIndex}` as FetchAppliationsOrderParam);
  }, []);

  const appRegions = useApplicationRegionsSelector(items);

  const applicationTable = useMemo(() => {
    const onInteractiveCellClick = (record) => {
      const handleAppItemClick = (application) => (e) => {
        e.stopPropagation();

        if (canEnterApplication) {
          changeApplicationRequest(application);
        }
      };
      return {
        onClick: handleAppItemClick(record),
      };
    };

    const appItemActions = (application: ApplicationSummary) => {
      const actions = [
        {
          label: 'Change app name',
          onClick: () => {
            showDialogsRequest({
              dialogTypes: DialogType.ChangeAppName,
              dialogProps: {
                application,
              },
            });
          },
        },
      ];
      if (isPermitted(['organization.applications.all'])) {
        actions.push({
          label: 'Delete',
          onClick: () => {
            showDialogsRequest({
              dialogTypes: DialogType.DeleteApplication,
              dialogProps: { application },
            });
          },
        });
      }
      return actions;
    };

    const noResultViewContent = isSearchResultVisible
      ? {
          title: intl.formatMessage({ id: 'label.applicationSearchResultEmpty' }),
          description: intl.formatMessage({ id: 'desc.applicationSearchResultEmpty' }),
        }
      : {
          title: intl.formatMessage({ id: 'label.applicationListEmpty' }),
          description: intl.formatMessage({ id: 'desc.applicationListEmpty' }),
        };

    const onLoadMoreButtonClick = () => {
      fetchNextResults();
    };

    const columns: TableColumnProps<ApplicationSummary>[] = [
      {
        dataIndex: 'app_name',
        title: intl.formatMessage({ id: 'label.name' }),
        flex: 3,
        render: ({ app_id, app_name }) => (
          <>
            <AppItemIcon type={AvatarType.Application} profileID={app_id} size={32} />
            <AppInfo>
              <p>{app_name}</p>
              <p>{app_id}</p>
            </AppInfo>
          </>
        ),
        sorter: true,
        defaultSortOrder: 'ascend',
        onCell: onInteractiveCellClick,
      },
      ...(isSelfService
        ? []
        : [
            {
              dataIndex: 'plan',
              title: intl.formatMessage({ id: 'common.home.applications.column.plan' }),
              flex: 1,
              render: ({ plan }) => (plan.toLowerCase() === 'enterprise' ? 'Custom' : startCase(plan)),
              sorter: true,
              onCell: onInteractiveCellClick,
            },
          ]),
      {
        dataIndex: 'region',
        title: intl.formatMessage({ id: 'common.home.applications.column.region' }),
        flex: 1,
        render: (record) => appRegions[record.app_id],
        sorter: true,
        onCell: onInteractiveCellClick,
      },
      {
        dataIndex: 'created_at',
        title: intl.formatMessage({ id: 'common.home.applications.column.createdAt' }),
        flex: 1.4,
        render: (record) => moment(record.created_at).format(TIME_DATE_FORMAT),
        sorter: true,
        onCell: onInteractiveCellClick,
      },
    ];

    return (
      <>
        <StyledApplicationTable
          columns={columns}
          rowActions={
            isPermitted(['organization.applications.all'])
              ? (record) => [
                  <RowOverflowMenu
                    key="actions"
                    items={appItemActions(record)}
                    iconButtonProps={
                      { 'data-test-id': 'ApplicationRowActionMenuButton' } as HTMLAttributes<HTMLButtonElement>
                    }
                  />,
                ]
              : undefined
          }
          dataSource={items}
          rowKey="app_id"
          rowStyles={canEnterApplication ? () => 'cursor: pointer;' : undefined}
          density="large"
          emptyView={!isFetching && <CenteredEmptyState icon="applications" {...noResultViewContent} />}
          onSortByUpdated={onSortByUpdated}
        />
        <FooterWrapper ref={footerRef}>
          {hasMore && !isFetching && (
            <Button buttonType="tertiary" size="small" onClick={onLoadMoreButtonClick}>
              More
            </Button>
          )}
          {isFetching && <SpinnerInner isFetching={true} />}
        </FooterWrapper>
      </>
    );
  }, [
    isSearchResultVisible,
    intl,
    isSelfService,
    isPermitted,
    items,
    isFetching,
    onSortByUpdated,
    footerRef,
    hasMore,
    canEnterApplication,
    changeApplicationRequest,
    showDialogsRequest,
    fetchNextResults,
    appRegions,
  ]);

  if (!authenticated) {
    return <SpinnerFull />;
  }

  return (
    <Wrapper data-test-id="Applications">
      <Header>
        <TitleWrapper>
          <Title>{intl.formatMessage({ id: 'common.home.applications.title' })}</Title>
          <TitleActions>
            <AppSearchInput
              handleChange={handleSearchChange}
              handleSearchClear={handleSearchClear}
              value={rawSearchQuery}
              ph={intl.formatMessage({ id: 'ph.searchApplications' })}
              isFetching={!!searchQuery && isFetching}
            />
            {isPermitted(['organization.applications.all']) && (
              <Tooltip
                key="organization_no_app_tooltip"
                target={
                  <CreateAppButton
                    size="small"
                    buttonType="primary"
                    onClick={handleCreateApp}
                    icon="plus"
                    css="margin-left: 8px;"
                  >
                    {intl.formatMessage({ id: 'common.createApp' })}
                  </CreateAppButton>
                }
                items={[{ description: 'Create your first application.' }]}
                placement="left-start"
                offset="4, 0"
                isOpen={!isFetching && !searchQuery && items.length === 0 && !isCreateFirstAppTooltipClosed}
                onClickPrimaryButton={closeCreateFirstAppTooltip}
                interactionHover={false}
                enablePrimaryButton={true}
              />
            )}
          </TitleActions>
        </TitleWrapper>
        <Description>
          {intl.formatMessage(
            { id: 'common.applications.maxApplicationCount.withCurrent' },
            {
              max: <strong>{currentOrganization.max_application_count}</strong>,
              current: <strong>{currentOrganization.total_applications}</strong>,
              currentCount: currentOrganization.total_applications,
            },
          )}
        </Description>
      </Header>
      {showConvertFreePlanNotification && <ConvertFreePlanNotification style={{ margin: '24px 0 16px' }} />}
      {applicationTable}
    </Wrapper>
  );
};

export const Applications = connect(mapStateToProps, mapDispatchToProps)(ApplicationsConnectable);
