import { memo, useState, useMemo, useEffect, useCallback, useContext, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { Switch, Route, useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { Button, cssVariables, SpinnerFull, toast, transitionDefault, Tooltip, TooltipRef } from 'feather';
import sortBy from 'lodash/sortBy';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { LNBContext } from '@core/containers/app/lnbContext';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShowDialog, useUnsaved } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { UnsavedPrompt, useContentContainerHorizontalPadding } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { TicketRuleDetail } from './TicketRuleDetail';
import { TicketRuleList } from './TicketRuleList';
import { TicketRuleStatus, TicketRuleType } from './constants';
import { useRuleType } from './useRuleType';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  grid-auto-flow: row;
  grid-gap: 26px;
`;

const OrderUpdateActions = styled.div<{ isVisible: boolean; isLNBCollapsed; offset: number }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 0 24px;
  width: 1024px;
  height: 64px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  transform: translate(
    ${({ isLNBCollapsed, offset }) => (isLNBCollapsed ? 320 : 480) + offset}px,
    ${({ isVisible }) => (isVisible ? 0 : 64)}px
  );
  transition: transform 0.3s ${transitionDefault};
  background: ${cssVariables('neutral-1')};
`;

const SaveButton = styled(Button)`
  margin-left: 8px;
`;

const DescriptionLightText = styled.i`
  font-style: normal;
  color: ${cssVariables('neutral-6')};
`;
const DescriptionLightBoldText = styled.b`
  font-weight: 500;
  color: ${cssVariables('neutral-6')};
`;

const NoRules = styled(CenteredEmptyState)`
  padding: 149px 16px;
`;

const MAX_RULES_LIMIT = 50; // maximum 20 rules are allowed to create but set it to 50 for better capacity

type UpdateTicketRuleStatusRequest = (params: Pick<TicketRule, 'id' | 'status' | 'name'>) => Promise<boolean>;
type UpdateTicketRuleOrderRequest = (orders: TicketRuleOrder[]) => Promise<boolean>;
type ReorderRules = (params: { startIndex: number; endIndex: number }) => void;

export const TicketRule = memo(() => {
  const intl = useIntl();
  const match = useRouteMatch();
  const history = useHistory();

  const { pid, region } = useProjectIdAndRegion();
  const { unsaved, setUnsaved } = useUnsaved();
  const showDialog = useShowDialog();
  const contentContainerHorizontalPadding = useContentContainerHorizontalPadding();
  const currentRuleType = useRuleType();
  const { getErrorMessage } = useDeskErrorHandler();

  const { isCollapsed: isLNBCollapsed } = useContext(LNBContext);

  const [rules, setRules] = useState<TicketRule[]>([]);
  const [previousRules, setPreviousRules] = useState<TicketRule[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const isOrderUpdatable = previousRules.some((prev, index) => {
    const currentRule = sortBy(rules)[index];
    return currentRule && prev.order !== currentRule.order;
  });

  const createButtonTooltipRef = useRef<TooltipRef | null>(null);
  const isCreateButtonTooltipVisible = rules.length >= 20;

  const fetchTicketRulesRequest = useCallback(async () => {
    setIsFetching(true);
    try {
      const {
        data: { results },
      } = await deskApi.fetchTicketRules(pid, region, {
        type: currentRuleType.type,
        offset: 0,
        limit: MAX_RULES_LIMIT,
      });

      /**
       * FIXME:
       * Remove legacy @type TicketRuleConsequentDeprecated when back-end data migration is done
       */
      const rules = results.map((rule) => {
        if (currentRuleType.type === TicketRuleType.PRIORITY) {
          if (
            currentRuleType.type === TicketRuleType.PRIORITY &&
            (rule.conditional.consequent as TicketRuleConsequentPriority)._priority === undefined
          ) {
            const { type, ...legacyConsequentProperties } = rule.conditional
              .consequent as TicketRuleConsequentDeprecated;

            return {
              ...rule,
              conditional: {
                ...rule.conditional,
                consequent: {
                  type,
                  _priority: {
                    ...legacyConsequentProperties,
                  },
                } as TicketRuleConsequentPriority,
              },
            };
          }
          return rule;
        }

        if (!(rule.conditional.consequent as TicketRuleConsequentGroup)._group) {
          const { type, ...legacyConsequentProperties } = rule.conditional.consequent as TicketRuleConsequentDeprecated;

          return {
            ...rule,
            conditional: {
              ...rule.conditional,
              consequent: {
                type,
                _group: {
                  ...legacyConsequentProperties,
                },
              } as TicketRuleConsequentGroup,
            },
          };
        }

        return rule;
      });

      setRules(rules);
      setPreviousRules(results);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setIsFetching(false);
    }
  }, [currentRuleType.type, getErrorMessage, pid, region]);

  const updateTicketRuleStatusRequest: UpdateTicketRuleStatusRequest = useCallback(
    async ({ id, status, name }) => {
      setIsFetching(true);

      try {
        await deskApi.updateTicketRule(pid, region, {
          id,
          status,
        });

        toast.success({
          message: intl.formatMessage(
            {
              id: `desk.settings.ticketRules.toast.status${status === TicketRuleStatus.ON ? 'On' : 'Off'}.success`,
            },
            { ruleName: name },
          ),
        });

        return true; // isUpdated
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [getErrorMessage, intl, pid, region],
  );

  const updateTicketRuleOrderRequest: UpdateTicketRuleOrderRequest = useCallback(
    async (orders) => {
      setIsFetching(true);
      try {
        await deskApi.updateTicketRuleOrder(pid, region, {
          type: currentRuleType.type,
          orders,
        });
        toast.success({ message: intl.formatMessage({ id: 'desk.settings.ticketRules.toast.order.success' }) });
        return true;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [currentRuleType.type, getErrorMessage, intl, pid, region],
  );

  const deleteTicketRuleRequest = useCallback(
    async (id: TicketRule['id']) => {
      setIsFetching(true);
      try {
        await deskApi.deleteTicketRule(pid, region, { id });
        toast.success({
          message: intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.toast.delete.success` }),
        });
        return true;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [currentRuleType.intlKeyByType, getErrorMessage, intl, pid, region],
  );

  const handleReorderRules: ReorderRules = useCallback(
    ({ startIndex, endIndex }) => {
      const isMovedDown = startIndex < endIndex;
      const isPushed = (order: number) =>
        isMovedDown ? order > startIndex && order < endIndex : order < startIndex && order > endIndex;

      const reorderedRules = rules.map((rule) => {
        if (rule.order === startIndex) {
          return { ...rule, order: endIndex };
        }

        if (rule.order === endIndex) {
          return { ...rule, order: isMovedDown ? endIndex - 1 : endIndex + 1 };
        }

        if (isPushed(rule.order)) {
          const pushedIndex = isMovedDown ? rule.order - 1 : rule.order + 1;
          return { ...rule, order: pushedIndex };
        }

        return rule;
      });

      setRules(reorderedRules);
    },
    [rules],
  );

  const handleCreateClick = useCallback(() => {
    match && history.push(`${match.url}/create`);
  }, [history, match]);

  const handleEditClick = useCallback(
    (id: number) => {
      match && history.push(`${match.url}/${id}`);
    },
    [history, match],
  );

  const handleDeleteClick = useCallback(
    (id: number, name: string) => {
      showDialog({
        dialogTypes: DialogType.Delete,
        dialogProps: {
          title: intl.formatMessage(
            { id: 'desk.settings.ticketRules.dialog.delete.title' },
            {
              ruleName: name,
            },
          ),
          description: intl.formatMessage({
            id: `desk.settings.${currentRuleType.intlKeyByType}.dialog.delete.description`,
          }),
          confirmText: intl.formatMessage({ id: 'desk.settings.ticketRules.dialog.delete.button' }),
          cancelText: intl.formatMessage({ id: 'desk.settings.ticketRules.dialog.cancel.button' }),
          onDelete: async (setIsDeleting) => {
            setIsDeleting(true);
            if (await deleteTicketRuleRequest(id)) {
              fetchTicketRulesRequest();
            }
          },
        },
      });
    },
    [currentRuleType.intlKeyByType, deleteTicketRuleRequest, fetchTicketRulesRequest, intl, showDialog],
  );

  const handleStatusToggleClick = useCallback(
    (id: number, name: string, checked: boolean) => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage(
            { id: 'desk.settings.ticketRules.dialog.statusToggle.title' },
            {
              ruleStatus: checked
                ? intl.formatMessage({ id: `desk.settings.ticketRules.list.ruleStatus.turnOn` })
                : intl.formatMessage({ id: `desk.settings.ticketRules.list.ruleStatus.turnOff` }),
              ruleName: name,
            },
          ),
          description: checked
            ? intl.formatMessage({
                id: `desk.settings.${currentRuleType.intlKeyByType}.dialog.statusToggle.description.on`,
              })
            : intl.formatMessage({
                id: `desk.settings.${currentRuleType.intlKeyByType}.dialog.statusToggle.description.off`,
              }),
          confirmText: checked
            ? intl.formatMessage({ id: `desk.settings.ticketRules.list.ruleStatus.turnOn` })
            : intl.formatMessage({ id: `desk.settings.ticketRules.list.ruleStatus.turnOff` }),
          onConfirm: async (setIsPending) => {
            setIsPending(true);
            if (
              await updateTicketRuleStatusRequest({
                id,
                status: checked ? TicketRuleStatus.ON : TicketRuleStatus.OFF,
                name,
              })
            ) {
              fetchTicketRulesRequest();
            }
          },
        },
      });
    },
    [currentRuleType.intlKeyByType, fetchTicketRulesRequest, intl, showDialog, updateTicketRuleStatusRequest],
  );

  const handleCancelOrder = () => {
    setRules(previousRules);
  };

  const handleSaveOrder = async () => {
    const newOrders = rules.map(({ id, order }) => ({ id, order }));
    await updateTicketRuleOrderRequest(newOrders).then((isUpdated) => {
      if (isUpdated) {
        setPreviousRules(rules);
      }
    });
  };

  useEffect(() => {
    /**
     * re-fetch data when location is updated between list and detail page
     */
    const unListen = history.listen((location) => {
      const pathSplits = location.pathname.split('/');
      if (pathSplits[pathSplits.length - 1] === currentRuleType.pathname) {
        fetchTicketRulesRequest();
      }
    });

    return () => {
      unListen();
    };
  }, [currentRuleType.pathname, fetchTicketRulesRequest, history]);

  useEffect(() => {
    fetchTicketRulesRequest();
  }, [fetchTicketRulesRequest]);

  useEffect(() => {
    if (isCreateButtonTooltipVisible) {
      createButtonTooltipRef.current?.show();
      return;
    }
    createButtonTooltipRef.current?.hide();
  }, [isCreateButtonTooltipVisible]);

  useEffect(() => {
    setUnsaved(isOrderUpdatable);

    return () => {
      setUnsaved(false);
    };
  }, [isOrderUpdatable, setUnsaved]);

  const empty = useMemo(
    () => (
      <NoRules
        icon="rule"
        title={intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.list.empty.header` })}
        description={intl.formatMessage({
          id: `desk.settings.${currentRuleType.intlKeyByType}.list.empty.description`,
        })}
      />
    ),
    [currentRuleType.intlKeyByType, intl],
  );

  const ruleList = useMemo(() => {
    return (
      <TicketRuleList
        rules={sortBy(rules, 'order')}
        isActionDisabled={isOrderUpdatable}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onUpdateStatus={handleStatusToggleClick}
        onReorder={handleReorderRules}
      />
    );
  }, [handleDeleteClick, handleEditClick, handleReorderRules, handleStatusToggleClick, isOrderUpdatable, rules]);

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader
        css={`
          * + ${AppSettingPageHeader.Description} {
            margin-top: 24px;
          }
        `}
      >
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.pageTitle` })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <Tooltip
            ref={createButtonTooltipRef}
            placement="bottom-end"
            content={intl.formatMessage({
              id: `desk.settings.${currentRuleType.intlKeyByType}.button.create.tooltip.max`,
            })}
            disabled={isFetching || !isCreateButtonTooltipVisible}
          >
            <Button
              buttonType="primary"
              icon="plus"
              size="small"
              disabled={isFetching || isCreateButtonTooltipVisible || isOrderUpdatable}
              onClick={handleCreateClick}
              css={`
                flex: none;
                margin-left: 8px;
              `}
            >
              {intl.formatMessage({ id: 'desk.settings.ticketRules.button.create' })}
            </Button>
          </Tooltip>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description>
          {intl.formatMessage(
            { id: `desk.settings.${currentRuleType.intlKeyByType}.description` },
            {
              i: (text: string) => <DescriptionLightText>{text}</DescriptionLightText>,
              b: (text: string) => <DescriptionLightBoldText>{text}</DescriptionLightBoldText>,
              break: <br />,
            },
          )}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <UnsavedPrompt when={unsaved} />
      <Wrapper>
        {isFetching && <SpinnerFull transparent={true} />}
        {rules.length > 0 ? ruleList : empty}
      </Wrapper>
      <OrderUpdateActions
        isVisible={isOrderUpdatable}
        isLNBCollapsed={isLNBCollapsed}
        offset={contentContainerHorizontalPadding - 32}
      >
        <Button buttonType="tertiary" disabled={!isOrderUpdatable || isFetching} onClick={handleCancelOrder}>
          {intl.formatMessage({ id: 'desk.settings.ticketRules.list.order.button.cancel' })}
        </Button>
        <SaveButton buttonType="primary" disabled={!isOrderUpdatable || isFetching} onClick={handleSaveOrder}>
          {intl.formatMessage({ id: 'desk.settings.ticketRules.list.order.button.save' })}
        </SaveButton>
      </OrderUpdateActions>
      <Switch>
        <Route path={`${match?.url}/create`} component={TicketRuleDetail} />
        <Route path={`${match?.url}/:ruleId`} component={TicketRuleDetail} />
      </Switch>
    </AppSettingsContainer>
  );
});
