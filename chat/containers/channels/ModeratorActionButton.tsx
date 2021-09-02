import { forwardRef } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, cssVariables, Icon, Subtitles } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog, useCurrentSdkUser } from '@hooks';
import { SDKUserAvatar } from '@ui/components';

const ModeratorNickname = styled.div`
  flex: 1;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 8px;
`;

export const ModeratorActionButton = forwardRef<HTMLButtonElement, { className?: string }>(({ className }, ref) => {
  const intl = useIntl();
  const { sdkUser, isFetched } = useCurrentSdkUser();
  const showDialog = useShowDialog();

  const handleButtonClick = () => {
    if (sdkUser) {
      showDialog({ dialogTypes: DialogType.UpdateSDKUser, dialogProps: { sdkUser } });
    } else {
      showDialog({ dialogTypes: DialogType.CreateSDKUser, dialogProps: {} });
    }
  };

  const arrow = (
    <Icon
      icon="input-arrow-down"
      size={20}
      color={cssVariables('neutral-9')}
      css={`
        margin-left: 4px;
      `}
    />
  );

  if (!isFetched) {
    return null;
  }

  return (
    <Button
      className={className}
      onClick={handleButtonClick}
      buttonType="primary"
      variant="ghost"
      size="small"
      css={`
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 184px;
        padding-left: 8px;
        padding-right: 4px;
      `}
      ref={ref}
    >
      {sdkUser ? (
        <>
          <SDKUserAvatar userID={sdkUser.user_id} size={20} imageUrl={sdkUser.profile_url} />
          <ModeratorNickname>{sdkUser.nickname}</ModeratorNickname>
          {arrow}
        </>
      ) : (
        <>
          <Icon icon="avatar-dotted" size={20} color={cssVariables('neutral-6')} />
          <ModeratorNickname
            css={`
              color: ${cssVariables('neutral-6')};
            `}
          >
            {intl.formatMessage({ id: 'chat.moderationTool.btn.createModerator' })}
          </ModeratorNickname>
          {arrow}
        </>
      )}
    </Button>
  );
});
