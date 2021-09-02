import { useMemo, useState, FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { Link as ReactRouterLink } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Button, cssVariables, Link, LinkVariant, toast, Dropdown, Lozenge, Subtitles } from 'feather';

import { fetchAnnouncements } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useAuthorization, useAppId } from '@hooks';
import { LoadMoreTable, PageHeader, TablePageContainer } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { colorMapV16 } from './AnnouncementStatusLozenge';
import { useAnnouncementTimezone, useAnnouncementTimezoneSetter } from './AnnouncementTimezoneContextProvider';
import { TimezoneDropdown } from './TimezoneDropdown';
import { VersionTag } from './VersionTag';
import { pageSize, ALL_STATUS } from './constants';
import { StatusDropdownType } from './index';
import { useAnnouncementVersion } from './useAnnouncementVersion';
import { useTableColumns } from './useTableColumns';

type Props = {
  items: AnnouncementUnknownVersion[];
  nextToken: string;
  isLoading: boolean;
  onItemsUpdated: (updates: { items: AnnouncementUnknownVersion[]; nextToken: string }) => void;
  handleStatusFilter: (newStatus: StatusDropdownType) => void;
  status: StatusDropdownType;
};

const announcementTableStyle = css`
  border-left: none;
  border-right: none;
  border-bottom: none;

  thead {
    // prevent thead from being shrunk on Safari
    flex: none;
  }

  tbody tr:last-child {
    border-bottom-width: 1px;
  }

  th > span {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    [role='tooltip'] {
      white-space: initial;
    }
  }

  tr:hover a {
    // underline links on hovered rows
    text-decoration: underline;
  }
`;

const StyledAllStatus = styled.div`
  ${Subtitles['subtitle-01']}
`;

export const AnnouncementList: FC<Props> = ({
  items,
  isLoading,
  nextToken,
  onItemsUpdated,
  handleStatusFilter,
  status,
}) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const match = useRouteMatch();

  const appId = useAppId();
  const announcementVersion = useAnnouncementVersion();
  const columns = useTableColumns(status);
  const timezone = useAnnouncementTimezone();
  const setTimezone = useAnnouncementTimezoneSetter();

  const [isLoadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const { data } = await fetchAnnouncements({
        appId,
        limit: pageSize,
        listToken: nextToken,
        ...(status !== ALL_STATUS && { status }),
      });
      onItemsUpdated({ items: items.concat(data.announcements), nextToken: data.next });
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setLoadingMore(false);
    }
  }, [appId, items, nextToken, onItemsUpdated, status]);

  const table = useMemo(() => {
    return (
      <LoadMoreTable<AnnouncementUnknownVersion>
        css={announcementTableStyle}
        columns={columns}
        rowStyles={() => css`
          &:not(:hover) a {
            color: ${cssVariables('neutral-10')} !important;
          }
        `}
        dataSource={items}
        loading={isLoading}
        emptyView={
          <CenteredEmptyState
            icon="announcements"
            title={intl.formatMessage({ id: 'chat.announcements.list.table.emptyView.title' })}
            description={intl.formatMessage({ id: 'chat.announcements.list.table.emptyView.description' })}
          />
        }
        hasNext={!isLoading && !!nextToken}
        loadMoreButtonProps={{
          onClick: loadMore,
          isLoading: isLoadingMore,
          disabled: isLoadingMore,
          ['data-test-id' as string]: 'LoadMoreButton',
        }}
        showScrollbars={true}
      />
    );
  }, [columns, intl, isLoading, isLoadingMore, items, loadMore, nextToken]);

  if (!announcementVersion) {
    return null;
  }
  const getStatusItem = (statusName: StatusDropdownType, isSelectedElement: boolean) => {
    return (
      <div style={{ marginLeft: isSelectedElement ? '16px' : '' }}>
        {statusName === ALL_STATUS ? (
          <StyledAllStatus>{intl.formatMessage({ id: 'chat.announcements.filter.status.all' })}</StyledAllStatus>
        ) : (
          <Lozenge color={colorMapV16[statusName]}>{statusName}</Lozenge>
        )}
      </div>
    );
  };

  return (
    <TablePageContainer>
      <PageHeader
        css={`
          * + ${PageHeader.Description} {
            margin-top: 16px;
          }
        `}
      >
        <PageHeader.Title>
          {intl.formatMessage({ id: 'chat.announcements.list.title' })}
          <VersionTag css="margin-left: 8px;" />
        </PageHeader.Title>
        <PageHeader.Actions>
          {/* eslint-disable */}
          <label data-test-id="TimezoneDropdownWrapper">
            <span
              css={`
                // visually hidden
                position: absolute;
                overflow: hidden;
                width: 0;
                height: 0;
              `}
            >
              Timezone
            </span>
            <TimezoneDropdown
              size="small"
              initialSelectedItem={timezone}
              onChange={setTimezone}
              listWidth={386}
              css={`
                margin-right: 8px;
              `}
            />
          </label>
          {/* eslint-disable */}
          {isPermitted(['application.announcements.all']) && (
            <ReactRouterLink to={`${match?.url}/create`}>
              <Button data-test-id="CreateAnnouncementButton" buttonType="primary" size="small" icon="plus">
                {intl.formatMessage({ id: 'chat.announcements.list.btn.create' })}
              </Button>
            </ReactRouterLink>
          )}
        </PageHeader.Actions>
        <PageHeader.Description>
          {announcementVersion === 'v1.6'
            ? intl.formatMessage({ id: 'chat.announcements.list.description' })
            : intl.formatMessage(
                { id: 'chat.announcements.list.description.legacyVersion' },
                {
                  a: (text) => (
                    <Link href="/settings/contact_us" useReactRouter={true} variant={LinkVariant.Inline}>
                      {text}
                    </Link>
                  ),
                },
              )}
        </PageHeader.Description>
      </PageHeader>
      {announcementVersion === 'v1.6' && (
        <div data-test-id="pageHeaderFilter">
          <Dropdown
            size="small"
            selectedItem={status}
            items={[ALL_STATUS, ...Object.keys(colorMapV16)]}
            itemToElement={(statusName: StatusDropdownType) => getStatusItem(statusName, false)}
            toggleRenderer={() => getStatusItem(status, true)}
            onChange={(newStatus: StatusDropdownType) => {
              newStatus && handleStatusFilter(newStatus);
            }}
          />
        </div>
      )}
      {table}
    </TablePageContainer>
  );
};
