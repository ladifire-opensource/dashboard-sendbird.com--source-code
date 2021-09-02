import { memo, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { useForm, useField, Grid, GridItem, InputTextarea, cssVariables } from 'feather';

import { deskActions } from '@actions';
import { SettingsTextareaGrid, SettingsTitle } from '@common/containers/layout';
import { Unsaved } from '@hooks';

type Props = {
  inquireCloseMessage: Project['inquireCloseMessage'];
  inquireCloseConfirmedMessage: Project['inquireCloseConfirmedMessage'];
  inquireCloseDeclinedMessage: Project['inquireCloseDeclinedMessage'];
  isUpdating: DeskStoreState['isUpdating'];
  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

const ExtraMessages = styled.div`
  padding-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

export const InqueryMessage = memo<Props>(
  ({
    inquireCloseMessage,
    inquireCloseConfirmedMessage,
    inquireCloseDeclinedMessage,
    isUpdating,
    setUnsaved,
    updateProjectRequest,
  }) => {
    const intl = useIntl();
    const form = useForm({
      onSubmit: ({ inquireCloseMessage, inquireCloseConfirmedMessage, inquireCloseDeclinedMessage }) => {
        updateProjectRequest({
          inquireCloseMessage,
          inquireCloseConfirmedMessage,
          inquireCloseDeclinedMessage,
          onSuccess: form.onSuccess,
        });
      },
    });
    const closeMessageField = useField<string, HTMLTextAreaElement>('inquireCloseMessage', form, {
      defaultValue: inquireCloseMessage,
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.closeMessage.error.required' });
        }
        return '';
      },
    });
    const confirmedMessageField = useField<string, HTMLTextAreaElement>('inquireCloseConfirmedMessage', form, {
      defaultValue: inquireCloseConfirmedMessage,
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.replace.error.positiveRequired' });
        }
        return '';
      },
    });
    const declinedMessageField = useField<string, HTMLTextAreaElement>('inquireCloseDeclinedMessage', form, {
      defaultValue: inquireCloseDeclinedMessage,
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.replace.error.negativeRequired' });
        }
        return '';
      },
    });

    const updatables = closeMessageField.updatable || confirmedMessageField.updatable || declinedMessageField.updatable;
    useEffect(() => {
      setUnsaved(updatables);
    }, [setUnsaved, updatables]);

    return (
      <SettingsTextareaGrid
        title={intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.title' })}
        description={intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.desc' })}
        form={form}
        field={closeMessageField}
        showActions={updatables}
        gap={['0px', '32px']}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        saveText={intl.formatMessage({ id: 'desk.settings.triggers.actions.save' })}
        cancelText={intl.formatMessage({ id: 'desk.settings.triggers.actions.cancel' })}
        isFetching={isUpdating}
        extra={
          <ExtraMessages>
            <Grid>
              <GridItem colSpan={6}>
                <SettingsTitle>
                  {intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.replace.title' })}
                </SettingsTitle>
              </GridItem>
              <GridItem colSpan={6}>
                <InputTextarea
                  ref={confirmedMessageField.ref}
                  name={confirmedMessageField.name}
                  label={intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.replace.label.positive' })}
                  error={confirmedMessageField.error}
                  disabled={isUpdating}
                  onChange={confirmedMessageField.onChange}
                />
                <InputTextarea
                  ref={declinedMessageField.ref}
                  name={declinedMessageField.name}
                  label={intl.formatMessage({ id: 'desk.settings.triggers.inqueryMessage.replace.label.negative' })}
                  error={declinedMessageField.error}
                  disabled={isUpdating}
                  onChange={declinedMessageField.onChange}
                />
              </GridItem>
            </Grid>
          </ExtraMessages>
        }
      />
    );
  },
);
