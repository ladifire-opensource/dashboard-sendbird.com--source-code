import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchTicketFields: FetchTicketFieldsAPI = (pid, region = '', { offset = 0, limit = 20 }) =>
  axios.get(`${getDeskURL(region)}/api/projects/ticket_fields?&limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const createTicketField: CreateTicketFieldAPI = (
  pid,
  region = '',
  { name, key, description, field_type, read_only, options = [] },
) =>
  axios.post(
    `${getDeskURL(region)}/api/ticket_fields`,
    { name, key, description, field_type, read_only, options },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const deleteTicketField: DeleteTicketFieldAPI = (pid, region = '', { id }) =>
  axios.patch(
    `${getDeskURL(region)}/api/ticket_fields/${id}/inactive`,
    { id },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const getTicketField: GetTicketFieldAPI = (pid, region = '', { id }) =>
  axios.get(`${getDeskURL(region)}/api/ticket_fields/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const updateTicketField: UpdateTicketFieldAPI = (
  pid,
  region = '',
  { id, name, key, field_type, read_only, description, options },
) =>
  axios.patch(
    `${getDeskURL(region)}/api/ticket_fields/${id}`,
    { name, key, description, field_type, read_only, options },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const checkTicketFieldKeyValidation: CheckTicketFieldKeyValidationAPI = (pid, region = '', { key }) =>
  axios.get(`${getDeskURL(region)}/api/ticket_fields/key_duplicate_check`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      key,
    },
  });

export const getTicketFieldDataList: GetTicketFieldDataListAPI = (pid, region = '', { id }) =>
  axios.get(`${getDeskURL(region)}/api/tickets/${id}/ticket_field_datas`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const addTicketFieldData: AddTicketFieldDataAPI = (pid, region = '', { ticket, ticket_field, value }) =>
  axios.post(
    `${getDeskURL(region)}/api/ticket_field_datas`,
    { ticket, ticket_field, value },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const updateTicketFieldData: UpdateTicketFieldDataAPI = (pid, region = '', { id, value }) =>
  axios.patch(
    `${getDeskURL(region)}/api/ticket_field_datas/${id}`,
    { value },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
