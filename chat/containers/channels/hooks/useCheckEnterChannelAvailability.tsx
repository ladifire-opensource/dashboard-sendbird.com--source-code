import { useCallback, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useCurrentSdkUser, useShowDialog } from '@hooks';

import { FeatureSettingLink, PlanUpgradeLink, ContactSalesLink } from '../PlanErrorResolutionLink';
import { useModerationToolAvailability, ModerationToolAvailability } from './useModerationToolAvailability';

type CheckEnterChannelAvailability = (options: { onSuccess: () => void }) => void;

const Bold = styled.b`
  font-weight: 600;
`;

export const useModeratorRequiredToEnterChannelDialog = () => {
  const intl = useIntl();
  const showCreateModeratorDialog = useShowDialog({ dialogTypes: DialogType.CreateSDKUser, dialogProps: {} });

  return useShowDialog({
    dialogTypes: DialogType.Custom,
    dialogProps: {
      size: 'small',
      title: intl.formatMessage({ id: 'chat.channelList.moderatorRequiredToEnterChannelDialog.title' }),
      description: intl.formatMessage({ id: 'chat.channelList.moderatorRequiredToEnterChannelDialog.body' }),
      positiveButtonProps: {
        text: intl.formatMessage({ id: 'chat.channelList.moderatorRequiredToEnterChannelDialog.btn.createModerator' }),
        onClick: () => showCreateModeratorDialog(),
        preventClose: true,
      },
      isNegativeButtonHidden: true,
    },
  });
};

export const useCheckEnterChannelAvailability = (channelType: ChannelType): CheckEnterChannelAvailability => {
  const intl = useIntl();
  const { sdkUser, isFetched: isSdkUserFetched } = useCurrentSdkUser();
  const featureAvailability = useModerationToolAvailability(channelType);
  const moderatorExists = isSdkUserFetched && sdkUser;
  const canEnterChannel = featureAvailability === ModerationToolAvailability.Available && moderatorExists;
  const showDialog = useShowDialog();
  const dispatch = useDispatch();

  const showModeratorRequiredToEnterChannelDialog = useModeratorRequiredToEnterChannelDialog();
  const showCannotOpenChannelDialog = useCallback(
    ({ title, body }: { title: string; body: ReactNode }) => {
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          size: 'small',
          title,
          description: body,
          positiveButtonProps: {
            text: intl.formatMessage({ id: 'chat.channelList.cannotOpenChannelDialog.btn.confirm' }),
          },
          isNegativeButtonHidden: true,
        },
      });
    },
    [intl, showDialog],
  );
  const closeDialog = useCallback(() => dispatch(commonActions.hideDialogsRequest()), [dispatch]);

  return useCallback(
    ({ onSuccess }) => {
      if (canEnterChannel) {
        onSuccess();
        return;
      }
      switch (featureAvailability) {
        case ModerationToolAvailability.Available:
          showModeratorRequiredToEnterChannelDialog();
          break;

        case ModerationToolAvailability.FeatureOff:
          showCannotOpenChannelDialog({
            title: intl.formatMessage({ id: 'chat.channelList.cannotOpenChannelDialog.featureOff.title' }),
            body: intl.formatMessage(
              { id: 'chat.channelList.cannotOpenChannelDialog.featureOff.body' },
              {
                b: (text: string) => <Bold>{text}</Bold>,
                featuresettinglink: (text: string) => (
                  <FeatureSettingLink
                    onClick={closeDialog} // close the dialog as we navigate to another page
                  >
                    {text}
                  </FeatureSettingLink>
                ),
              },
            ),
          });
          break;

        case ModerationToolAvailability.NotSupported:
          showCannotOpenChannelDialog({
            title: intl.formatMessage({ id: 'chat.channelList.cannotOpenChannelDialog.notSupported.title' }),
            body: intl.formatMessage(
              { id: 'chat.channelList.cannotOpenChannelDialog.notSupported.body' },
              {
                b: (text: string) => <Bold>{text}</Bold>,
                planupgradelink: (text: string) => (
                  <PlanUpgradeLink
                    onClick={closeDialog} // close the dialog as we navigate to another page
                  >
                    {text}
                  </PlanUpgradeLink>
                ),
              },
            ),
          });
          break;

        case ModerationToolAvailability.V1OrgUnavailable:
          showCannotOpenChannelDialog({
            title: intl.formatMessage({ id: 'chat.channelList.cannotOpenChannelDialog.v1OrgUnavailable.title' }),
            body: intl.formatMessage(
              { id: 'chat.channelList.cannotOpenChannelDialog.v1OrgUnavailable.body' },
              {
                b: (text: string) => <Bold>{text}</Bold>,
                contactsaleslink: (text: string) => (
                  <ContactSalesLink
                    onClick={closeDialog} // close the dialog as we navigate to another page
                  >
                    {text}
                  </ContactSalesLink>
                ),
              },
            ),
          });
          break;

        default:
          break;
      }
    },
    [
      canEnterChannel,
      closeDialog,
      featureAvailability,
      intl,
      showCannotOpenChannelDialog,
      showModeratorRequiredToEnterChannelDialog,
    ],
  );
};
