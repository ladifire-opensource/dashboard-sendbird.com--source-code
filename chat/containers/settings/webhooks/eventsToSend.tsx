import React, { useEffect, useState, useCallback, useContext, createContext } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio, useField, useForm, Field, Form } from 'feather';
import pickBy from 'lodash/pickBy';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { Unsaved } from '@hooks';

import { UpdateWebhookParams } from '.';
import { GroupChannelInformation } from './GroupChannelInformation';
import { CollapsibleGroup } from './collapsibleGroup';
import { CollapsibleGroupContext } from './collapsibleGroupContext';

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
  isEditable: boolean;
  isFetchingWebhookInformation: boolean;
  webhookSetting: WebhookSetting;
  webhookAllEvents: SettingsState['webhookAllEvents'];
  updateWebhookInformationRequest: (params: UpdateWebhookParams) => void;
};

type EventTypeRadioProps = {
  form: Form;
  enabled: boolean;
  enabledEventSet: Set<string>;
  webhookAllEvents: SettingsState['webhookAllEvents'];
};

export type EventCategory = Record<string, Field<boolean>>;

const Radios = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RadioWrapper = styled.div`
  & + & {
    margin-top: 8px;
  }
`;

const EventTypeRadioGroupContext = createContext<{
  isUnsaved: boolean;
  setIsUnsaved: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenedCollapsibleGroup: boolean;
  setIsOpenedCollapsibleGroup: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isUnsaved: false,
  setIsUnsaved: () => {},
  isOpenedCollapsibleGroup: false,
  setIsOpenedCollapsibleGroup: () => {},
});

const EventTypeRadioGroup: React.FC<EventTypeRadioProps> = ({ form, enabled, enabledEventSet, webhookAllEvents }) => {
  const intl = useIntl();
  const { setIsUnsaved, setIsOpenedCollapsibleGroup } = useContext(EventTypeRadioGroupContext);
  const field = useField<boolean>('displayAllCategories', form, {
    defaultValue: webhookAllEvents.every((event) => enabledEventSet.has(event)),
    isControlled: true,
  });

  const handleChangeDisplayAllCategories = useCallback(
    (value: boolean) => () => {
      field.updateValue(value);
    },
    [field],
  );

  useEffect(() => {
    setIsOpenedCollapsibleGroup(!field.value);
    setIsUnsaved(field.updatable && field.value);
  }, [field.value, field.updatable, setIsOpenedCollapsibleGroup, setIsUnsaved]);

  return (
    <Radios>
      <RadioWrapper>
        <Radio
          name="events"
          label={intl.formatMessage({ id: 'core.settings.application.webhooks.eventsToSend.label_allEvents' })}
          onChange={handleChangeDisplayAllCategories(true)}
          checked={field.value}
          disabled={!enabled}
        />
      </RadioWrapper>
      <RadioWrapper>
        <Radio
          name="events"
          label={intl.formatMessage({ id: 'core.settings.application.webhooks.eventsToSend.label_selectedEvents' })}
          onChange={handleChangeDisplayAllCategories(false)}
          checked={!field.value}
          disabled={!enabled}
        />
      </RadioWrapper>
    </Radios>
  );
};

export const EventsToSend = React.memo<Props>(
  ({
    setUnsaved,
    isEditable,
    isFetchingWebhookInformation,
    webhookSetting,
    webhookAllEvents,
    updateWebhookInformationRequest,
  }) => {
    const intl = useIntl();
    const { enabled, url, include_members, include_unread_count, enabled_events } = webhookSetting;
    const [isUnsavedCollapsibleGroup, setIsUnsavedCollapsibleGroup] = useState(false);
    const [isUnsavedRadioGroup, setIsUnsavedRadioGroup] = useState(false);
    const [isOpenedCollapsibleGroup, setIsOpenedCollapsibleGroup] = useState(false);
    const [includeMembers, setIncludeMembers] = useState(include_members);
    const [includeUnreadCount, setIncludeUnreadCount] = useState(include_unread_count);

    const enabledEventSet = new Set(enabled_events);
    const form = useForm({
      onSubmit: ({ displayAllCategories, ...events }) => {
        const enabledKeys = Object.keys(pickBy(events, (item) => item));
        updateWebhookInformationRequest({
          url,
          enabled,
          onSuccess: form.onSuccess,
          enabled_events: displayAllCategories ? ['*'] : enabledKeys,
          include_members: includeMembers,
          include_unread_count: includeUnreadCount,
        });
      },
    });

    const handleSubmit = (e) => {
      form.onSubmit(e);
    };

    const isUnsaved = [
      isUnsavedRadioGroup,
      isUnsavedCollapsibleGroup,
      includeMembers !== include_members,
      includeUnreadCount !== include_unread_count,
    ].some((updatable) => updatable);

    useEffect(() => {
      setUnsaved(isUnsaved);
    }, [setUnsaved, isUnsaved]);

    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'core.settings.application.webhooks.eventsToSend.title' })}
        description={intl.formatMessage({ id: 'core.settings.application.webhooks.eventsToSend.desc' })}
        gridItemConfig={{
          subject: { alignSelf: 'start' },
          body: { alignSelf: 'start' },
        }}
        showActions={isUnsaved}
        actions={[
          {
            key: 'cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: form.reset,
          },
          {
            key: 'save',
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: handleSubmit,
            isLoading: isFetchingWebhookInformation,
            disabled: isFetchingWebhookInformation || !isEditable,
          },
        ]}
        data-test-id="EventsToSend"
      >
        <EventTypeRadioGroupContext.Provider
          value={{
            isUnsaved: isUnsavedRadioGroup,
            setIsUnsaved: setIsUnsavedRadioGroup,
            isOpenedCollapsibleGroup,
            setIsOpenedCollapsibleGroup,
          }}
        >
          <EventTypeRadioGroup
            form={form}
            enabled={enabled}
            enabledEventSet={enabledEventSet}
            webhookAllEvents={webhookAllEvents}
          />
        </EventTypeRadioGroupContext.Provider>
        <CollapsibleGroupContext.Provider
          value={{ isUnsaved: isUnsavedCollapsibleGroup, setIsUnsaved: setIsUnsavedCollapsibleGroup }}
        >
          {isOpenedCollapsibleGroup && (
            <CollapsibleGroup
              form={form}
              enabled={enabled}
              enabledEventSet={enabledEventSet}
              webhookAllEvents={webhookAllEvents}
            />
          )}
        </CollapsibleGroupContext.Provider>
        <GroupChannelInformation
          isEditable={!isFetchingWebhookInformation && isEditable}
          includeMembers={includeMembers}
          includeUnreadCount={includeUnreadCount}
          setIncludeMembers={setIncludeMembers}
          setIncludeUnreadCount={setIncludeUnreadCount}
        />
      </SettingsGridCard>
    );
  },
);
