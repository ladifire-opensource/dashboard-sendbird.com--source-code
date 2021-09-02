import { useCallback, useContext, useRef, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Tag,
  cssVariables,
  ScrollBar,
  Link as LinkText,
  LinkVariant,
  IconButton,
  Dropdown,
  Icon,
  Tooltip,
} from 'feather';
import moment from 'moment-timezone';

import { EMPTY_TEXT, AgentActivationStatusValue, AgentTier, AgentType } from '@constants';
import AgentConnectionDiagram from '@desk/components/AgentConnectionDiagram';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import { AdminContext } from '@desk/contexts/AdminContext';
import { useDeskAgent, useShallowEqualSelector } from '@hooks';
import { useDeskAgentActivation } from '@hooks/useDeskAgentActivation';
import {
  Drawer,
  DrawerContext,
  drawerTransitionDurationSecond,
  CollapsibleSection,
  TicketListItem,
  AgentActivationStatus,
  TextWithOverflowTooltip,
  DeskBotTypeTag,
} from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { getAgentStatusLabelKey, renderTimestring } from '@utils';

import { AgentBadge } from './AgentBadge';

type ActivateDropdownItem = {
  key?: AgentActivationStatusValue;
  label: string;
  icon: React.ReactNode;
  onClick?: Function;
};

export const drawerID = 'agent';

const Container = styled(Drawer)`
  width: 320px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 9px;
  top: 9px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 28px;
  padding-bottom: 16px;

  ${DeskAgentAvatar} {
    position: relative;
  }

  h3 {
    font-size: 18px;
    min-height: 24px;
    line-height: 24px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  dl {
    width: 100%;
    display: grid;
    grid-template-columns: 88px auto;
    grid-row-gap: 12px;
    grid-column-gap: 16px;

    font-size: 14px;
    line-height: 20px;

    dt {
      grid-column: 1 / span 1;
      color: ${cssVariables('neutral-6')};
      margin-right: 8px;
    }

    dd {
      grid-column: 2 / span 1;
      word-break: break-all;
    }
  }
`;

const AgentTagInfo = styled.div`
  display: flex;
  align-items: center;
`;

const AgentAvatarInfo = styled.div`
  display: flex;
  padding-bottom: 24px;
  width: 100%;
`;

const AgentIdentity = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const AgentBotSettingButton = styled(IconButton)`
  margin-left: 4px;
`;

const RecentTickets = styled(CollapsibleSection)`
  div[role='list'] {
    list-style: none;
    padding: 0;
    margin-left: -16px;
    margin-right: -16px;
    padding-bottom: 16px;
  }

  .no-recent-tickets {
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    text-align: center;
    color: ${cssVariables('neutral-5')};
    padding-top: 48px;
    padding-bottom: 48px;

    .no-recent-tickets-icon {
      margin-bottom: 8px;
    }
  }
  a {
    &:hover {
      text-decoration: none;
    }
  }
`;

const ToggleWrapper = styled.div`
  margin-left: 12px;
`;

const Statistics = styled(CollapsibleSection)`
  border-bottom: 0;

  dl {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    font-size: 14px;
    line-height: 20px;
    padding-top: 12px;

    dt {
      flex: 1 1 51%;
      color: ${cssVariables('neutral-6')};
      margin-bottom: 12px;
    }

    dd {
      flex: 0 0 auto;
      margin-left: auto;
      cursor: pointer;

      a {
        color: ${cssVariables('neutral-10')};
      }

      &:hover {
        text-decoration: underline;
      }

      .assignment-ratio {
        color: ${cssVariables('neutral-6')};
        text-decoration: inherit;
        vertical-align: baseline;
      }
    }
  }

  .today {
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-6')};
    margin-bottom: 16px;
  }
`;

const StyledAgentConnectionDiagram = styled(AgentConnectionDiagram)`
  margin-bottom: 12px;
`;

const ActivationStatusContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const roleLabelKey = {
  ADMIN: 'desk.agents.sidebar.lbl.role.admin',
  AGENT: 'desk.agents.sidebar.lbl.role.agent',
};

const tierLabelKey: Record<AgentTier, string> = {
  [AgentTier.EXPERT]: 'desk.agents.sidebar.lbl.expert',
  [AgentTier.INTERMEDIATE]: 'desk.agents.sidebar.lbl.intermediate',
};

export const AgentDetailSidebar: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const { appId, agentId: currentAgentId } = useShallowEqualSelector((state) => {
    return { appId: state.applicationState.data?.app_id, agentId: state.desk.agent.id };
  });
  const {
    agentDetail: {
      data: { agent, data },
      resetAgentDetail,
      updateAgentData,
    },
  } = useContext(AdminContext);

  const currentAgent = useDeskAgent();
  const { activeDrawerID, closeDrawer } = useContext(DrawerContext);
  const isBot = agent?.agentType === 'BOT';

  const waitTransitionAndResetAgentDetail = useCallback(() => {
    setTimeout(() => resetAgentDetail(), drawerTransitionDurationSecond * 1000);
  }, [resetAgentDetail]);

  const onDialogClose = useCallback(() => {
    waitTransitionAndResetAgentDetail();
    closeDrawer(drawerID);
  }, [closeDrawer, waitTransitionAndResetAgentDetail]);

  const now = moment(new Date());
  const today = moment(now).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  const windowClickEventListener = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || (e.target instanceof Node && !containerRef.current.contains(e.target))) {
        closeDrawer(drawerID);
      }
    },
    [closeDrawer],
  );

  const subscribeCloseDrawerEvent = useCallback(() => {
    window.addEventListener('click', windowClickEventListener, true);
  }, [windowClickEventListener]);

  const unsubscribeCloseDrawerEvent = useCallback(() => {
    window.removeEventListener('click', windowClickEventListener, true);
  }, [windowClickEventListener]);

  const handleSuccessDeskActivation = useCallback(
    (agent: Agent) => {
      updateAgentData(agent);
      subscribeCloseDrawerEvent();
    },
    [subscribeCloseDrawerEvent, updateAgentData],
  );

  const updateDeskAgentActivation = useDeskAgentActivation({
    onSuccess: handleSuccessDeskActivation,
    onDialogClose: subscribeCloseDrawerEvent,
  });

  useEffect(() => {
    if (activeDrawerID && activeDrawerID === drawerID) {
      setTimeout(() => {
        subscribeCloseDrawerEvent();
      }, drawerTransitionDurationSecond * 1000);
    }

    return () => {
      unsubscribeCloseDrawerEvent();
    };
  }, [activeDrawerID, subscribeCloseDrawerEvent, unsubscribeCloseDrawerEvent]);

  const renderTeamData = useCallback(() => {
    if (agent && agent.groups && agent.groups.length > 0) {
      return agent.groups
        .map<React.ReactNode>((group) => {
          const handleLinkTextClick = () => {
            onDialogClose();
            history.push(`/${appId}/desk/settings/teams/form/${group.id}`);
          };

          return (
            <LinkText key={group.id} variant={LinkVariant.Neutral} onClick={handleLinkTextClick}>
              {group.name}
            </LinkText>
          );
        })
        .reduce((prev, curr) => (
          <>
            {prev}, {curr}
          </>
        ));
    }
    return EMPTY_TEXT;
  }, [agent, appId, history, onDialogClose]);

  /**
   * FIXME:
   * Remove this email tweak when Desk back-end team fixes email sync delay issue.
   * https://sendbird.atlassian.net/browse/DESK-259
   */
  const latestAgentEmail = useMemo(() => {
    if (!agent) {
      return null;
    }

    return currentAgent.id === agent.id ? currentAgent.email : agent.email;
  }, [agent, currentAgent.email, currentAgent.id]);

  const { activateItem, deactivateItem, pausedItem, pendingItem } = {
    activateItem: {
      key: AgentActivationStatusValue.ACTIVE,
      label: intl.formatMessage({ id: getAgentStatusLabelKey(AgentActivationStatusValue.ACTIVE) }),
      icon: <Icon icon="success-filled" size={16} color={cssVariables('green-6')} />,
      onClick: () => {
        agent && updateDeskAgentActivation(agent, AgentActivationStatusValue.ACTIVE);
      },
    },
    deactivateItem: {
      key: AgentActivationStatusValue.INACTIVE,
      label: intl.formatMessage({ id: getAgentStatusLabelKey(AgentActivationStatusValue.INACTIVE) }),
      icon: <Icon icon="success-filled" size={16} color={cssVariables('neutral-5')} />,
      onClick: () => {
        agent && updateDeskAgentActivation(agent, AgentActivationStatusValue.INACTIVE);
      },
    },
    pausedItem: {
      key: AgentActivationStatusValue.PAUSED,
      label: intl.formatMessage({ id: getAgentStatusLabelKey(AgentActivationStatusValue.PAUSED) }),
      icon: <Icon icon="pause" size={16} color={cssVariables('neutral-5')} />,
      onClick: () => {
        agent && updateDeskAgentActivation(agent, AgentActivationStatusValue.PAUSED);
      },
    },
    pendingItem: {
      key: AgentActivationStatusValue.PENDING,
      label: intl.formatMessage({ id: getAgentStatusLabelKey(AgentActivationStatusValue.PENDING) }),
      icon: <Icon icon="warning-filled" size={16} color={cssVariables('yellow-5')} />,
    },
  };

  const selectedActivationStatus = useMemo(() => {
    switch (agent?.status) {
      case AgentActivationStatusValue.ACTIVE:
        return activateItem;
      case AgentActivationStatusValue.INACTIVE:
        return deactivateItem;
      case AgentActivationStatusValue.PAUSED:
        return pausedItem;
      case AgentActivationStatusValue.PENDING:
        return pendingItem;
      default:
        return undefined;
    }
  }, [activateItem, agent?.status, deactivateItem, pausedItem, pendingItem]);

  const activateDropdownItems = useMemo(() => {
    switch (agent?.status) {
      case AgentActivationStatusValue.ACTIVE:
        return [pausedItem, deactivateItem];
      case AgentActivationStatusValue.INACTIVE:
        return [pausedItem, activateItem];
      case AgentActivationStatusValue.PAUSED:
        return [activateItem, deactivateItem];
      case AgentActivationStatusValue.PENDING:
        return [activateItem];
      default:
        return [];
    }
  }, [activateItem, agent, deactivateItem, pausedItem]);

  const isSelf = agent?.id === currentAgentId;
  const isBotNotReadyToActivate = agent?.agentType === AgentType.BOT && !agent?.bot?.isReadyToActivate;
  const isDisabledActivationDropdown = isSelf || isBotNotReadyToActivate;
  const tooltipProps = useMemo(() => {
    if (isSelf) {
      return {
        content: intl.formatMessage({
          id: 'desk.agents.sidebar.lbl.activationStatus.toggle.disabled.tooltip.isAdmin',
        }),
      };
    }
    if (isBotNotReadyToActivate) {
      return {
        content: intl.formatMessage({
          id: 'desk.agents.sidebar.lbl.activationStatus.toggle.disabled.tooltip.isBotNotReadyToActivate',
        }),
      };
    }

    return undefined;
  }, [intl, isSelf, isBotNotReadyToActivate]);

  const agentProfiles = useMemo(() => {
    return [
      {
        intlKey: 'desk.agents.sidebar.lbl.email',
        value: latestAgentEmail || EMPTY_TEXT,
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.sendbirdId',
        value: agent?.sendbirdId || EMPTY_TEXT,
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.phoneNumber',
        value: agent?.phoneNumber || EMPTY_TEXT,
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.tier',
        value:
          agent &&
          (agent.agentType === AgentType.BOT || agent.role === 'ADMIN'
            ? EMPTY_TEXT
            : intl.formatMessage({ id: tierLabelKey[agent.tier] })),
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.teams',
        value: renderTeamData(),
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.created',
        value: agent && moment(agent.createdAt).format('lll'),
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.activationStatus',
        value:
          agent &&
          (agent.status === AgentActivationStatusValue.DELETED ? (
            <Tooltip
              content={intl.formatMessage({ id: 'desk.agent.status.guide.userAgent.deleted' })}
              popperProps={{ modifiers: { offset: { offset: '0, 12' } } }}
              tooltipContentStyle="word-break: break-word;"
              css={css`
                display: inline-block;
                cursor: pointer;

                label {
                  cursor: pointer;
                }
              `}
            >
              <AgentActivationStatus status={AgentActivationStatusValue.DELETED} disabled={true} />
            </Tooltip>
          ) : (
            <ActivationStatusContainer>
              <Dropdown<ActivateDropdownItem>
                selectedItem={selectedActivationStatus}
                items={activateDropdownItems}
                disabled={isDisabledActivationDropdown}
                tooltipProps={tooltipProps}
                toggleRenderer={({ selectedItem }) =>
                  selectedItem?.key && (
                    <ToggleWrapper>
                      <AgentActivationStatus status={selectedItem.key} disabled={isDisabledActivationDropdown} />
                    </ToggleWrapper>
                  )
                }
                itemToElement={(item) => item.label}
                itemToString={(item) => item.label}
                size="small"
                onChange={(item) => {
                  item?.onClick?.();
                  unsubscribeCloseDrawerEvent();
                }}
              />
            </ActivationStatusContainer>
          )),
      },
    ];
  }, [
    activateDropdownItems,
    agent,
    intl,
    isDisabledActivationDropdown,
    latestAgentEmail,
    renderTeamData,
    selectedActivationStatus,
    tooltipProps,
    unsubscribeCloseDrawerEvent,
  ]);

  const agentStatisticsURL = agent ? `/${appId}/desk/reports/agents?agent=${agent.id}` : '';
  const agentStatistics = useMemo(() => {
    const items = [
      {
        intlKey: 'desk.agents.sidebar.lbl.assignments',
        value: data?.numberOfAssignments,
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.firstResponseTime',
        value: data && renderTimestring(data.averageResponseTime),
      },
      {
        intlKey: 'desk.agents.sidebar.lbl.online',
        value: data && renderTimestring(data.onlineDuration),
      },
    ];
    agent?.agentType !== AgentType.BOT &&
      items.push({
        intlKey: 'desk.agents.sidebar.lbl.away',
        value: data && renderTimestring(data.awayDuration),
      });
    return items;
  }, [agent, data]);

  const handleClickBotSettings = useCallback(() => {
    closeDrawer(drawerID);
  }, [closeDrawer]);

  return (
    <Container id={drawerID} ref={containerRef}>
      <ScrollBar>
        <CollapsibleSection>
          <HeaderWrapper>
            <CloseButton buttonType="secondary" icon="close" size="small" onClick={onDialogClose} />
            <AgentAvatarInfo>
              <DeskAgentAvatar
                profileID={agent ? agent.email : ''}
                size={64}
                status={(agent?.connection ?? 'offline').toLowerCase() as 'online' | 'away' | 'offline'}
                imageUrl={agent ? agent.photoThumbnailUrl : undefined}
              />
              <AgentIdentity>
                <h3>
                  {agent && (
                    <TextWithOverflowTooltip
                      tooltipDisplay="inline-flex"
                      css={`
                        max-width: 168px;
                        font-size: 18px;
                        font-weight: 500;
                      `}
                    >
                      {agent.displayName}
                    </TextWithOverflowTooltip>
                  )}
                  {agent && (
                    <AgentBadge
                      size={20}
                      agentType={agent.agentType}
                      role={agent.role}
                      tier={agent.tier}
                      css={`
                        transform: translateY(4px);
                      `}
                    />
                  )}
                </h3>
                <AgentTagInfo>
                  {agent && (
                    <Tag>
                      {intl.formatMessage({
                        id: isBot ? 'desk.agents.sidebar.lbl.agentType.bot' : roleLabelKey[agent.role],
                      })}
                    </Tag>
                  )}
                  {agent?.bot && isBot && (
                    <DeskBotTypeTag
                      type={agent.bot.type}
                      css={css`
                        margin-left: 8px;
                      `}
                    />
                  )}
                  {agent && isBot && agent.status !== AgentActivationStatusValue.DELETED && (
                    <Link
                      to={`/${appId}/desk/settings/bots/${agent.bot?.id}/edit?bot_type=${agent.bot?.type}`}
                      onClick={handleClickBotSettings}
                    >
                      <AgentBotSettingButton
                        icon="settings-filled"
                        size="small"
                        title={intl.formatMessage({ id: 'desk.agents.sidebar.lbl.botSettings' })}
                        tooltipPlacement="bottom"
                      />
                    </Link>
                  )}
                </AgentTagInfo>
              </AgentIdentity>
            </AgentAvatarInfo>
            <dl>
              {agentProfiles.map(({ intlKey, value }) => (
                <>
                  <dt key={`${intlKey}-title`}>{intl.formatMessage({ id: intlKey })}</dt>
                  <dd key={`${intlKey}-value`}>{value}</dd>
                </>
              ))}
            </dl>
          </HeaderWrapper>
        </CollapsibleSection>
        <RecentTickets title={intl.formatMessage({ id: 'desk.agents.sidebar.header.recentTickets' })}>
          {data && data.recentTickets.length > 0 ? (
            <div role="list">
              {data.recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/${appId}/desk/tickets/${ticket.id}`}
                  role="listitem"
                  onClick={onDialogClose}
                >
                  <TicketListItem ticket={ticket} />
                </Link>
              ))}
            </div>
          ) : (
            <CenteredEmptyState
              icon="tickets"
              title={intl.formatMessage({ id: 'desk.agents.sidebar.lbl.noTickets' })}
              description=""
            />
          )}
        </RecentTickets>
        <Statistics title={intl.formatMessage({ id: 'desk.agents.sidebar.header.dailyStatistics' })}>
          <dl>
            {agentStatistics.map(({ intlKey, value }) => (
              <>
                <dt key={`${intlKey}-title`}>{intl.formatMessage({ id: intlKey })}</dt>
                <dd key={`${intlKey}-value`}>
                  <Link to={agentStatisticsURL} onClick={onDialogClose}>
                    {value}
                  </Link>
                </dd>
              </>
            ))}
          </dl>
          <StyledAgentConnectionDiagram
            date={now.format('YYYY-MM-DD')}
            connectionLogs={data ? data.connectionLogs : []}
          />
          <span className="today">
            {today.format(`lll`)} - {now.format('LTS')}
          </span>
        </Statistics>
      </ScrollBar>
    </Container>
  );
};
