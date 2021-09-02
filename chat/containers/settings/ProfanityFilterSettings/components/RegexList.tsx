import { FC, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog, useLatestValue } from '@hooks';
import { UniqueItemList } from '@ui/components';

type Props = {
  items?: string[];
  disabled?: boolean;
  onChange?: (items: string[]) => void;
};

const RegexValue = styled.span`
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
`;

const DeleteTarget = styled.div`
  margin-top: 8px;
  padding: 6px 16px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.54;
  letter-spacing: -0.3px;
  color: ${cssVariables('neutral-10')};
  word-break: break-word;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-1')};
`;

const RegexList: FC<Props> = ({ items = [], onChange, disabled }) => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const latestOnChange = useLatestValue(onChange);

  const handleEditRegexClick = useCallback(
    (selectedItem: string) => {
      showDialog({
        dialogTypes: DialogType.RegexEditor,
        dialogProps: {
          defaultValue: selectedItem,
          onSubmit: (newValue) => {
            latestOnChange.current?.(items.map((item) => (item === selectedItem ? newValue : item)));
          },
        },
      });
    },
    [items, latestOnChange, showDialog],
  );

  const handleDeleteRegexClick = useCallback(
    (targetRegex: string) => {
      showDialog({
        dialogTypes: DialogType.Delete,
        dialogProps: {
          size: 'small',
          title: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.dialog.title.delete' }),
          description: (
            <>
              <p
                css={`
                  margin-bottom: 16px;
                `}
              >
                {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.dialog.desc.delete' })}
              </p>
              <DeleteTarget>/{targetRegex}/</DeleteTarget>
            </>
          ),
          confirmText: intl.formatMessage({
            id: 'chat.settings.profanityFilter.form.field.regex.dialog.button.delete',
          }),
          onDelete: () => {
            latestOnChange.current?.(items.filter((item) => item !== targetRegex));
          },
        },
      });
    },
    [intl, items, latestOnChange, showDialog],
  );

  return (
    <UniqueItemList
      color="neutral"
      items={items}
      disabled={disabled}
      rowActions={useMemo(
        () => [
          {
            icon: 'edit',
            label: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.btn.edit' }),
            onClick: handleEditRegexClick,
          },
          {
            icon: 'remove-filled',
            label: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.btn.delete' }),
            onClick: handleDeleteRegexClick,
          },
        ],
        [handleDeleteRegexClick, handleEditRegexClick, intl],
      )}
      renderItem={(item) => <RegexValue>/{item}/</RegexValue>}
    />
  );
};

export default RegexList;
