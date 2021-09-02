import { FC, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Button,
  cssVariables,
  EmptyState,
  EmptyStateSize,
  OverflowMenu,
  Table,
  Tooltip,
  TooltipVariant,
  transitionDefault,
} from 'feather';

import { Room } from '@calls/api/types';
import RoomAvatar from '@calls/components/RoomAvatar';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAppId, useErrorToast, useShowDialog } from '@hooks';
import { snakeCaseKeys } from '@utils';

import { useContactsContext } from '../ContactsContext';
import { GroupCallsGuides } from '../Guides';
import RoomType from '../components/RoomType';
import { AddRoomDropdown } from '../components/dropdowns';
import { usePhoneboothUser } from '../dialogs/usePhoneboothUser';
import useRoomLink from '../useRoomLink';
import useRooms from '../useRooms';
import Coachmark from './Coachmark';
import { ContentLayout, TableContainer } from './components';

const tableStyle = css`
  tbody {
    min-height: 74px;

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
        padding: 16px 0;
      }
    }
  }
`;

const ID = styled.span`
  font-weight: 500;
`;

const RoomProfileWrapper = styled.div`
  display: grid;
  grid-template-columns: min-content auto;

  grid-gap: 4px 12px;

  ${RoomAvatar} {
    grid-row: 1 / 3;
  }
`;

const RoomRowWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;
`;

const RoomLinkWrapper = styled.a<{ $disabled: boolean }>`
  && {
    color: ${cssVariables('neutral-10')};
    font-weight: 600;
    text-decoration: none;
    font-size: 14px;
    line-height: 20px;
    padding: 6px 12px;
    transition: background 0.2s ${transitionDefault};
    border-radius: 4px;
    border: 1px solid transparent;
  }

  ${(props) =>
    props.$disabled &&
    css`
      && {
        color: ${cssVariables('neutral-5')};
        background-color: transparent;
        pointer-events: none;
        cursor: not-allowed;
      }
    `}

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  &:active {
    background: ${cssVariables('neutral-3')};
  }
`;

const ActionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  align-items: center;
  grid-gap: 8px;

  > button {
    min-width: auto;
  }
`;

const RoomLink: FC<{ user?: SDKUser; roomId: string; tooltip: ReactNode }> = ({ user, roomId, tooltip }) => {
  const intl = useIntl();
  const link = useRoomLink({ user, roomId });

  const children = (
    <RoomLinkWrapper target="_blank" href={link} $disabled={!link || !!tooltip}>
      {intl.formatMessage({ id: 'calls.studio.new.body.group.table.body.row.actions.enter' })}
    </RoomLinkWrapper>
  );

  return tooltip ? (
    <Tooltip variant={TooltipVariant.Light} tooltipContentStyle="max-width: 256px;" content={tooltip}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};

const RoomProfile: FC<{ id: string; type: Room['room_type'] }> = ({ id, type }) => {
  return (
    <RoomProfileWrapper>
      <RoomAvatar size="xmedium" id={id} />
      <ID>{id}</ID>
      <RoomType value={type} />
    </RoomProfileWrapper>
  );
};

const InviteButton: FC<{ disabled?: boolean; onClick?: () => void }> = ({ disabled, onClick }) => {
  const intl = useIntl();

  return (
    <Button variant="ghost" buttonType="secondary" size="small" disabled={disabled} onClick={onClick}>
      {intl.formatMessage({ id: 'calls.studio.new.body.group.table.body.row.actions.invite' })}
    </Button>
  );
};

const RoomCoachmark: FC<{ onDone?: () => void }> = ({ onDone }) => {
  const intl = useIntl();

  return (
    <Coachmark
      tooltip={
        <Coachmark.Tooltip
          title={intl.formatMessage({ id: 'calls.studio.new.body.group.table.body.row.actions.enter.tooltip.title' })}
          description={intl.formatMessage({
            id: 'calls.studio.new.body.group.table.body.row.actions.enter.tooltip.description',
          })}
          onDone={onDone}
        />
      }
    >
      <Button variant="ghost" buttonType="secondary" size="small" css="min-width: auto;">
        {intl.formatMessage({ id: 'calls.studio.new.body.group.table.body.row.actions.enter' })}
      </Button>
    </Coachmark>
  );
};

const useRemoveConfirm = () => {
  const showDialog = useShowDialog();
  const intl = useIntl();

  const confirm = useCallback(
    ({ onConfirm }: { onConfirm: () => void }) => {
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          size: 'small',
          title: intl.formatMessage({ id: 'calls.studio.new.body.group.table.body.row.actions.remove.confirm.title' }),
          description: intl.formatMessage({
            id: 'calls.studio.new.body.group.table.body.row.actions.remove.confirm.description',
          }),
          positiveButtonProps: {
            buttonType: 'danger',
            text: intl.formatMessage({
              id: 'calls.studio.new.body.group.table.body.row.actions.remove.confirm.submit',
            }),
            onClick: onConfirm,
          },
        },
      });
    },
    [showDialog, intl],
  );

  return confirm;
};

const useOperator = () => {
  const { user } = usePhoneboothUser();

  return useMemo(() => (user ? snakeCaseKeys<typeof user, SDKUser>(user) : null), [user]);
};

const GroupCallsContent: FC<{
  showCoachmark?: boolean;
  onCloseCoachmark?: () => void;
}> = ({ showCoachmark, onCloseCoachmark }) => {
  const intl = useIntl();
  const { rooms, isLoading, loadError, canAdd, load, remove, add } = useRooms();
  const operator = useOperator();
  const { items } = useContactsContext();
  const showDialog = useShowDialog();
  const confirmRemove = useRemoveConfirm();
  const appId = useAppId();
  const hasNoResult = rooms?.length === 0;

  const showCreateDialog = () => {
    showDialog({ dialogTypes: DialogType.CreateRoom, dialogProps: { onSuccess: add } });
  };

  const showAddExistingDialog = () => {
    showDialog({
      dialogTypes: DialogType.CallsStudioAddExistingRoom,
      dialogProps: { addedRoomIds: rooms?.map((room) => room.room_id), onSuccess: add },
    });
  };

  const showInviteDialog = (room: Room) => () => {
    showDialog({ dialogTypes: DialogType.CallsStudioRoomInvite, dialogProps: { items, room } });
  };

  const handleRemoveClick = (id: string) => () => confirmRemove({ onConfirm: () => remove(id) });

  useEffect(() => {
    load();
  }, [load]);

  useErrorToast(loadError);

  return (
    <ContentLayout>
      <p>
        {intl.formatMessage(
          { id: 'calls.studio.new.body.group.description' },
          { a: (text) => <Link to={`/${appId}/calls/group-calls`}>{text}</Link> },
        )}
      </p>
      <TableContainer>
        <h2>{intl.formatMessage({ id: 'calls.studio.new.body.group.table.title' })}</h2>
        <Table<Room>
          rowKey="room_id"
          dataSource={rooms}
          loading={isLoading}
          columns={[
            {
              dataIndex: 'room_id',
              title: intl.formatMessage({ id: 'calls.studio.new.body.group.table.header.rooms' }),
              render: (room, index) => {
                const { room_id, room_type } = room;

                return (
                  <RoomRowWrapper>
                    <RoomProfile id={room_id} type={room_type} />
                    <ActionContainer>
                      <InviteButton onClick={showInviteDialog(room)} />
                      {showCoachmark && index === 0 ? (
                        <RoomCoachmark onDone={onCloseCoachmark} />
                      ) : (
                        <RoomLink
                          user={operator ?? undefined}
                          roomId={room_id}
                          tooltip={
                            operator?.is_active === true
                              ? undefined
                              : intl.formatMessage({
                                  id: 'calls.studio.new.body.group.table.body.row.actions.enter.tooltip.noOperator',
                                })
                          }
                        />
                      )}
                      <OverflowMenu
                        popperProps={{ modifiers: { hide: { enabled: false }, preventOverflow: { enabled: false } } }}
                        items={[
                          {
                            label: intl.formatMessage({
                              id: 'calls.studio.new.body.group.table.body.row.actions.remove',
                            }),
                            onClick: handleRemoveClick(room_id),
                          },
                        ]}
                      />
                    </ActionContainer>
                  </RoomRowWrapper>
                );
              },
            },
          ]}
          emptyView={
            hasNoResult && (
              <EmptyState
                size={EmptyStateSize.Small}
                icon="group-call"
                title={intl.formatMessage({ id: 'calls.studio.new.body.group.table.empty' })}
                description={null}
                css="margin: 32px auto"
              />
            )
          }
          css={tableStyle}
        />
        {canAdd && <AddRoomDropdown onClickCreate={showCreateDialog} onClickAddExisting={showAddExistingDialog} />}
      </TableContainer>
      <GroupCallsGuides />
    </ContentLayout>
  );
};

export default GroupCallsContent;
