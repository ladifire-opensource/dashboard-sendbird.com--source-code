import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, EmptyState, EmptyStateSize, Icon, IconButton, Table, TableColumnProps } from 'feather';

import { Deactivated, Deleted } from '@calls/components/UserCard';
import { EMPTY_TEXT } from '@constants';
import { useAppId, useTypedSelector } from '@hooks';
import { EllipsisText, SDKUserAvatar } from '@ui/components';

import { useCallWidgetApp } from '../../widget/widgetAppContext';
import { useContactsContext } from '../ContactsContext';
import { DirectCallsGuides } from '../Guides';
import { SigninDropdown } from '../components/dropdowns';
import { useDesktopSigninDialog, useMobileSigninDialog } from '../dialogs/signinDialogs';
import { FetchFailureReason } from '../dialogs/useMobileAppUsers';
import Coachmark from './Coachmark';
import { ContentLayout, TableContainer } from './components';

const Nickname = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 8px;

  > span {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ID = styled.span`
  word-break: break-all;

  > * {
    display: inline-flex;
    margin-left: 8px;
  }
`;

const CallButton = styled(IconButton).attrs({
  size: 'small',
  buttonType: 'secondary',
})`
  position: relative;

  ${(props) =>
    props.disabled &&
    `
    cursor: not-allowed;

    &::before {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 2;
    }
  `}
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;

  svg {
    fill: ${cssVariables('neutral-9')};
  }

  > [role='combobox'] {
    button {
      min-width: auto;
    }
  }

  > * ~ * {
    margin-left: 8px;
  }
`;

const getTableStyle = ({ withBorderBottom }: { withBorderBottom: boolean }) => css`
  tbody {
    ${!withBorderBottom && 'border-bottom: none;'}

    tr {
      /* override table row  style on hover  */
      &:hover {
        background: transparent;

        &:not(:first-child) {
          border-top: 1px solid ${cssVariables('neutral-3')};
        }

        & + tr {
          border-top: 1px solid ${cssVariables('neutral-3')};
        }
      }

      td {
        height: 44px;
        padding: 0;
        align-items: center;
      }
    }
  }
`;

const AudioCallCoachmark: FC<{ onDone?: () => void }> = ({ onDone }) => {
  const intl = useIntl();

  return (
    <Coachmark
      css="width: 32px; height: 32px;"
      tooltip={
        <Coachmark.Tooltip
          title={intl.formatMessage({ id: 'calls.studio.contacts.coachmark.title' })}
          description={intl.formatMessage({ id: 'calls.studio.contacts.coachmark.content' })}
          onDone={onDone}
        />
      }
    >
      <Icon icon="call" size={20} />
    </Coachmark>
  );
};

const useIsWidgetEnabled = () => {
  const appId = useAppId();
  const isSdkUserActive = useTypedSelector((state) => {
    return state.moderations.sdkUser?.is_active ?? false;
  });

  return !!(appId && isSdkUserActive);
};

const DirectCallsContent: FC<{
  showCoachmark?: boolean;
  onCloseCoachmark?: () => void;
}> = ({ showCoachmark, onCloseCoachmark }) => {
  const intl = useIntl();
  const isWidgetEnabled = useIsWidgetEnabled();
  const callWidgetApp = useCallWidgetApp();
  const { items } = useContactsContext();
  const showDesktopSigninDialog = useDesktopSigninDialog();
  const showMobileSigninDialog = useMobileSigninDialog();
  const appId = useAppId();

  const handleVoiceButtonClick = (user?: SDKUser) => () => {
    if (!user) return;
    callWidgetApp?.mainApp.dial(user.user_id);
    callWidgetApp?.openWidget();
  };

  const handleVideoClick = (user?: SDKUser) => () => {
    if (!user) return;
    callWidgetApp?.mainApp.dial(user.user_id, true);
    callWidgetApp?.openWidget();
  };

  const handleMobileSigninClick = (user?: SDKUser) => () => {
    user && showMobileSigninDialog(user);
  };

  const handleDesktopSigninClick = (user?: SDKUser) => () => {
    user && showDesktopSigninDialog(user);
  };

  const columns: TableColumnProps<typeof items[number]>[] = [
    {
      dataIndex: 'nickname',
      title: intl.formatMessage({ id: 'calls.studio.new.body.direct.table.header.name' }),
      flex: 1,
      render: (record) => (
        <Nickname>
          <SDKUserAvatar size="small" userID={record.userId} imageUrl={record.data?.profile_url} />
          <span>{record.data?.nickname || EMPTY_TEXT}</span>
        </Nickname>
      ),
    },
    {
      dataIndex: 'userId',
      title: intl.formatMessage({ id: 'calls.studio.new.body.direct.table.header.id' }),
      flex: 2,
      render: (record) => (
        <EllipsisText component={ID} text={record.userId} maxLines={1}>
          {record.data?.is_active === false && <Deactivated />}
          {record.fetchFailureReason === FetchFailureReason.Deleted && <Deleted />}
        </EllipsisText>
      ),
    },
    {
      dataIndex: 'actions',
      flex: 1,
      render: (record, index) => (
        <ActionsContainer>
          {showCoachmark && index === 0 ? (
            <AudioCallCoachmark onDone={onCloseCoachmark} />
          ) : (
            <CallButton
              icon="call"
              disabled={!isWidgetEnabled || !record.data}
              onClick={handleVoiceButtonClick(record.data)}
              title={intl.formatMessage({
                id: isWidgetEnabled
                  ? 'calls.studio.contacts.user.actions.call.audio'
                  : 'calls.studio.contacts.user.actions.call.guide',
              })}
            />
          )}
          <CallButton
            icon="call-video"
            disabled={!isWidgetEnabled || !record.data}
            onClick={handleVideoClick(record.data)}
            title={intl.formatMessage({
              id: isWidgetEnabled
                ? 'calls.studio.contacts.user.actions.call.video'
                : 'calls.studio.contacts.user.actions.call.guide',
            })}
          />
          <SigninDropdown
            disabled={!isWidgetEnabled || !record.data}
            onClickDesktop={handleDesktopSigninClick(record.data)}
            onClickMobile={handleMobileSigninClick(record.data)}
          />
        </ActionsContainer>
      ),
    },
  ];

  const isLoading = items.some((item) => item.isFetching);

  return (
    <ContentLayout>
      <p>
        {intl.formatMessage(
          { id: 'calls.studio.new.body.direct.description' },
          { a: (text) => <Link to={`/${appId}/calls/direct-calls`}>{text}</Link> },
        )}
      </p>
      <TableContainer>
        <h2>{intl.formatMessage({ id: 'calls.studio.new.body.direct.table.title' })}</h2>
        <Table<typeof items[number]>
          rowKey="userId"
          loading={isLoading}
          columns={columns}
          dataSource={items}
          emptyView={
            <EmptyState
              size={EmptyStateSize.Small}
              icon="user"
              title={intl.formatMessage({ id: 'calls.studio.new.body.direct.table.empty' })}
              description={null}
              css="margin: 32px auto"
            />
          }
          css={getTableStyle({ withBorderBottom: items.length === 0 })}
        />
      </TableContainer>
      <DirectCallsGuides />
    </ContentLayout>
  );
};

export default DirectCallsContent;
