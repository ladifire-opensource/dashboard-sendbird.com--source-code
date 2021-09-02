import React, { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { Body, Button, cssVariables, InputText, Lozenge, Subtitles, toast } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { fetchUserSummary } from '@calls/api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard, SettingsGridGroup } from '@common/containers/layout';
import { EMPTY_TEXT, TIME_DATE_FORMAT } from '@constants';
import { editUser, fetchUser, fetchUserPushTokens } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAsync, useAuthorization, useErrorToast, useIsCallsEnabled } from '@hooks';
import { ChevronLink, ConnectionLabel, PageContainer, PageHeader, SDKUserAvatar } from '@ui/components';
import { camelCaseKeys } from '@utils';

import { UserDetailGroupChannelCount } from './UserDetailGroupChannelCount';
import { UserDetailOperator } from './UserDetailOperator';
import { useDeleteUserPushTokens } from './useDeleteUserPushTokens';

const PushTokensContainer = styled.ul`
  position: relative;

  > *:not(:last-child) {
    margin-bottom: 18px;
  }
`;

const PlatformLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 6px;
`;

const PushTokenID = styled(InputText).attrs({
  readOnly: true,
})``;

const PushTokenListWrapper = styled.div`
  display: flex;
  flex-direction: column;

  // override margin between inputs
  & > *:not(${PlatformLabel}) + *:not(${PlatformLabel}) {
    margin-top: 8px;
  }
`;

type UserPushTokensProps = {
  appId: Application['app_id'];
  userId: User['userId'];
  product: 'messaging' | 'calls';
};

const PushTokenItem: FC<{ token: string; isPendingDeleted: boolean; onDelete: (token: string) => void }> = ({
  token,
  isPendingDeleted,
  onDelete,
}) => {
  return (
    <PushTokenID
      role="listitem"
      value={token}
      icons={[
        {
          icon: 'copy' as const,
          title: 'Copy',
          onClick: () => {
            copy(token);
            toast.success({ message: 'Copied' });
          },
        },
        {
          icon: 'delete' as const,
          title: 'Delete',
          isLoading: isPendingDeleted,
          disabled: isPendingDeleted,
          onClick: () => onDelete(token),
        },
      ]}
    />
  );
};

const UserPushTokens: FC<UserPushTokensProps> = ({ appId, userId, product }) => {
  const intl = useIntl();
  const [pushTokens, setPushTokens] = useState<Record<'android' | 'ios' | 'huawei', string[]>>({
    android: [],
    ios: [],
    huawei: [],
  });
  const [isFetching, setIsFetching] = useState(false);

  const {
    handleDeleteButtonClick: handleDeletePushTokenButtonClick,
    pendingPushTokens: pendingDeletedPushTokens,
  } = useDeleteUserPushTokens({
    appId,
    userId,
    onTokenDeleted: ({ token, tokenType }) => {
      if (tokenType.includes('apns')) {
        setPushTokens((tokens) => ({ ...tokens, ios: tokens.ios.filter((item) => item !== token) }));
        return;
      }
      setPushTokens((tokens) => ({ ...tokens, android: tokens.android.filter((item) => item !== token) }));
    },
  });

  useEffect(() => {
    setIsFetching(true);
    Promise.all(
      product === 'messaging'
        ? [
            fetchUserPushTokens({ appId, userId, tokenType: 'gcm' }),
            fetchUserPushTokens({ appId, userId, tokenType: 'apns' }),
            fetchUserPushTokens({ appId, userId, tokenType: 'huawei' }),
          ]
        : [
            fetchUserPushTokens({ appId, userId, tokenType: 'fcm_voip' }),
            fetchUserPushTokens({ appId, userId, tokenType: 'apns_voip' }),
          ],
    )
      .then(([android, ios, huawei]) => {
        setIsFetching(false);
        setPushTokens({ android: android.data.tokens, ios: ios.data.tokens, huawei: huawei?.data?.tokens ?? [] });
      })
      .catch((error) => {
        setIsFetching(false);
        toast.error({ message: getErrorMessage(error) });
      });
  }, [appId, userId, product]);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken' })}
      titleColumns={4}
      isFetchingBody={isFetching}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <PushTokensContainer>
        <PushTokenListWrapper>
          <PlatformLabel>
            {intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_android' })}
          </PlatformLabel>
          {pushTokens.android.length > 0 ? (
            pushTokens.android.map((token) => {
              return (
                <PushTokenItem
                  key={token}
                  token={token}
                  onDelete={(token) =>
                    handleDeletePushTokenButtonClick({
                      tokenType: product === 'messaging' ? 'gcm' : 'fcm_voip',
                      token,
                    })
                  }
                  isPendingDeleted={pendingDeletedPushTokens.some(
                    (item) => item.tokenType.match(/fcm|gcm/) && item.token === token,
                  )}
                />
              );
            })
          ) : (
            <PushTokenID
              value={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_android.empty' })}
            />
          )}
        </PushTokenListWrapper>

        <PushTokenListWrapper>
          <PlatformLabel>{intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_ios' })}</PlatformLabel>
          {pushTokens.ios.length > 0 ? (
            pushTokens.ios.map((token) => {
              return (
                <PushTokenItem
                  key={token}
                  token={token}
                  onDelete={(token) =>
                    handleDeletePushTokenButtonClick({
                      tokenType: product === 'messaging' ? 'apns' : 'apns_voip',
                      token,
                    })
                  }
                  isPendingDeleted={pendingDeletedPushTokens.some(
                    (item) => item.tokenType.includes('apns') && item.token === token,
                  )}
                />
              );
            })
          ) : (
            <PushTokenID value={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_ios.empty' })} />
          )}
        </PushTokenListWrapper>

        {product === 'messaging' && (
          <PushTokenListWrapper>
            <PlatformLabel>
              {intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_huawei' })}
            </PlatformLabel>
            {pushTokens.huawei.length > 0 ? (
              pushTokens.huawei.map((token) => {
                return (
                  <PushTokenItem
                    key={token}
                    token={token}
                    onDelete={(token) =>
                      handleDeletePushTokenButtonClick({
                        tokenType: 'huawei',
                        token,
                      })
                    }
                    isPendingDeleted={pendingDeletedPushTokens.some(
                      (item) => item.tokenType === 'huawei' && item.token === token,
                    )}
                  />
                );
              })
            ) : (
              <PushTokenID
                value={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.pushToken_huawei.empty' })}
              />
            )}
          </PushTokenListWrapper>
        )}
      </PushTokensContainer>
    </SettingsGridCard>
  );
};

const TotalCallsWrapper = styled.div`
  p {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: -0.1px;
    color: ${cssVariables('neutral-10')};
  }

  .separator {
    display: inline-block;
    width: 1px;
    height: 16px;
    margin: 0 12px;
    background: ${cssVariables('neutral-6')};
  }
`;

const UserActiveStatusLozenge = styled(Lozenge)`
  margin-left: 8px;
`;

const ActionButtonsContainer = styled.div`
  > button:first-child {
    margin-right: 8px;
  }
`;

const UserInfoCategory = styled.div`
  margin-top: 32px;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.33;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-7')};
`;

const UserDetailContentContainer = styled(PageContainer)`
  max-width: 1024px;
  margin-bottom: 56px;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  line-height: 1.43;
`;

const ProfileImage = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  margin-right: 8px;
`;

const ProfileFieldWrapper = styled.div`
  display: flex;
  flex-direction: row;

  & > div:last-child {
    flex: 1;
  }
`;

const AccessTokenFieldWrapper = styled.div`
  display: flex;
  flex-direction: row;

  & > div:first-child {
    flex: 1;
  }
`;

const UserStatusConnectionLabel = styled(ConnectionLabel)`
  width: 8px;
  height: 8px;
  margin-right: 8px;
  vertical-align: baseline;
`;

type UserCallsSummaryProps = {
  appId: Application['app_id'];
  userId: User['userId'];
  userIsActive: User['isActive'];
  pushEnabled: boolean;
};

const CallsSummaryFields = styled.ul`
  display: grid;

  > dt {
    display: flex;
    align-items: center;
    ${Subtitles['subtitle-01']}

    > a {
      margin-left: 8px;
    }
  }
  > hr {
    border: none;
    height: 1px;
    margin: 24px 0;
    background: ${cssVariables('neutral-3')};
  }

  > dd {
    ${Body['body-short-01']}
    margin-top: 16px;
  }
`;

const UserCallsSummary: FC<UserCallsSummaryProps> = React.memo(({ appId, userId, userIsActive, pushEnabled }) => {
  const intl = useIntl();
  const [{ data: callSummary, status, error }, fetch] = useAsync(async () => {
    const { data } = await fetchUserSummary(appId, userId);
    return camelCaseKeys(data);
  }, [appId, userId]);

  const isLoading = status === 'loading';

  useEffect(() => {
    fetch();
  }, [fetch]);

  useErrorToast(error);

  return (
    <>
      <UserInfoCategory>{intl.formatMessage({ id: 'core.user_detail.callsActivity.title' })}</UserInfoCategory>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.callsActivity.directCalls.title' })}
          titleColumns={4}
          isFetchingBody={isLoading}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <CallsSummaryFields>
            <dt>{intl.formatMessage({ id: 'core.user_detail.callsActivity_field.lastCalledAt' })}</dt>
            <dd>
              {callSummary?.lastCall ? moment(callSummary.lastCall.startedAt).format(TIME_DATE_FORMAT) : EMPTY_TEXT}
            </dd>
            <hr />
            <dt>
              {intl.formatMessage({ id: 'core.user_detail.callsActivity_field.numberOfCalls' })}
              {callSummary && (
                <ChevronLink href={`/${appId}/calls/direct-calls?user_id=${userId}&status=ended`}>
                  {intl.formatMessage(
                    { id: 'core.user_detail.callsActivity_field.numberOfCalls.number' },
                    { number: callSummary.callCount.total },
                  )}
                </ChevronLink>
              )}
            </dt>
            <dd>
              {callSummary?.callCount.total > 0 ? (
                <TotalCallsWrapper>
                  {intl.formatMessage(
                    { id: 'core.user_detail.callsActivity_field.numberOfCalls.number.outgoing' },
                    { number: callSummary.callCount.directCall.caller },
                  )}
                  <span className="separator" />
                  {intl.formatMessage(
                    { id: 'core.user_detail.callsActivity_field.numberOfCalls.number.incoming' },
                    { number: callSummary.callCount.directCall.callee },
                  )}
                </TotalCallsWrapper>
              ) : (
                EMPTY_TEXT
              )}
            </dd>
          </CallsSummaryFields>
        </SettingsGridCard>
        {pushEnabled && userIsActive && <UserPushTokens appId={appId} userId={userId} product="calls" />}
      </SettingsGridGroup>
    </>
  );
});

export const UserDetail: FC = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const { appId, organizationUid, pushEnabled } = useSelector<
    RootState,
    { appId: Application['app_id']; organizationUid: Organization['uid']; pushEnabled: boolean }
  >((state) => ({
    appId: state.applicationState.data?.app_id ?? '',
    organizationUid: state.organizations.current.uid,
    pushEnabled: state.applicationState.data?.push_enabled ?? false,
  }));

  const isCallsEnabled = useIsCallsEnabled();
  const dispatch = useDispatch();

  const { userId } = useParams<{ userId: User['userId'] }>();
  const history = useHistory();
  const userIdInParam = decodeURIComponent(userId);

  const [user, setUser] = useState<User>({
    userId: '',
    accessToken: '',
    profileUrl: '',
    nickname: '',
    isActive: false,
    isOnline: false,
    lastSeenAt: 0,
    createdAt: 0,
  });
  const [nicknameFieldValue, setNicknameFieldValue] = useState(user.nickname);
  const [profileUrlFieldValue, setProfileUrlFieldValue] = useState(user.profileUrl);
  const [isEditingUserNickname, setIsEditingUserNickname] = useState(false);
  const [isEditingUserProfileUrl, setIsEditingUserProfileUrl] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const handleDeleteButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.DeleteUser,
        dialogProps: {
          selectedUsers: [{ ...user, userId: userIdInParam }],
          onSuccess: () => history.push(`/${appId}/users`),
        },
      }),
    );
  };

  const handleReactivateButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.ReactivateUser,
        dialogProps: {
          selectedUsers: [{ ...user, userId: userIdInParam }],
          onSuccess: () => setUser({ ...user, isActive: true }),
        },
      }),
    );
  };

  const handleDeactivateButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.DeactivateUser,
        dialogProps: {
          selectedUsers: [{ ...user, userId: userIdInParam }],
          onSuccess: () => setUser({ ...user, isActive: false }),
        },
      }),
    );
  };

  const handleIssueButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.IssueUserAccessToken,
        dialogProps: {
          userId: userIdInParam,
          hasAccessToken: user.accessToken !== '',
          onSuccess: ({ accessToken }) => setUser({ ...user, accessToken }),
        },
      }),
    );
  };

  const handleNicknameFieldChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setNicknameFieldValue(value);
  };

  const handleProfileUrlFieldChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setProfileUrlFieldValue(value);
  };

  const handleNicknameFieldCancelButtonClick = () => {
    setNicknameFieldValue(user.nickname);
  };

  const handleProfileUrlFieldCancelButtonClick = () => {
    setProfileUrlFieldValue(user.profileUrl);
  };

  const handleNicknameFieldSaveButtonClick = () => {
    setIsEditingUserNickname(true);
    editUser({ appId, userId: user.userId, nickname: nicknameFieldValue })
      .then(({ data }) => {
        setUser({ ...user, nickname: data.nickname });
        setIsEditingUserNickname(false);
        toast.success({ message: 'User nickname has been changed' });
      })
      .catch((error) => {
        setIsEditingUserNickname(false);
        toast.error({ message: getErrorMessage(error) });
      });
  };

  const handleProfileUrlFieldSaveButtonClick = () => {
    setIsEditingUserProfileUrl(true);
    editUser({ appId, userId: user.userId, profileUrl: profileUrlFieldValue })
      .then(({ data }) => {
        setUser({ ...user, profileUrl: data.profile_url });
        setIsEditingUserProfileUrl(false);
        toast.success({ message: 'User profile URL has been changed' });
      })
      .catch((error) => {
        setIsEditingUserProfileUrl(false);
        toast.error({ message: getErrorMessage(error) });
      });
  };

  const renderUserProfileImage = () => {
    const isLoading = user.userId === '';
    return <SDKUserAvatar size={40} userID={user.userId} imageUrl={user.profileUrl} isLoading={isLoading} />;
  };

  useEffect(() => {
    setIsFetchingUser(true);
    fetchUser({ appId, userId: userIdInParam })
      .then(({ data }) => {
        setIsFetchingUser(false);
        setUser(camelCaseKeys(data));
        setNicknameFieldValue(data.nickname);
        setProfileUrlFieldValue(data.profile_url);
      })
      .catch((error) => {
        setIsFetchingUser(false);
        toast.error({ message: getErrorMessage(error) });
      });
  }, [appId, userIdInParam]);

  return (
    <UserDetailContentContainer>
      <PageHeader>
        <PageHeader.BackButton href={`/${appId}/users`} />
        <PageHeader.Title>
          {userIdInParam}
          {isFetchingUser ? undefined : (
            <UserActiveStatusLozenge color={user.isActive ? 'green' : 'neutral'}>
              {user.isActive
                ? intl.formatMessage({ id: 'core.users_status.activated' })
                : intl.formatMessage({ id: 'core.users_status.deactivated' })}
            </UserActiveStatusLozenge>
          )}
        </PageHeader.Title>
        <PageHeader.Actions>
          {isPermitted(['application.users.all']) && !isFetchingUser && (
            <ActionButtonsContainer>
              {user.isActive ? (
                <Button
                  buttonType="tertiary"
                  size="small"
                  icon="ban"
                  onClick={handleDeactivateButtonClick}
                  data-test-id="DeactivateButton"
                >
                  {intl.formatMessage({ id: 'core.users.table_header.batchActions_deactivate.button' })}
                </Button>
              ) : (
                <Button
                  buttonType="tertiary"
                  size="small"
                  icon="invite"
                  onClick={handleReactivateButtonClick}
                  data-test-id="ReactivateButton"
                >
                  {intl.formatMessage({ id: 'core.users.table_header.batchActions_reactivate.button' })}
                </Button>
              )}
              <Button
                buttonType="tertiary"
                size="small"
                icon="delete"
                onClick={handleDeleteButtonClick}
                data-test-id="DeleteButton"
              >
                {intl.formatMessage({ id: 'core.users.table_header.batchActions_delete.button' })}
              </Button>
            </ActionButtonsContainer>
          )}
        </PageHeader.Actions>
      </PageHeader>
      {/* User information */}
      <UserInfoCategory>{intl.formatMessage({ id: 'core.user_detail.basicInfo.title' })}</UserInfoCategory>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.userId' })}
          titleColumns={4}
          isFetchingBody={isFetchingUser}
        >
          <InputText value={user.userId} readOnly={true} data-test-id="UserIdField" />
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.createdAt' })}
          titleColumns={4}
          isFetchingBody={isFetchingUser}
          data-test-id="CreatedAtRow"
        >
          {user.createdAt ? moment(user.createdAt * 1000).format(TIME_DATE_FORMAT) : EMPTY_TEXT}
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.nickname' })}
          titleColumns={4}
          isFetchingBody={isFetchingUser}
          showActions={user.nickname !== nicknameFieldValue}
          actions={[
            {
              key: 'user-nickname-field-cancel',
              buttonType: 'tertiary',
              label: 'Cancel',
              onClick: handleNicknameFieldCancelButtonClick,
            },
            {
              key: 'user-nickname-field-save',
              buttonType: 'primary',
              label: 'Save',
              isLoading: isEditingUserNickname,
              onClick: handleNicknameFieldSaveButtonClick,
            },
          ]}
        >
          <InputText
            value={nicknameFieldValue}
            readOnly={isPermitted(['application.users.view'])}
            onChange={handleNicknameFieldChange}
            data-test-id="NicknameField"
          />
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.profileUrl' })}
          titleColumns={4}
          isFetchingBody={isFetchingUser}
          showActions={user.profileUrl !== profileUrlFieldValue}
          actions={[
            {
              key: `user-profile-url-cancel`,
              buttonType: 'tertiary',
              label: 'Cancel',
              onClick: handleProfileUrlFieldCancelButtonClick,
            },
            {
              key: `user-profile-url-save`,
              buttonType: 'primary',
              label: 'Save',
              isLoading: isEditingUserProfileUrl,
              onClick: handleProfileUrlFieldSaveButtonClick,
            },
          ]}
        >
          <ProfileFieldWrapper>
            <ProfileImage data-test-id="ProfileImage">{renderUserProfileImage()}</ProfileImage>
            <InputText
              value={profileUrlFieldValue}
              readOnly={isPermitted(['application.users.view'])}
              onChange={handleProfileUrlFieldChange}
              data-test-id="ProfileURLField"
            />
          </ProfileFieldWrapper>
        </SettingsGridCard>
        {isPermitted(['application.users.all']) && (
          <>
            <SettingsGridCard
              title={intl.formatMessage({ id: 'core.user_detail.basicInfo_field.accessToken' })}
              titleColumns={4}
              isFetchingBody={isFetchingUser}
            >
              <AccessTokenFieldWrapper>
                {user.accessToken && (
                  <InputText
                    value={user.accessToken}
                    readOnly={true}
                    icons={[
                      {
                        icon: 'copy',
                        title: 'Copy',
                        onClick: () => {
                          copy(user.accessToken);
                          toast.success({ message: 'Copied' });
                        },
                      },
                    ]}
                    styles="margin-right: 8px;"
                    data-test-id="AccessTokenField"
                  />
                )}
                <Button buttonType="tertiary" type="button" onClick={handleIssueButtonClick}>
                  {user.accessToken
                    ? intl.formatMessage({ id: 'core.user_detail.basicInfo_field.accessToken_reIssue.button' })
                    : intl.formatMessage({ id: 'core.user_detail.basicInfo_field.accessToken_issue.button' })}
                </Button>
              </AccessTokenFieldWrapper>
            </SettingsGridCard>
          </>
        )}
        {isPermitted(['application.users.all', 'organization.members.all'], { combinedWith: 'and' }) && (
          <UserDetailOperator appId={appId} organizationUid={organizationUid} userId={userIdInParam} />
        )}
      </SettingsGridGroup>
      {/* Messaging */}
      <UserInfoCategory>{intl.formatMessage({ id: 'core.user_detail.messagingActivity.title' })}</UserInfoCategory>
      <SettingsGridGroup>
        <SettingsGridCard
          title="Status"
          titleColumns={4}
          isFetchingBody={isFetchingUser}
          data-test-id="OnlineStatusRow"
        >
          <UserStatusConnectionLabel connection={user.isOnline ? 'online' : 'offline'} />
          {user.isOnline ? 'Online' : 'Offline'}
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'core.user_detail.messagingActivity_field.lastSeenAt' })}
          titleColumns={4}
          isFetchingBody={isFetchingUser}
          data-test-id="LastSeenAtRow"
        >
          {user.lastSeenAt === 0 ? EMPTY_TEXT : moment(user.lastSeenAt).format(TIME_DATE_FORMAT)}
        </SettingsGridCard>
        <UserDetailGroupChannelCount userId={userIdInParam} />
        {pushEnabled && user.isActive && <UserPushTokens appId={appId} userId={userIdInParam} product="messaging" />}
      </SettingsGridGroup>
      {/* Calls */}
      {isCallsEnabled && (
        <UserCallsSummary appId={appId} userId={userIdInParam} userIsActive={user.isActive} pushEnabled={pushEnabled} />
      )}
    </UserDetailContentContainer>
  );
};
