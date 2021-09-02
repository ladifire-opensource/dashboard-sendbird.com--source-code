import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { InputText } from 'feather';

import { TableRowIconButton } from './TableRowButtons';
import { useCreateTagForm } from './useCreateTagForm';

type Props = {
  onCancelButtonClick: () => void;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
  serverError: unknown | null;
  defaultValue?: string;
};

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 8px;
  grid-auto-flow: column;
  align-items: start;
  width: 100%;
  margin: -6px 0;

  input:focus {
    box-shadow: none;
  }
`;

const Buttons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 4px;
  grid-auto-flow: column;
  align-items: center;
  height: 32px;
`;

export const CreateTagForm: FC<Props> = ({
  onCancelButtonClick,
  onSubmit: onSubmitProp,
  isSubmitting,
  defaultValue,
  serverError,
}) => {
  const intl = useIntl();
  const { nameInputProps, handleSubmit, reset } = useCreateTagForm({
    defaultValue,
    serverError,
  });

  const handleCancelButtonClick = () => {
    reset();
    onCancelButtonClick();
  };

  const onSubmit = async ({ name }: { name: string }) => {
    if (name === defaultValue) {
      // If submitted without change, ignore submission and trigger cancel action.
      handleCancelButtonClick();
      return;
    }

    onSubmitProp(name);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} name={intl.formatMessage({ id: 'desk.settings.tags.btn.createTag' })}>
      <InputText {...nameInputProps} size="small" />
      <Buttons>
        <TableRowIconButton
          type="submit"
          icon="done"
          title={intl.formatMessage({ id: 'desk.settings.tags.createRow.btn.save' })}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        />
        <TableRowIconButton
          type="button"
          icon="rollback"
          title={intl.formatMessage({ id: 'desk.settings.tags.createRow.btn.cancel' })}
          onClick={handleCancelButtonClick}
        />
      </Buttons>
    </Form>
  );
};
