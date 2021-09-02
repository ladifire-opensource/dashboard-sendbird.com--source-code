import React, { useContext } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Checkbox, Field, useField, Form } from 'feather';

import { CollapsibleSection } from '@ui/components';

import { CollapsibleGroupContext } from './collapsibleGroupContext';
import { EventCategory } from './eventsToSend';

type Props = {
  form: Form;
  enabled: boolean;
  enabledEventSet: Set<string>;
  webhookAllEvents: SettingsState['webhookAllEvents'];
};

type CollapseSectionProp = {
  enabled: boolean;
  title: string;
  items: EventCategory;
};

const CollapsibleSettingGroup = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const CollapsibleSettingWrapper = styled(CollapsibleSection)`
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;

  & + & {
    margin-top: 8px;
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const CollapsibleTitle = styled.div`
  display: inline-flex;
  align-items: center;

  > span {
    display: inline-block;
  }
`;

const CollapsibleBody = styled.div``;

const OptionGroup = styled.ul`
  list-style: none;
  padding-top: 16px;

  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const OptionItem = styled.li<{ isHidden: boolean }>`
  ${({ isHidden }) => (isHidden ? 'display: none' : '')};
  & + & {
    margin-top: 16px;
  }
`;

// Checkboxes for the legacy events will be hidden from UI and meant to be unchanged.
const legacyEventKeys = ['group_channel:old_kick_out:join', 'group_channel:old_kick_out:invite'];

const CollapsibleSetting: React.FC<CollapseSectionProp> = React.memo(({ title, items, enabled }) => {
  const visibleEventKeys = Object.keys(items).filter((key) => !legacyEventKeys.includes(key));
  const enabledCount = visibleEventKeys.filter((key) => items[key].value).length;
  const totalCount = visibleEventKeys.length;

  const Highlight = styled.span<{ disabled: boolean }>`
    color: ${(props) => (props.disabled ? cssVariables('neutral-5') : cssVariables('purple-7'))};
  `;

  const handleCheckboxChange = (field: Field<boolean>) => () => {
    field.updateValue(!field.value);
  };

  return (
    <CollapsibleSettingWrapper
      title={
        <CollapsibleTitle>
          {title} (<Highlight disabled={!enabled}>{enabledCount}</Highlight> / <span>{totalCount}</span>)
        </CollapsibleTitle>
      }
      initialCollapsed={true}
      disabled={!enabled}
    >
      <CollapsibleBody>
        <OptionGroup>
          {Object.values(items).map((field) => (
            <OptionItem key={field.name} isHidden={legacyEventKeys.includes(field.name)}>
              <Checkbox
                id={field.name}
                label={field.name}
                checked={field.value}
                onChange={handleCheckboxChange(field)}
                disabled={!enabled}
              />
            </OptionItem>
          ))}
        </OptionGroup>
      </CollapsibleBody>
    </CollapsibleSettingWrapper>
  );
});

// This affects the order of event groups on UI.
const knownEventCategoryGroups = [
  'open_channel',
  'group_channel',
  'user',
  'operators',
  'report',
  'profanity_filter',
  'image_moderation',
  'announcement',
  'alert',
];

const categoryGroupNameIntlKeys = {
  open_channel: 'core.settings.application.webhooks.eventsToSend.section.openChannel',
  group_channel: 'core.settings.application.webhooks.eventsToSend.section.groupChannel',
  user: 'core.settings.application.webhooks.eventsToSend.section.user',
  operators: 'core.settings.application.webhooks.eventsToSend.section.operators',
  report: 'core.settings.application.webhooks.eventsToSend.section.report',
  profanity_filter: 'core.settings.application.webhooks.eventsToSend.section.profanity',
  announcement: 'core.settings.application.webhooks.eventsToSend.section.announcement',
  image_moderation: 'core.settings.application.webhooks.eventsToSend.section.imageModeration',
  alert: 'core.settings.application.webhooks.eventsToSend.section.alert',
};

export const CollapsibleGroup = React.memo<Props>(({ form, enabled, webhookAllEvents, enabledEventSet }) => {
  const intl = useIntl();
  const { setIsUnsaved } = useContext(CollapsibleGroupContext);

  const eventCategories: Record<string, Record<string, Field<boolean>>> = {};

  [...webhookAllEvents].sort().forEach((event) => {
    const [originalEventKey, eventName] = event.split(':');

    const key = eventName.includes('report') ? 'report' : originalEventKey;
    const existKey = key in eventCategories;
    if (!existKey) {
      eventCategories[key] = {};
    }
    // FIXME: replace with react-hook-form to fix rules of hooks violation
    // eslint-disable-next-line react-hooks/rules-of-hooks
    eventCategories[key][event] = useField<boolean>(event, form, {
      defaultValue: enabledEventSet.has(event),
      isControlled: true,
    });
  });

  setIsUnsaved(
    Object.values(eventCategories).some((category) => Object.values(category).some((field) => field.updatable)),
  );

  const unknownEventCategoryGroups = Object.keys(eventCategories).filter(
    (key) => !knownEventCategoryGroups.includes(key),
  );

  return (
    <CollapsibleSettingGroup data-test-id="WebhookCollapsibleGroup">
      {knownEventCategoryGroups
        .filter((group) => !!eventCategories[group])
        .map((group) => (
          <CollapsibleSetting
            key={group}
            title={intl.formatMessage({ id: categoryGroupNameIntlKeys[group] })}
            items={eventCategories[group]}
            enabled={enabled}
          />
        ))}
      {unknownEventCategoryGroups.map((group) => (
        <CollapsibleSetting key={group} title={group} items={eventCategories[group]} enabled={enabled} />
      ))}
    </CollapsibleSettingGroup>
  );
});
