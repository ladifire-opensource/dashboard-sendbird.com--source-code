import { OrganizationSettingMenu, Page } from '@constants';

import { useAuthorization } from './useAuthorization';

/**
 * List organization uids on the production environment only.
 * On the staging environment, feature flags menu will be visible regardless of organization.
 */
const featureFlagsYongganOrganizations = Object.freeze([
  '7e22314a1ed6d706f37f4c506423b6f12afcaa99', // Voice & Video Engineering team
  '874f0613feacfbe5cf29e79718ab0f70eff7c4a7', // e2e production
  'a3a48d45fffd5a8a397602621589ca9cf19b8af5', // Calls war room
  '62957a8dd44b319517fe56a9f1a219a8e1ca9782', // Sendbird-BC (Solutions engineer)
  'ce2565f49dc4bf963a824521567f29e4db6fec25', // Sendbird Demo (Super organization)
]);

/**
 * FIXME: lets migrate into organization.support.all
 * `view` permission will be added after contact history
 * general.all, billing.all user should allowed to visit contact us page to submit ticket
 */
export const CONTACT_US_ALLOWED_PERMISSIONS: PermissionKey[] = [
  'support.technical',
  'organization.general.all',
  'organization.billing.all',
];

export const useOrganizationMenu = (uid: string): OrganizationSettingMenu[] => {
  const { isPermitted, isAccessiblePage, isSelfService } = useAuthorization();
  const menus: OrganizationSettingMenu[] = [];
  if (isPermitted(['organization.general.all', 'organization.general.view'])) {
    menus.push(OrganizationSettingMenu.general);
  }
  if (isPermitted(['organization.usage.all', 'organization.usage.view']) && isSelfService) {
    menus.push(OrganizationSettingMenu.usage);
  }
  if (isPermitted(['organization.applications.all', 'organization.applications.view'])) {
    menus.push(OrganizationSettingMenu.applications);
  }
  if (isPermitted(['organization.members.all', 'organization.members.view'])) {
    menus.push(OrganizationSettingMenu.members);
  }
  if (isPermitted(['organization.roles.all', 'organization.roles.view'])) {
    menus.push(OrganizationSettingMenu.roles);
  }
  if (isPermitted(['organization.billing.all', 'organization.billing.view'])) {
    menus.push(OrganizationSettingMenu.billing);
  }
  if (isPermitted(['organization.security.all', 'organization.security.view'])) {
    menus.push(OrganizationSettingMenu.security);
  }

  if (isPermitted(CONTACT_US_ALLOWED_PERMISSIONS)) {
    menus.push(OrganizationSettingMenu.contactUs);
  }
  if (isAccessiblePage(Page.organization)) {
    menus.push(OrganizationSettingMenu.community);
  }
  if (featureFlagsYongganOrganizations.includes(uid) || process.env.BUILD_MODE === 'staging') {
    menus.push('ff' as any);
  }
  return menus;
};
