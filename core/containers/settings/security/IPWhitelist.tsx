import React, { useEffect, useCallback, useReducer, useRef, RefObject } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import cidrRegex from 'cidr-regex';
import { toast } from 'feather';
import ipRegex from 'ip-regex';

import { SettingsGridCard } from '@common/containers/layout';
import { putIPWhitelist, getIPWhitelist, deleteIPWhitelist } from '@core/api';
import { getErrorMessage } from '@epics';

import { UniqueItemListForm, UniqueItemListFormRef } from './UniqueItemListForm';

type Props = { isEditable: boolean };

type IPWhitelistState = {
  status: 'fetching' | 'adding' | 'removing' | 'error' | 'idle';
  pendingRemoveItem: string | null;
  error: string | null;
  ipWhitelist: string[];
};

type IPWhitelistAction =
  | { type: 'fetch_request' }
  | { type: 'fetch_success'; payload: { ipWhitelist: string[] } }
  | { type: 'fetch_fail'; payload: { error: string } }
  | { type: 'add_request' }
  | { type: 'add_success'; payload: { ipWhitelist: string[] } }
  | { type: 'add_fail' }
  | { type: 'remove_request'; payload: { item: string } }
  | { type: 'remove_success'; payload: { ipWhitelist: string[] } }
  | { type: 'remove_fail' };

const useIPWhitelist = (formRef: RefObject<UniqueItemListFormRef>) => {
  const intl = useIntl();
  const [{ status, pendingRemoveItem, error, ipWhitelist }, dispatch] = useReducer(
    (state: IPWhitelistState, action: IPWhitelistAction): IPWhitelistState => {
      switch (action.type) {
        case 'fetch_request':
          return { ...state, status: 'fetching' };
        case 'fetch_success':
          return { ...state, status: 'idle', ipWhitelist: action.payload.ipWhitelist, error: null };
        case 'fetch_fail':
          return { ...state, status: 'error', error: action.payload.error };
        case 'add_request':
          return { ...state, status: 'adding' };
        case 'add_success':
          return { ...state, status: 'idle', ipWhitelist: action.payload.ipWhitelist };
        case 'add_fail':
          return { ...state, status: 'idle' };
        case 'remove_request':
          return { ...state, status: 'removing', pendingRemoveItem: action.payload.item };
        case 'remove_success':
          return { ...state, status: 'idle', ipWhitelist: action.payload.ipWhitelist, pendingRemoveItem: null };
        case 'remove_fail':
          return { ...state, status: 'idle', pendingRemoveItem: null };
        default:
          return state;
      }
    },
    {
      status: 'idle',
      error: null,
      pendingRemoveItem: null,
      ipWhitelist: [],
    },
  );
  const appId = useSelector((state: RootState) => state.applicationState.data?.app_id);

  const fetchList = useCallback(async () => {
    if (appId) {
      dispatch({ type: 'fetch_request' });
      try {
        const {
          data: { ip_whitelist_addresses },
        } = await getIPWhitelist({ appId });
        dispatch({ type: 'fetch_success', payload: { ipWhitelist: ip_whitelist_addresses } });
      } catch (error) {
        dispatch({ type: 'fetch_fail', payload: { error: getErrorMessage(error) } });
      }
    }
  }, [appId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addItem = async (value: string, onSuccess?: () => void) => {
    dispatch({ type: 'add_request' });
    try {
      if (appId) {
        const { data } = await putIPWhitelist({ appId, ip_whitelist_addresses: [value] });
        const { ip_whitelist_addresses } = data;
        dispatch({ type: 'add_success', payload: { ipWhitelist: ip_whitelist_addresses } });
        onSuccess?.();
      }
    } catch (error) {
      dispatch({ type: 'add_fail' });

      const message = getErrorMessage(error);
      if (/Invalid value:.*ip_whitelist_addresses/i.test(message) && formRef.current) {
        formRef.current?.setError(intl.formatMessage({ id: 'chat.settings.ipWhitelisting.error.invalid' }));
        return;
      }
      toast.error({ message: getErrorMessage(error) });
    }
  };

  const removeItem = async (value: string, onSuccess?: () => void) => {
    dispatch({ type: 'remove_request', payload: { item: value } });
    try {
      if (appId) {
        const { data } = await deleteIPWhitelist({ appId, ip_whitelist_addresses: [value] });
        const { ip_whitelist_addresses } = data;
        dispatch({ type: 'remove_success', payload: { ipWhitelist: ip_whitelist_addresses } });
        onSuccess?.();
      }
    } catch (error) {
      dispatch({ type: 'remove_fail' });
      toast.error({ message: getErrorMessage(error) });
    }
  };

  return { ipWhitelist, error, pendingRemoveItem, addItem, removeItem, status, fetchList };
};

export const IPWhitelist: React.FC<Props> = React.memo(({ isEditable }) => {
  const intl = useIntl();
  const formRef = useRef<UniqueItemListFormRef>(null);
  const { ipWhitelist, error, pendingRemoveItem, addItem, removeItem, status, fetchList } = useIPWhitelist(formRef);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'chat.settings.ipWhitelisting.title' })}
      titleColumns={6}
      gap={['0', '32px']}
      description={intl.formatMessage({ id: 'chat.settings.ipWhitelisting.description' })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <UniqueItemListForm
        ref={formRef}
        items={ipWhitelist}
        pendingRemoveItems={pendingRemoveItem ? [pendingRemoveItem] : undefined}
        error={error ?? undefined}
        isLoading={status === 'fetching'}
        inputPlaceholder={intl.formatMessage({
          id: 'chat.settings.ipWhitelisting.placeholder',
        })}
        addButtonLabel={intl.formatMessage({ id: 'chat.settings.ipWhitelisting_btn.add' })}
        addButtonIsLoading={status === 'adding'}
        disabled={!isEditable || status === 'fetching' || status === 'adding'}
        onItemAdd={(item, onSuccess) => {
          addItem(item, onSuccess);
        }}
        onItemDelete={(item) => {
          removeItem(item);
        }}
        onReload={fetchList}
        validate={{
          isValid: (value) => {
            return (
              [ipRegex({ exact: true }), cidrRegex({ exact: true })].some((regex) => regex.test(value)) ||
              intl.formatMessage({ id: 'chat.settings.ipWhitelisting.error.invalid' })
            );
          },
          isUnique: (value) => {
            return (
              !ipWhitelist.includes(value) ||
              intl.formatMessage({ id: 'chat.settings.ipWhitelisting.error.duplicated' })
            );
          },
        }}
      />
    </SettingsGridCard>
  );
});
