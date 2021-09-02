import { combineEpics } from 'redux-observable';

import {
  changePasswordEpic,
  changeEmailEpic,
  unregisterEpic,
  isAbleToUnregisterEpic,
  turnoffGoogleAuthenticatorEpic,
} from './accountEpic';
import {
  signinEpic,
  samlSigninInitiateEpic,
  samlSigninCallbackEpic,
  resendActivationMailEpic,
  activateAccountEpic,
  confirmEmailChangeEpic,
  verifyEmailEpic,
  verifyAuthenticationEpic,
  sendEmailVerificationMailEpic,
  recoverTwoFactorAuthenticationEpic,
  signupEpic,
  signoutEpic,
  forgotPasswordEpic,
  resetPasswordEpic,
  fetchInvitationEpic,
  oauthGoogleEpic,
  proveGreenLanternEpic,
} from './authenticationEpic';
import { fetchCardInfoEpic, saveBillingContactsEpic } from './billingEpic';
import { locationChangeEpic } from './configurationEpic';
import { showDialogsEpic, hideDialogsEpic } from './dialogsEpic';
import { fileSaveEpic } from './filesEpic';
import { addNotificationsEpic, addDesktopNotificationsEpic } from './notificationsEpic';
import {
  updateOrganizationEpic,
  updateOrganizationNameEpic,
  updateOrganizationSlugNameEpic,
  updateOrganizationMemberRoleEpic,
  deleteOrganizationMembersEpic,
  exportMembersList,
  inviteMemberEpic,
  updateSamlConfigurationEpic,
  deleteSamlConfigurationEpic,
  transferOwnerEpic,
} from './organizationsEpic';
import { sbConnectEpic, sbDisconnectEpic } from './sendbirdEpic';

export const commonEpics = combineEpics(
  // notifications
  addNotificationsEpic,
  addDesktopNotificationsEpic,
  // dialogs
  showDialogsEpic,
  hideDialogsEpic,
  // authentication
  signinEpic,
  samlSigninInitiateEpic,
  samlSigninCallbackEpic,
  resendActivationMailEpic,
  activateAccountEpic,
  confirmEmailChangeEpic,
  sendEmailVerificationMailEpic,
  verifyEmailEpic,
  verifyAuthenticationEpic,
  recoverTwoFactorAuthenticationEpic,
  signupEpic,
  signoutEpic,
  forgotPasswordEpic,
  resetPasswordEpic,
  fetchInvitationEpic,
  oauthGoogleEpic,
  proveGreenLanternEpic,
  // account
  changePasswordEpic,
  changeEmailEpic,
  unregisterEpic,
  isAbleToUnregisterEpic,
  turnoffGoogleAuthenticatorEpic,
  // billing
  fetchCardInfoEpic,
  saveBillingContactsEpic,
  // organization
  updateOrganizationEpic,
  updateOrganizationNameEpic,
  updateOrganizationSlugNameEpic,
  updateOrganizationMemberRoleEpic,
  deleteOrganizationMembersEpic,
  exportMembersList,
  inviteMemberEpic,
  updateSamlConfigurationEpic,
  deleteSamlConfigurationEpic,
  transferOwnerEpic,
  // configuration
  locationChangeEpic,
  // files
  fileSaveEpic,
  // sendbird
  sbConnectEpic,
  sbDisconnectEpic,
);
