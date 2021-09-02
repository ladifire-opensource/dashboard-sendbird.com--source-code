import { FC, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio, cssVariables, Body } from 'feather';

type Props = {
  name?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
};

const Container = styled.div.attrs({ role: 'radiogroup' })`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  > * + * {
    margin-top: 8px;
  }
`;

const Label = styled.label`
  display: grid;
  grid-template-columns: 20px 1fr;
  grid-gap: 8px;
  align-items: start;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  font-size: 14px;
  font-weight: 500;

  > *:first-child {
    position: relative;
    top: 1px;
  }
`;

const DefinitionWrapper = styled.dl`
  dd {
    margin-top: 4px;
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-7')};
  }
`;

const Definition: FC<{ term: string; definition: string }> = ({ term, definition }) => (
  <DefinitionWrapper>
    <dt>{term}</dt>
    <dd>{definition}</dd>
  </DefinitionWrapper>
);

export const ChannelDistinctRadioGroup: FC<Props> = ({ name, value = true, onChange, className }) => {
  const intl = useIntl();

  const onRadioChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value === 'distinct';
    onChange?.(newValue);
  };

  return (
    <Container className={className}>
      <Label>
        <Radio
          onChange={onRadioChange}
          name={name}
          value="distinct"
          checked={value}
          aria-label={intl.formatMessage({ id: 'chat.announcements.targetChannelType.distinct' })}
        />
        <Definition
          term={intl.formatMessage({ id: 'chat.announcements.targetChannelType.distinct' })}
          definition={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.distinct.definitions.distinct',
          })}
        />
      </Label>
      <Label>
        <Radio
          onChange={onRadioChange}
          name={name}
          value="non_distinct"
          checked={!value}
          aria-label={intl.formatMessage({ id: 'chat.announcements.targetChannelType.nonDistinct' })}
        />
        <Definition
          term={intl.formatMessage({ id: 'chat.announcements.targetChannelType.nonDistinct' })}
          definition={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.distinct.definitions.nonDistinct',
          })}
        />
      </Label>
    </Container>
  );
};
