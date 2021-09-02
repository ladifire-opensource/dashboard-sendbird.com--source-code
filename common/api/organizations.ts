import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const createOrganization: CreateOrganizationAPI = ({
  organizationName: organization_name,
  contact,
  firstName: first_name,
  lastName: last_name,
}) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/organizations/`,
    {
      organization_name,
      contact,
      first_name,
      last_name,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const fetchOrganization: FetchOrganizationAPI = (organization_uid) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const updateOrganization: UpdateOrganizationAPI = (organization_uid, payload) => {
  return axios.patch(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const deleteOrganization: DeleteOrganizationAPI = (organization_uid) => {
  return axios.delete(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchOrganizationMembers: FetchOrganizationMembersAPI = ({ uid, params }) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/members/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
    params,
  });
};

export const updateOrganizationMemberRole: UpdateOrganizationMemberRoleAPI = ({ uid, ...payload }) => {
  return axios.put(`${getGateURL()}/dashboard/organization/${uid}/members/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const deleteOrganizationMember = (organization_uid, member) => {
  return axios.delete(`${getGateURL()}/dashboard/organization/${organization_uid}/members/`, {
    data: {
      email: member.user.email,
    },
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const exportOrganizationMembersList = (organization_uid) => {
  return axios.get(`${getGateURL()}/dashboard/organization/${organization_uid}/export_member_list/`, {
    headers: {
      authorization: getSBAuthToken(),
      'Content-Type': 'text/csv',
    },
  });
};

export const inviteMember = (payload) => {
  return axios.post(`${getGateURL()}/dashboard/organization/invitation/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchOrganizationInvitations: FetchOrganizationInvitationsAPI = ({ uid, params }) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/invitations/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
    params,
  });
};

export const updateInvitation = (invite_hash) => {
  return axios.put(
    `${getGateURL()}/dashboard/organization/invitation/${invite_hash}/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const cancelInvitation = (invite_hash) => {
  return axios.delete(`${getGateURL()}/dashboard/organization/invitation/${invite_hash}/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const setLoginIPRanges = ({
  loginIPRanges,
  ignore_cidr_on_two_factor_authentication,
}: SetLoginIPRangesPayload) => {
  const login_cidr_list = loginIPRanges;

  return axios.put<{ organization: Organization }>(
    `${getGateURL()}/dashboard/auth/login_ip_range/`,
    {
      login_cidr_list,
      ignore_cidr_on_two_factor_authentication,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const updateSamlConfiguration: UpdateSamlConfigurationAPI = (organization_uid, payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/sso_profile/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const deleteSamlConfiguration: DeleteSamlConfigurationAPI = (organization_uid) => {
  return axios.delete(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/sso_profile/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

/**
 *
 * @param payload Transfer payload with organization uid and target member's email
 * @param payload.organization_uid Current organization's uid
 * @param payload.email Target member's email
 */
export const transferOwner: TransferOwnerAPI = ({ organization_uid, email }: TransferOwnerPayload) => {
  return axios.post(
    `${getGateURL()}/dashboard/organization/${organization_uid}/transfer_owner/`,
    {
      email,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const fetchMemberRoles: FetchMemberRolesAPI = ({ uid, limit, offset }) => {
  const params = `?limit=${limit}&offset=${offset}`;
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/member_roles/${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const getOrganizationAPIKey = ({ organization_uid }) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/api_key/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchMemberRole = (roleId) => {
  return axios.get(`${getGateURL()}/dashboard_api/organization_member_roles/${roleId}/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchMemberRoleByName: FetchMemberRoleByNameAPI = (name) => {
  return axios.get(`${getGateURL()}/dashboard_api/organization_member_roles/get_by_name/?name=${name}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchPermissions: FetchPermissionsAPI = (uid) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/permissions/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const createMemberRole: CreateMemberRoleAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/organization_member_roles/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const editMemberRole: EditMemberRoleAPI = ({ roleId, payload }) => {
  return axios.patch(`${getGateURL()}/dashboard_api/organization_member_roles/${roleId}/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const deleteMemberRole = ({ roleId }) => {
  return axios.delete(`${getGateURL()}/dashboard_api/organization_member_roles/${roleId}/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const renewOrganizationAPIKey = ({ organization_uid }) => {
  return axios.patch(
    `${getGateURL()}/dashboard_api/organizations/${organization_uid}/renew_api_key/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const startFreeTrial = () => {
  return axios.post(
    `${getGateURL()}/dashboard_api/billing/subscriptions/start_free_trial/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const enforce2FA = ({ uid, enforce }: Enforce2FAPayload) => {
  return axios.post<{
    organization: Organization;
  }>(
    `${getGateURL()}/dashboard/auth/enforce_2fa/`,
    { uid, enforce },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};
