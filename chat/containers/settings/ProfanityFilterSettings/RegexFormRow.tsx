import { FC, Fragment, useEffect, useMemo } from 'react';
import { Controller, UseFormMethods } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import styled from 'styled-components';

import { Button, cssVariables, toast, Tooltip, TooltipVariant, Typography } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog, useTypedSelector } from '@hooks';

import FileReaderStatus from './components/FileReaderStatus';
import FormRow from './components/FormRow';
import ImportFileButton from './components/ImportFileButton';
import RegexList from './components/RegexList';
import useFileReader from './hooks/useFileReader';
import { FormValues } from './types';

const FormRowActions = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const FormRowAction = styled(Button).attrs(({ type = 'button', buttonType = 'tertiary', size = 'small' }) => ({
  type,
  buttonType,
  size,
}))``;

const Counter = styled.div`
  margin-top: 8px;
  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']};
`;

const ImportFileControl = styled.div``;

const FileReader = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 6px;
`;

const Container = styled(FormRow)`
  &[aria-disabled='true'] {
    ${Counter}, ${Counter} *, ${FileReader} * {
      color: ${cssVariables('neutral-5')};
      fill: ${cssVariables('neutral-5')};
    }
  }
`;

const useMaxRegCount = () =>
  useTypedSelector((state) => state.applicationState.data?.attrs.item_limit.max_regex_filters);

const DisabledAddButtonWrapper: FC = ({ children }) => {
  const intl = useIntl();
  const maxRegexCount = useMaxRegCount();
  return (
    <Tooltip
      content={intl.formatMessage(
        { id: 'chat.settings.profanityFilter.form.field.regex.btn.add.tooltip.reachedMax' },
        { maxCount: maxRegexCount },
      )}
      variant={TooltipVariant.Light}
      placement="top"
    >
      {children}
    </Tooltip>
  );
};

const RegexFormRow: FC<{ isDisabled?: boolean; formContextValues: UseFormMethods<FormValues> }> = ({
  isDisabled: isDisabledProp = false,
  formContextValues: { setValue, control, getValues, watch },
}) => {
  const intl = useIntl();
  const maxRegexCount = useMaxRegCount();
  const { selectedFile, setSelectedFile, fileContent, fileReaderStatus } = useFileReader();
  const isDisabled = isDisabledProp || fileReaderStatus === 'loading';
  const showDialog = useShowDialog();
  const regexFilters = watch('regexFilters', []);

  const regexListFromFile = useMemo(() => {
    return typeof fileContent === 'string' ? fileContent.split('\n').filter((v) => v) : null;
  }, [fileContent]);

  useEffect(() => {
    if (regexListFromFile) {
      const isOverLimit = typeof maxRegexCount === 'number' && regexListFromFile.length > maxRegexCount;
      const newValue = isOverLimit ? regexListFromFile.slice(0, maxRegexCount) : regexListFromFile;

      const notifySuccess = () => {
        if (isOverLimit) {
          toast.warning({
            message: intl.formatMessage(
              { id: 'chat.settings.profanityFilter.form.noti.importedRegexPartially' },
              { maxCount: maxRegexCount },
            ),
          });
        } else {
          toast.success({
            message: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.noti.importedRegex' }),
          });
        }
      };

      const currentValue = getValues('regexFilters');
      if (shallowEqual(currentValue, newValue)) {
        notifySuccess();
        return;
      }

      if (currentValue.length === 0) {
        // update without confirmation
        setValue('regexFilters', newValue);
        notifySuccess();
        return;
      }

      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.replaceDialog.title' }),
          description: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.regex.replaceDialog.description',
          }),
          confirmText: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.regex.replaceDialog.btn.ok',
          }),
          cancelText: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.regex.replaceDialog.btn.cancel',
          }),
          onConfirm: () => {
            setValue('regexFilters', newValue);
            notifySuccess();
          },
          onCancel: () => {
            setSelectedFile(null);
          },
        },
      });
    }
  }, [getValues, intl, maxRegexCount, regexListFromFile, setSelectedFile, setValue, showDialog]);

  const showAddRegexDialog = useShowDialog({
    dialogTypes: DialogType.RegexEditor,
    dialogProps: {
      onSubmit: (value) => {
        const currentRegexList = getValues('regexFilters') || [];
        setValue('regexFilters', [value, ...currentRegexList]);
      },
    },
  });

  const isMaximum = typeof maxRegexCount === 'number' && regexFilters.length >= maxRegexCount;
  const AddButtonWrapper = isMaximum ? DisabledAddButtonWrapper : Fragment;

  return (
    <Container
      title={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.title' })}
      description={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.desc' })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      isDisabled={isDisabled}
    >
      <FormRowActions>
        <ImportFileControl>
          <ImportFileButton
            disabled={isDisabled}
            onFileSelect={(file) => {
              setSelectedFile(file);
            }}
          >
            {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.btn.import' })}
          </ImportFileButton>
          <FileReaderStatus selectedFile={selectedFile} status={fileReaderStatus} isDisabled={isDisabled} />
        </ImportFileControl>
        <AddButtonWrapper>
          <FormRowAction
            buttonType="secondary"
            disabled={isDisabled || isMaximum}
            onClick={() => {
              showAddRegexDialog();
            }}
          >
            {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.btn.add' })}
          </FormRowAction>
        </AddButtonWrapper>
      </FormRowActions>
      <Controller
        control={control}
        name="regexFilters"
        defaultValue={[]}
        render={({ onChange, value }) => {
          return <RegexList items={value} onChange={onChange} disabled={isDisabled} />;
        }}
      />
      {typeof maxRegexCount === 'number' && (
        <Counter>
          {intl.formatMessage(
            { id: 'chat.settings.profanityFilter.form.field.regex.counter' },
            {
              isMaximum: String(isMaximum),
              count: regexFilters.length,
              maxCount: maxRegexCount,
              red: (text) => (
                <i
                  css={`
                    font-style: normal;
                    color: ${cssVariables('red-5')};
                  `}
                >
                  {text}
                </i>
              ),
            },
          )}
        </Counter>
      )}
    </Container>
  );
};

export default RegexFormRow;
