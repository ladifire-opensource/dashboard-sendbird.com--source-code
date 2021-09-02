import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  Dropdown,
  cssVariables,
  IconButton,
  DropdownProps,
  toast,
  transitionDefault,
  transitions,
  Icon,
  cssColors,
} from 'feather';
import { rgba } from 'polished';

import { deskActions } from '@actions';
import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentConnection, CONNECTION_COLORS } from '@constants';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import { AgentBadge } from '@desk/containers/agents/AgentBadge';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useIsWoowahan, useShallowEqualSelector, useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import Tour from '@ui/components/Tour';
import { useRerenderTourTooltipPosition } from '@ui/components/Tour/useRerenderTourTooltipPosition';
import { logException } from '@utils/logException';

import { DeskAgentOnboardingLocalStorageUtils } from '../deskAgentOnboardingLocalStorageUtils';
import { ConversationContext } from './conversationContext';
import { useExitFromCurrentTicket } from './useExitFromCurrentTicket';

const AgentProfileConnectionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: -8px;
  width: 100%;
`;

const ConnectionToggle = styled.div`
  color: ${cssVariables('neutral-10')};
  font-size: 14px;
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 4px;
  transition: background 0.2s ${transitionDefault}, border 0.2s ${transitionDefault};
`;

const ConnectionLabel = styled.div<{ $connection: AgentConnection | Agent['connection'] }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  transition: background 0.15s ${transitionDefault};
  background: ${(props) => CONNECTION_COLORS[props.$connection]};
`;

const AgentContents = styled.div<{ $isOnboarding: boolean; $isEditingDisplayName: boolean; $hasError: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 8px;
  min-width: 196px;
  border-radius: 4px;
  transition: ${transitions({ duration: 0.5, properties: ['box-shadow'] })};

  &:hover {
    flex: 1;
  }

  ${({ $isOnboarding }) =>
    $isOnboarding &&
    css`
      box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
    `};

  ${({ $isEditingDisplayName, $hasError }) =>
    ($isEditingDisplayName || $hasError) &&
    css`
      flex: 1;
    `};
`;

const AgentProfileThumbnail = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  overflow: hidden;
`;

const AgentProfileEditButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  width: 100%;
  height: 100%;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: transparent;
    transition: ${transitions({ duration: 0.3, properties: ['background'] })};
  }

  &:hover {
    ${Icon} {
      opacity: 1;
    }

    &::before {
      background: ${rgba(cssColors('neutral-7'), 0.6)};
    }
  }

  ${Icon} {
    position: relative;
    z-index: 10;
    opacity: 0;
    transition: ${transitions({ duration: 0.3, properties: ['opacity'] })};
  }

  input {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 30;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const AgentInfo = styled.div`
  flex: 1;
  max-width: calc(100% - 54px);
  transform: translateY(2px);
`;

const AgentDisplayNameText = styled.span`
  display: inline-block;
  position: relative;
  z-index: 30;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AgentDisplayNameInput = styled.input<{ $hasError: boolean; $isHover: boolean }>`
  position: absolute;
  top: -1px;
  left: -1px;
  z-index: 10;
  padding: 0 8px;
  width: 105%;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  border: 1px solid transparent;
  border-radius: 4px;
  outline: 0;
  opacity: ${({ $hasError }) => ($hasError ? 1 : 0)};
  transform: translateX(-8px);
  transition: ${transitions({ properties: ['border', 'opacity', 'background'], duration: 0.3 })};
  background: white;

  ${({ $hasError, $isHover }) =>
    $isHover &&
    css`
      border-color: ${$hasError ? cssVariables('red-5') : cssVariables('neutral-3')};
      opacity: 1;
      z-index: 50;
    `};

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? cssVariables('red-5') : cssVariables('purple-7'))};
    opacity: 1;
    z-index: 50;
  }
`;

const AgentInfoNameForm = styled.form`
  display: flex;
  align-items: center;
`;

const AgentInfoConnection = styled.div`
  margin-top: -3px;
  transform: translateX(-5px);
`;

const AgentSetting = styled.div`
  margin-left: auto;
`;

const AgentSettingButton = styled(IconButton)<{ $isOnboarding: boolean }>`
  position: static;
  transform: translateX(8px);
  transition: ${transitions({ duration: 0.5, properties: ['box-shadow'] })};

  ${({ $isOnboarding }) =>
    $isOnboarding &&
    css`
      box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
    `};
`;

const agentConnectionKeyMap: Record<Agent['connection'], string> = {
  [AgentConnection.ONLINE]: 'ui.agentConnection.online',
  [AgentConnection.AWAY]: 'ui.agentConnection.away',
  [AgentConnection.OFFLINE]: 'ui.agentConnection.offline',
};

export const AgentProfileConnection: React.FC = () => {
  useRerenderTourTooltipPosition();
  const intl = useIntl();
  const dispatch = useDispatch();
  const exitFromCurrentTicket = useExitFromCurrentTicket();

  const { pid, region } = useProjectIdAndRegion();
  const showDialog = useShowDialog();
  const isWoowahan = useIsWoowahan();

  const { project, currentAgent } = useShallowEqualSelector((state) => ({
    project: state.desk.project,
    currentAgent: state.desk.agent,
  }));
  const { getErrorMessage } = useDeskErrorHandler();

  const previousAgentDisplayNameRef = useRef(currentAgent.displayName);
  const agentDisplayNameInputRef = useRef<HTMLInputElement | null>(null);

  const [isUpdatingAgentProfileFile, setIsUpdatingAgentProfileFile] = useState(false);
  const [isAgentDisplayNameHover, setIsAgentDisplayNameHover] = useState(false);

  const { isFinished, appendFinished } = DeskAgentOnboardingLocalStorageUtils;
  const [isOnboarding, setIsOnboarding] = useState(!isFinished(currentAgent.id));
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  const { register, errors, reset, formState, handleSubmit } = useForm({
    defaultValues: { displayName: currentAgent.displayName },
    mode: 'onChange',
  });

  const { conversationTickets: conversationTicketsContext } = useContext(ConversationContext);
  const {
    state: { counts },
    resetCurrentTickets,
  } = conversationTicketsContext;

  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);

  useEffect(() => {
    if (currentAgent.displayName !== previousAgentDisplayNameRef.current) {
      reset({ displayName: currentAgent.displayName });
      return;
    }

    if (
      !isEditingDisplayName &&
      agentDisplayNameInputRef.current &&
      previousAgentDisplayNameRef.current !== agentDisplayNameInputRef.current.value
    ) {
      reset({ displayName: previousAgentDisplayNameRef.current });
      return;
    }
  }, [currentAgent.displayName, isEditingDisplayName, reset]);

  const onSubmit = useCallback(
    async ({ displayName }: { displayName: string }) => {
      if (formState.isDirty) {
        const formData = new FormData();
        formData.append('displayName', displayName.trim());

        try {
          const { data } = await deskApi.updateAgentProfile(pid, region, {
            agentId: currentAgent.id,
            payload: formData,
          });

          dispatch(deskActions.setDeskAgent(data));
          previousAgentDisplayNameRef.current = data.displayName;
          agentDisplayNameInputRef.current?.blur();
          toast.success({ message: intl.formatMessage({ id: 'desk.agentProfile.dialog.form.submit.toast.success' }) });
        } catch (error) {
          logException(error);
          toast.error({ message: getErrorMessage(error) });
        } finally {
          setIsUpdatingAgentProfileFile(false);
        }
      }
    },
    [currentAgent.id, dispatch, formState.isDirty, getErrorMessage, intl, pid, region],
  );

  const handleAgentProfileImageChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      if (e.target?.files) {
        setIsUpdatingAgentProfileFile(true);

        try {
          const formData = new FormData();
          formData.append('profileFile', e.target.files[0]);

          const { data } = await deskApi.updateAgentProfile(pid, region, {
            agentId: currentAgent.id,
            payload: formData,
          });

          dispatch(deskActions.setDeskAgent(data));
          toast.success({ message: intl.formatMessage({ id: 'desk.agentProfile.dialog.form.submit.toast.success' }) });
        } catch (error) {
          logException(error);
          toast.error({ message: getErrorMessage(error) });
        } finally {
          setIsUpdatingAgentProfileFile(false);
        }
      }
    },
    [currentAgent.id, dispatch, getErrorMessage, intl, pid, region],
  );

  const handleAgentDisplayNameKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        agentDisplayNameInputRef.current?.blur();
        return;

      default:
        return;
    }
  }, []);

  const handleOnboardingStepChange = useCallback((currentStep) => {
    setCurrentOnboardingStep(currentStep);
  }, []);

  const handleOnboardingEnd = useCallback(() => {
    appendFinished(currentAgent.id);
    setIsOnboarding(false);
  }, [appendFinished, currentAgent.id]);

  const handleAgentProfileClick = useCallback(async () => {
    showDialog({
      dialogTypes: DialogType.UpdateAgentProfile,
      dialogProps: {
        agentId: currentAgent.id,
      },
    });
  }, [currentAgent.id, showDialog]);

  const handleAgentConnectionChange: DropdownProps<Agent['connection']>['onItemSelected'] = useCallback(
    (agentConnection) => {
      if (agentConnection == null) {
        return;
      }

      const changeStatus = async (params?: { transferGroup?: AgentGroup<'listItem'> }) => {
        try {
          const { data } = await deskApi.updateAgentConnection(pid, region, {
            agentId: currentAgent.id,
            connection: agentConnection,
            transferGroupId: params?.transferGroup?.id,
          });

          if (data.connection === agentConnection) {
            if (params?.transferGroup) {
              toast.success({
                message: intl.formatMessage(
                  { id: 'desk.agents.statusChange.transfer.success' },
                  { teamName: params.transferGroup.name },
                ),
              });
            } else {
              toast.success({ message: intl.formatMessage({ id: 'desk.agents.statusChange.success' }) });
            }

            if (agentConnection === AgentConnection.OFFLINE) {
              resetCurrentTickets();
              exitFromCurrentTicket();
            }

            dispatch(deskActions.setAgentConnection(data.connection));
          }
        } catch (error) {
          toast.error({ message: getErrorMessage(error) });
        }
      };

      if (counts.active === 0 || agentConnection === AgentConnection.ONLINE || !project.bulkTransferEnabled) {
        changeStatus();
      } else {
        showDialog({
          dialogTypes: DialogType.AgentConnectionStatusChange,
          dialogProps: {
            status: agentConnection,
            onSuccess: (group) => {
              changeStatus({ transferGroup: group });
            },
          },
        });
      }
    },
    [
      counts.active,
      currentAgent.id,
      dispatch,
      exitFromCurrentTicket,
      getErrorMessage,
      intl,
      pid,
      project.bulkTransferEnabled,
      region,
      resetCurrentTickets,
      showDialog,
    ],
  );

  const hasNameInputError = !!errors.displayName?.message;

  return (
    <AgentProfileConnectionContainer data-test-id="AgentProfileConnection">
      {isOnboarding && (
        <Tour
          steps={[
            {
              title: intl.formatMessage({ id: 'desk.conversation.agentProfile.tour.step1.title' }),
              content: intl.formatMessage({ id: 'desk.conversation.agentProfile.tour.step1.content' }),
              placement: 'top-start',
              target: '#quickEdit',
              offset: 0,
              disableBeacon: true,
              disableOverlay: true,
              disableOverlayClose: true,
              floaterProps: {
                options: {
                  offset: {
                    offset: '-22, 6',
                  },
                },
              },
              styles: {
                tooltipContainer: {
                  width: 336,
                },
              },
              spotlight: {
                isHidden: true,
              },
            },
            {
              title: intl.formatMessage({ id: 'desk.conversation.agentProfile.tour.step2.title' }),
              content: intl.formatMessage({ id: 'desk.conversation.agentProfile.tour.step2.content' }),
              placement: 'top-end',
              target: '#agentProfileSetting',
              disableBeacon: true,
              disableOverlay: true,
              disableOverlayClose: true,
              floaterProps: {
                options: {
                  offset: {
                    offset: '24, 9',
                  },
                },
              },
              styles: {
                tooltipContainer: {
                  width: 336,
                },
              },
              spotlight: {
                isHidden: true,
              },
            },
          ]}
          onStepChange={handleOnboardingStepChange}
          onStepEnd={handleOnboardingEnd}
        />
      )}
      <AgentContents
        $isOnboarding={isOnboarding && currentOnboardingStep === 0}
        $isEditingDisplayName={isEditingDisplayName}
        $hasError={hasNameInputError}
      >
        <AgentProfileThumbnail id="quickEdit">
          <AgentProfileEditButton>
            <Icon size={20} icon="camera" color="white" />
            <input type="file" accept="image/*" onChange={handleAgentProfileImageChange} />
          </AgentProfileEditButton>
          <DeskAgentAvatar
            profileID={currentAgent.email}
            imageUrl={currentAgent.photoThumbnailUrl || undefined}
            size={40}
            isLoading={isUpdatingAgentProfileFile}
          />
        </AgentProfileThumbnail>
        <AgentInfo>
          <AgentInfoNameForm onSubmit={handleSubmit(onSubmit)}>
            <AgentDisplayNameText
              onMouseEnter={() => {
                setIsAgentDisplayNameHover(true);
              }}
              data-test-id="AgentDisplayNameText"
            >
              {currentAgent.displayName}
            </AgentDisplayNameText>
            <AgentBadge
              agentType={currentAgent.agentType}
              tier={currentAgent.tier}
              role={currentAgent.role}
              css={css`
                position: relative;
                z-index: 30;
              `}
            />
            <AgentDisplayNameInput
              ref={(ref) => {
                agentDisplayNameInputRef.current = ref;
                register({
                  validate: {
                    required: (value) =>
                      value.trim().length > 0 ||
                      intl.formatMessage({ id: 'desk.agentProfile.dialog.form.error.displayName.required' }),
                  },
                })(ref);
              }}
              name="displayName"
              maxLength={80}
              $isHover={isAgentDisplayNameHover}
              $hasError={hasNameInputError}
              onFocus={() => {
                setIsEditingDisplayName(true);
              }}
              onBlur={() => {
                setIsEditingDisplayName(false);
                if (
                  agentDisplayNameInputRef.current &&
                  previousAgentDisplayNameRef.current !== agentDisplayNameInputRef.current.value
                ) {
                  agentDisplayNameInputRef.current.value = previousAgentDisplayNameRef.current;
                  reset({ displayName: previousAgentDisplayNameRef.current });
                }
              }}
              onKeyDown={handleAgentDisplayNameKeyDown}
              onMouseLeave={() => {
                setIsAgentDisplayNameHover(false);
              }}
              data-test-id="AgentDisplayNameInput"
            />
          </AgentInfoNameForm>
          <AgentInfoConnection data-test-id="AgentInfoConnection">
            <Dropdown<Agent['connection']>
              variant="inline"
              size="small"
              placement="right-end"
              portalId="portal_popup"
              disabled={isWoowahan}
              selectedItem={currentAgent.connection}
              onChange={handleAgentConnectionChange}
              items={[AgentConnection.ONLINE, AgentConnection.AWAY, AgentConnection.OFFLINE]}
              itemToString={(item) => item && intl.formatMessage({ id: agentConnectionKeyMap[item] })}
              itemToElement={(item) => (
                <>
                  <ConnectionLabel $connection={item} />
                  {intl.formatMessage({ id: agentConnectionKeyMap[item] })}
                </>
              )}
              positionFixed={true}
              toggleRenderer={({ selectedItem }) =>
                selectedItem && (
                  <ConnectionToggle data-test-id="AgentConnectionLabel">
                    <ConnectionLabel $connection={currentAgent.connection} />
                    {intl.formatMessage({ id: agentConnectionKeyMap[selectedItem] })}
                  </ConnectionToggle>
                )
              }
            />
          </AgentInfoConnection>
        </AgentInfo>
      </AgentContents>
      <AgentSetting>
        <AgentSettingButton
          id="agentProfileSetting"
          className="agentSetting__icon"
          buttonType="tertiary"
          icon="settings"
          size="small"
          iconSize={16}
          $isOnboarding={isOnboarding && currentOnboardingStep === 1}
          onClick={handleAgentProfileClick}
        />
      </AgentSetting>
    </AgentProfileConnectionContainer>
  );
};
