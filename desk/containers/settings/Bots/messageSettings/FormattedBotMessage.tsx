import { useEffect, useRef } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Headings } from 'feather';

import { BotMessagesKey } from '@constants/desk';
import FormatTextarea from '@desk/components/FormatTextarea';
import { ContentEditableRef } from '@ui/components/contentEditable';

const TooltipHeader = styled.div`
  ${Headings['heading-01']}
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
`;

type Props = {
  name: keyof BotFormValues;
  defaultValue: string;
  registerOptions: RegisterOptions;
  tags: BotMessagesKey[];
  testId?: string;
};

export const FormattedBotMessage = ({ name, defaultValue, registerOptions, tags, testId }: Props) => {
  const intl = useIntl();
  const messageEditorRef = useRef<ContentEditableRef>(null);
  const { watch, errors, register, setValue } = useFormContext<BotFormValues>();

  const propertyMap = {
    [BotMessagesKey.CUSTOMER_NAME]: {
      label: intl.formatMessage({ id: 'desk.settings.bots.detail.property.customerName' }),
      value: BotMessagesKey.CUSTOMER_NAME,
    },
    [BotMessagesKey.TICKET_NAME]: {
      label: intl.formatMessage({ id: 'desk.settings.bots.detail.property.ticketName' }),
      value: BotMessagesKey.TICKET_NAME,
    },
    [BotMessagesKey.SELECTED_QUESTION]: {
      label: intl.formatMessage({ id: 'desk.settings.bots.detail.property.selectedQuestion' }),
      value: BotMessagesKey.SELECTED_QUESTION,
    },
  };

  useEffect(() => {
    register(name, registerOptions);
  }, [name, register, registerOptions]);

  const handleChange = (message: string) => {
    setValue(name, message, { shouldDirty: true });
  };

  return (
    <FormatTextarea
      editorRef={messageEditorRef}
      defaultText={((watch(name) as string) ?? '') || defaultValue}
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
      propertyTags={tags.map((tag) => propertyMap[tag])}
      propertyTagTooltip={intl.formatMessage({ id: 'desk.settings.bots.detail.property.tooltip' })}
      testId={testId}
      error={errors[name]?.message?.toString() ?? ''}
      onChange={handleChange}
    />
  );
};
