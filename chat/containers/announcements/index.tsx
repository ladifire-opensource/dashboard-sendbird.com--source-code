import React, { useState, useCallback, useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { toast } from 'feather';

import { fetchAnnouncements } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';

import { AnnouncementDetail } from './AnnouncementDetail';
import { AnnouncementList } from './AnnouncementList';
import { colorMapV16 } from './AnnouncementStatusLozenge';
import { AnnouncementTimezoneContextProvider } from './AnnouncementTimezoneContextProvider';
import { CreateAnnouncement } from './CreateAnnouncement';
import { pageSize, ALL_STATUS } from './constants';

export type StatusDropdownType = AnnouncementV16['status'] | 'ALL_STATUS';

type Props = RouteComponentProps;

type State = {
  items: AnnouncementUnknownVersion[];
  nextToken: string;
  isLoading: boolean;
};

const getUniqueId = (item: AnnouncementUnknownVersion) =>
  (item as AnnouncementV15).unique_id || (item as AnnouncementV10).event_id;

type SearchParams = {
  status: StatusDropdownType;
};
const defaultParams: SearchParams = { status: 'ALL_STATUS' };

export const Announcements: React.FC<Props> = ({ match }) => {
  const appId = useAppId();
  const [{ items, nextToken, isLoading }, setState] = useState<State>({
    items: [] as AnnouncementUnknownVersion[],
    nextToken: '',
    isLoading: false,
  });

  const { status, updateParams } = useQueryString<SearchParams>(defaultParams, {
    status: (status) =>
      !status || (typeof status === 'string' && [ALL_STATUS, ...Object.keys(colorMapV16)].includes(status)),
  });

  const initializeList = useCallback(
    async (status = ALL_STATUS) => {
      setState((currentState) => ({ ...currentState, isLoading: true }));
      try {
        const { data } = await fetchAnnouncements({
          appId,
          limit: pageSize,
          listToken: '',
          status: status === ALL_STATUS ? '' : status,
        });
        setState({ items: data.announcements, nextToken: data.next, isLoading: false });
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        setState((currentState) => ({ ...currentState, isLoading: false }));
      }
    },
    [appId],
  );

  useEffect(() => {
    initializeList(status);
  }, [initializeList, status]);

  const handleStatusFilter = useCallback(
    (status: StatusDropdownType) => {
      updateParams({ status });
    },
    [updateParams],
  );

  const updateItem = useCallback((updatedItem: AnnouncementUnknownVersion) => {
    const uniqueId = getUniqueId(updatedItem);
    setState((currentState) => ({
      ...currentState,
      items: currentState.items.map((item) => (getUniqueId(item) === uniqueId ? updatedItem : item)),
    }));
  }, []);

  const updateItems = useCallback((params: Pick<State, 'items' | 'nextToken'>) => {
    setState((currentState) => ({ ...currentState, ...params }));
  }, []);

  return (
    <AnnouncementTimezoneContextProvider>
      <Switch>
        <Route
          exact={true}
          path={`${match.url}`}
          render={() => (
            <AnnouncementList
              items={items}
              nextToken={nextToken}
              isLoading={isLoading}
              onItemsUpdated={updateItems}
              handleStatusFilter={handleStatusFilter}
              status={status}
            />
          )}
        />
        <Route path={`${match.url}/create`} render={() => <CreateAnnouncement reloadList={initializeList} />} />
        <Route
          path={`${match.url}/:eventId`}
          render={() => <AnnouncementDetail onAnnouncementUpdated={updateItem} />}
        />
      </Switch>
    </AnnouncementTimezoneContextProvider>
  );
};
