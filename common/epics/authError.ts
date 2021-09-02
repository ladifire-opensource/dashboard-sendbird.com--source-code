import { getErrorMessage } from '../../epics/generateBadRequest';

export enum AuthErrorCode {
  organizationSsoEnforced = 'type.auth.general.organization.sso_enforced',
  ssoOrganizationJitProvisioningDisabled = 'type.auth.sso.organization.jit_provisioning_disabled',
  ssoOrganizationNotFound = 'type.auth.sso.organization.not_found',
  ssoUserActivationMailSent = 'type.auth.sso.user.activation_mail_sent',
  ssoUserUnactivated = 'type.auth.sso.user.unactivated',
  ssoUserMemberOfOtherOrganization = 'type.auth.sso.user.member_of_other_organization',
  ssoEmailAddressNotFound = 'type.auth.sso.email_address.not_found',
}

export class AuthError {
  constructor(readonly code?: AuthErrorCode, readonly message?: string, readonly data?: {}) {}

  static fromAny(object: any) {
    // if object is an error response returned from axios, find code and data
    const code = object && object.data && object.data.code;
    let data;
    if (object && object.data) {
      data = { ...object.data };
      delete data.code;
      delete data.detail;
      delete data.message;

      if (Object.keys(data).length === 0) {
        data = undefined;
      }
    }

    return new AuthError(code, getErrorMessage(object), data);
  }
}
