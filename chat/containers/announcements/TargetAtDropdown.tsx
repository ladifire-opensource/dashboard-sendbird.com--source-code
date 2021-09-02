import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { DropdownProps, Dropdown } from 'feather';

import { targetAtDescriptionsWithIntlKeys } from './constants';
import { descriptionIntlKeyMapper } from './descriptionIntlKeyMapper';

type TargetAt = AnnouncementV16['target_at'];

const targetAtOptions: TargetAt[] = [
  'sender_all_channels',
  'target_channels',
  'target_users_included_channels',
  'target_users_only_channels',
];

const DropdownItemDefinition = styled.dl`
  white-space: initial;

  dd {
    font-weight: 400;
  }
`;

export const TargetAtDropdown = (
  props: Omit<DropdownProps<TargetAt>, 'items' | 'itemToString' | 'itemToElement' | 'placeholder'>,
) => {
  const intl = useIntl();
  const targetAtDescriptions = targetAtDescriptionsWithIntlKeys.map(descriptionIntlKeyMapper(intl));

  const getItemDescription = (key: TargetAt) => targetAtDescriptions.find((item) => item.key === key);

  return (
    <Dropdown<TargetAt>
      items={targetAtOptions}
      placeholder={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.targetAtPlaceholder' })}
      itemToString={(key) => getItemDescription(key)?.label ?? key}
      itemToElement={(key) => {
        const { label, description } = getItemDescription(key) ?? { label: key, description: '' };
        return (
          <DropdownItemDefinition>
            <dt>{label}</dt>
            <dd>{description}</dd>
          </DropdownItemDefinition>
        );
      }}
      {...props}
    />
  );
};
