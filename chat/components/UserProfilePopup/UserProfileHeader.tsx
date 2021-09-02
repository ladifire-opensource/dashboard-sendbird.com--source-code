import { FC } from 'react';

import styled from 'styled-components';

import { cssVariables, Headings, IconButton, Typography } from 'feather';

import { OperatorIcon } from '@chat/components/OperatorIcon';
import { useCopy } from '@hooks';
import { EllipsisText, SDKUserAvatar } from '@ui/components';

type Props = { nickname: string; profileUrl: string; userId: string; userRole?: string };

const Copy = styled(IconButton).attrs({ icon: 'copy', buttonType: 'tertiary', size: 'xsmall', title: 'Copy' })``;

const Container = styled.div`
  display: flex;
  padding: 16px;
`;

const AvatarWrapper = styled.div``;

const Nickname = styled.span`
  ${Headings['heading-02']}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${cssVariables('neutral-10')};
`;

const UserIdText = styled.span.attrs({ 'data-test-id': 'UserID' })`
  ${Typography['caption-01']}
  color: ${cssVariables('neutral-7')};
  overflow: hidden;
  word-break: break-all;

  ${Copy} {
    position: absolute;
    transform: translate(0, -4px);
    opacity: 0;
  }

  &:hover > ${Copy} {
    opacity: 1;
  }
`;

const TextsWrapper = styled.div`
  position: relative;
  margin-left: 18px;
  display: flex;
  flex-direction: column;
  max-width: 208px;
  ${UserIdText} {
    margin-top: 4px;
  }
`;

const UserId: FC<{ id: string }> = ({ id }) => {
  const copy = useCopy();

  return (
    <EllipsisText component={UserIdText} text={`User ID: ${id}`} maxLines={2}>
      <Copy onClick={() => copy(id)} />
    </EllipsisText>
  );
};

const UserProfileHeader: FC<Props> = ({ nickname, profileUrl, userId, userRole }) => {
  return (
    <Container>
      <AvatarWrapper>
        <SDKUserAvatar size="xmedium" userID={userId} imageUrl={profileUrl} />
      </AvatarWrapper>
      <TextsWrapper>
        <Nickname data-test-id="Nickname">
          {nickname}
          {userRole === 'operator' && (
            <OperatorIcon
              color={cssVariables('purple-7')}
              size={20}
              css={`
                display: inline-block;
                margin-left: 4px;
                vertical-align: top;
                line-height: 0;
              `}
            />
          )}
        </Nickname>
        <UserId id={userId} />
      </TextsWrapper>
    </Container>
  );
};

export default UserProfileHeader;
