import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { DropdownProps, Dropdown, cssVariables } from 'feather';

import { targetChannelTypeDescriptionsWithIntlKeys } from './constants';
import { descriptionIntlKeyMapper } from './descriptionIntlKeyMapper';

type Props = Omit<DropdownProps<TargetChannelType>, 'items' | 'itemToString' | 'itemToElement' | 'placeholder'> & {
  label: string;
};

type TargetChannelType = AnnouncementV16['target_channel_type'];

const options: TargetChannelType[] = ['distinct', 'non_distinct', 'all'];

const Container = styled.div``;

const Label = styled.div`
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 6px;
`;

const DropdownItemDefinition = styled.dl`
  white-space: initial;

  dd {
    font-weight: 400;
  }
`;

export const TargetChannelTypeDropdown: FC<Props> = ({ label, ...props }) => {
  const intl = useIntl();
  const targetChannelTypeDescriptions = targetChannelTypeDescriptionsWithIntlKeys.map(descriptionIntlKeyMapper(intl));

  const getItemDescription = (key: TargetChannelType) => targetChannelTypeDescriptions.find((item) => item.key === key);

  return (
    <Container>
      <Label id="TargetChannelTypeDropdownLabel">{label}</Label>
      <Dropdown<TargetChannelType>
        aria-labelledby="TargetChannelTypeDropdownLabel"
        items={options}
        placeholder={intl.formatMessage({
          id: 'chat.announcements.createAnnouncement.fields_lbl.targetChannelTypePlaceholder',
        })}
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
    </Container>
  );
};
