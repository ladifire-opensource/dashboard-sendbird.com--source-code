import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { toast } from 'feather';
import moment from 'moment-timezone';
import qs from 'qs';

import { axios } from '@api/shared';
import { getDeskURL } from '@api/shared';
import * as deskApi from '@desk/api';
import { snakeCaseKeys, ClientStorage } from '@utils';

import { useAsync } from './useAsync';
import { useErrorToast } from './useErrorToast';
import { useTypedSelector } from './useTypedSelector';

const getIframeURL: GetIframeURL = (id, region, params) =>
  `${getDeskURL(region)}/api/apps_iframes/${id}/get_html?${qs.stringify(snakeCaseKeys(params))}`;
type IframeHtmlKeyStore = {
  key: string;
  iframeAppId: number;
  expiredAt: string;
};
const htmlKeyStorageKey = 'sbHtmlKeyStore';
const getHTMLKeyStore = () => {
  // Use localStorage to prevent re-generation of the key when new tab or window opened
  const htmlKeyStoreRaw = ClientStorage.get(htmlKeyStorageKey);
  let htmlKeyStore: IframeHtmlKeyStore | undefined = undefined;
  try {
    if (htmlKeyStoreRaw) {
      htmlKeyStore = JSON.parse(htmlKeyStoreRaw);
    }
  } catch (e) {}
  return htmlKeyStore;
};

export const useIframeApp = (ticketId?: Ticket['id']) => {
  const { pid, region, agentId } = useTypedSelector((state) => ({
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region ?? '',
    agentId: state.desk.agent.id,
  }));

  const [fetchIframeAppResponse, fetchIframeApps] = useAsync(() => deskApi.fetchIframeApps(pid, region), [pid, region]);
  const [verifyUrlResponse, verifyUrl] = useAsync(async (url: string) => axios.get(url), []);
  const [generateHtmlKeyResult, generateHtmlKey] = useAsync(
    async (id: IframeApp['id']) => deskApi.getHtmlKey(pid, region, { id }),
    [pid, region],
  );
  const [htmlKey, setHtmlKey] = useState<IframeHtmlKeyStore | undefined>(getHTMLKeyStore());

  const iframeApp = useMemo(() => {
    if (fetchIframeAppResponse.data?.data.length ?? 0 > 0) {
      return fetchIframeAppResponse.data?.data[0];
    }
    return undefined;
  }, [fetchIframeAppResponse.data]);
  const iframeAppId = iframeApp?.id;
  const iframeAppEnabled = iframeApp?.isEnabled;

  const url = useMemo(() => {
    if (iframeAppEnabled) {
      if (htmlKey) {
        const isValidIframeApp = iframeAppId === (htmlKey.iframeAppId ?? undefined);
        const isExpired = moment(htmlKey?.expiredAt).isBefore();
        if (iframeAppId && isValidIframeApp && !isExpired) {
          return getIframeURL(iframeAppId, region, { htmlKey: htmlKey.key, ticketId, agentId });
        }
      }
      if (iframeAppId && generateHtmlKeyResult.status === 'init') {
        generateHtmlKey(iframeAppId);
      }
    }
    return undefined;
  }, [
    htmlKey,
    iframeAppEnabled,
    iframeAppId,
    generateHtmlKeyResult.status,
    region,
    ticketId,
    agentId,
    generateHtmlKey,
  ]);

  useEffect(() => {
    if (generateHtmlKeyResult.status === 'success' && generateHtmlKeyResult.data?.data.htmlKey && iframeAppId) {
      const htmlKeyData = {
        key: generateHtmlKeyResult.data.data.htmlKey,
        iframeAppId,
        expiredAt: moment()
          .add(23, 'hours') // Actual expiration time: after 24 hours
          .toISOString(),
      };
      setHtmlKey(htmlKeyData);
      ClientStorage.set(htmlKeyStorageKey, JSON.stringify(htmlKeyData));
    }
  }, [generateHtmlKeyResult.status, generateHtmlKeyResult.data, iframeAppId]);

  useEffect(() => {
    fetchIframeApps();
  }, [fetchIframeApps]);

  useEffect(() => {
    if (url) verifyUrl(url);
  }, [url, verifyUrl]);

  useErrorToast(generateHtmlKeyResult.error);

  return {
    iframeApp,
    isFetching: fetchIframeAppResponse.status === 'loading',
    isKeyFetching: generateHtmlKeyResult.status === 'loading',
    isKeyVerifying: verifyUrlResponse.status === 'loading',
    generateKeyError: generateHtmlKeyResult.error,
    verifyUrlError: verifyUrlResponse.error,
    url,
    generateHtmlKey: () => iframeApp && generateHtmlKey(iframeApp.id),
  };
};

export const useIframeAppIntegration = () => {
  const { pid, region } = useSelector((state: RootState) => ({
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region ?? '',
  }));
  const [fetchIframeAppResponse, fetchIframeApps] = useAsync(() => deskApi.fetchIframeApps(pid, region), [pid, region]);

  const iframeApp = useMemo(() => {
    if (fetchIframeAppResponse.data?.data.length ?? 0 > 0) {
      return fetchIframeAppResponse.data?.data[0];
    }
    return undefined;
  }, [fetchIframeAppResponse.data]);

  useEffect(() => {
    fetchIframeApps();
  }, [fetchIframeApps]);

  useErrorToast(fetchIframeAppResponse.error);

  return {
    isFetching: fetchIframeAppResponse.status === 'loading',
    isInstalled: !!iframeApp,
    isEnabled: iframeApp?.isEnabled ?? false,
    iframeApp,
    load: fetchIframeApps,
    error: fetchIframeAppResponse.error,
  };
};

export const useIframeAppSetting = () => {
  const intl = useIntl();
  const { pid, region } = useSelector((state: RootState) => ({
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region ?? '',
  }));

  const [id, setId] = useState<IframeApp['id'] | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [iframeAppDetail, setIframeAppDetail] = useState<IframeApp | undefined>(undefined);

  const [createResult, createIframeApp] = useAsync(
    async (params: CreateIFrameAppPayload) =>
      deskApi.createIframeApp(pid, region, { ...params, width: Number(params.width) }),
    [pid, region],
  );
  const [fetchIframeAppsResult, fetchIframeApps] = useAsync(() => {
    setIsFetching(true);
    return deskApi.fetchIframeApps(pid, region);
  }, [pid, region]);

  const [updateResult, updateIframeAppDetail] = useAsync(
    async (params: Omit<UpdateIframeAppPayload, 'id'>) => {
      if (id != null && id > 0) {
        return deskApi.updateIframeApp(pid, region, { ...params, id, width: Number(params.width) ?? undefined });
      }
      return undefined;
    },
    [id, pid, region],
  );

  const [toggleResult, toggleIframeApp] = useAsync(
    async (value: UpdateIframeAppPayload['isEnabled'] = !iframeAppDetail?.isEnabled) => {
      if (id != null && id > 0) {
        setIsToggling(true);
        return deskApi.updateIframeApp(pid, region, { id, isEnabled: value });
      }
      return undefined;
    },
    [id, iframeAppDetail, pid, region],
  );

  const [uninstallResult, uninstallIframeApp] = useAsync(async () => {
    if (id != null && id > 0) {
      return deskApi.updateIframeApp(pid, region, { id, status: 'INACTIVE' });
    }
    return undefined;
  }, [id, pid, region]);

  const [fetchDetailResult, fetchIframeAppDetail] = useAsync(
    async (id: IframeApp['id']) => deskApi.fetchIframeAppDetail(pid, region, { id }),
    [pid, region],
  );

  useEffect(() => {
    fetchIframeApps();
  }, [fetchIframeApps]);

  useEffect(() => {
    if (id != null && id > 0) {
      fetchIframeAppDetail(id);
      return;
    }
  }, [fetchIframeAppDetail, id]);

  useEffect(() => {
    if (fetchIframeAppsResult.status === 'success') {
      if (fetchIframeAppsResult.data?.data.length ?? 0 > 0) {
        setId(fetchIframeAppsResult.data.data[0].id);
      } else {
        setId(undefined);
        setIsFetching(false);
      }
    } else if (fetchIframeAppsResult.status === 'error') {
      setIsFetching(false);
    }
  }, [fetchIframeAppsResult.data, fetchIframeAppsResult.status]);

  useEffect(() => {
    if (fetchDetailResult.status === 'success') {
      setIframeAppDetail(fetchDetailResult.data.data);
      setIsFetching(false);
    } else if (fetchDetailResult.status === 'error') {
      setIsFetching(false);
    }
  }, [fetchDetailResult.data, fetchDetailResult.status]);

  useEffect(() => {
    if (createResult.status === 'success') {
      setIframeAppDetail(createResult.data.data);
      setId(createResult.data.data.id);
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.install' }) });
    }
  }, [createResult.data, createResult.status, intl]);

  useEffect(() => {
    if (updateResult.status === 'success') {
      setIframeAppDetail(updateResult.data?.data);
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.update' }) });
    }
  }, [intl, updateResult.data, updateResult.status]);

  useEffect(() => {
    if (toggleResult.status === 'success') {
      setIframeAppDetail(toggleResult.data?.data);
      if (toggleResult.data?.data.isEnabled) {
        toast.success({ message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.turnOn' }) });
      } else {
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.turnOff' }),
        });
      }
      setIsToggling(false);
    } else if (toggleResult.status === 'error') {
      setIsToggling(false);
    }
  }, [intl, toggleResult.data, toggleResult.status]);

  useEffect(() => {
    if (uninstallResult.status === 'success') {
      setIframeAppDetail(uninstallResult.data?.data);
      toast.success({
        message: intl.formatMessage({ id: 'desk.settings.integration.iframe.toast.success.uninstall' }),
      });
    }
  }, [intl, uninstallResult.data, uninstallResult.status]);

  useErrorToast(fetchIframeAppsResult.error);
  useErrorToast(updateResult.error);
  useErrorToast(createResult.error);
  useErrorToast(toggleResult.error);
  useErrorToast(uninstallResult.error);
  useErrorToast(fetchDetailResult.error);

  return {
    isFetching,
    isUpdating: updateResult.status === 'loading',
    isToggling,
    isCreating: createResult.status === 'loading',
    iframeAppDetail,
    createIframeApp,
    updateIframeAppDetail,
    toggleIframeApp,
    uninstallIframeApp,
  };
};
