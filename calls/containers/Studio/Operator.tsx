import { FC, ReactNode, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  Body,
  Button,
  cssVariables,
  Icon,
  InlineNotification,
  Lozenge,
  LozengeVariant,
  OverflowMenu,
  OverflowMenuItem,
  Spinner,
  Subtitles,
  Tag,
  TooltipVariant,
} from 'feather';

import Copyable from '@calls/components/Copyable';
import { EMPTY_TEXT } from '@constants';
import { useAuthorization } from '@hooks';
import { SDKUserAvatar } from '@ui/components';

import {
  useCreateUserDialog,
  useReactivateUserDialog,
  useUnregisterUserDialog,
  useUpdateSDKUserDialog,
} from './dialogs/phoneboothUserDialogs';
import { usePhoneboothUser } from './dialogs/usePhoneboothUser';

const Datalist = styled.datalist`
  display: grid;
  grid-template-columns: 64px auto;
  grid-gap: 16px;
  ${Body['body-short-01']}

  dt {
    color: ${cssVariables('neutral-7')};
  }
`;

const Nickname = styled.span`
  ${Subtitles['subtitle-03']}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: flex-start;

  > * + * {
    margin-left: 4px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${cssVariables('neutral-5')};
  width: 64px;
  height: 64px;
`;

const NoUserWrapper = styled.div`
  display: flex;
  align-items: center;

  ${IconWrapper} {
    margin-right: 16px;
  }
`;

const ProfileWrapper = styled.div`
  display: grid;
  grid-template-areas:
    'avatar nickname dropdown'
    'avatar tags tags';
  grid-template-rows: auto 1fr;
  grid-template-columns: min-content 1fr min-content;
  grid-gap: 4px 16px;

  > ${SDKUserAvatar}, > ${IconWrapper} {
    grid-area: avatar;
  }

  > ${Nickname} {
    grid-area: nickname;
    align-self: center;
  }

  > [role='combobox'] {
    grid-area: dropdown;

    > button > svg {
      fill: ${cssVariables('neutral-9')};
    }
  }

  > ${TagsContainer} {
    grid-area: tags;
  }
`;

const Layout = styled.section`
  ${ProfileWrapper} + ${Datalist} {
    margin-top: 12px;
  }

  > [role='progressbar'] {
    margin: auto;
    min-height: 96px;
  }
`;

const Error: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="error"
      message={message}
      action={{ label: intl.formatMessage({ id: 'calls.studio.new.operator.error.retry' }), onClick: onRetry }}
    />
  );
};

const AvatarPlaceholder = () => (
  <IconWrapper>
    <Icon icon="user" size={36} color="white" />
  </IconWrapper>
);

const NoUser: FC<{ onAddButtonClick: () => void }> = ({ onAddButtonClick }) => {
  const intl = useIntl();
  return (
    <NoUserWrapper>
      <AvatarPlaceholder />
      <Button variant="ghost" buttonType="primary" size="small" icon="plus" onClick={onAddButtonClick}>
        {intl.formatMessage({ id: 'calls.studio.new.operator.addOperator' })}
      </Button>
    </NoUserWrapper>
  );
};

const Profile: FC<{
  userId: string;
  nickname?: string;
  profileUrl?: string;
  isActive?: boolean;
  action?: ReactNode;
}> = ({ userId, nickname, profileUrl, action, isActive }) => {
  const intl = useIntl();

  return (
    <>
      <ProfileWrapper>
        <SDKUserAvatar size={64} userID={userId} imageUrl={profileUrl} />
        <Nickname>
          {intl.formatMessage({ id: 'calls.studio.new.operator.profile.nickname' }, { value: nickname || EMPTY_TEXT })}
        </Nickname>
        {action}
        <TagsContainer>
          <Tag>{intl.formatMessage({ id: 'calls.studio.new.operator.profile.tags.operator' })}</Tag>
          {!isActive && (
            <Lozenge variant={LozengeVariant.Light} color="neutral">
              {intl.formatMessage({ id: 'calls.studio.new.operator.profile.tags.deactivated' })}
            </Lozenge>
          )}
        </TagsContainer>
      </ProfileWrapper>
      <Datalist>
        <dt>{intl.formatMessage({ id: 'calls.studio.new.operator.profile.userId' })}</dt>
        <dd>
          <Copyable>{userId}</Copyable>
        </dd>
      </Datalist>
    </>
  );
};

const Operator = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const hasReactivatePermission = isPermitted(['application.users.all']);
  const { status, user, loadUser, errorMessage } = usePhoneboothUser();
  const openUpdateUserDialog = useUpdateSDKUserDialog();
  const openReactivateUserDialog = useReactivateUserDialog();
  const openCreateUserDialog = useCreateUserDialog();
  const openUnregisterUserDialog = useUnregisterUserDialog();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const renderContent = () => {
    if (!user) {
      return <NoUser onAddButtonClick={openCreateUserDialog} />;
    }
    return (
      <Profile
        userId={user.userId}
        nickname={user.nickname}
        profileUrl={user.profileUrl}
        isActive={user.isActive}
        action={
          <OverflowMenu
            items={
              [
                {
                  label: intl.formatMessage({ id: 'calls.studio.new.operator.profile.edit' }),
                  onClick: () => openUpdateUserDialog(user),
                },
                {
                  label: intl.formatMessage({ id: 'calls.studio.new.operator.profile.remove' }),
                  onClick: () => openUnregisterUserDialog(user.userId),
                },
                !user.isActive && {
                  label: intl.formatMessage({ id: 'calls.studio.new.operator.profile.reactivate' }),
                  onClick: () => openReactivateUserDialog({ user, onSuccess: loadUser }),
                  ...(!hasReactivatePermission && {
                    disabled: true,
                    tooltip: {
                      variant: TooltipVariant.Light,
                      tooltipContentStyle: 'width: max-content; max-width: 256px;',
                      content: intl.formatMessage({ id: 'calls.studio.new.operator.profile.reactivate.tooltip' }),
                    },
                  }),
                },
              ].filter(Boolean) as OverflowMenuItem[]
            }
          />
        }
      />
    );
  };

  return (
    <Layout data-test-id="Operator">
      {status === 'loading' && <Spinner size={24} />}
      {status === 'error' && errorMessage && <Error message={errorMessage} onRetry={loadUser} />}
      {status === 'success' && renderContent()}
    </Layout>
  );
};

export default Operator;
