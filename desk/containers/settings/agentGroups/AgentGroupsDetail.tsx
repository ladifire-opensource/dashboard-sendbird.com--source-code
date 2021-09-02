import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, ControllerRenderProps, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import { Button, cssVariables, InputText, OverflowMenu, SpinnerFull, toast, Typography } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  SettingsGridCard,
  SettingsGridGroup,
  AppSettingsContainer,
  AppSettingPageHeader,
} from '@common/containers/layout';
import { AgentActivationStatusValue } from '@constants';
import {
  fetchAgentGroup,
  createAgentGroup,
  updateAgentGroup,
  checkAgentGroupNameDuplicate,
  checkAgentGroupKeyDuplicate,
} from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, useAppId, useShowDialog } from '@hooks';
import { UnsavedPrompt } from '@ui/components';
import { debouncePromise, getIsDefaultTeam, logException } from '@utils';

import { AgentGroupMemberDropdown } from './AgentGroupMemberDropdown';
import { SelectedAgentsTable } from './SelectedAgentsTable';

type FormValues = Pick<AgentGroup<'detail'>, 'name' | 'key' | 'description'> & {
  agents: AgentGroup<'detail'>['members'];
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  padding-bottom: 36px;
  max-width: 1024px;
  position: relative;
`;

const AssistiveText = styled.p`
  margin-top: 4px;
  ${Typography['caption-01']};
  color: ${cssVariables('neutral-6')};
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;

  button:first-child {
    margin-right: 8px;
  }
`;

const TITLE_COLUMNS = 5;

export const AgentGroupsDetail: React.FC = () => {
  const history = useHistory();
  const match = useRouteMatch<{ id?: string }>();
  const intl = useIntl();

  const appId = useAppId();
  const { pid, region } = useProjectIdAndRegion();
  const showDialog = useShowDialog();

  const groupId = match && match.params.id ? parseInt(match.params.id) : 0;
  const isEditMode = groupId > 0;

  const { formState, control, errors, watch, reset, register, getValues, setValue, handleSubmit } = useForm<FormValues>(
    {
      defaultValues: {
        name: '',
        key: '',
        description: '',
        agents: [],
      },
      mode: 'onChange',
    },
  );
  const agents = watch('agents');

  const [{ data: agentGroupData, status: agentGroupStatus }, fetchAgentGroupRequest] = useAsync(
    () => fetchAgentGroup(pid, region, { groupId }),
    [groupId, pid, region],
  );

  const [{ status: createAgentGroupStatus }, createAgentGroupRequest] = useAsync(
    (payload) => createAgentGroup(pid, region, payload),
    [pid, region],
  );

  const [{ status: updateAgentGroupStatus }, updateAgentGroupRequest] = useAsync(
    ({ name, agents, description }) => updateAgentGroup(pid, region, { groupId, name, agents, description }),
    [groupId, pid, region],
  );

  const debounceIsNameUnique = useMemo(
    () =>
      debouncePromise(async (value: string) => {
        try {
          const {
            data: { result },
          } = await checkAgentGroupNameDuplicate(pid, region, { name: value });
          /**
           * TODO
           * Returning error message here seems wrong place to put, but because how the react-hook-form validation works,
           * the error message should be here, otherwise it would not be shown on screen
           *
           * Please revisit when react-hook-form is updated to version 6 or more
           */
          return result || intl.formatMessage({ id: 'desk.team.form.name.error.unique' });
        } catch (error) {
          logException(error);
          return intl.formatMessage({ id: 'desk.team.form.name.error.unique.serverError' });
        }
      }, 400),
    [intl, pid, region],
  );

  const debounceIsKeyUnique = useMemo(
    () =>
      debouncePromise(async (value: string) => {
        try {
          const {
            data: { result },
          } = await checkAgentGroupKeyDuplicate(pid, region, { key: value });
          /**
           * TODO
           * Returning error message here seems wrong place to put, but because how the react-hook-form validation works,
           * the error message should be here, otherwise it would not be shown on screen
           *
           * Please revisit when react-hook-form is updated to version 6 or more
           */
          return result || intl.formatMessage({ id: 'desk.team.form.key.error.unique' });
        } catch (error) {
          logException(error);
          return intl.formatMessage({ id: 'desk.team.form.key.error.unique.serverError' });
        }
      }, 400),
    [intl, pid, region],
  );

  const isFetching = agentGroupStatus === 'loading';
  const isSubmitting = createAgentGroupStatus === 'loading' || updateAgentGroupStatus === 'loading';
  const isDefaultTeam = isEditMode && agentGroupData && getIsDefaultTeam(agentGroupData.data.key);

  const errorProcessor = useCallback(
    (key) => {
      return errors[key]
        ? {
            hasError: true,
            message: errors[key].message || '',
          }
        : undefined;
    },
    [errors],
  );

  const historyBackToList = useCallback(() => {
    history.push(`/${appId}/desk/settings/teams`);
  }, [appId, history]);

  useEffect(() => {
    if (isEditMode) {
      fetchAgentGroupRequest();
    }
  }, [fetchAgentGroupRequest, isEditMode]);

  useEffect(() => {
    if (agentGroupData) {
      const { name, key, description, members } = agentGroupData.data;
      reset({
        name,
        key,
        description,
        agents: members,
      });
    }
  }, [agentGroupData, reset, setValue]);

  useEffect(() => {
    // Create
    if (createAgentGroupStatus === 'success') {
      toast.success({ message: intl.formatMessage({ id: 'desk.team.form.toast.create.success' }) });
      return;
    }

    if (createAgentGroupStatus === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.team.form.toast.create.fail' }) });
      return;
    }

    // Edit
    if (updateAgentGroupStatus === 'success') {
      toast.success({ message: intl.formatMessage({ id: 'desk.team.form.toast.update.success' }) });
      return;
    }

    if (updateAgentGroupStatus === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.team.form.toast.update.fail' }) });
      return;
    }
  }, [createAgentGroupStatus, historyBackToList, intl, updateAgentGroupStatus]);

  useEffect(() => {
    if (formState.isSubmitted && formState.isSubmitSuccessful) {
      historyBackToList();
    }
  }, [formState.isSubmitted, formState.isSubmitSuccessful, historyBackToList]);

  const deleteAgentGroup = useCallback(
    (group: AgentGroup<'detail'>) => {
      showDialog({
        dialogTypes: DialogType.DeleteAgentGroup,
        dialogProps: {
          groupId,
          groupName: group.name,
          onSuccess: history.goBack,
        },
      });
    },
    [groupId, history, showDialog],
  );

  const updateSelectedAgentStatus = useCallback(
    (params: {
      id: Agent['id'];
      status: AgentActivationStatusValue;
      autoRoutingEnabled: AgentGroupMember['autoRoutingEnabled'];
    }) => {
      const { id: agentId, status: agentStatus, autoRoutingEnabled } = params;
      const selectedAgents = getValues('agents');
      const index = selectedAgents.findIndex(({ id }) => id === agentId);
      if (index > -1) {
        const targetAgent = selectedAgents[index];
        setValue(
          'agents',
          [
            ...selectedAgents.slice(0, index),
            {
              ...targetAgent,
              status: agentStatus,
              autoRoutingEnabled,
            },
            ...selectedAgents.slice(index + 1),
          ],
          { shouldDirty: true },
        );
      }
    },
    [getValues, setValue],
  );

  const toggleAutoRoutingEnabled = (index: number) => () => {
    const selectedAgents = getValues('agents');
    const targetAgent = selectedAgents[index];
    setValue(
      'agents',
      [
        ...selectedAgents.slice(0, index),
        {
          ...targetAgent,
          autoRoutingEnabled: !targetAgent.autoRoutingEnabled,
        },
        ...selectedAgents.slice(index + 1),
      ],
      { shouldDirty: true },
    );
  };

  const removeSelectedAgent = (index: number) => () => {
    const selectedAgents = getValues('agents');
    const currentSelectedAgents = selectedAgents.slice(0);
    currentSelectedAgents.splice(index, 1);
    setValue('agents', currentSelectedAgents, { shouldDirty: true });
  };

  const onSubmit = useCallback(
    async ({ name, key, description }: FormValues) => {
      const selectedAgents = getValues('agents');
      const agents = selectedAgents.map(({ id, autoRoutingEnabled }) => ({ id, autoRoutingEnabled }));
      if (isEditMode) {
        await updateAgentGroupRequest({ name, agents, description });
        return;
      }
      await createAgentGroupRequest({ name, key, description, agents });
    },
    [createAgentGroupRequest, getValues, isEditMode, updateAgentGroupRequest],
  );

  const renderAgentGroupMemberDropdownController = useCallback((props: ControllerRenderProps) => {
    const { value, onChange } = props;

    const handleChange = (member: AgentGroupMember | null) => {
      onChange([...value, member]);
    };

    return <AgentGroupMemberDropdown selectedMembers={value} isBlock={true} onChange={handleChange} />;
  }, []);

  if (isFetching) {
    return <SpinnerFull />;
  }

  return (
    <AppSettingsContainer>
      {isSubmitting && <SpinnerFull transparent={true} />}
      <UnsavedPrompt when={formState.isDirty && !formState.isSubmitted} />
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={`/${appId}/desk/settings/teams`} />
        <AppSettingPageHeader.Title>
          {isEditMode ? agentGroupData?.data.name : intl.formatMessage({ id: 'desk.team.form.create.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          {!isDefaultTeam && isEditMode && (
            <div data-test-id="DeleteAgentGroupMenuWrapper">
              <OverflowMenu
                items={[
                  {
                    label: intl.formatMessage({ id: 'desk.team.form.edit.overflowMenu.delete' }),
                    onClick: () => {
                      agentGroupData && deleteAgentGroup(agentGroupData.data);
                    },
                  },
                ]}
              />
            </div>
          )}
        </AppSettingPageHeader.Actions>
      </AppSettingPageHeader>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <SettingsGridGroup>
          <SettingsGridCard
            title={intl.formatMessage({ id: 'desk.team.form.name.title' })}
            titleColumns={TITLE_COLUMNS}
          >
            <InputText
              ref={register({
                validate: {
                  unique: (value) => !formState.dirtyFields.name || debounceIsNameUnique(value),
                  minLength: (value) =>
                    value.trim().length > 0 || intl.formatMessage({ id: 'desk.team.form.name.error.minimum' }),
                  maxLength: (value) =>
                    value.trim().length <= 30 || intl.formatMessage({ id: 'desk.team.form.name.error.maximum' }),
                },
              })}
              name="name"
              placeholder={intl.formatMessage({ id: 'desk.team.form.name.placeholder' })}
              error={errorProcessor('name')}
            />
          </SettingsGridCard>
          {!isDefaultTeam && (
            <SettingsGridCard
              title={intl.formatMessage({ id: 'desk.team.form.key.title' })}
              titleColumns={TITLE_COLUMNS}
            >
              <div data-test-id="KeyWrapper">
                <InputText
                  ref={register({
                    validate: {
                      unique: (value) => !formState.dirtyFields.key || debounceIsKeyUnique(value),
                      minLength: (value) =>
                        value.trim().length > 0 || intl.formatMessage({ id: 'desk.team.form.key.error.minimum' }),
                      maxLength: (value) =>
                        value.trim().length <= 30 || intl.formatMessage({ id: 'desk.team.form.key.error.maximum' }),
                      start: (value) =>
                        /^[a-z0-9]*$/.test(value.trim().charAt(0)) ||
                        intl.formatMessage({ id: 'desk.team.form.key.error.start' }),
                      allowed: (value) =>
                        /^[a-z0-9-]*$/.test(value.trim()) ||
                        intl.formatMessage({ id: 'desk.team.form.key.error.allowed' }),
                    },
                  })}
                  name="key"
                  placeholder={intl.formatMessage({ id: 'desk.team.form.key.placeholder' })}
                  readOnly={isEditMode}
                  error={errorProcessor('key')}
                />
              </div>
              <AssistiveText>{intl.formatMessage({ id: 'desk.team.form.key.assistive' })}</AssistiveText>
            </SettingsGridCard>
          )}
          <SettingsGridCard
            title={intl.formatMessage({ id: 'desk.team.form.description.title' })}
            titleColumns={TITLE_COLUMNS}
          >
            <InputText
              ref={register({
                validate: {
                  maxLength: (value) =>
                    value.trim().length <= 120 ||
                    intl.formatMessage({ id: 'desk.team.form.description.error.maximum' }),
                },
              })}
              name="description"
              placeholder={intl.formatMessage({ id: 'desk.team.form.description.placeholder' })}
              error={errorProcessor('description')}
            />
          </SettingsGridCard>
          <SettingsGridCard
            titleColumns={TITLE_COLUMNS}
            title={intl.formatMessage({ id: 'desk.team.form.addAgents.header.title' })}
            description={intl.formatMessage({ id: 'desk.team.form.addAgents.header.description' })}
          >
            <Controller control={control} name="agents" render={renderAgentGroupMemberDropdownController} />
          </SettingsGridCard>
          <SettingsGridCard
            titleColumns={TITLE_COLUMNS}
            title={intl.formatMessage({ id: 'desk.team.form.selectedAgents.header.title' })}
            gridItemConfig={{ subject: { alignSelf: 'start' } }}
            description={intl.formatMessage({ id: 'desk.team.form.selectedAgents.header.description' })}
          >
            <SelectedAgentsTable
              selectedAgents={agents}
              updateSelectedAgentStatus={updateSelectedAgentStatus}
              isFetching={isFetching}
              handleAutoRoutingEnabledClick={toggleAutoRoutingEnabled}
              handleRemoveSelectedAgentClick={removeSelectedAgent}
            />
          </SettingsGridCard>
        </SettingsGridGroup>
        <FormFooter>
          <Button buttonType="tertiary" type="button" onClick={historyBackToList} data-test-id="Cancel">
            {intl.formatMessage({ id: 'desk.team.form.cancel.button' })}
          </Button>
          <Button buttonType="primary" type="submit" data-test-id="Save">
            {intl.formatMessage({ id: 'desk.team.form.save.button' })}
          </Button>
        </FormFooter>
      </FormContainer>
    </AppSettingsContainer>
  );
};
