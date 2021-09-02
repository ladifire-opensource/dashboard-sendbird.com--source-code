import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const createCustomerField: CreateCustomerFieldAPI = (
  pid,
  region,
  { name, key, field_type, read_only, options = [], description },
) =>
  axios.post(
    `${getDeskURL(region)}/api/customer_fields`,
    { name, key, field_type, read_only, options, description },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchCustomerFields: FetchCustomerFieldsAPI = (pid, region, { offset = 0, limit = 20 }) =>
  axios.get(`${getDeskURL(region)}/api/projects/customer_fields?offset=${offset}&limit=${limit}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const getCustomerField: GetCustomerFieldAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/customer_fields/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const checkCustomerFieldKeyValidation: CheckCustomerFieldKeyValidationAPI = (pid, region, { key }) =>
  axios.get(`${getDeskURL(region)}/api/customer_fields/key_duplicate_check?`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: { key },
  });

export const updateCustomerField: UpdateCustomerFieldAPI = (pid, region, { id, ...data }) =>
  axios.patch(`${getDeskURL(region)}/api/customer_fields/${id}`, data, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const deleteCustomerField: DeleteCustomerFieldAPI = (pid, region, { id }) =>
  axios.patch(
    `${getDeskURL(region)}/api/customer_fields/${id}/inactive`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const getCustomerFieldDataList: GetCustomerFieldDataListAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/customers/${id}/customer_field_datas`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const addCustomerFieldData: AddCustomerFieldDataAPI = (pid, region, { customer, customer_field, value }) =>
  axios.post(
    `${getDeskURL(region)}/api/customer_field_datas`,
    { customer, customer_field, value },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const updateCustomerFieldData: UpdateCustomerFieldDataAPI = (pid, region, { id, value }) =>
  axios.patch(
    `${getDeskURL(region)}/api/customer_field_datas/${id}`,
    { value },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
