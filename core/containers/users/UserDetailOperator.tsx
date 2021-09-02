import { memo, FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { cssVariables, Button, toast, Avatar, AvatarType, Body, Subtitles, Tag } from 'feather';

import { coreActions, commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { fetchRegisteredOperator, unregisterUserAsOperator } from '@core/api';
import { getErrorMessage } from '@epics';
import { useIsNCSoft } from '@hooks/useIsNCSoft';
import { useNCSoftSDKUserByID } from '@hooks/useNCSoftSDKUserByID';
import { useTypedSelector } from '@hooks/useTypedSelector';
import { InfoTooltip } from '@ui/components';
import { camelCaseKeys } from '@utils';

const RegisteredOperatorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RegisteredOperatorEmail = styled.p`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

const RegisteredOperatorRole = styled.p`
  font-size: 12px;
  line-height: 1.33;
  color: ${cssVariables('neutral-7')};
`;

const RegisteredOperatorProfileImage = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 8px;
`;

const RegisteredOperatorInfo = styled.div`
  margin-right: 24px;
`;

const AllowedChannelCustomTypesWrapper = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 24px;
`;

const AllowedChannelCustomTypesTitle = styled.h3`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-01']};
  margin-bottom: 4px;
`;

const AllowedChannelCustomTypesNoAccessible = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 22px;
`;

const AllowedChannelCustomTypes = styled.ul`
  list-style: none;
  li + li {
    margin-top: 8px;
  }
`;

type UserDetailOperatorProps = {
  appId: Application['app_id'];
  organizationUid: Organization['uid'];
  userId: User['userId'];
};

const useOperatorReduxSync = () => {
  const authUserEmail = useTypedSelector((state) => state.auth.user.email);
  const dispatch = useDispatch();

  const sync = (email: string) => {
    if (email === authUserEmail) {
      dispatch(coreActions.fetchSDKUserRequest());
    }
  };

  return sync;
};

export const UserDetailOperator: FC<UserDetailOperatorProps> = memo(({ appId, organizationUid, userId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const syncReduxOperator = useOperatorReduxSync();

  const isNCSoft = useIsNCSoft();
  const { loading, userDetail } = useNCSoftSDKUserByID(userId, isNCSoft);

  const [registeredOperator, setRegisteredOperator] = useState<Member_NEXT | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const handleRegisterButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.RegisterUserAsOperator,
        dialogProps: {
          userId,
          onSuccess: (registeredOperator) => {
            setRegisteredOperator(registeredOperator);
            syncReduxOperator(registeredOperator.email);
          },
        },
      }),
    );
  };

  const handleUnregisterButtonClick = () => {
    if (registeredOperator) {
      setIsFetching(true);
      unregisterUserAsOperator({ appId, organizationUid, userId, email: registeredOperator.email })
        .then(() => {
          setIsFetching(false);
          setRegisteredOperator(null);
          syncReduxOperator(registeredOperator.email);
        })
        .catch((error) => {
          setIsFetching(false);
          toast.error({ message: getErrorMessage(error) });
        });
    }
  };

  useEffect(() => {
    setIsFetching(true);
    fetchRegisteredOperator({ appId, organizationUid, userId })
      .then(({ data }) => {
        setIsFetching(false);
        setRegisteredOperator(Object.keys(data).length === 0 ? null : camelCaseKeys(data));
      })
      .catch((error) => {
        setIsFetching(false);
        setRegisteredOperator(null);
        toast.error({ message: getErrorMessage(error) });
      });
  }, [appId, organizationUid, userId]);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'core.user_detail.messagingActivity_field.registerUserAsOperator' })}
      titleColumns={4}
      description={intl.formatMessage({ id: 'core.user_detail.messagingActivity_field.registerUserAsOperator.desc' })}
      isFetchingBody={isFetching}
      gridItemConfig={{ body: { alignSelf: 'start' } }}
    >
      <RegisteredOperatorWrapper>
        {registeredOperator ? (
          <>
            <RegisteredOperatorProfileImage>
              <Avatar
                size="xmedium"
                type={AvatarType.Member}
                profileID={registeredOperator.email}
                imageUrl={registeredOperator.profileUrl}
              />
            </RegisteredOperatorProfileImage>
            <RegisteredOperatorInfo>
              <RegisteredOperatorEmail data-test-id="OperatorEmail">{registeredOperator.email}</RegisteredOperatorEmail>
              <RegisteredOperatorRole data-test-id="OperatorRole">{registeredOperator.role}</RegisteredOperatorRole>
            </RegisteredOperatorInfo>
            <Button
              icon="unlink"
              buttonType="tertiary"
              onClick={handleUnregisterButtonClick}
              data-test-id="UnlinkOperatorButton"
            >
              {intl.formatMessage({
                id: 'core.user_detail.messagingActivity_field.registerUserAsOperator_unregister.button',
              })}
            </Button>
          </>
        ) : (
          <Button buttonType="tertiary" onClick={handleRegisterButtonClick} data-test-id="LinkOperatorButton">
            {intl.formatMessage({
              id: 'core.user_detail.messagingActivity_field.registerUserAsOperator_register.button',
            })}
          </Button>
        )}
      </RegisteredOperatorWrapper>
      {registeredOperator && isNCSoft && !loading && (
        <AllowedChannelCustomTypesWrapper>
          <AllowedChannelCustomTypesTitle>
            {intl.formatMessage({ id: 'core.user_detail.messagingActivity_field.allowedChannelCustomTypes' })}
            <InfoTooltip
              content={intl.formatMessage({
                id: 'core.user_detail.messagingActivity_field.allowedChannelCustomTypes.tooltip',
              })}
              placement="top"
            />
          </AllowedChannelCustomTypesTitle>
          {userDetail?.allowed_channel_custom_types.length === 0 ? (
            <AllowedChannelCustomTypesNoAccessible>
              {intl.formatMessage({
                id: 'core.user_detail.messagingActivity_field.allowedChannelCustomTypes.noAccessible',
              })}
            </AllowedChannelCustomTypesNoAccessible>
          ) : (
            <AllowedChannelCustomTypes>
              {userDetail?.allowed_channel_custom_types.map((customType) => {
                return (
                  <li key={customType}>
                    <Tag>{customType}</Tag>
                  </li>
                );
              })}
            </AllowedChannelCustomTypes>
          )}
        </AllowedChannelCustomTypesWrapper>
      )}
    </SettingsGridCard>
  );
});
