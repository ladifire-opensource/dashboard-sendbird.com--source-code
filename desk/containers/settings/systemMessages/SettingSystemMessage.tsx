import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Headings, cssVariables, toast } from 'feather';

import { deskApi } from '@api';
import { SettingsGridCard } from '@common/containers/layout';
import FormatTextarea, { PropertyTagItem } from '@desk/components/FormatTextarea';
import { useAsync, useErrorToast } from '@hooks';
import { ContentEditableRef } from '@ui/components';

type Props = {
  title: React.ReactNode;
  defaultValue: string;
  systemMessageKey: SystemMessageKey;
  description?: string;
  propertyTags?: {
    [key in string]: PropertyTagKey;
  };
  placeholder?: string;
  onSave?: (result: UpdateSystemMessageResponse) => void;
  onCancel?: () => void;
  disabled?: boolean;
};

const TooltipHeader = styled.div`
  ${Headings['heading-01']}
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
`;

const propertyTagMap: { [key in PropertyTagKey]: { labelKey: string; value: string } } = {
  by_agent_name: {
    labelKey: 'desk.settings.systemMessages.propertyTag.byAgent',
    value: 'by_agent_name',
  },
  from_agent_name: {
    labelKey: 'desk.settings.systemMessages.propertyTag.fromAgent',
    value: 'from_agent_name',
  },
  to_agent_name: {
    labelKey: 'desk.settings.systemMessages.propertyTag.toAgent',
    value: 'to_agent_name',
  },
  from_team_name: {
    labelKey: 'desk.settings.systemMessages.propertyTag.fromTeam',
    value: 'from_team_name',
  },
  to_team_name: {
    labelKey: 'desk.settings.systemMessages.propertyTag.toTeam',
    value: 'to_team_name',
  },
  memo: {
    labelKey: 'desk.settings.systemMessages.propertyTag.notes',
    value: 'memo',
  },
  priority: {
    labelKey: 'desk.settings.systemMessages.propertyTag.priority',
    value: 'priority',
  },
  ticket_close_notes: {
    labelKey: 'desk.settings.systemMessages.propertyTag.ticketCloseNotes',
    value: 'ticket_close_notes',
  },
  ticket_transfer_notes: {
    labelKey: 'desk.settings.systemMessages.propertyTag.ticketTransferNotes',
    value: 'ticket_transfer_notes',
  },
};

export const SettingSystemMessage = React.memo<Props>(
  ({ title, systemMessageKey, description, propertyTags, defaultValue, placeholder, onSave, onCancel, disabled }) => {
    const intl = useIntl();
    const messageEditorRef = useRef<ContentEditableRef>(null);
    const [updatable, setUpdatable] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const { pid, region } = useSelector((state: RootState) => ({
      pid: state.desk.project.pid,
      region: state.applicationState.data?.region || '',
    }));

    const [{ status, data, error }, update] = useAsync(
      (message: string) =>
        deskApi.updateSystemMessage(pid, region, {
          [systemMessageKey]: message,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    useErrorToast(error && intl.formatMessage({ id: 'desk.settings.systemMessages.toast.update.failed' }));

    const tags = useMemo(() => {
      if (propertyTags && Object.keys(propertyTags).length > 0) {
        return Object.values(propertyTags).reduce((acc, cur) => {
          const { labelKey, value } = propertyTagMap[cur];
          (acc as PropertyTagItem[]).push({ label: intl.formatMessage({ id: labelKey }), value });
          return acc;
        }, []);
      }
      return undefined;
    }, [intl, propertyTags]);

    const handleClickSave = useCallback(() => {
      const message = messageEditorRef.current?.getText() ?? '';
      update(message);
    }, [update]);

    const handleClickCancel = useCallback(() => {
      messageEditorRef.current?.setText(defaultValue);
      onCancel?.();
    }, [onCancel, defaultValue, messageEditorRef]);

    const handleChange = useCallback(
      (message: string) => {
        setUpdatable(message !== defaultValue);
        if (message.trim() === '') {
          setErrorMessage(intl.formatMessage({ id: 'desk.settings.systemMessages.input.error.empty' }));
        } else {
          setErrorMessage(undefined);
        }
      },
      [defaultValue, intl],
    );

    useEffect(() => {
      if (status === 'success') {
        toast.success({ message: intl.formatMessage({ id: 'desk.settings.systemMessages.toast.update.success' }) });
      }
    }, [intl, status]);

    useEffect(() => {
      if (data?.data && status === 'success') {
        onSave?.(data.data);
      }
    }, [data, onSave, status]);

    useEffect(() => {
      const editorValue = messageEditorRef.current?.getText() ?? '';
      setUpdatable(editorValue !== defaultValue);
    }, [defaultValue]);

    return (
      <SettingsGridCard
        title={title}
        description={description}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        showActions={updatable}
        actions={[
          {
            key: 'cancel',
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.btn.actions.cancel' }),
            buttonType: 'tertiary',
            onClick: handleClickCancel,
          },
          {
            key: 'save',
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.btn.actions.save' }),
            buttonType: 'primary',
            onClick: handleClickSave,
            isLoading: status === 'loading',
            disabled: status === 'loading' || disabled || !!errorMessage,
          },
        ]}
      >
        <FormatTextarea
          editorRef={messageEditorRef}
          defaultText={defaultValue}
          propertyTags={tags}
          propertyTagTooltip={intl.formatMessage({ id: 'desk.settings.systemMessages.btn.propertyTag.tooltip' })}
          contextualTooltip={
            <div>
              <TooltipHeader>
                {intl.formatMessage({ id: 'desk.settings.systemMessages.contextualTooltip.title' })}
              </TooltipHeader>
              <div>
                {intl.formatMessage(
                  { id: 'desk.settings.systemMessages.contextualTooltip.desc' },
                  { b: (text) => <b css="font-weight: 600;">{text}</b>, break: <br /> },
                )}
              </div>
            </div>
          }
          placeholder={placeholder}
          disabled={status === 'loading' || disabled}
          onChange={handleChange}
          error={errorMessage}
        />
      </SettingsGridCard>
    );
  },
);
