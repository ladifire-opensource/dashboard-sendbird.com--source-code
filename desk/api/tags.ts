import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const getProjectTags: GetProjectTagsAPI = (pid, region, { limit = 100, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/projects/tags/`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    params: { limit, ...params },
  });
};

export const createTag: CreateTagAPI = (pid, region, data) => {
  return axios.post(`${getDeskURL(region)}/api/tags/`, data, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const updateTag: UpdateTagAPI = (pid, region, { id, ...data }) => {
  return axios.patch(`${getDeskURL(region)}/api/tags/${id}/`, data, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const deleteTag: DeleteTagAPI = (pid, region, { id }) => {
  return axios.delete(`${getDeskURL(region)}/api/tags/${id}/`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};
