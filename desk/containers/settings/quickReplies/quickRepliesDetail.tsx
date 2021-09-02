import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  OverflowMenu,
  toast,
  useForm,
  useField,
  InputText,
  Button,
  Radio,
  TreeSelect,
  TreeData,
} from 'feather';
import moment from 'moment-timezone';

import { DialogsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { useDeskAuth } from '@authorization/useDeskAuth';
import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  SettingsGridCard,
  SettingsGridGroup,
  AppSettingPageHeader,
  AppSettingsContainer,
} from '@common/containers/layout';
import { QuickRepliesAvailableType } from '@constants';
import { useAuthorization } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { ContentEditableRef } from '@ui/components';

import { QuickRepliesEditor } from './quickRepliesEditor';

type MatchParam = {
  duplicateQuickReplyId?: string;
  quickReplyId?: string;
};

const LastUpdateBar = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
`;

const TitleOverflowMenu = styled(OverflowMenu)`
  margin-left: 8px;
`;

const FormGroup = styled(SettingsGridGroup)`
  margin-top: 24px;
`;

const RadioList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  & > * + * {
    margin-top: 8px;
  }
`;

const AvailableForText = styled.span`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

const GroupOptionPlaceholder = styled.span`
  display: flex;
  align-items: center;
  padding-left: 8px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-6')};
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;

  button + button {
    margin-left: 8px;
  }
`;

export const QuickRepliesDetail = memo<RCProps<MatchParam>>(({ match }) => {
  useDeskAuth();
  const { isPermitted } = useAuthorization();
  const isAgent = isPermitted(['desk.agent']);
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();

  const { appID, pid, region, agentId } = useSelector((state: RootState) => ({
    appID: state.applicationState.data?.app_id ?? '',
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region ?? '',
    agentId: state.desk.agent.id,
  }));

  const dir = useCharDirection();
  const dispatch = useDispatch();
  const showDialogsRequest = (payload) => dispatch({ type: DialogsActionTypes.SHOW_DIALOGS_REQUEST, payload });

  const history = useHistory();
  const { quickReplyId, duplicateQuickReplyId } = match.params;
  const defaultAvailableType = isAgent ? QuickRepliesAvailableType.AGENT : QuickRepliesAvailableType.ALL;

  const [editableQuickReply, setEditableQuickReply] = useState<QuickReply | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [availableType, setAvailableType] = useState(defaultAvailableType);
  const [selectedGroups, setSelectedGroups] = useState<TreeData[]>([]);
  const [groupOptions, setGroupOptions] = useState<AgentGroup<'listItem'>[]>([]);
  const [isFetchingGroupOptions, setIsFetchingGroupOptions] = useState(false);
  const selectedGroupIds =
    availableType === QuickRepliesAvailableType.GROUP
      ? selectedGroups.map((group) => parseInt(group.value, 10))
      : undefined;

  const messageEditorRef = useRef<ContentEditableRef>(null);

  const availableAgent = availableType === QuickRepliesAvailableType.AGENT ? agentId : undefined;
  const isEditMode = !!quickReplyId;
  const isDuplicateMode = !!duplicateQuickReplyId;

  const goToSettings = useCallback(() => history.push(`/${appID}/desk/settings/quick-replies`), [appID, history]);

  const fetchQuickReplyData = useCallback(
    async ({ id }: FetchQuickReplyRequestPayload) => {
      try {
        const { data } = await deskApi.fetchQuickReply(pid, region, { id });
        setEditableQuickReply(data);
        setSelectedGroups(data.groups.map((group) => ({ value: group.id.toString(), label: group.name })));
        setAvailableType(data.availableType);
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      } finally {
        setIsFetching(false);
      }
    },
    [getErrorMessage, pid, region],
  );

  const fetchAgentGroupOptions = useCallback(async () => {
    setIsFetchingGroupOptions(true);
    try {
      const {
        data: { results },
      } = await deskApi.fetchAgentGroups(pid, region, { offset: 0, limit: 100 });
      setGroupOptions(results);
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
    } finally {
      setIsFetchingGroupOptions(false);
    }
  }, [getErrorMessage, pid, region]);

  const updateQuickReplyData = useCallback(
    async ({ id, name, message }: UpdateQuickRepliesRequestPayload) => {
      setIsFetching(true);
      try {
        await deskApi.updateQuickReply(pid, region, {
          id,
          availableAgent,
          availableType,
          group: selectedGroupIds,
          name,
          message,
        });
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.toast.success.update' }),
        });
        goToSettings();
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      } finally {
        setIsFetching(false);
      }
    },
    [availableAgent, availableType, getErrorMessage, goToSettings, intl, pid, region, selectedGroupIds],
  );

  const createQuickReplyData = useCallback(
    async ({ name, message }) => {
      setIsFetching(true);
      try {
        await deskApi.createQuickReply(pid, region, {
          name,
          message,
          availableAgent,
          availableType,
          group: selectedGroupIds,
        });
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.toast.success.create' }),
        });
        goToSettings();
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      } finally {
        setIsFetching(false);
      }
    },
    [availableAgent, availableType, getErrorMessage, goToSettings, intl, pid, region, selectedGroupIds],
  );

  const deleteQuickReplyData = useCallback(
    async (quickReply: QuickReply) => {
      setIsFetching(true);
      try {
        await deskApi.deleteQuickReply(pid, region, { id: quickReply.id });
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.toast.success.delete' }),
        });
        goToSettings();
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      } finally {
        setIsFetching(false);
      }
    },
    [getErrorMessage, goToSettings, intl, pid, region],
  );

  const getNameFieldDefaultValue = () => {
    const editName = editableQuickReply ? editableQuickReply.name : '';

    if (isEditMode) {
      return editName;
    }

    if (isDuplicateMode) {
      return `${editName} (Copy)`;
    }

    return '';
  };

  const form = useForm({
    onSubmit: ({ name }) => {
      const message = messageEditorRef.current ? messageEditorRef.current.getText() : '';
      if (message.trim().length <= 0) {
        return;
      }

      if (quickReplyId) {
        updateQuickReplyData({ id: parseInt(quickReplyId), name, message });
      } else {
        createQuickReplyData({ name, message });
      }
    },
  });

  const nameField = useField('name', form, {
    defaultValue: getNameFieldDefaultValue(),
    validate: (value) => {
      if (value.trim().length <= 0) {
        return intl.formatMessage({ id: 'desk.settings.quickReplies.detail.name.error.minLength' });
      }

      if (value.trim().length > 100) {
        return intl.formatMessage({ id: 'desk.settings.quickReplies.detail.name.error.maxLength' });
      }
      return '';
    },
  });

  useEffect(() => {
    fetchAgentGroupOptions();
  }, [availableType, fetchAgentGroupOptions]);

  useEffect(() => {
    if (quickReplyId) {
      fetchQuickReplyData({ id: parseInt(quickReplyId) });
    }

    if (duplicateQuickReplyId) {
      fetchQuickReplyData({ id: parseInt(duplicateQuickReplyId) });
    }
  }, [quickReplyId, duplicateQuickReplyId, fetchQuickReplyData]);

  const handleSaveClick = (e) => {
    form.onSubmit(e);
  };

  const overflowActions = [
    {
      label: intl.formatMessage({ id: 'desk.settings.quickReplies.label.duplicate' }),
      onClick: () => {
        history.push(`/${appID}/desk/settings/quick-replies/${quickReplyId}/duplicate`);
      },
    },
    {
      label: intl.formatMessage({ id: 'desk.settings.quickReplies.label.delete' }),
      onClick: () => {
        showDialogsRequest({
          dialogTypes: DialogType.Delete,
          dialogProps: {
            title: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.title' }),
            description: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.desc' }),
            confirmText: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.confirm' }),
            cancelText: intl.formatMessage({ id: 'desk.settings.quickReplies.detail.delete.cancel' }),
            onDelete: async () => {
              editableQuickReply && (await deleteQuickReplyData(editableQuickReply));
            },
          },
        });
      },
    },
  ];

  const getPageTitle = () => {
    const editTitle = (editableQuickReply && editableQuickReply.name) || '';
    if (isEditMode) {
      return editTitle;
    }

    if (isDuplicateMode) {
      return intl.formatMessage({ id: 'desk.settings.quickReplies.detail.title.duplicate' });
    }

    return intl.formatMessage({ id: 'desk.settings.quickReplies.detail.title.new' });
  };

  const renderToggleContent = () => (
    <GroupOptionPlaceholder>
      {intl.formatMessage({ id: 'desk.settings.quickReplies.detail.teams.placeholder' })}
    </GroupOptionPlaceholder>
  );

  const handleAvailableTypeChange = (e) => {
    setAvailableType(e.target.value);
  };

  const handleGroupSelect = (selectedNodes: TreeData[]) => {
    setSelectedGroups(selectedNodes);
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader
        css={css`
          ${AppSettingPageHeader.Title} {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          ${AppSettingPageHeader.Actions} {
            flex: none;
          }
        `}
      >
        <AppSettingPageHeader.BackButton href={`/${appID}/desk/settings/quick-replies`} />
        <AppSettingPageHeader.Title>{getPageTitle()}</AppSettingPageHeader.Title>
        {isEditMode && (
          <AppSettingPageHeader.Actions>
            <LastUpdateBar>
              {editableQuickReply &&
                `${intl.formatMessage({ id: 'desk.settings.quickReplies.detail.lastUpdated' })} ${moment(
                  editableQuickReply.updatedAt,
                ).format('lll')}`}
            </LastUpdateBar>
            <TitleOverflowMenu items={overflowActions} iconButtonProps={{ buttonType: 'tertiary' }} />
          </AppSettingPageHeader.Actions>
        )}
      </AppSettingPageHeader>

      <FormGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.name.title' })}
          titleColumns={4}
          gridItemConfig={{ subject: { alignSelf: nameField.error ? 'start' : 'center' } }}
        >
          <InputText
            dir={dir}
            ref={nameField.ref}
            name={nameField.name}
            placeholder={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.name.placeholder' })}
            error={nameField.error}
            tabIndex={0}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
            onChange={nameField.onChange}
            disabled={isFetching}
          />
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.message.title' })}
          titleColumns={4}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <QuickRepliesEditor
            editorRef={messageEditorRef}
            editableText={editableQuickReply ? editableQuickReply.message : ''}
          />
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.availableFor.title' })}
          titleColumns={4}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          {isAgent ? (
            <AvailableForText>
              {intl.formatMessage({ id: 'desk.settings.quickReplies.detail.availableFor.label.myself' })}
            </AvailableForText>
          ) : (
            <RadioList>
              <Radio
                name="availableType"
                label={intl.formatMessage({ id: 'desk.settings.quickReplies.detail.availableFor.label.allAgents' })}
                value={QuickRepliesAvailableType.ALL}
                checked={availableType === QuickRepliesAvailableType.ALL}
                onChange={handleAvailableTypeChange}
              />
              <Radio
                name="availableType"
                label={intl.formatMessage({
                  id: 'desk.settings.quickReplies.detail.availableFor.label.onlyToSpecificTeams',
                })}
                value={QuickRepliesAvailableType.GROUP}
                checked={availableType === QuickRepliesAvailableType.GROUP}
                onChange={handleAvailableTypeChange}
              />
              {availableType === QuickRepliesAvailableType.GROUP && (
                <TreeSelect
                  treeData={groupOptions.map((group) => ({ value: group.id.toString(), label: group.name }))}
                  selectedNodes={selectedGroups}
                  disabled={isFetchingGroupOptions}
                  toggleRenderer={selectedGroups.length === 0 ? renderToggleContent : undefined}
                  onSelect={handleGroupSelect}
                />
              )}
              <Radio
                name="availableType"
                label={intl.formatMessage({
                  id: 'desk.settings.quickReplies.detail.availableFor.label.myself',
                })}
                value={QuickRepliesAvailableType.AGENT}
                checked={availableType === QuickRepliesAvailableType.AGENT}
                onChange={handleAvailableTypeChange}
              />
            </RadioList>
          )}
        </SettingsGridCard>
      </FormGroup>
      <ButtonGroup>
        <Button buttonType="tertiary" onClick={goToSettings}>
          {intl.formatMessage({ id: 'desk.settings.quickReplies.detail.button.cancel' })}
        </Button>
        <Button buttonType="primary" onClick={handleSaveClick}>
          {isEditMode || isDuplicateMode
            ? intl.formatMessage({ id: 'desk.settings.quickReplies.detail.button.save' })
            : intl.formatMessage({ id: 'desk.settings.quickReplies.detail.button.add' })}
        </Button>
      </ButtonGroup>
    </AppSettingsContainer>
  );
});
