import { useCallback, useEffect, useContext, useState, ComponentProps, FC } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import styled from 'styled-components';

import { Table, cssVariables, TableProps, OverflowMenu } from 'feather';
import moment from 'moment-timezone';

import { coreActions } from '@actions';
import { useAuthentication } from '@authentication';
import { DEFAULT_DATE_FORMAT } from '@constants';
import {
  useAuthorization,
  usePagination,
  useApplicationSearch,
  useApplicationRegionsSelector,
  useCanEnterApplication,
  useShowDialog,
} from '@hooks';
import { Paginator } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { DialogType } from '../dialogs/DialogType';
import { SettingsHeader, SettingsLayoutContext } from '../layout/settingsLayout';
import { SearchInputWrapper, SearchInput } from './components';

const AppName = styled.span`
  color: ${cssVariables('purple-7')};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ApplicationTable = styled((props: TableProps<ApplicationSummary>) => Table<ApplicationSummary>(props))`
  flex: 1;
  min-height: 96px;
`;

const ApplicationsPagination = styled(Paginator)`
  margin-left: auto;
`;

export const ApplicationsSetting: FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const { isOrganizationDeactivated } = useAuthentication();
  const { isPermitted } = useAuthorization();
  const settingsLayoutContext = useContext(SettingsLayoutContext);
  const organization = useSelector((state: RootState) => state.organizations.current);

  useEffect(() => {
    settingsLayoutContext.setBodyFitToWindow(true);
    return () => {
      settingsLayoutContext.setBodyFitToWindow(false);
    };
  }, [settingsLayoutContext]);

  const { page, pageSize, setPagination } = usePagination(1, 10);
  const [order, setOrder] = useState<FetchAppliationsOrderParam>('app_name');
  const applicationSearch = useApplicationSearch(pageSize, order);

  const canEnterApplication = useCanEnterApplication();

  const handleSearchChange = useCallback(
    (query) => {
      applicationSearch.updateSearchQuery(query);
    },
    [applicationSearch],
  );

  const handleSearchClear = useCallback(() => applicationSearch.clearSearchQuery(), [applicationSearch]);

  const onAppNameClick = useCallback(
    (application: ApplicationSummary) => () => {
      dispatch(coreActions.changeApplicationRequest(application));
    },
    [dispatch],
  );

  const onCreateAppButtonClick = useCallback(() => {
    if (isPermitted(['organization.applications.all'])) {
      showDialog({
        dialogTypes: DialogType.CreateApp,
        dialogProps: {
          organization,
        },
      });
    }
  }, [isPermitted, showDialog, organization]);

  const appItemActions = (application: ApplicationSummary) => {
    const actions: {
      label: string;
      onClick: () => void;
    }[] = [];
    if (!isOrganizationDeactivated) {
      actions.push({
        label: 'Change app name',
        onClick: () => {
          showDialog({
            dialogTypes: DialogType.ChangeAppName,
            dialogProps: { application },
          });
        },
      });
    }
    if (isPermitted(['organization.applications.all'])) {
      actions.push({
        label: 'Delete',
        onClick: () => {
          showDialog({
            dialogTypes: DialogType.DeleteApplication,
            dialogProps: { application },
          });
        },
      });
    }
    return actions;
  };

  const onPaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (page, pageSize) => {
      if (applicationSearch.items.length < page * pageSize) {
        applicationSearch.fetchNextResults();
      }
      setPagination(page, pageSize);
    },
    [applicationSearch, setPagination],
  );

  const onSortByUpdated = useCallback(
    (column, order) => {
      setPagination(1, pageSize); // move back to the first page
      if (!column) {
        setOrder('app_name');
        return;
      }
      setOrder(`${order === 'descend' ? '-' : ''}${column.dataIndex}` as FetchAppliationsOrderParam);
    },
    [pageSize, setPagination],
  );

  const appRegions = useApplicationRegionsSelector(applicationSearch.items);
  return (
    <>
      <SettingsHeader
        title={intl.formatMessage({ id: 'common.settings.applications_title' })}
        description={intl.formatMessage(
          { id: 'common.applications.maxApplicationCount' },
          {
            max: <strong>{organization.max_application_count}</strong>,
            maxCount: organization.max_application_count,
          },
        )}
        actions={
          isPermitted(['organization.applications.all'])
            ? [
                {
                  key: 'create-app',
                  label: intl.formatMessage({ id: 'common.createApp' }),
                  icon: 'plus',
                  buttonType: 'primary',
                  ...(isOrganizationDeactivated ? { disabled: true } : {}),
                },
              ]
            : []
        }
        onActionPress={onCreateAppButtonClick}
      />
      <SearchInputWrapper>
        {intl.formatMessage({ id: 'label.resultCount' }, { count: applicationSearch.count })}
        <SearchInput
          handleChange={handleSearchChange}
          handleSearchClear={handleSearchClear}
          value={applicationSearch.rawSearchQuery}
          ph={intl.formatMessage({ id: 'ph.searchApplications' })}
        />
      </SearchInputWrapper>
      <ApplicationTable
        loading={applicationSearch.isFetching}
        columns={[
          {
            dataIndex: 'app_name',
            title: intl.formatMessage({ id: 'label.name' }),
            flex: 5,
            defaultSortOrder: 'ascend',
            sorter: true,
            render: (record) =>
              canEnterApplication && !isOrganizationDeactivated ? (
                <AppName role="link" onClick={onAppNameClick(record)}>
                  {record.app_name}
                </AppName>
              ) : (
                record.app_name
              ),
          },
          {
            dataIndex: 'region',
            title: intl.formatMessage({ id: 'label.server' }),
            flex: 3,
            render: (record) => appRegions[record.app_id],
            sorter: true,
          },
          {
            dataIndex: 'created_at',
            title: intl.formatMessage({ id: 'label.created' }),
            flex: 4,
            render: (record) => moment(record.created_at).format(DEFAULT_DATE_FORMAT),
            sorter: true,
          },
        ]}
        rowActions={
          isPermitted(['organization.applications.all'])
            ? (record) => [<OverflowMenu key="settingsApplicationsOverflow" items={appItemActions(record)} />]
            : undefined
        }
        onSortByUpdated={onSortByUpdated}
        dataSource={applicationSearch.items.slice((page - 1) * pageSize, page * pageSize)}
        rowKey="app_id"
        emptyView={
          <CenteredEmptyState
            icon="applications"
            title={intl.formatMessage({
              id: applicationSearch.isSearchResultVisible
                ? 'label.applicationSearchResultEmpty'
                : 'label.applicationListEmpty',
            })}
            description={intl.formatMessage({
              id: applicationSearch.isSearchResultVisible
                ? 'desc.applicationSearchResultEmpty'
                : 'desc.applicationListEmpty',
            })}
          />
        }
        footer={
          <ApplicationsPagination
            current={page}
            total={applicationSearch.count}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100] as ReadonlyArray<PerPage>}
            onChange={onPaginationChange}
            onItemsPerPageChange={onPaginationChange}
          />
        }
        showScrollbars={true}
      />
    </>
  );
};
