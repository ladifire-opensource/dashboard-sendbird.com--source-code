import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  InlineNotification,
  Lozenge,
  LozengeVariant,
  Spinner,
  Subtitles,
  Tooltip,
  TooltipTargetIcon,
  TooltipVariant,
  Typography,
} from 'feather';

import { EMPTY_TEXT } from '@constants';
import { CopyButton, EllipsisText, SDKUserAvatar } from '@ui/components';

const UserCardContainer = styled.li<{ $single?: boolean }>`
  border: 1px solid ${cssVariables('neutral-3')};
  height: 64px;

  ${(props) =>
    props.$single
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;
        `
      : css`
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-template-rows: auto;
          grid-gap: 12px;
          align-items: center;
          padding: 13px 15px;
        `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.span<{ disabled?: boolean }>`
  ${Subtitles['subtitle-01']}
  position: relative;
  word-break: break-all;

  > ${Lozenge} {
    display: inline-flex;
    margin-left: 4px;
  }
`;

const CopyButtonWrapper = styled.div`
  position: relative;
  align-items: center;

  div {
    position: absolute;
    transform: translateY(-4px);
  }
`;

const ID = styled.span<{ $disabled?: boolean }>`
  ${Typography['caption-01']}
  word-break: break-all;
  cursor: ${(props) => (props.$disabled ? 'auto' : 'default')};
  color: ${(props) => (props.$disabled ? cssVariables('neutral-5') : cssVariables('neutral-7'))};

  ${Lozenge} {
    margin-left: 4px;
  }

  > ${CopyButtonWrapper} {
    display: none;
  }

  &:hover {
    > ${CopyButtonWrapper} {
      display: inline-flex;
    }
  }
`;

export const UserCardList = styled.ul`
  list-style: none;

  ${UserCardContainer}:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  ${UserCardContainer}:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  ${UserCardContainer} + ${UserCardContainer} {
    margin-top: -1px;
  }
`;

export const Deleted = () => {
  const intl = useIntl();
  return (
    <Tooltip
      variant={TooltipVariant.Light}
      content={intl.formatMessage({ id: 'calls.studio.components.userCard.deleted.tooltip' })}
      tooltipContentStyle="max-width: 256px;"
      css="display: inline-flex;"
    >
      <Lozenge variant={LozengeVariant.Light} color="red" data-test-id="Deleted">
        {intl.formatMessage({ id: 'calls.studio.components.userCard.deleted' })}
      </Lozenge>
    </Tooltip>
  );
};

export const Deactivated = () => {
  const intl = useIntl();
  return (
    <Lozenge variant={LozengeVariant.Light} color="neutral" data-test-id="Deactivated">
      {intl.formatMessage({ id: 'calls.studio.components.userCard.deactivated' })}
    </Lozenge>
  );
};

const Error: FC<{ message: string }> = ({ message }) => {
  return (
    <Tooltip variant={TooltipVariant.Light} tooltipContentStyle="max-width: 256px;" content={message}>
      <TooltipTargetIcon icon="warning-filled" color={cssVariables('red-5')} />
    </Tooltip>
  );
};

export const UserCard: FC<{
  userId: string;
  nickname?: string;
  profileUrl?: string;
  deactivated?: boolean;
  deleted?: boolean;
  errorMessage?: string;
  action?: ReactNode;
}> = ({ userId, nickname, profileUrl, deactivated, deleted, errorMessage, action }) => {
  const disabled = !!(deleted || errorMessage);

  return (
    <UserCardContainer data-test-id="UserCard">
      <SDKUserAvatar size="medium" userID={userId} imageUrl={profileUrl} />
      <Content>
        {!disabled && (
          <EllipsisText component={Nickname} text={nickname || EMPTY_TEXT} maxLines={1}>
            {deactivated && <Deactivated />}
          </EllipsisText>
        )}
        <EllipsisText component={ID} text={`User ID: ${userId}`} maxLines={disabled ? 2 : 1}>
          {!disabled && (
            <CopyButtonWrapper>
              <CopyButton size="xsmall" copyableText={userId} />
            </CopyButtonWrapper>
          )}
          {deleted && <Deleted />}
          {errorMessage && <Error message={errorMessage} />}
        </EllipsisText>
      </Content>
      {action}
    </UserCardContainer>
  );
};

export const UserCardError: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const intl = useIntl();

  return (
    <UserCardContainer $single={true}>
      <InlineNotification
        type="error"
        css={css`
          margin: 7px 15px;
          width: 100%;
        `}
        message={message}
        action={{ label: intl.formatMessage({ id: 'calls.studio.components.userCard.retry' }), onClick: onRetry }}
      />
    </UserCardContainer>
  );
};

export const UserCardLoading = () => {
  return (
    <UserCardContainer $single={true}>
      <Spinner />
    </UserCardContainer>
  );
};
