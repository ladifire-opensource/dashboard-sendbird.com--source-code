import { forwardRef, useImperativeHandle } from 'react';
import { RegisterOptions, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, InputText, Button, IconButton, Spinner, InlineNotification } from 'feather';

type Props = {
  items: string[];
  pendingRemoveItems?: string[];
  inputPlaceholder?: string;
  addButtonLabel: string;
  addButtonIsLoading?: boolean;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
  onItemAdd: (item: string, onSuccess: () => void) => void;
  onItemDelete: (item: string) => void;
  onReload?: () => void;
  validate: RegisterOptions['validate'];
  className?: string;
};

type FormValues = { value: string };
export type UniqueItemListFormRef = { setError: (message: string) => void };

const Container = styled.div``;

const AddItemForm = styled.form`
  display: flex;

  > button {
    margin-left: 8px;
  }
`;

const ItemList = styled.ul`
  list-style: none;
  margin-top: 28px;
`;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${cssVariables('neutral-2')};
  color: ${cssVariables('neutral-7')};
  padding: 4px 16px;
  padding-right: 8px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.43;

  & + & {
    margin-top: 8px;
  }
`;

const InputContainer = styled.div`
  width: 100%;
`;

export const UniqueItemListForm = forwardRef<UniqueItemListFormRef, Props>(
  (
    {
      items,
      pendingRemoveItems = [],
      isLoading,
      error,
      inputPlaceholder,
      addButtonLabel,
      addButtonIsLoading,
      disabled,
      onItemAdd,
      onItemDelete,
      onReload,
      validate,
      className,
    },
    ref,
  ) => {
    const intl = useIntl();
    const { register, handleSubmit, watch, reset, errors, setError } = useForm<FormValues>();
    const inputValue = watch('value');

    useImperativeHandle(
      ref,
      () => ({
        setError: (message: string) => {
          setError('value', { type: 'serverError', message });
        },
      }),
      [setError],
    );

    const renderList = () => {
      if (error) {
        return (
          <InlineNotification
            message={error}
            type="info"
            action={{
              label: intl.formatMessage({ id: 'chat.settings.commonActions.btn.retry' }),
              onClick: onReload,
              isLoading,
              disabled: isLoading,
            }}
            css={`
              margin-top: 20px;
            `}
          />
        );
      }

      if (items.length === 0 && isLoading) {
        return (
          <Spinner
            size={24}
            stroke={cssVariables('neutral-5')}
            css={`
              margin: 56px auto 32px;
            `}
          />
        );
      }

      return items.length > 0 ? (
        <ItemList>
          {items.map((item) => (
            <Item key={item}>
              {item}
              <IconButton
                aria-label="Delete"
                buttonType="tertiary"
                icon="delete"
                size="small"
                onClick={() => {
                  onItemDelete(item);
                }}
                isLoading={pendingRemoveItems.includes(item)}
                disabled={disabled}
              />
            </Item>
          ))}
        </ItemList>
      ) : null;
    };

    return (
      <Container className={className}>
        <AddItemForm
          onSubmit={handleSubmit(({ value }) => {
            onItemAdd(value, () => reset());
          })}
        >
          <InputContainer>
            <InputText
              ref={register({ validate })}
              type="text"
              name="value"
              placeholder={inputPlaceholder}
              icons={inputValue ? [{ icon: 'close', type: 'button', onClick: () => reset() }] : undefined}
              required={true}
              error={errors.value?.message ? { hasError: true, message: errors.value.message as string } : undefined}
              disabled={disabled}
            />
          </InputContainer>
          <Button buttonType="primary" isLoading={addButtonIsLoading} type="submit" disabled={disabled}>
            {addButtonLabel}
          </Button>
        </AddItemForm>
        {renderList()}
      </Container>
    );
  },
);
