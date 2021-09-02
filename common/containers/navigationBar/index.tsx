import React, { MouseEventHandler, useContext } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { DownshiftProps } from 'downshift';
import {
  GlobalNavigationBar,
  GNBOverflowMenu,
  GNBIconButton,
  Icon,
  cssVariables,
  generateButtonContainerStyle,
  toast,
} from 'feather';
import moment from 'moment-timezone';

import { commonActions, coreActions } from '@actions';
import { commonApi } from '@api';
import { OrganizationSettingMenu, CLOUD_FRONT_URL } from '@constants';
import { useCanEnterApplication } from '@hooks';
import useAuthentication from '@hooks/useAuthentication';
import { useAuthorization } from '@hooks/useAuthorization';
import { useOrganizationMenu } from '@hooks/useOrganizationMenu';
import { Tooltip, DrawerContext } from '@ui/components';

import { useCurrentChatSubscription } from '../CurrentChatSubscriptionProvider';
import { DialogType } from '../dialogs/DialogType';
import { WhatsNew, loadEntries, drawerID as whatsNewDrawerID } from './WhatsNew';
import { GNBApplicationDropdown } from './gnbApplicationDropdown';

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
  currentUser: state.auth.user,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  changeApplicationRequest: coreActions.changeApplicationRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

export type DropdownMenu = 'applications' | 'resources' | 'account';

const EndButtons = styled.div`
  display: grid;
  grid-gap: 4px;
  grid-auto-flow: column;
`;

const GNBOuterLinks = styled.div`
  display: flex;
  align-items: center;
  svg {
    margin-left: 8px;
    fill: ${cssVariables('neutral-6')};
  }
`;

const SubscriptionButtons = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

const FreeTrialDescription = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  img {
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
  u {
    margin: 0 4px;
  }
`;

const FreeTrialButton = styled.button`
  ${generateButtonContainerStyle({
    contentColor: cssVariables('purple-8'),
    disabledContentColor: cssVariables('purple-7'),
    bgColor: '#38ffff',
    hoverBgColor: '#8dffff',
    activeBgColor: '#8dffff',
    disabledBgColor: cssVariables('purple-4'),
    borderColor: '#38ffff',
    hoverBorderColor: '#8dffff',
    activeBorderColor: '#8dffff',
    disabledBorderColor: cssVariables('purple-4'),
    focusOutlineColor: '#38ffff',
  })}

  display: flex;
  flex-direction: row;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.54;
  letter-spacing: -0.09px;
`;

const whatsNewEntries = loadEntries();

export const NavigationBarConnectable: React.FC<Props> = ({
  organization,
  changeApplicationRequest,
  showDialogsRequest,
  currentUser,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const { authenticated, isOrganizationDeactivated } = useAuthentication();
  const { isPermitted } = useAuthorization();
  const { openDrawer, closeDrawer, activeDrawerID } = useContext(DrawerContext);
  const { isLoading: isLoadingSubscription, isSelfService, currentSubscription } = useCurrentChatSubscription();

  const canEnterApplication = useCanEnterApplication();
  const permittedOrganizationMenuKeys = useOrganizationMenu(organization.uid);

  const onApplicationDropdownSelected = (application: Application) => {
    if (canEnterApplication) {
      changeApplicationRequest(application);
    }
  };

  const onCreateAppButtonClick: MouseEventHandler = () => {
    showDialogsRequest({
      dialogTypes: DialogType.CreateApp,
      dialogProps: {
        organization,
      },
    });
  };

  const handleContactUsClick = () => {
    history.push('/settings/contact_us');
  };

  if (!authenticated) {
    return null;
  }

  const permittedOrganizationMenus = (permittedOrganizationMenuKeys.length > 0
    ? [
        {
          label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.general' }),
          href: '/settings',
          useReactRouterLink: true,
        },
      ]
    : []
  ).concat(
    [
      {
        key: OrganizationSettingMenu.usage,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.usage' }),
        href: '/settings/usage',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.applications,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.applications' }),
        href: '/settings/applications',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.members,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.members' }),
        href: '/settings/members',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.roles,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.roles' }),
        href: '/settings/roles',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.billing,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.billing' }),
        href: '/settings/billing',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.security,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.security' }),
        href: '/settings/security',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.contactUs,
        label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.contactUs' }),
        href: '/settings/contact_us',
        useReactRouterLink: true,
      },
      {
        key: OrganizationSettingMenu.community,
        label: (
          <GNBOuterLinks>
            {intl.formatMessage({ id: 'common.gnb.outerPages.label.community' })}
            <Icon icon="open-in-new" size={16} />
          </GNBOuterLinks>
        ) as any,
        href: 'https://community.sendbird.com',
        useReactRouterLink: false,
        target: '_blank',
      },
      {
        key: 'ff' as any,
        label: 'Feature flags',
        href: '/settings/ff',
        useReactRouterLink: true,
      },
    ].filter((item) => permittedOrganizationMenuKeys.includes(item.key)),
  );

  const onWhatsNewButtonClick = () => {
    openDrawer(whatsNewDrawerID);
  };

  const onGNBDropdownMenuStateChange: DownshiftProps<any>['onStateChange'] = (options) => {
    if (options.isOpen) {
      closeDrawer();
    }
  };

  const isWhatsNewPromoted = whatsNewEntries.length > 0 && moment().diff(whatsNewEntries[0].date, 'day') < 7;

  const handleFreeTrialClick = () => {
    if (isPermitted(['organization.general.all'])) {
      history.push('/settings/general/plans/chat', { goBackTo: history.location.pathname });
    } else {
      toast.warning({ message: intl.formatMessage({ id: 'common.gnb.subscriptionButtons.freeTrial.warning' }) });
    }
  };

  return (
    <>
      <GlobalNavigationBar
        className="tourTargetGNB"
        logoHref={{ url: '/', useReactRouterLink: true }}
        user={{
          name: currentUser.nickname,
          email: currentUser.email,
          profileImageURL: currentUser.profile_url,
        }}
        organization={{
          name: organization.name,
          key: intl.formatMessage(
            { id: 'common.gnb.orgAccount.label.orgSubtitle' },
            {
              current: organization.total_applications,
            },
          ),
        }}
        organizationMenus={permittedOrganizationMenus}
        userMenus={[
          {
            label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.account.settings' }),
            href: '/account',
            useReactRouterLink: true,
          },
          {
            label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.account.security' }),
            href: '/account/security',
            useReactRouterLink: true,
          },
          {
            label: intl.formatMessage({ id: 'common.gnb.orgAccount.label.signOut' }),
            onClick: async () => {
              await commonApi.signOut();
              history.push('/auth/signout');
            },
            useDivider: true,
          },
        ]}
        startButtonNode={
          !isOrganizationDeactivated && (
            <GNBApplicationDropdown
              onItemSelected={onApplicationDropdownSelected}
              isSelectionDisabled={!canEnterApplication}
              onCreateAppButtonClick={onCreateAppButtonClick}
            />
          )
        }
        endButtonNode={
          <EndButtons>
            {isSelfService && !isLoadingSubscription && currentSubscription && (
              <SubscriptionButtons>
                {currentSubscription.subscription_name === 'free_trial' && (
                  <>
                    <FreeTrialDescription>
                      <img src={`${CLOUD_FRONT_URL}/dashboard/img-gnb-rocket@3x.png`} alt="" />
                      {intl.formatMessage(
                        { id: 'common.gnb.subscriptionButtons.freeTrial.description' },
                        {
                          u: (text) => <u>{text}</u>,
                          days: moment(currentSubscription?.end_date)
                            .add('day', 1)
                            .startOf('day')
                            .diff(moment().startOf('day'), 'days'),
                        },
                      )}
                    </FreeTrialDescription>
                    <FreeTrialButton onClick={handleFreeTrialClick}>Upgrade</FreeTrialButton>
                  </>
                )}
              </SubscriptionButtons>
            )}
            {permittedOrganizationMenuKeys.includes(OrganizationSettingMenu.contactUs) && (
              <Tooltip
                target={<GNBIconButton icon="support" onClick={handleContactUsClick} aria-pressed={false} />}
                content="Contact us"
                placement="bottom"
              />
            )}
            {!isOrganizationDeactivated && (
              <Tooltip
                target={
                  <GNBIconButton
                    icon="gift"
                    onClick={onWhatsNewButtonClick}
                    aria-pressed={activeDrawerID === whatsNewDrawerID}
                    isNotificationDotVisible={isWhatsNewPromoted}
                  />
                }
                content="What's new"
                placement="bottom"
              />
            )}
            <GNBOverflowMenu
              onStateChange={onGNBDropdownMenuStateChange}
              iconButtonProps={{ id: 'btn-resource', icon: 'question' } as any}
              items={[
                {
                  label: (
                    <GNBOuterLinks>
                      {intl.formatMessage({ id: 'common.gnb.outerPages.label.docs' })}
                      <Icon icon="open-in-new" size={16} />
                    </GNBOuterLinks>
                  ) as any,
                  href: 'https://sendbird.com/docs',
                  target: '_blank',
                },
                {
                  label: (
                    <GNBOuterLinks>
                      {intl.formatMessage({ id: 'common.gnb.outerPages.label.helpCenter' })}
                      <Icon icon="open-in-new" size={16} />
                    </GNBOuterLinks>
                  ) as any,
                  href: 'https://help.sendbird.com',
                  target: '_blank',
                },
                {
                  label: (
                    <GNBOuterLinks>
                      {intl.formatMessage({ id: 'common.gnb.outerPages.label.community' })}
                      <Icon icon="open-in-new" size={16} />
                    </GNBOuterLinks>
                  ) as any,
                  href: 'https://community.sendbird.com',
                  target: '_blank',
                },
              ]}
            />
          </EndButtons>
        }
        userDropdownDownshiftProps={{ onStateChange: onGNBDropdownMenuStateChange }}
      />
      <WhatsNew />
    </>
  );
};

export const NavigationBar = connect(mapStateToProps, mapDispatchToProps)(NavigationBarConnectable);
