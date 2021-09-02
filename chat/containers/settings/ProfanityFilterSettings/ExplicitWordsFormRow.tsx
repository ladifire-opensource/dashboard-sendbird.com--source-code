import { FC, useCallback, useEffect } from 'react';
import { UseFormMethods } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, cssVariables, InlineNotification, InputTextarea, Link, toast } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import FileReaderStatus from './components/FileReaderStatus';
import FormRow from './components/FormRow';
import ImportFileButton from './components/ImportFileButton';
import useDefaultKeywords from './hooks/useDefaultKeywords';
import useFileReader from './hooks/useFileReader';
import { FormValues } from './types';

const textareaMaxLength = 100000;

const FormRowActions = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const GrayBox = styled.div`
  margin-top: 4px;
  border-radius: 4px;
  background: ${cssVariables('bg-2')};
  padding: 14px 16px;
  height: 120px;
  overflow-x: hidden;
  overflow-y: scroll;
  word-break: break-all;
  color: ${cssVariables('content-2')};
  ${Body['body-short-01']};
`;

const ExplicitWordsFormRow: FC<{ isDisabled?: boolean; formContextValues: UseFormMethods<FormValues> }> = ({
  isDisabled: isDisabledProp = false,
  formContextValues: { register, setValue, getValues, watch },
}) => {
  const intl = useIntl();
  const { isFetching: isFetchingDefaultKeywords, getKeywords: getDefaultKeywords } = useDefaultKeywords();
  const { selectedFile, setSelectedFile, fileContent, fileReaderStatus } = useFileReader();
  const isDisabled = isDisabledProp || fileReaderStatus === 'loading';
  const showDialog = useShowDialog();

  const confirmReplacement = useCallback(
    ({ newValue, onConfirm, onCancel }: { newValue: string; onConfirm?: () => void; onCancel?: () => void }) => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.explicitWords.replaceDialog.title',
          }),
          description: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.explicitWords.replaceDialog.description',
          }),
          confirmText: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.explicitWords.replaceDialog.btn.ok',
          }),
          cancelText: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.explicitWords.replaceDialog.btn.cancel',
          }),
          onConfirm: () => {
            setValue('keywords', newValue);
            onConfirm?.();
          },
          onCancel,
        },
      });
    },
    [intl, setValue, showDialog],
  );

  useEffect(() => {
    if (typeof fileContent === 'string') {
      const notifySuccess = () => {
        toast.success({
          message: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.noti.importedKeywords' }),
        });
      };

      const currentValue = getValues('keywords');

      if (!currentValue) {
        // if the current value is empty, just update the field.
        setValue('keywords', fileContent);
        notifySuccess();
        return;
      }

      if (currentValue === fileContent) {
        notifySuccess();
        return;
      }

      confirmReplacement({
        newValue: fileContent,
        onConfirm: () => {
          notifySuccess();
        },
        onCancel: () => {
          setSelectedFile(null);
        },
      });
    }
  }, [confirmReplacement, fileContent, getValues, intl, setSelectedFile, setValue]);

  const handleDefaultListButtonClick = async () => {
    const defaultKeywords = await getDefaultKeywords();
    const currentValue = getValues('keywords');

    if (defaultKeywords && currentValue !== defaultKeywords) {
      if (currentValue) {
        confirmReplacement({ newValue: defaultKeywords });
      } else {
        // if the current value is empty, replace it without confirmation.
        setValue('keywords', defaultKeywords);
      }
    }
  };

  const keywords = watch('keywords') || '';

  return (
    <FormRow
      title={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.explicitWords.title' })}
      description={intl.formatMessage({
        id: 'chat.settings.profanityFilter.form.field.explicitWords.desc',
      })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      isDisabled={isDisabled}
    >
      <FormRowActions>
        <div>
          <ImportFileButton
            disabled={isDisabled}
            onFileSelect={(file: File) => {
              setSelectedFile(file);
            }}
          >
            {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.explicitWords.btn.import' })}
          </ImportFileButton>
          <FileReaderStatus selectedFile={selectedFile} status={fileReaderStatus} isDisabled={isDisabled} />
        </div>
        <Link
          role="button"
          onClick={handleDefaultListButtonClick}
          disabled={isDisabled || isFetchingDefaultKeywords}
          css={`
            font-size: 14px;
            font-weight: 600 !important;
            margin: 9px 0;
          `}
        >
          {intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.explicitWords.btn.useDefaultList',
          })}
        </Link>
      </FormRowActions>
      {keywords.length > textareaMaxLength ? (
        <>
          <InlineNotification
            message={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.explicitWords.tooMany' })}
            type="warning"
          />
          <GrayBox>{`${keywords.slice(0, textareaMaxLength)}...`}</GrayBox>
          <input
            ref={register}
            type="hidden"
            name="keywords"
            placeholder={intl.formatMessage({
              id: 'chat.settings.profanityFilter.form.field.explicitWords.placeholder',
            })}
          />
        </>
      ) : (
        <>
          <InputTextarea
            ref={register}
            name="keywords"
            readOnly={isDisabled}
            aria-label={intl.formatMessage({
              id: 'chat.settings.profanityFilter.form.field.explicitWords.title',
            })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.profanityFilter.form.field.explicitWords.placeholder',
            })}
            maxLength={textareaMaxLength}
            error={
              keywords.length >= textareaMaxLength
                ? {
                    hasError: true,
                    message: intl.formatMessage({
                      id: 'chat.settings.profanityFilter.form.field.explicitWords.error.maxLength',
                    }),
                  }
                : undefined
            }
          />
        </>
      )}
    </FormRow>
  );
};

export default ExplicitWordsFormRow;
