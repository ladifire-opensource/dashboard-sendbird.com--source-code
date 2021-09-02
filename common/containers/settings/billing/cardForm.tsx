import React, { FC, useCallback, useState } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, toast, useForm, useField, typeface, Checkbox, Body } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { getErrorMessage } from '@epics';
import { useInitCardRegistration } from '@hooks/useInitCardRegistration';
import { useStripeSDK } from '@hooks/useStripeSDK';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { SetupIntent } from '@stripe/stripe-js';
import {
  BasicInput,
  DialogFormSet,
  DialogFormLabel,
  DialogFormBody,
  DialogFormAction,
  CancelButton,
  ConfirmButton,
} from '@ui/components';
import { clearfix } from '@ui/styles';
import { ALERT_CARD_AGGREMENT_REQUIRED } from '@utils/text';

type Props = {
  isLoading: boolean;

  // actions
  handleSubmit: (setupIntent: SetupIntent) => void;
  handleDialogCancel: () => void;
  submitText?: string;
};

const FormBox = styled.div<{ grid?: 'half' }>`
  ${clearfix()};
  margin-bottom: 20px;

  ${({ grid }) =>
    grid === 'half'
      ? css`
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-column-gap: 16px;
          ${DialogFormSet} + ${DialogFormSet} {
            margin-top: 0;
          }
        `
      : ''}
`;

const StyledCardForm = styled.form`
  .stripeInput {
    display: block;
    width: 100%;
    color: ${cssVariables('neutral-10')};
    -webkit-appearance: none;
    height: 40px;
    line-height: 38px;
    font-size: 14px;
    cursor: auto;
    will-change: height;
    padding: 10px 16px;
    border-width: 1px;
    border-style: solid;
    border-color: ${cssVariables('neutral-3')};
    border-image: initial;
    border-radius: 4px;
    outline: none;
    background: white;
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0s;
    &.StripeElement--focus {
      border-color: ${cssVariables('purple-7')};
    }
  }
`;

const CheckboxLabel = styled.div`
  padding-left: 8px;
`;

const Inform = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 16px;
`;

const inputStyle = {
  style: {
    base: {
      fontSize: '14px',
      color: cssVariables('neutral-10'),
      letterSpacing: '0',
      fontFamily: typeface.system,
      '::placeholder': {
        color: cssVariables('neutral-7'),
      },
    },
    invalid: {
      color: cssVariables('red-5'),
    },
  },
};

const CardFormComponent: FC<Props> = ({ isLoading, handleSubmit, handleDialogCancel, submitText }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { intent_client_secret } = useInitCardRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = useCallback(
    async (formData) => {
      if (!formData.agree) {
        toast.warning({
          message: ALERT_CARD_AGGREMENT_REQUIRED,
        });
        return false;
      }
      const address = {};
      if (formData.city) {
        address['city'] = formData.city;
      }
      if (formData.country) {
        address['country'] = formData.country;
      }
      if (formData.line1) {
        address['line1'] = formData.line1;
      }
      if (stripe && elements) {
        setIsSubmitting(true);
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          const { setupIntent, error } = await stripe.confirmCardSetup(intent_client_secret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: formData.name,
                ...(isEmpty(address) ? {} : { address }),
              },
            },
          });
          if (error) {
            toast.error({
              message: getErrorMessage(error),
            });
          }
          if (setupIntent) {
            await handleSubmit(setupIntent);
          }
        }
        setIsSubmitting(false);
      }
    },
    [stripe, elements, intent_client_secret, handleSubmit],
  );

  const cardForm = useForm({ onSubmit: handleFormSubmit });
  const nameField = useField<string, HTMLInputElement>('name', cardForm, {
    defaultValue: '',
    validate: (value) => (value.trim() ? '' : 'Please enter your name.'),
  });
  const addressField = useField<string, HTMLInputElement>('line1', cardForm, {
    defaultValue: '',
  });
  const cityField = useField<string, HTMLInputElement>('city', cardForm, {
    defaultValue: '',
  });
  const countryField = useField<string, HTMLInputElement>('country', cardForm, {
    defaultValue: '',
  });
  const agreeField = useField<boolean, HTMLInputElement>('agree', cardForm, {
    defaultValue: false,
    isControlled: true,
  });
  return (
    <StyledCardForm onSubmit={cardForm.onSubmit} data-test-id="CardForm">
      <DialogFormBody>
        <FormBox>
          <DialogFormSet>
            <DialogFormLabel>Card</DialogFormLabel>
            <CardElement
              className="stripeInput"
              options={{
                ...inputStyle,
                hidePostalCode: true,
              }}
            />
          </DialogFormSet>
          <DialogFormSet>
            <DialogFormLabel>Full name</DialogFormLabel>
            <BasicInput
              type="text"
              ref={nameField.ref}
              name={nameField.name}
              required={true}
              data-test-id="FullNameField"
            />
          </DialogFormSet>
        </FormBox>
        <FormBox>
          <DialogFormSet>
            <DialogFormLabel>Address (optional)</DialogFormLabel>
            <BasicInput type="text" ref={addressField.ref} name={addressField.name} />
          </DialogFormSet>
        </FormBox>
        <FormBox grid="half">
          <DialogFormSet>
            <DialogFormLabel>City (optional)</DialogFormLabel>
            <BasicInput type="text" ref={cityField.ref} name={cityField.name} />
          </DialogFormSet>
          <DialogFormSet>
            <DialogFormLabel>Country (optional)</DialogFormLabel>
            <BasicInput type="text" ref={countryField.ref} name={countryField.name} />
          </DialogFormSet>
        </FormBox>
        <DialogFormSet>
          <Checkbox
            ref={agreeField.ref}
            name={agreeField.name}
            checked={agreeField.value}
            onChange={agreeField.onChange}
            label={
              (
                <CheckboxLabel>
                  I agree to Sendbird's{' '}
                  <a href="https://sendbird.com/terms-of-service" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="https://sendbird.com/privacy" target="_blank">
                    Privacy Policy
                  </a>
                  .
                </CheckboxLabel>
              ) as any
            }
          />
          <Inform>*You may receive a pending charge of USD 1.00 or less to verify that your card is valid.</Inform>
        </DialogFormSet>
      </DialogFormBody>
      <DialogFormAction>
        <CancelButton type="button" onClick={handleDialogCancel}>
          Cancel
        </CancelButton>
        <ConfirmButton type="submit" isFetching={isSubmitting || isLoading} disabled={isSubmitting || isLoading}>
          {submitText}
        </ConfirmButton>
      </DialogFormAction>
    </StyledCardForm>
  );
};

export const CardForm: React.FC<Props> = ({ isLoading, handleSubmit, handleDialogCancel, submitText = 'Save' }) => {
  const stripe = useStripeSDK();

  return (
    <Elements stripe={stripe}>
      <CardFormComponent
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        handleDialogCancel={handleDialogCancel}
        submitText={submitText}
      />
    </Elements>
  );
};
