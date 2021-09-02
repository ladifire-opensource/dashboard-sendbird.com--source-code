import { axios, getDeskURL } from '@api/shared';
import { getDeskAPIToken } from '@api/tokens';

export const fetchCustomers = ({ region, pid, parameters = '' }) => {
  const url = `${getDeskURL(region)}/api/projects/customers/${parameters}`;

  return axios.get(url, {
    headers: {
      Authorization: `Token ${getDeskAPIToken()}`,
      pid,
    },
  });
};

export const fetchCustomer = ({ region, pid, customerId, parameters = '' }) => {
  const url = `${getDeskURL(region)}/api/customers/${customerId}`;

  return axios.get(url, {
    headers: {
      Authorization: `Token ${getDeskAPIToken()}`,
      pid,
    },
  });
};
