import { createAction } from '@actions/createAction';
import { OrganizationsActionTypes } from '@actions/types';

export const OrganizationsActions: OrganizationsActionCreators = {
  createOrganizationSuccess: (payload) => createAction(OrganizationsActionTypes.CREATE_ORGANIZATION_SUCCESS, payload),

  updateOrganizationRequest: (payload: {
    organization_uid: string;
    payload: {
      name: string;
    };
  }) => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_REQUEST, payload),
  updateOrganizationSuccess: (payload) => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_SUCCESS, payload),
  updateOrganizationFail: (payload) => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_FAIL, payload),

  updateOrganizationNameRequest: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_REQUEST, payload),

  updateOrganizationNameSuccess: () => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_SUCCESS),

  updateOrganizationNameFail: (error) => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_FAIL, error),

  updateOrganizationNameReset: () => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_RESET),

  updateSamlConfigurationAndSlugNameRequest: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_AND_SLUG_NAME_REQUEST, payload),

  updateOrganizationSlugNameSuccess: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_SUCCESS, payload),

  updateOrganizationSlugNameFail: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_FAIL, payload),

  updateOrganizationSlugNameReset: () => createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_RESET),

  deleteOrganizationMembersRequest: (payload: { organization_uid: string; members: Member[] }) =>
    createAction(OrganizationsActionTypes.DELETE_ORGANIZATION_MEMBERS_REQUEST, payload),
  deleteOrganizationMembersSuccess: (payload: string[]) =>
    createAction(OrganizationsActionTypes.DELETE_ORGANIZATION_MEMBERS_SUCCESS, payload),
  deleteOrganizationMembersFail: (payload) =>
    createAction(OrganizationsActionTypes.DELETE_ORGANIZATION_MEMBERS_FAIL, payload),
  updateOrganizationMemberRoleRequest: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_MEMBER_ROLE_REQUEST, payload),
  updateOrganizationMemberRoleSuccess: (payload: Member) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_MEMBER_ROLE_SUCCESS, payload),
  updateOrganizationMemberRoleFail: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_ORGANIZATION_MEMBER_ROLE_FAIL, payload),
  inviteMemberRequest: (payload: {
    email: string;
    role: string;
    organization_uid: string;
    options: {
      failMessage: any;
    };
  }) => createAction(OrganizationsActionTypes.INVITE_MEMBER_REQUEST, payload),
  inviteMemberSuccess: (payload) => createAction(OrganizationsActionTypes.INVITE_MEMBER_SUCCESS, payload),
  inviteMemberFail: (payload) => createAction(OrganizationsActionTypes.INVITE_MEMBER_FAIL, payload),
  updateInvitationRequest: (payload: { inviteHash: string }) =>
    createAction(OrganizationsActionTypes.UPDATE_INVITATION_REQUEST, payload),
  updateInvitationSuccess: (payload) => createAction(OrganizationsActionTypes.UPDATE_INVITATION_SUCCESS, payload),
  updateInvitationFail: (payload) => createAction(OrganizationsActionTypes.UPDATE_INVITATION_FAIL, payload),
  cancelInvitationRequest: (payload: { inviteHash: string }) =>
    createAction(OrganizationsActionTypes.CANCEL_INVITATION_REQUEST, payload),
  cancelInvitationSuccess: (payload) => createAction(OrganizationsActionTypes.CANCEL_INVITATION_SUCCESS, payload),
  cancelInvitationFail: (payload) => createAction(OrganizationsActionTypes.CANCEL_INVITATION_FAIL, payload),

  // SAML SSO
  updateSamlConfigurationRequest: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_REQUEST, payload),

  updateSamlConfigurationSuccess: (payload) =>
    createAction(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_SUCCESS, payload),

  updateSamlConfigurationFail: (error) => createAction(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_FAIL, error),

  deleteSamlConfigurationRequest: () => createAction(OrganizationsActionTypes.DELETE_SAML_CONFIGURATION_REQUEST),
  resetSamlConfigurationRequest: () => createAction(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_RESET),

  transferOwnerRequest: (payload) => createAction(OrganizationsActionTypes.TRANSFER_OWNER_REQUEST, payload),

  transferOwnerSuccess: (payload) => createAction(OrganizationsActionTypes.TRANSFER_OWNER_SUCCESS, payload),
  transferOwnerFail: (payload) => createAction(OrganizationsActionTypes.TRANSFER_OWNER_FAIL, payload),
  exportOrganizationMembersRequest: () => createAction(OrganizationsActionTypes.EXPORT_MEMBERS_REQUEST),
  exportOrganizationMembersSuccess: () => createAction(OrganizationsActionTypes.EXPORT_MEMBERS_SUCCESS),
};
