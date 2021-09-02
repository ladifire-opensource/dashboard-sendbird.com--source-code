import { FC } from 'react';

import { LinkVariant } from 'feather';

import { useAppId } from '@hooks';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LinkWithPermissionCheck } from '@ui/components';
import { PropsOf } from '@utils';

type Props = Omit<PropsOf<typeof LinkWithPermissionCheck>, 'permissions' | 'variant' | 'href' | 'useReactRouter'>;

export const FeatureSettingLink: FC<Props> = (props) => {
  const appId = useAppId();
  return (
    <LinkWithPermissionCheck
      {...props}
      permissions={['application.settings.view', 'application.settings.all']}
      variant={LinkVariant.Inline}
      href={`/${appId}/settings/features`}
      useReactRouter={true}
    />
  );
};

export const PlanUpgradeLink: FC<Props> = (props) => {
  return (
    <LinkWithPermissionCheck
      {...props}
      permissions={['organization.general.view', 'organization.general.all']}
      variant={LinkVariant.Inline}
      href="/settings/general"
      useReactRouter={true}
    />
  );
};

export const ContactSalesLink: FC<Props> = (props) => {
  return (
    <LinkWithPermissionCheck
      {...props}
      permissions={CONTACT_US_ALLOWED_PERMISSIONS}
      variant={LinkVariant.Inline}
      href="/settings/contact_us?category=sales_inquiry"
      useReactRouter={true}
    />
  );
};
