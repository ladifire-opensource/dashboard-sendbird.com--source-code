import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Headings, cssVariables, IconButton, InputText, Button } from 'feather';

import { createTag } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';

import { useCreateTagForm } from '../settings/TicketTags/useCreateTagForm';

type Props = { onBackButtonClick: () => void; onTagCreated: (tag: TicketTag) => void };

const Container = styled.div`
  margin: -8px 0;
`;

const Titlebar = styled.h6`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const Form = styled.form`
  padding: 20px 16px;
  padding-bottom: 0;
`;

const FormActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 8px 4px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  margin: 0 -16px;
  margin-top: 24px;

  & > * {
    margin-left: 4px;
  }
`;

const FormAction = styled(Button).attrs({ variant: 'ghost', size: 'small' })`
  min-width: 0;
`;

const BackButton = styled(IconButton).attrs({ size: 'small', buttonType: 'secondary', icon: 'arrow-left' })`
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
`;

export const CreateTagFormView: FC<Props> = ({ onBackButtonClick, onTagCreated }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const [requestState, setRequestState] = useState<{
    status: 'idle' | 'pending' | 'done';
    error: unknown | null;
  }>({
    status: 'idle',
    error: null,
  });
  const { nameInputProps, handleSubmit } = useCreateTagForm({ serverError: requestState.error });

  const onSubmit = async ({ name }: { name: string }) => {
    if (requestState.status === 'pending') {
      return;
    }
    setRequestState((state) => ({ ...state, status: 'pending' }));
    try {
      const { data } = await createTag(pid, region, { name });
      setRequestState({ status: 'done', error: null });
      onTagCreated(data);
    } catch (error) {
      setRequestState({ status: 'idle', error });
    }
  };

  const isPending = requestState.status === 'pending';

  return (
    <Container>
      <Titlebar>
        {intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.createNewTag.title' })}
        <BackButton onClick={onBackButtonClick} />
      </Titlebar>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* eslint-disable */}
        <InputText
          {...nameInputProps}
          label={intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.createNewTag.nameField.label' })}
          placeholder={intl.formatMessage({
            id: 'desk.tickets.ticketTagDropdown.createNewTag.nameField.placeholder',
          })}
          autoFocus={true}
        />
        {/* eslint-disable */}
        <FormActions>
          <FormAction type="button" buttonType="secondary" onClick={onBackButtonClick}>
            {intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.createNewTag.btn.cancel' })}
          </FormAction>
          <FormAction type="submit" buttonType="primary" isLoading={isPending} disabled={isPending}>
            {intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.createNewTag.btn.save' })}
          </FormAction>
        </FormActions>
      </Form>
    </Container>
  );
};
