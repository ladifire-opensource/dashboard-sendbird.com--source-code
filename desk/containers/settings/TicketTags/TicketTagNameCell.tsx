import { FC, useMemo, useReducer, Dispatch, useRef, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { createGlobalStyle } from 'styled-components';

import { toast } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { updateTag, deleteTag } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

import { CreateTagForm } from './CreateTagForm';
import { TableRowIconButton, TableRowButton } from './TableRowButtons';
import { useReloadTags } from './useReloadTags';
import { useTicketTagsDispatchAction } from './useTicketTagsReducer';

type Props = { tag: TicketTag };

type State = {
  isEditMode: boolean;
  editRequest: { status: 'idle' | 'pending'; error: unknown | null };
  restoreRequest: { status: 'idle' | 'pending' };
};

type Action =
  | { type: 'SET_EDIT_MODE'; payload: { isEditMode: boolean } }
  | { type: 'CLEAR_EDIT_REQUEST_ERROR' }
  | { type: 'EDIT_REQUEST_START' }
  | { type: 'EDIT_REQUEST_SUCCESS' }
  | { type: 'EDIT_REQUEST_FAIL'; payload: { error: unknown } }
  | { type: 'SET_RESTORE_REQUEST_STATUS'; payload: { status: State['restoreRequest']['status'] } };

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  margin: -6px 0;
`;

const RowActions = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  grid-gap: 8px;
  grid-auto-flow: column;
  align-items: center;
  pointer-events: none;
  opacity: 0;
`;

const CellInTableRowStyle = createGlobalStyle`
  tr:hover ${RowActions} {
    opacity: 1;
    pointer-events: initial;
  }
`;

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.payload.isEditMode };
    case 'CLEAR_EDIT_REQUEST_ERROR':
      return { ...state, editRequest: { ...state.editRequest, error: null } };
    case 'EDIT_REQUEST_START':
      return { ...state, editRequest: { ...state.editRequest, status: 'pending' } };
    case 'EDIT_REQUEST_SUCCESS':
      return { ...state, isEditMode: false, editRequest: { status: 'idle', error: null } };
    case 'EDIT_REQUEST_FAIL':
      return { ...state, editRequest: { status: 'idle', error: action.payload.error } };
    case 'SET_RESTORE_REQUEST_STATUS':
      return { ...state, restoreRequest: { status: action.payload.status } };
    default:
      return state;
  }
};

const useEditTag = (state: State, dispatch: Dispatch<Action>) => {
  const latestStateRef = useRef(state);
  const { pid, region } = useProjectIdAndRegion();
  const dispatchTicketTagsAction = useTicketTagsDispatchAction();

  useEffect(() => {
    latestStateRef.current = state;
  });

  const sendEditTagRequest = useCallback(
    async (id: TicketTag['id'], name: string) => {
      if (latestStateRef.current.editRequest.status === 'pending') {
        return;
      }

      dispatch({ type: 'EDIT_REQUEST_START' });
      try {
        const { data } = await updateTag(pid, region, { id, name });

        dispatchTicketTagsAction({ type: 'UPDATE_TAG', payload: { tag: data } });
        dispatch({ type: 'EDIT_REQUEST_SUCCESS' });
      } catch (error) {
        dispatch({ type: 'EDIT_REQUEST_FAIL', payload: { error } });
      }
    },
    [dispatch, dispatchTicketTagsAction, pid, region],
  );

  return sendEditTagRequest;
};

const useRestoreTag = (state: State, dispatch: Dispatch<Action>) => {
  const intl = useIntl();
  const latestStateRef = useRef(state);
  const { pid, region } = useProjectIdAndRegion();
  const reloadBothTabs = useReloadTags(true);
  const { getErrorMessage } = useDeskErrorHandler();

  useEffect(() => {
    latestStateRef.current = state;
  });

  const sendRestoreTagRequest = useCallback(
    async (id: TicketTag['id'], name: string) => {
      if (latestStateRef.current.restoreRequest.status === 'pending') {
        return;
      }

      dispatch({ type: 'SET_RESTORE_REQUEST_STATUS', payload: { status: 'pending' } });
      try {
        await updateTag(pid, region, { id, status: 'ACTIVE' });
        toast.success({ message: intl.formatMessage({ id: 'desk.settings.tags.noti.restored' }, { tag: name }) });

        // If tag is successfully restored, reload both active and archived tabs.
        reloadBothTabs();
      } catch (error) {
        toast.error({
          message:
            error?.data?.code === 'desk400122'
              ? intl.formatMessage({ id: 'desk.settings.tags.noti.error.maxActiveTags' })
              : getErrorMessage(error),
        });
      } finally {
        dispatch({ type: 'SET_RESTORE_REQUEST_STATUS', payload: { status: 'idle' } });
      }
    },
    [dispatch, getErrorMessage, intl, pid, region, reloadBothTabs],
  );

  return sendRestoreTagRequest;
};

const useDeleteTag = (id: TicketTag['id'], name: TicketTag['name']) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const reloadCurrentTab = useReloadTags();

  return useShowDialog({
    dialogTypes: DialogType.Delete,
    dialogProps: {
      title: intl.formatMessage({ id: 'desk.settings.tags.deleteDialog.title' }, { tag: name }),
      description: intl.formatMessage({ id: 'desk.settings.tags.deleteDialog.description' }),
      confirmText: intl.formatMessage({ id: 'desk.settings.tags.deleteDialog.btn.delete' }),
      cancelText: intl.formatMessage({ id: 'desk.settings.tags.deleteDialog.btn.cancel' }),
      size: 'small',
      onDelete: async (setIsDeleting) => {
        setIsDeleting(true);
        await deleteTag(pid, region, { id }).then(() => {
          toast.success({ message: intl.formatMessage({ id: 'desk.settings.tags.noti.deleted' }, { tag: name }) });

          // If tag is deleted, reload the currently visible list.
          reloadCurrentTab();
        });
      },
    },
  });
};

const useArchiveTag = (id: TicketTag['id'], name: TicketTag['name']) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const reloadBothTabs = useReloadTags(true);
  const deleteTag = useDeleteTag(id, name);

  return useShowDialog({
    dialogTypes: DialogType.Delete,
    dialogProps: {
      title: intl.formatMessage({ id: 'desk.settings.tags.archiveDialog.title' }, { tag: name }),
      description: intl.formatMessage({ id: 'desk.settings.tags.archiveDialog.description' }),
      confirmText: intl.formatMessage({ id: 'desk.settings.tags.archiveDialog.btn.confirm' }),
      cancelText: intl.formatMessage({ id: 'desk.settings.tags.archiveDialog.btn.cancel' }),
      size: 'small',
      onDelete: async (setIsDeleting) => {
        setIsDeleting(true);
        await updateTag(pid, region, { id, status: 'ARCHIVE' });
        toast.success({ message: intl.formatMessage({ id: 'desk.settings.tags.noti.archived' }, { tag: name }) });

        // If tag is successfully archived, reload both active and archived tabs.
        reloadBothTabs();
      },
      alternativeAction: {
        children: intl.formatMessage({ id: 'desk.settings.tags.archiveDialog.btn.delete' }),
        icon: 'delete',
        onClick: deleteTag,
      },
    },
  });
};

export const TicketTagNameCell: FC<Props> = ({ tag }) => {
  const intl = useIntl();
  const [state, dispatch] = useReducer(reducer, {
    isEditMode: false,
    editRequest: { status: 'idle', error: null },
    restoreRequest: { status: 'idle' },
  });
  const archiveTag = useArchiveTag(tag.id, tag.name);
  const deleteTag = useDeleteTag(tag.id, tag.name);
  const restoreTag = useRestoreTag(state, dispatch);
  const editTag = useEditTag(state, dispatch);

  const {
    isEditMode,
    editRequest: { status: editRequestStatus, error: editRequestError },
  } = state;

  const { id, name, status } = tag;

  const actions = useMemo(() => {
    switch (status) {
      case 'ACTIVE':
        return (
          <>
            <TableRowIconButton
              type="button"
              icon="edit"
              title={intl.formatMessage({ id: 'desk.settings.tags.rowActions.btn.edit' })}
              onClick={() => dispatch({ type: 'SET_EDIT_MODE', payload: { isEditMode: true } })}
            />
            <TableRowButton type="button" buttonType="tertiary" size="small" onClick={archiveTag}>
              {intl.formatMessage({ id: 'desk.settings.tags.rowActions.btn.archive' })}
            </TableRowButton>
          </>
        );
      case 'ARCHIVE':
        return (
          <>
            <TableRowButton type="button" buttonType="tertiary" size="small" onClick={() => restoreTag(id, name)}>
              {intl.formatMessage({ id: 'desk.settings.tags.rowActions.btn.restore' })}
            </TableRowButton>
            <TableRowButton type="button" buttonType="danger" size="small" onClick={deleteTag}>
              {intl.formatMessage({ id: 'desk.settings.tags.rowActions.btn.delete' })}
            </TableRowButton>
          </>
        );
      default:
        return null;
    }
  }, [archiveTag, deleteTag, id, intl, name, restoreTag, status]);

  return (
    <>
      <CellInTableRowStyle />
      {isEditMode ? (
        <CreateTagForm
          defaultValue={name}
          onCancelButtonClick={() => {
            // reset the server error when exiting from Edit mode
            dispatch({ type: 'CLEAR_EDIT_REQUEST_ERROR' });
            dispatch({ type: 'SET_EDIT_MODE', payload: { isEditMode: false } });
          }}
          onSubmit={(name) => editTag(id, name)}
          isSubmitting={editRequestStatus === 'pending'}
          serverError={editRequestError}
        />
      ) : (
        <Container>
          {name}
          <RowActions>{actions}</RowActions>
        </Container>
      )}
    </>
  );
};
