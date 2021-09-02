import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchIframeApps: FetchIframeAppsAPI = (pid, region, params) =>
  axios.get(`${getDeskURL(region)}/api/projects/apps_iframes/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });

export const getHtmlKey: GetIframeHtmlKeyAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/apps_iframes/${id}/get_html_key`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
