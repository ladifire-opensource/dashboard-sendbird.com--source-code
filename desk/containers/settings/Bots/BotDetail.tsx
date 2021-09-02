import { FC, useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useForm, FormProvider, SubmitHandler, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useParams, useHistory, Redirect } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { toast, Button, SpinnerFull, Spinner, TabbedInterface } from 'feather';
import isEmpty from 'lodash/isEmpty';
import qs from 'qs';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import {
  AgentActivationStatusValue,
  DeskBotDetailTab,
  DeskBotType,
  DeskFAQBotFilesSortBy,
  SortOrder,
} from '@constants';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAppId, useAsync, useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useIsFAQBotEnabled } from '@hooks/useIsFAQBotEnabled';
import { useQueryString } from '@hooks/useQueryString';
import { DeskBotTypeTag, UnsavedPrompt } from '@ui/components';
import { logException } from '@utils';

import { CustomizedBotSettings, FAQBotSettings } from './BotDetailSettings';
import { DeskBotDetailStatusDropdown } from './DeskBotDetailStatusDropdown';
import { BotDetailContext, DeskBotFormMode } from './botDetailContext';
import { DeskBotFileUploadSetting } from './fileSettings';
import { BOT_FILES_LIST_LIMIT } from './fileSettings/DeskFAQBotFiles';
import { useDefaultBotFormValues } from './useDefaultBotFormValues';
import { useDeskBotFormMode } from './useDeskBotFormMode';

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button + button {
    margin-left: 8px;
  }
`;

const HiddenTextInput = styled.input`
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  overflow: auto;
  min-width: initial;
  visibility: hidden;
  pointer-events: none;
`;

/**
 * FIXME:
 * This hide focus outline on tab.
 * If there is another way to hide tab's outline at the moment of tab change to bot file page
 * without actually removing focus from element, you can remove overriding css below.
 * */
const BotDetailContentContainer = styled.div`
  a[role='tab']:focus {
    box-shadow: none !important;
  }
`;

enum KeyName {
  TOAST_SUCCESS,
}

const INTL_KEYS = {
  [DeskBotType.CUSTOMIZED]: {
    [KeyName.TOAST_SUCCESS]: 'desk.settings.bots.detail.form.toast.create.custom.success',
  },
  [DeskBotType.FAQBOT]: {
    [KeyName.TOAST_SUCCESS]: 'desk.settings.bots.detail.form.toast.create.faq.success',
  },
};

const useBotIntl = (botType?: DeskBotType) => {
  const intl = useIntl();
  const keys = botType ? INTL_KEYS[botType] : undefined;
  return (keyName: KeyName) => {
    const key = keys?.[keyName];
    return key ? intl.formatMessage({ id: key }) : keyName;
  };
};
const NUMBER_REGEX = new RegExp(/^[0-9]+$/);
const getNumberTypeTabValue = (tab?: DeskBotDetailTab): DeskBotDetailTab => {
  if (
    tab !== undefined &&
    ([DeskBotDetailTab.FILES, DeskBotDetailTab.SETTINGS].includes(tab) ||
      (typeof tab === 'string' && NUMBER_REGEX.test(tab)))
  ) {
    return tab;
  }
  return DeskBotDetailTab.SETTINGS;
};

export const getBotByType = ({ bot, formMode }: { bot: DeskBotDetail; formMode: DeskBotFormMode }) => {
  const {
    key,
    timeoutSeconds,
    agent,
    project,
    status,
    photoUrl,
    isUnreadError,
    updatedAt,
    createdAt,
    type,
    ...others
  } = bot;

  if (type === DeskBotType.CUSTOMIZED) {
    const { noResultsMessage, questionSelectedMessage, ...customizedBotValues } = others;
    const customBotResetData: DeskCustomizedBotFormValues = {
      type,
      key: formMode === DeskBotFormMode.EDIT ? key : '',
      timeLimitMinutes: Math.floor(timeoutSeconds / 60),
      timeLimitSeconds: timeoutSeconds % 60,
      profileFile: null,
      ...customizedBotValues,
    };
    return customBotResetData;
  }

  if (type === DeskBotType.FAQBOT) {
    const { webhookUrl, fallbackRetryLimit, serverErrorMessage, timeoutMessage, ...faqBotValues } = others;
    const customBotResetData: DeskFAQBotFormValues = {
      type,
      key: formMode === DeskBotFormMode.EDIT ? key : '',
      profileFile: null,
      ...faqBotValues,
    };
    return customBotResetData;
  }

  return null;
};

export const BotDetail: FC = () => {
  const intl = useIntl();
  const history = useHistory<{ backUrl?: string } | undefined>();
  const appId = useAppId();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const showDialog = useShowDialog();
  const { botId } = useParams<{ botId: string }>();
  const { updateParams, ...queryParams } = useQueryString<DeskBotDetailQueryParams>({
    tab: DeskBotDetailTab.SETTINGS,
    page: 1,
    pageSize: BOT_FILES_LIST_LIMIT,
  });
  const defaultValues = useDefaultBotFormValues(queryParams.botType || DeskBotType.CUSTOMIZED);
  const botIntl = useBotIntl(queryParams.botType);
  const isFAQBotEnabled = useIsFAQBotEnabled();

  const [activeTabIndex, setActiveTabIndex] = useState(getNumberTypeTabValue(queryParams.tab));

  const formMethods = useForm<BotFormValues>({
    mode: 'onChange',
    defaultValues,
  });
  const { formState, handleSubmit, getValues, control, reset, errors } = formMethods;
  const isFormValid = formState.isValid || isEmpty(errors); // FIXME: so tricky solution... // jacob added isEmpty(errors)
  const isFormDirty = formState.isDirty;
  const isFormSubmitted = formState.isSubmitted;

  const [bot, setBot] = useState<DeskBotDetail>();
  const [submittedValues, setSubmittedValues] = useState<BotFormValues>();
  const { mode } = useDeskBotFormMode();

  const shouldPreventUnsavedPromptRef = useRef(false);
  const hasSeenFileUploadGuideDialogRef = useRef(false);
  const backUrlRef = useRef<string | null>(null);

  const [{ status: fetchDeskBotStatus, data: fetchDeskBotData, error: fetchDeskBotError }, fetchDeskBot] = useAsync(
    (id: DeskBot['id']) => deskApi.fetchDeskBot(pid, region, { id }),
    [pid, region],
  );
  const [
    { status: createDeskBotStatus, data: createDeskBotData, error: createDeskBotError },
    createDeskBot,
  ] = useAsync((payload: CreateDeskBotAPIPayload) => deskApi.createDeskBot(pid, region, payload), [pid, region]);
  const [
    { status: updateDeskBotStatus, data: updateDeskBotData, error: updateDeskBotError },
    updateDeskBot,
  ] = useAsync((payload: UpdateDeskBotAPIPayload) => deskApi.updateDeskBot(pid, region, payload), [pid, region]);

  const fetchDeskBotRequest = useCallback(() => {
    if (botId) {
      fetchDeskBot(Number(botId));
    }
  }, [botId, fetchDeskBot]);

  /**
   * SUBJECT: @var backUrlRef.current
   *
   * As an admin navigate between tabs, it loses @var history.location.state.backUrl
   * @var backUrlRef.current will store valid backUrl with query string of filter values from Bot list.
   */
  const backUrl = useMemo(() => {
    if (typeof history.location.state?.backUrl === 'string') {
      backUrlRef.current = history.location.state.backUrl;
    }
    return backUrlRef.current ?? `/${appId}/desk/settings/bots`;
  }, [appId, history.location.state]);

  const isBotTypeCustomized = queryParams.botType === DeskBotType.CUSTOMIZED;
  const isBotTypeFAQBot = queryParams.botType === DeskBotType.FAQBOT;

  const handleDeleteButtonClick = useCallback(() => {
    if (bot) {
      showDialog({
        dialogTypes: DialogType.DeleteDeskBot,
        dialogProps: {
          agentId: bot.agent.id,
          onSuccess: () => history.push(backUrl),
        },
      });
    }
  }, [backUrl, bot, history, showDialog]);

  const convertFormValuesToPayload = useCallback(
    (updates: Partial<BotFormValues>) => {
      const { profileFile, ...payload } = updates;

      // specific payload for Custom bot
      if (isBotTypeCustomized) {
        const customizedPayload = payload as DeskCustomizedBotFormValues;
        const { timeLimitMinutes, timeLimitSeconds } = customizedPayload;
        if (typeof timeLimitMinutes === 'number' && typeof timeLimitSeconds === 'number') {
          payload['timeoutSeconds'] = timeLimitMinutes * 60 + timeLimitSeconds;
        }
      }

      if (profileFile && profileFile.length > 0) {
        [payload['profileFile']] = profileFile;
      }

      if (mode === DeskBotFormMode.DUPLICATE && typeof bot?.photoUrl === 'string' && bot.photoUrl.trim().length > 0) {
        payload['photoUrl'] = bot.photoUrl;
      }

      return payload;
    },
    [bot, isBotTypeCustomized, mode],
  );

  const onSubmit: SubmitHandler<BotFormValues> = useCallback(
    async (values) => {
      shouldPreventUnsavedPromptRef.current = true;
      setSubmittedValues(values);
      if (mode === DeskBotFormMode.CREATE || mode === DeskBotFormMode.DUPLICATE) {
        await createDeskBot(convertFormValuesToPayload(values) as CreateDeskBotAPIPayload);
        return;
      }
      if (mode === DeskBotFormMode.EDIT) {
        await updateDeskBot({
          id: Number(botId),
          payload: convertFormValuesToPayload(
            Object.keys(formState.dirtyFields).reduce((dirtyFieldsMap, dirtyFieldName) => {
              if (dirtyFieldName === 'timeLimitMinutes' || dirtyFieldName === 'timeLimitSeconds') {
                // Should update both 'timeLimitMinutes' and 'timeLimitSeconds' though just one value is changed
                return {
                  timeLimitMinutes: getValues('timeLimitMinutes'),
                  timeLimitSeconds: getValues('timeLimitSeconds'),
                  ...dirtyFieldsMap,
                };
              }
              return { [dirtyFieldName]: getValues(dirtyFieldName), ...dirtyFieldsMap };
            }, {}) as BotFormValues,
          ),
        });
      }
    },
    [botId, convertFormValuesToPayload, createDeskBot, formState.dirtyFields, getValues, mode, updateDeskBot],
  );

  const resetForm = useCallback(
    (currentBot: DeskBotDetail) => {
      const bot = getBotByType({ bot: currentBot, formMode: mode });
      if (bot) {
        reset(bot);
      }
    },
    [mode, reset],
  );

  const navigateToEditPage = useCallback(
    (created: DeskBotDetail) => {
      history.replace(`/${appId}/desk/settings/bots/${created.id}/edit?bot_type=${created.type}`);
    },
    [appId, history],
  );

  useEffect(() => {
    fetchDeskBotRequest();

    if (isBotTypeFAQBot) {
      setActiveTabIndex(getNumberTypeTabValue(queryParams.tab));
    }
  }, [fetchDeskBotRequest, isBotTypeFAQBot, queryParams.tab]);

  useEffect(() => {
    if (
      (mode === DeskBotFormMode.EDIT || mode === DeskBotFormMode.DUPLICATE) &&
      fetchDeskBotStatus === 'success' &&
      fetchDeskBotData != null
    ) {
      setBot(fetchDeskBotData.data);
      resetForm(fetchDeskBotData.data);
      shouldPreventUnsavedPromptRef.current = false;
    }
  }, [fetchDeskBotData, fetchDeskBotStatus, mode, resetForm]);

  useEffect(() => {
    if (createDeskBotStatus === 'success' && createDeskBotData && submittedValues && formState.isSubmitted) {
      const created = createDeskBotData.data;
      reset(submittedValues);
      setBot(created);

      if (mode === DeskBotFormMode.CREATE) {
        toast.success({ message: botIntl(KeyName.TOAST_SUCCESS) });
      }

      if (mode === DeskBotFormMode.DUPLICATE) {
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.toast.duplicate.success' }),
        });
      }

      if (isBotTypeFAQBot && !hasSeenFileUploadGuideDialogRef.current) {
        showDialog({
          dialogTypes: DialogType.Confirm,
          dialogProps: {
            title: intl.formatMessage({ id: 'desk.settings.bots.dialog.createdDialog.title' }),
            description: intl.formatMessage(
              { id: 'desk.settings.bots.dialog.createdDialog.desc' },
              { botName: created.name },
            ),
            cancelText: intl.formatMessage({ id: 'desk.settings.bots.dialog.createdDialog.button.skip' }),
            confirmText: intl.formatMessage({ id: 'desk.settings.bots.dialog.createdDialog.button.upload' }),
            onClose: () => {
              navigateToEditPage(created);
            },
            onCancel: () => {
              hasSeenFileUploadGuideDialogRef.current = true;
              navigateToEditPage(created);
            },
            onConfirm: () => {
              hasSeenFileUploadGuideDialogRef.current = true;
              const faqFilesParams = {
                name: created.name,
                bot_type: created.type,
                tab: DeskBotDetailTab.FILES,
                page: 1,
                pageSize: BOT_FILES_LIST_LIMIT,
                sortOrder: SortOrder.DESCEND,
                sortBy: DeskFAQBotFilesSortBy.CREATED_AT,
              };
              history.push(`/${appId}/desk/settings/bots/${created.id}/edit?${qs.stringify(faqFilesParams)}`, {
                backUrl,
              });
            },
          },
        });
      } else {
        navigateToEditPage(created);
      }
    }
  }, [
    appId,
    backUrl,
    botIntl,
    createDeskBotData,
    createDeskBotStatus,
    formState.isSubmitted,
    history,
    intl,
    isBotTypeFAQBot,
    mode,
    navigateToEditPage,
    reset,
    showDialog,
    submittedValues,
  ]);

  useEffect(() => {
    if (updateDeskBotStatus === 'success' && updateDeskBotData && submittedValues && formState.isSubmitted) {
      toast.success({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.toast.update.success' }) });
      reset(submittedValues);
      setBot(updateDeskBotData.data);
    }
  }, [
    formState.isSubmitted,
    getValues,
    intl,
    reset,
    submittedValues,
    updateDeskBotData,
    updateDeskBotStatus,
    updateParams,
  ]);

  useEffect(() => {
    if (fetchDeskBotStatus === 'error') {
      toast.error({ message: getErrorMessage(fetchDeskBotError) });
      history.push(backUrl);
    }
  }, [backUrl, fetchDeskBotError, fetchDeskBotStatus, getErrorMessage, history]);

  useEffect(() => {
    if (createDeskBotStatus === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.toast.create.error' }) });
      logException(createDeskBotError);
    }
  }, [intl, createDeskBotStatus, createDeskBotError]);

  useEffect(() => {
    if (updateDeskBotStatus === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.toast.update.error' }) });
      logException(updateDeskBotError);
    }
  }, [intl, updateDeskBotError, updateDeskBotStatus]);

  const title = useMemo(() => {
    const tagStyle = css`
      margin: 0 8px;
      transform: translateY(-2px);
    `;
    if (mode === DeskBotFormMode.CREATE) {
      return (
        <>
          {intl.formatMessage({ id: 'desk.settings.bots.detail.create.title' })}
          {queryParams.botType && <DeskBotTypeTag type={queryParams.botType} css={tagStyle} />}
        </>
      );
    }
    if (mode === DeskBotFormMode.DUPLICATE) {
      return (
        <>
          {intl.formatMessage({ id: 'desk.settings.bots.detail.duplicate.title' })}
          {queryParams.botType && <DeskBotTypeTag type={queryParams.botType} css={tagStyle} />}
        </>
      );
    }
    if (mode === DeskBotFormMode.EDIT) {
      if (bot) {
        return (
          <>
            {bot.name}
            {bot && <DeskBotTypeTag type={bot.type} css={tagStyle} />}
          </>
        );
      }
      if (fetchDeskBotStatus === 'loading') {
        return <Spinner />;
      }
      return null;
    }
    return null;
  }, [bot, fetchDeskBotStatus, intl, mode, queryParams.botType]);

  const formActions = useMemo(
    () => (
      <FormActions>
        {mode === DeskBotFormMode.EDIT && (
          <Button
            buttonType="primary"
            variant="ghost"
            icon="delete"
            css={css`
              margin-right: auto;
            `}
            onClick={handleDeleteButtonClick}
          >
            {intl.formatMessage({ id: 'desk.settings.bots.detail.form.actions.button.delete' })}
          </Button>
        )}
        <Button buttonType="tertiary" onClick={() => history.push(backUrl)} data-test-id="CancelButton">
          {intl.formatMessage({ id: 'desk.settings.bots.detail.form.actions.button.cancel' })}
        </Button>
        <Button
          buttonType="primary"
          type="submit"
          disabled={!(formState.isDirty && isFormValid)}
          isLoading={createDeskBotStatus === 'loading' || updateDeskBotStatus === 'loading'}
          data-test-id="SaveButton"
        >
          {intl.formatMessage({ id: 'desk.settings.bots.detail.form.actions.button.save' })}
        </Button>
      </FormActions>
    ),
    [
      backUrl,
      createDeskBotStatus,
      formState.isDirty,
      handleDeleteButtonClick,
      history,
      intl,
      isFormValid,
      mode,
      updateDeskBotStatus,
    ],
  );

  const botSettings = useCallback(
    (index) => {
      if (index === DeskBotDetailTab.SETTINGS) {
        return (
          <FormProvider {...formMethods}>
            {fetchDeskBotStatus === 'loading' && <SpinnerFull transparent={true} />}
            <form
              onSubmit={handleSubmit(onSubmit)}
              css={`
                margin-top: ${isBotTypeFAQBot ? 24 : 0}px;
              `}
            >
              <Controller
                type="hidden"
                defaultValue={queryParams.botType}
                control={control}
                name="type"
                render={({ onChange, onBlur, value, name, ref }) => {
                  return <HiddenTextInput ref={ref} name={name} value={value} onChange={onChange} onBlur={onBlur} />;
                }}
              />
              {isBotTypeCustomized && <CustomizedBotSettings />}
              {isBotTypeFAQBot && <FAQBotSettings />}
              {formActions}
            </form>
          </FormProvider>
        );
      }

      if (index === DeskBotDetailTab.FILES) {
        return (
          <div
            css={`
              margin-top: ${isBotTypeFAQBot ? 24 : 0}px;
            `}
          >
            <DeskBotFileUploadSetting />
          </div>
        );
      }
    },
    [
      control,
      fetchDeskBotStatus,
      formActions,
      handleSubmit,
      isBotTypeCustomized,
      isBotTypeFAQBot,
      formMethods,
      onSubmit,
      queryParams.botType,
    ],
  );

  const handleBotDetailStatusChange = useCallback((status: AgentActivationStatusValue) => {
    setBot((prev) => (prev ? { ...prev, status, agent: { ...prev.agent, status } } : prev));
  }, []);

  const handleBotTabChange = ({ index: tabIndex }: { index: number }) => {
    updateParams({
      tab: tabIndex,
      ...(tabIndex === DeskBotDetailTab.FILES
        ? {
            page: queryParams.page || 1,
            pageSize: queryParams.pageSize || BOT_FILES_LIST_LIMIT,
            sortOrder: SortOrder.DESCEND,
            sortBy: DeskFAQBotFilesSortBy.CREATED_AT,
          }
        : {
            page: undefined,
            pageSize: undefined,
            sortOrder: undefined,
            sortBy: undefined,
          }),
    });
  };

  /**
   * Redirect customer to backUrl form who dose not have right to use FAQ bot.
   */
  if (!isFAQBotEnabled && queryParams.botType !== DeskBotType.CUSTOMIZED) {
    return <Redirect to={backUrl} />;
  }
  if (bot !== undefined && bot.type !== queryParams.botType) {
    return <Redirect to={backUrl} />;
  }

  return (
    <AppSettingsContainer>
      <UnsavedPrompt
        when={
          !shouldPreventUnsavedPromptRef.current &&
          (queryParams.tab === undefined || queryParams.tab === DeskBotDetailTab.SETTINGS) &&
          isFormDirty &&
          !isFormSubmitted
        }
      />
      <AppSettingPageHeader>
        <AppSettingPageHeader.BackButton href={backUrl} />
        <AppSettingPageHeader.Title role="heading">{title}</AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions data-test-id="PageHeaderActions">
          <DeskBotDetailStatusDropdown mode={mode} bot={bot} onChange={handleBotDetailStatusChange} />
        </AppSettingPageHeader.Actions>
      </AppSettingPageHeader>
      <BotDetailContentContainer>
        <BotDetailContext.Provider value={{ bot, mode, queryParams, updateParams, fetchDeskBotRequest }}>
          {isBotTypeFAQBot && (
            <TabbedInterface
              tabs={[
                {
                  title: intl.formatMessage({ id: 'desk.settings.bots.detail.tabs.general' }),
                  id: DeskBotDetailTab.SETTINGS.toString(),
                },
                {
                  title: intl.formatMessage({ id: 'desk.settings.bots.detail.tabs.faqFiles' }),
                  id: DeskBotDetailTab.FILES.toString(),
                },
              ]}
              activeTabIndex={activeTabIndex}
              onActiveTabChange={handleBotTabChange}
            >
              {(tab, index) => botSettings(index)}
            </TabbedInterface>
          )}
          {isBotTypeCustomized && botSettings(DeskBotDetailTab.SETTINGS)}
        </BotDetailContext.Provider>
      </BotDetailContentContainer>
    </AppSettingsContainer>
  );
};
