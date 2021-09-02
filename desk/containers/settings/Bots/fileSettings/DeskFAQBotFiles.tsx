import React, { ComponentProps, FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  Button,
  cssVariables,
  EmptyState,
  EmptyStateSize,
  Table,
  Radio,
  toast,
  TableColumnProps,
  transitions,
  OverflowMenu,
  InlineNotification,
} from 'feather';
import moment from 'moment';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  DeskFAQBotFilesSortBy,
  DeskBotFileStatus,
  EMPTY_TEXT,
  SortOrder,
  DeskBotDetailTab,
  TicketStatus,
} from '@constants';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import {
  DeskBotFileStatusDefinition,
  InfoTooltip,
  Paginator,
  SlideTransition,
  TextWithOverflowTooltip,
  TicketAgent,
  TicketStatusLozenge,
} from '@ui/components';
import { logException } from '@utils';

import { BotDetailContext, DeskBotFormMode } from '../botDetailContext';

const FilesHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 0;
`;

const FilesHeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const FilesHeaderActions = styled.div`
  flex: 1;
  position: relative;
  text-align: right;
`;

const FilesTitle = styled.h2`
  line-height: 1.25;
  letter-spacing: -0.15px;
  white-space: pre-wrap;
  color: ${cssVariables('neutral-10')};
  font-size: 16px;
  font-weight: 500;
`;
const ActionButton = styled(Button)`
  & + & {
    margin-left: 4px;
  }
`;

const FilesBody = styled.div``;

const EmptyStateContainer = styled(EmptyState).attrs({ size: EmptyStateSize.Large })`
  margin: 104px auto;
`;

const BotRadio = styled(Radio)`
  width: 14px;
  height: 14px;

  &::before {
    top: 2px;
    left: 2px;
    width: 6px;
    height: 6px;
  }
`;

const FilesContainer = styled.div<{ $disabled: boolean }>`
  width: 100%;
  border-top: 1px solid ${cssVariables('neutral-3')};

  ${({ $disabled }) =>
    $disabled &&
    css`
      ${FilesTitle}, th > span {
        color: ${cssVariables('neutral-5')};
      }
    `};
`;

const StyledTicketStatusLozenge = styled(TicketStatusLozenge)`
  display: inline-block;
  margin: 0 4px;
`;

const InvalidFileStatusDimmer = styled(TextWithOverflowTooltip)<{ $isInvalid: boolean }>`
  opacity: ${({ $isInvalid }) => ($isInvalid ? 0.4 : 1)};
  transition: ${transitions({ duration: 0.3, properties: ['opacity'] })};
`;

const INVALID_FILE_STATUS_TYPES = [DeskBotFileStatus.ERROR, DeskBotFileStatus.EXPIRED, DeskBotFileStatus.DELETED];

export const BOT_FILES_LIST_LIMIT = 10;

type Props = {
  shouldRefetchFiles: boolean;
  isSelectBotFileMode: boolean;
  setIsSelectBotFileMode: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Subject: PROCESSING bot file checking interval
 *
 * It is variable to manage the interval checking bot file status.
 * It will also be used to clearInterval when the component is unmounted.
 */
let intervalIds = {};

export const DeskFAQBotFiles: FC<Props> = ({ shouldRefetchFiles, isSelectBotFileMode, setIsSelectBotFileMode }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const showDialog = useShowDialog();
  const { getErrorMessage } = useDeskErrorHandler();

  const { mode, bot, queryParams, updateParams, fetchDeskBotRequest } = useContext(BotDetailContext);
  const botId = bot?.id;
  const isDuplicationMode = mode === DeskBotFormMode.DUPLICATE;
  const isFilesDisabled = bot === undefined;
  const { tab, page, pageSize, sortBy, sortOrder } = queryParams;

  const [faqBotFiles, setFaqBotFiles] = useState<DeskFAQBotFile[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [activeFAQBotFileId, setActiveFAQBotFileId] = useState(-1);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileProcessingIntervalIds = useRef<Record<DeskFAQBotFile['id'], NodeJS.Timeout | null>>({});
  const updateFileStatusRequestTypeRef = useRef<DeskBotFileStatus>();

  const [{ status: fetchDeskFAQBotFilesStatus, data: fetchDeskFAQBotFilesData }, fetchDeskFAQBotFiles] = useAsync(
    (payload: FetchDeskFAQBotFilesAPIPayload) => deskApi.fetchDeskFAQBotFiles(pid, region, payload),
    [pid, region],
  );

  const [
    { status: updateDeskFAQBotFileStatus, data: updateDeskFAQBotFileData, error: updateDeskFAQBotFileError },
    updateDeskFAQBotFile,
  ] = useAsync((payload: UpdateDeskFAQBotFileAPIPayload) => deskApi.updateDeskFAQBotFile(pid, region, payload), [
    pid,
    region,
  ]);

  const previousActiveFAQBotFilId = faqBotFiles.find(({ status }) => status === DeskBotFileStatus.ACTIVE)?.id ?? 0;

  const fetchDeskFAQBotFilesRequest = useCallback(() => {
    if (botId && tab === DeskBotDetailTab.FILES) {
      const sortByPrefix = sortOrder === SortOrder.DESCEND ? '-' : '';
      fetchDeskFAQBotFiles({
        id: botId,
        order: sortBy ? (`${sortByPrefix}${sortBy}` as FetchDeskFAQBotFilesAPIPayload['order']) : '-created_at',
        offset: pageSize && page ? Number(pageSize) * (Number(page) - 1) : 0,
        status: [
          DeskBotFileStatus.ACTIVE,
          DeskBotFileStatus.INACTIVE,
          DeskBotFileStatus.PROCESSING,
          DeskBotFileStatus.EXPIRED,
          DeskBotFileStatus.ERROR,
        ],
        limit: pageSize || BOT_FILES_LIST_LIMIT,
      });
    }
  }, [botId, fetchDeskFAQBotFiles, page, pageSize, tab, sortBy, sortOrder]);

  const fetchDeskFAQBotFileRequest = useCallback(
    async ({ id }: FetchDeskFAQBotFileAPIPayload) => {
      try {
        const { data: fetchedBotFile } = await deskApi.fetchDeskFAQBotFile(pid, region, { id });
        const fileProcessingIntervalId = fileProcessingIntervalIds.current[id];

        /**
         * Subject: PROCESSING bot file checking interval
         *
         * If a fetched bot status is not processing, but the interval is ongoing,
         * the code below will clear interval.
         * */
        if (fileProcessingIntervalId && fetchedBotFile.status !== DeskBotFileStatus.PROCESSING) {
          clearInterval(fileProcessingIntervalId);
          fileProcessingIntervalIds.current[id] = null;
          fetchDeskFAQBotFilesRequest();
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        logException({ error, label: 'fetchDeskFAQBotFileRequest' });
        const fileProcessingIntervalId = fileProcessingIntervalIds.current[id];
        if (fileProcessingIntervalId) {
          clearInterval(fileProcessingIntervalId);
          fileProcessingIntervalIds.current[id] = null;
        }
      }
    },
    [fetchDeskFAQBotFilesRequest, getErrorMessage, pid, region],
  );

  useEffect(() => {
    if (!isDuplicationMode) {
      fetchDeskFAQBotFilesRequest();
    }
  }, [fetchDeskFAQBotFilesRequest, isDuplicationMode]);

  useEffect(() => {
    if (shouldRefetchFiles) {
      fetchDeskFAQBotFilesRequest();
    }
  }, [fetchDeskFAQBotFilesRequest, shouldRefetchFiles]);

  useEffect(() => {
    if (fetchDeskFAQBotFilesData && fetchDeskFAQBotFilesStatus === 'success') {
      setFaqBotFiles(fetchDeskFAQBotFilesData.data.results);
      setTotalFiles(fetchDeskFAQBotFilesData.data.count);
    }
  }, [activeFAQBotFileId, fetchDeskFAQBotFilesData, fetchDeskFAQBotFilesStatus]);

  useEffect(() => {
    if (updateDeskFAQBotFileData) {
      fetchDeskBotRequest();
    }
  }, [fetchDeskBotRequest, updateDeskFAQBotFileData]);

  useEffect(() => {
    if (!isSelectBotFileMode) {
      const activeFile = faqBotFiles.find((file) => file.status === DeskBotFileStatus.ACTIVE);
      if (activeFile && activeFile.id !== activeFAQBotFileId) {
        setActiveFAQBotFileId(activeFile.id);
      }

      /**
       * Subject: PROCESSING bot file checking interval
       *
       * After upload bot csv file, file status will be PROCESSING.
       * It will ask the Desk server whether the file is processed every 5 seconds
       */
      faqBotFiles.forEach(({ id, status }) => {
        if (status === DeskBotFileStatus.PROCESSING && !fileProcessingIntervalIds.current[id]) {
          fileProcessingIntervalIds.current[id] = setInterval(() => {
            fetchDeskFAQBotFileRequest({ id });
          }, 5000);
          intervalIds = fileProcessingIntervalIds.current;
        }
      });
    }
  }, [activeFAQBotFileId, faqBotFiles, fetchDeskFAQBotFileRequest, isSelectBotFileMode]);

  useEffect(() => {
    if (updateDeskFAQBotFileStatus === 'loading') {
      setFaqBotFiles((files) =>
        files.map((file) =>
          file.id === activeFAQBotFileId || file.status === DeskBotFileStatus.ACTIVE
            ? { ...file, status: DeskBotFileStatus.PROCESSING }
            : file,
        ),
      );
    }

    if (updateDeskFAQBotFileStatus === 'success' && updateFileStatusRequestTypeRef.current !== undefined) {
      fetchDeskFAQBotFilesRequest();
      switch (updateFileStatusRequestTypeRef.current) {
        case DeskBotFileStatus.DELETED:
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.bots.detail.files.toast.deleteFile.success' }),
          });
          updateFileStatusRequestTypeRef.current = undefined;
          return;

        default:
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.bots.detail.files.toast.updateFileStatus.success' }),
          });
          updateFileStatusRequestTypeRef.current = undefined;
      }
    }

    if (
      updateDeskFAQBotFileError &&
      updateDeskFAQBotFileStatus === 'error' &&
      updateFileStatusRequestTypeRef.current !== undefined
    ) {
      updateFileStatusRequestTypeRef.current = undefined;
      toast.error({ message: intl.formatMessage({ id: 'desk.settings.bots.detail.files.toast.serverError' }) });
      fetchDeskFAQBotFilesRequest();
    }
  }, [activeFAQBotFileId, fetchDeskFAQBotFilesRequest, intl, updateDeskFAQBotFileError, updateDeskFAQBotFileStatus]);

  /**
   * Subject: PROCESSING bot file checking interval
   *
   * Clear all running interval before unmount
   */
  useEffect(() => {
    return () => {
      Object.keys(intervalIds).forEach((processingFileId) => {
        clearInterval(intervalIds[processingFileId]);
      });
    };
  }, []);

  const getDefaultSortOrder = useCallback(
    (key: DeskFAQBotFilesSortBy) => (key === queryParams.sortBy ? queryParams.sortOrder : undefined),
    [queryParams.sortBy, queryParams.sortOrder],
  );

  const handleDownloadCSVFileClick = useCallback(
    async (id: DeskFAQBotFile['id']) => {
      if (bot !== undefined) {
        try {
          setIsDownloading(true);
          const { data } = await deskApi.getFAQBotCSVFileDownloadURL(pid, region, { id });
          const temporaryLink = document.createElement('a');
          temporaryLink.setAttribute('href', data.fileUrl);
          document.body.appendChild(temporaryLink);
          temporaryLink.click();
          document.body.removeChild(temporaryLink);
          toast.success({
            message: intl.formatMessage({ id: 'desk.settings.bots.detail.files.toast.download.success' }),
          });
        } catch (err) {
          toast.error({ message: getErrorMessage(err) });
        } finally {
          setIsDownloading(false);
        }
      }
    },
    [bot, getErrorMessage, intl, pid, region],
  );

  const handleFileDeleteClick = useCallback(
    (id: DeskFAQBotFile['id'], status: DeskBotFileStatus) => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.delete.header.title' }),
          description:
            status === DeskBotFileStatus.ACTIVE
              ? intl.formatMessage(
                  { id: 'desk.settings.bots.detail.files.popup.delete.header.desc.inUse' },
                  { pending: <StyledTicketStatusLozenge ticketStatus={TicketStatus.PENDING} /> },
                )
              : intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.delete.header.desc.notInUse' }),
          cancelText: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.delete.button.cancel' }),
          confirmText: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.delete.button.delete' }),
          confirmType: 'danger',
          onConfirm: () => {
            updateFileStatusRequestTypeRef.current = DeskBotFileStatus.DELETED;
            updateDeskFAQBotFile({ id, status: DeskBotFileStatus.DELETED });
            if (activeFAQBotFileId) {
              setActiveFAQBotFileId(-1);
            }
          },
        },
      });
    },
    [activeFAQBotFileId, intl, showDialog, updateDeskFAQBotFile],
  );

  const handleSortChange = useCallback(
    (sortColumn?: TableColumnProps<DeskFAQBotFile>, sortOrder?: SortOrder) => {
      sortColumn && sortOrder && updateParams({ sortBy: sortColumn.key as DeskFAQBotFilesSortBy, sortOrder });
    },
    [updateParams],
  );

  const handlePaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (nextPage, nextPageSize) => {
      updateParams({ page: nextPage, pageSize: nextPageSize });
    },
    [updateParams],
  );

  const activateDeskFAQBotFile = () => {
    if (previousActiveFAQBotFilId !== activeFAQBotFileId) {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.useFile.header.title' }),
          description: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.useFile.header.desc' }),
          cancelText: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.useFile.button.cancel' }),
          confirmText: intl.formatMessage({ id: 'desk.settings.bots.detail.files.popup.useFile.button.ok' }),
          onConfirm: () => {
            setIsSelectBotFileMode(false);
            updateFileStatusRequestTypeRef.current = DeskBotFileStatus.ACTIVE;
            updateDeskFAQBotFile({ id: activeFAQBotFileId, status: DeskBotFileStatus.ACTIVE });
          },
        },
      });
    }
  };

  const checkIsInvalid = (status: DeskBotFileStatus) => INVALID_FILE_STATUS_TYPES.includes(status);

  const columns = useMemo(() => {
    const commonColumns: TableColumnProps<DeskFAQBotFile>[] = [
      {
        key: 'filename',
        dataIndex: 'filename',
        title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.head.name' }),
        flex: 3,
        render: ({ filename, status }) => (
          <InvalidFileStatusDimmer $isInvalid={isSelectBotFileMode && checkIsInvalid(status)}>
            {filename}
          </InvalidFileStatusDimmer>
        ),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.head.createdBy' }),
        flex: 2,
        render: ({ createdBy, status }) => (
          <InvalidFileStatusDimmer $isInvalid={checkIsInvalid(status)}>
            <TicketAgent agent={createdBy} isShowAgentThumbnail={true} />
          </InvalidFileStatusDimmer>
        ),
      },
      {
        key: DeskFAQBotFilesSortBy.CREATED_AT,
        dataIndex: 'createdAt',
        title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.head.createdOn' }),
        flex: 2,
        sorter: true,
        defaultSortOrder: getDefaultSortOrder(DeskFAQBotFilesSortBy.CREATED_AT),
        render: ({ createdAt, status }) => (
          <InvalidFileStatusDimmer $isInvalid={isSelectBotFileMode && checkIsInvalid(status)}>
            {createdAt ? moment(createdAt).format('lll') : EMPTY_TEXT}
          </InvalidFileStatusDimmer>
        ),
      },
      {
        key: 'fileUploadNote',
        dataIndex: 'fileUploadNote',
        title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.head.notes' }),
        flex: 2,
        render: ({ fileUploadNote, status }) => (
          <InvalidFileStatusDimmer $isInvalid={isSelectBotFileMode && checkIsInvalid(status)}>
            {fileUploadNote || EMPTY_TEXT}
          </InvalidFileStatusDimmer>
        ),
      },
      {
        key: DeskFAQBotFilesSortBy.STATUS,
        dataIndex: 'status',
        title: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.head.status' }),
        flex: 2,
        sorter: true,
        defaultSortOrder: getDefaultSortOrder(DeskFAQBotFilesSortBy.CREATED_AT),
        render: ({ status }) => <DeskBotFileStatusDefinition status={status} />,
      },
    ];

    if (isSelectBotFileMode) {
      return [
        {
          title: '',
          key: 'activeFAQBotFileId',
          width: 20,
          render: ({ id, status }) =>
            !INVALID_FILE_STATUS_TYPES.includes(status) && (
              <BotRadio
                name="activeFAQBotFileId"
                id="activeFAQBotFileId"
                value={id}
                checked={id === activeFAQBotFileId}
                disabled={status === DeskBotFileStatus.PROCESSING}
                onChange={(event) => {
                  setActiveFAQBotFileId(parseInt(event.target.value));
                }}
              />
            ),
        },
        ...commonColumns,
      ];
    }
    return commonColumns;
  }, [activeFAQBotFileId, getDefaultSortOrder, intl, isSelectBotFileMode]);

  const getOverflowMenuItem = useCallback(
    (record: DeskFAQBotFile) => {
      const disabled = isDownloading || isSelectBotFileMode;
      const item = [
        {
          label: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.body.overflowMenu.delete' }),
          disabled,
          onClick: () => {
            handleFileDeleteClick(record.id, record.status);
          },
        },
      ];

      if (INVALID_FILE_STATUS_TYPES.includes(record.status)) {
        return item;
      }

      return [
        {
          label: intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.body.overflowMenu.download' }),
          disabled,
          onClick: () => {
            handleDownloadCSVFileClick(record.id);
          },
        },
        ...item,
      ];
    },
    [handleDownloadCSVFileClick, handleFileDeleteClick, intl, isDownloading, isSelectBotFileMode],
  );

  return (
    <FilesContainer $disabled={isFilesDisabled}>
      <FilesHeader>
        <FilesHeaderContent>
          <FilesTitle>{intl.formatMessage({ id: 'desk.settings.bots.detail.files.title' })}</FilesTitle>
          <InfoTooltip content={intl.formatMessage({ id: 'desk.settings.bots.detail.files.title.contextualHelp' })} />
        </FilesHeaderContent>
        <FilesHeaderActions>
          <SlideTransition show={isSelectBotFileMode} shouldUnmountAfterFadeOut={false} from="left">
            <ActionButton
              buttonType="tertiary"
              variant="ghost"
              disabled={isFilesDisabled}
              onClick={() => {
                setIsSelectBotFileMode(false);
                setActiveFAQBotFileId(previousActiveFAQBotFilId || 0);
              }}
            >
              {intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.button.cancel' })}
            </ActionButton>
            <ActionButton
              buttonType="secondary"
              isLoading={updateDeskFAQBotFileStatus === 'loading'}
              disabled={
                updateDeskFAQBotFileStatus === 'loading' ||
                isFilesDisabled ||
                activeFAQBotFileId === previousActiveFAQBotFilId ||
                activeFAQBotFileId < 0
              }
              onClick={() => {
                activateDeskFAQBotFile();
              }}
            >
              {intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.button.save' })}
            </ActionButton>
          </SlideTransition>
          <SlideTransition
            show={!isSelectBotFileMode}
            css={css`
              position: absolute;
              right: 0;
              top: 0;
            `}
          >
            <ActionButton
              buttonType="tertiary"
              disabled={
                isFilesDisabled ||
                faqBotFiles.length === 0 ||
                faqBotFiles.every(({ status }) => INVALID_FILE_STATUS_TYPES.includes(status))
              }
              onClick={() => {
                setIsSelectBotFileMode(true);
              }}
            >
              {intl.formatMessage({ id: 'desk.settings.bots.detail.files.button.selectBot' })}
            </ActionButton>
          </SlideTransition>
        </FilesHeaderActions>
      </FilesHeader>
      <FilesBody>
        {fetchDeskFAQBotFilesStatus === 'error' && (
          <InlineNotification
            type="error"
            message={intl.formatMessage({
              id: 'desk.settings.bots.detail.files.inlineNotification.error.message.fetch',
            })}
            action={{
              label: intl.formatMessage({
                id: 'desk.settings.bots.detail.files.inlineNotification.error.button.retry',
              }),
              onClick: fetchDeskFAQBotFilesRequest,
            }}
            css={css`
              margin-bottom: 24px;
            `}
          />
        )}
        <Table<DeskFAQBotFile>
          rowKey="id"
          dataSource={faqBotFiles}
          columns={columns}
          onSortByUpdated={handleSortChange}
          rowActions={(record) => [<OverflowMenu key="botFileActions" items={getOverflowMenuItem(record)} />]}
          emptyView={
            <EmptyStateContainer
              icon="document"
              title={intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.body.empty.title' })}
              description={intl.formatMessage({ id: 'desk.settings.bots.detail.files.table.body.empty.desc' })}
            />
          }
          footer={
            totalFiles > BOT_FILES_LIST_LIMIT && (
              <Paginator
                current={Number(queryParams.page) || 1}
                total={totalFiles}
                pageSize={queryParams.pageSize as PerPage}
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS as ReadonlyArray<PerPage>}
                onChange={handlePaginationChange}
                onItemsPerPageChange={handlePaginationChange}
                css={css`
                  margin-left: auto;
                `}
              />
            )
          }
        />
      </FilesBody>
    </FilesContainer>
  );
};
