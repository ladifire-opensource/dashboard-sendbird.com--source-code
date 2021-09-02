import { FC, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, Button, cssVariables, Headings, InputText, Lozenge } from 'feather';
import QRCode from 'qrcode.react';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMPTY_TEXT } from '@constants';
import { useAsync, useCopy, useShowDialog } from '@hooks';
import { SDKUserAvatar } from '@ui/components';

import useAuthData from '../useAuthData';
import { ShareableLink } from './ShareableLink';
import { SigninInstruction } from './SigninInstruction';

const getSigninLink = (data: string) => `${location.origin}/calls/signin/${data}`;

const Nickname = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-10')};

  ${Lozenge} {
    margin-left: 8px;
  }
`;

const UserID = styled.span`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const QRCodeContainer = styled.div`
  width: 160px;
  height: 160px;
`;

const CopyableLinkContainer = styled.div`
  display: flex;
  width: 100%;

  div {
    width: 100%;
  }

  > div + button {
    margin-left: 8px;
  }
`;

const SigninDialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${Nickname} {
    margin-top: 16px;
  }

  ${QRCodeContainer} {
    margin-top: 16px;
  }

  ${SigninInstruction}, ${CopyableLinkContainer} {
    margin-top: 32px;
  }

  ${ShareableLink} {
    margin-top: 20px;
  }
`;

const CopyableLink: FC<{ link?: string }> = ({ link }) => {
  const copy = useCopy();
  const handleCopy = () => {
    link && copy(link);
  };

  return (
    <CopyableLinkContainer>
      <InputText value={link} readOnly={true} />
      <Button buttonType="primary" disabled={!link} onClick={handleCopy}>
        Copy
      </Button>
    </CopyableLinkContainer>
  );
};

const useSignin = (user: SDKUser) => {
  const generate = useAuthData();
  const [{ data }, fetch] = useAsync(() => generate(user), [generate, user]);
  const link = data ? getSigninLink(data) : undefined;

  return { data, link, fetch };
};

const DesktopDialogContent: FC<{ user: SDKUser }> = ({ user }) => {
  const { user_id, profile_url, nickname } = user;
  const { link, fetch } = useSignin(user);
  const intl = useIntl();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <SigninDialogContainer css="padding-top: 16px">
      <SDKUserAvatar key={profile_url} userID={user_id} imageUrl={profile_url} size="large" />
      <Nickname>{nickname || EMPTY_TEXT}</Nickname>
      <UserID>{intl.formatMessage({ id: 'calls.studio.dialogs.signin.desktop.userId' }, { userId: user_id })}</UserID>
      <CopyableLink link={link} />
    </SigninDialogContainer>
  );
};

const MobileDialogContent: FC<{ user: SDKUser }> = ({ user }) => {
  const intl = useIntl();
  const { user_id, profile_url, nickname } = user;
  const { data, link, fetch } = useSignin(user);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <SigninDialogContainer data-test-id="SigninDialog">
      <SDKUserAvatar key={profile_url} userID={user_id} imageUrl={profile_url} size="large" />
      <Nickname>{nickname || EMPTY_TEXT}</Nickname>

      <UserID>{intl.formatMessage({ id: 'calls.studio.mobileApp.signinDialog.user.id' }, { userId: user_id })}</UserID>
      <QRCodeContainer data-test-id="QRCode">{data ? <QRCode value={data} size={160} /> : null}</QRCodeContainer>
      <SigninInstruction />
      <ShareableLink userId={user_id} link={link} />
    </SigninDialogContainer>
  );
};

export const useMobileSigninDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return (user: SDKUser) => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'large',
        isNegativeButtonHidden: true,
        title: intl.formatMessage({ id: 'calls.studio.mobileApp.signinDialog_lbl.title' }),
        body: <MobileDialogContent user={user} />,
      },
    });
  };
};

export const useDesktopSigninDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return (user: SDKUser) => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        isNegativeButtonHidden: true,
        title: intl.formatMessage({ id: 'calls.studio.dialogs.signin.desktop.title' }),
        description: intl.formatMessage({ id: 'calls.studio.dialogs.signin.desktop.description' }),
        body: <DesktopDialogContent user={user} />,
      },
    });
  };
};
