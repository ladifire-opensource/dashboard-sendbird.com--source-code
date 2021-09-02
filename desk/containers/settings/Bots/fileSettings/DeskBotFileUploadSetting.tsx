import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm, Validate, RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Button, cssVariables, Icon, InlineNotification, InputText, Link, Spinner } from 'feather';

import { deskApi } from '@api';
import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { SettingsDescription, SettingsGridCard, SettingsTitle } from '@common/containers/layout/settingsGrid';
import { BYTES_IN_MEGABYTE } from '@constants';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { SlideTransition } from '@ui/components';
import { debouncePromise } from '@utils';

import { DeskBotFormMode, useBotDetailContext } from '../botDetailContext';
import { DeskFAQBotFiles } from './DeskFAQBotFiles';

const Wrapper = styled.div<{ $disabled: boolean }>`
  ${({ $disabled }) =>
    $disabled &&
    css`
      ${SettingsTitle}, ${SettingsDescription} {
        color: ${cssVariables('neutral-5')};
      }
    `}
`;

const FileUploader = styled.div`
  display: flex;
  margin-top: 16px;
`;

const CancelFileUploadButton = styled(Button)`
  margin-left: 4px;
  width: 108px;
`;

const ChooseFileButton = styled(CancelFileUploadButton)`
  position: relative;
  margin-left: 4px;
  width: 108px;

  label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const FileNameSuffixIconContainer = styled(SlideTransition)`
  position: absolute;
  z-index: 90;
  width: 16px;
  height: 16px;
  top: 12px;
  right: 16px;
`;

export const DOWNLOAD_BOT_SAMPLE_CSV_URL = 'https://dxstmhyqfqr1o.cloudfront.net/desk/FAQ+sample.csv';

type FormValues = {
  fileUploadNote: string | null;
  csvFiles: FileList | null;
};

export const DeskBotFileUploadSetting: FC = () => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { mode, bot } = useBotDetailContext();

  const [filename, setFilename] = useState('');
  const uploadDeskFAQBotFileRequestRef = useRef<CancellableAxiosPromise<DeskFAQBotFile> | null>(null);
  const { errors, reset, register, watch, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { fileUploadNote: null, csvFiles: null },
  });

  const watchedCSVFiles = watch('csvFiles');
  const isReadyToUpload = !!watchedCSVFiles?.[0]?.name;
  const isRenderFilenameSuffixIcon = filename.length > 0;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadDeskFAQBotFileStatus, setUploadDeskFAQBotFileStatus] = useState<
    'init' | 'loading' | 'success' | 'error'
  >('init');
  const [isSelectBotFileMode, setIsSelectBotFileMode] = useState(false);

  const isCreationMode = mode === DeskBotFormMode.CREATE;
  const isDuplicationMode = mode === DeskBotFormMode.DUPLICATE;
  const isBotInvalid = bot === undefined;
  const isFileUploadFormDisabled = isBotInvalid || isSelectBotFileMode || isDuplicationMode;
  const shouldShowNoBotDataWarning = isCreationMode || isDuplicationMode;

  const debounceIsFilenameUnique = debouncePromise(async (params: CheckIsBotFilenameDuplicatedAPIPayload) => {
    try {
      const { data } = await deskApi.checkIsBotFilenameDuplicated(pid, region, params);
      const isValid = data.result;
      return isValid || intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.error.unique' });
    } catch {
      return true;
    }
  }, 200);

  const checkIsFilenameUnique: Validate = (files: FileList | null) => {
    if (bot && files && files.length > 0) {
      const file = files[0];
      return debounceIsFilenameUnique({ id: bot.id, filename: file.name });
    }
    return true;
  };

  const uploadDeskFAQBotFileRequest = useCallback(
    async (payload: UploadFAQBotFileAPIPayload) => {
      setIsUploading(true);
      setUploadDeskFAQBotFileStatus('loading');
      const request = deskApi.uploadDeskFAQBotFile(pid, region, payload);
      uploadDeskFAQBotFileRequestRef.current = request;

      try {
        const result = await request;
        if (result == null) {
          setUploadDeskFAQBotFileStatus('init');
          return; // ignore canceled requests
        }

        setUploadDeskFAQBotFileStatus('success');
        // wait 1 second to show success icon for file upload
        setTimeout(() => {
          reset();
          setFilename('');
        }, 1000);
      } catch (error) {
        setUploadDeskFAQBotFileStatus('error');
      } finally {
        setIsUploading(false);
      }
    },
    [pid, region, reset],
  );

  useEffect(() => {
    if (filename.length === 0) {
      // wait 300ms for the file upload status icon to be disappeared, and then unmount the icon element
      setTimeout(() => {
        setUploadDeskFAQBotFileStatus('init');
      }, 300);
    }
  }, [filename.length]);

  const fileDataValidationOptions: RegisterOptions = {
    validate: {
      sizeLimit: (files: FileList | null) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file.size > 5 * BYTES_IN_MEGABYTE) {
            return intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.error.sizeLimit' });
          }
          return true;
        }
      },
      unique: checkIsFilenameUnique,
    },
  };

  const handleDownloadSampleClick = () => {
    const temporaryLink = document.createElement('a');
    temporaryLink.setAttribute('href', DOWNLOAD_BOT_SAMPLE_CSV_URL);
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    document.body.removeChild(temporaryLink);
  };

  const onSubmit: SubmitHandler<FormValues> = async ({ fileUploadNote, csvFiles }) => {
    if (bot && csvFiles && csvFiles.length > 0) {
      uploadDeskFAQBotFileRequest({ bot: bot.id, fileUploadNote, filedata: csvFiles[0] });
    }
  };

  const fileUploadStatus = useMemo(() => {
    if (errors.csvFiles?.type) {
      return 'error';
    }

    return uploadDeskFAQBotFileStatus;
  }, [errors.csvFiles?.type, uploadDeskFAQBotFileStatus]);

  const filenameSuffixIcon = useMemo(() => {
    switch (fileUploadStatus) {
      case 'loading':
        return <Spinner size={16} stroke={cssVariables('neutral-6')} />;

      case 'success':
        return <Icon icon="done" size={16} color={cssVariables('green-5')} />;

      case 'error':
        return <Icon icon="error" size={16} color={cssVariables('red-5')} />;

      default:
        return null;
    }
  }, [fileUploadStatus]);

  return (
    <Wrapper $disabled={isFileUploadFormDisabled}>
      {shouldShowNoBotDataWarning && (
        <InlineNotification
          type="warning"
          message={intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.inlineNotification.noBot' })}
          css={css`
            margin-bottom: 24px;
          `}
        />
      )}
      <SettingsGridCard
        title={intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.header.title' })}
        description={intl.formatMessage(
          { id: 'desk.settings.bots.detail.fileUpload.header.desc' },
          {
            a: (text) => (
              <Link
                href="#FAQ_file_sample"
                iconProps={{ icon: 'download', size: 16 }}
                onClick={handleDownloadSampleClick}
              >
                {text}
              </Link>
            ),
          },
        )}
        gridItemConfig={{ subject: { alignSelf: 'start' } }}
        gap={['0', '32px']}
        extra={
          <DeskFAQBotFiles
            shouldRefetchFiles={uploadDeskFAQBotFileStatus === 'success'}
            isSelectBotFileMode={isSelectBotFileMode}
            setIsSelectBotFileMode={setIsSelectBotFileMode}
          />
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputText
            ref={register}
            type="text"
            name="fileUploadNote"
            disabled={isFileUploadFormDisabled}
            placeholder={intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.notes.placeholder' })}
            data-test-id="FileNoteInput"
          />

          <FileUploader>
            <InputText
              type="text"
              value={filename}
              helperText={intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.helperText' })}
              suffixNode={
                <FileNameSuffixIconContainer show={isRenderFilenameSuffixIcon} shouldUnmountAfterFadeOut={false}>
                  {filenameSuffixIcon}
                </FileNameSuffixIconContainer>
              }
              readOnly={true}
              disabled={isFileUploadFormDisabled}
              css={css`
                flex: auto;
              `}
              error={{
                hasError: errors.csvFiles?.message !== undefined || uploadDeskFAQBotFileStatus === 'error',
                message: (errors.csvFiles?.message as string) ?? '',
              }}
              styles={css`
                padding-right: 48px;
              `}
              data-test-id="FilenameInput"
            />
            {uploadDeskFAQBotFileStatus === 'loading' ? (
              <CancelFileUploadButton
                buttonType="tertiary"
                data-test-id="CancelFileUploadButton"
                onClick={() => {
                  uploadDeskFAQBotFileRequestRef.current?.cancel();
                }}
              >
                {intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.button.cancel' })}
              </CancelFileUploadButton>
            ) : (
              <ChooseFileButton
                buttonType="tertiary"
                disabled={isUploading || isFileUploadFormDisabled}
                data-test-id="ChooseFileButton"
              >
                <label htmlFor="bot_file">
                  <input
                    ref={register(fileDataValidationOptions)}
                    type="file"
                    id="bot_file"
                    name="csvFiles"
                    accept=".csv"
                    hidden={true}
                    data-test-id="FileUploaderInput"
                    onChange={(event) => {
                      const botFiles = event.target.files;
                      if (botFiles && botFiles.length > 0) {
                        setFilename(botFiles[0].name);
                      }
                    }}
                  />
                </label>
                {intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.button.chooseFile' })}
              </ChooseFileButton>
            )}
          </FileUploader>
          <Button
            buttonType="tertiary"
            type="submit"
            disabled={isUploading || !isReadyToUpload || isFileUploadFormDisabled || errors.csvFiles !== undefined}
            data-test-id="FileSubmitButton"
            css={css`
              margin-top: 16px;
            `}
          >
            {intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.button.upload' })}
          </Button>
          {uploadDeskFAQBotFileStatus === 'error' && (
            <InlineNotification
              type="error"
              message={intl.formatMessage({ id: 'desk.settings.bots.detail.fileUpload.file.error.serverError' })}
              css={css`
                margin-top: 16px;
              `}
            />
          )}
        </form>
      </SettingsGridCard>
    </Wrapper>
  );
};
