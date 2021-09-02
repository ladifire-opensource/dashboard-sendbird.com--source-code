import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMAIL_REGEX } from '@constants';
import { useAuthorization } from '@hooks';
import { ChipInput } from '@ui/components';

import { SettingsCard } from '../../layout';

const Input = styled(ChipInput)`
  width: 100%;
  margin-bottom: 8px;
  background-color: #fff;
`;

export const parseCurrentEmails = (billing_email: string): ReadonlyArray<string> => {
  try {
    const parsedBillingEmail = JSON.parse(billing_email);
    return Array.isArray(parsedBillingEmail) ? parsedBillingEmail : [billing_email];
  } catch {
    return [billing_email];
  }
};

const mapStateToProps = (state: RootState) => ({
  isSaving: state.billing.isSavingBillingContacts,
  key: state.billing.lastSavedAt ? `${state.billing.lastSavedAt}` : undefined,
  currentEmails: parseCurrentEmails(state.organizations.current.billing_email),
  organization_uid: state.organizations.current.uid,
});

const mapDispatchToProps = {
  saveBillingContactsRequest: commonActions.saveBillingContactsRequest,
  saveBillingContactsCancel: commonActions.saveBillingContactsCancel,
  showDialogsRequest: commonActions.showDialogsRequest,
};

type Props = {
  isEditing?: boolean;
  isSavingOwnProps?: boolean;
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

export const BillingContactsConnectable: React.FC<Props> = ({
  organization_uid,
  currentEmails,
  isEditing: isEditingProp,
  isSaving,
  isSavingOwnProps,
  saveBillingContactsRequest,
  saveBillingContactsCancel,
  showDialogsRequest,
}) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();

  const inputRef = useRef<ChipInput>(null);

  const [isEditing, setIsEditing] = useState(isEditingProp || false);
  const [editingEmails, setEditingEmails] = useState<readonly string[]>(currentEmails);

  const validateEmail = (value) => {
    return EMAIL_REGEX.test(value);
  };

  const onFocus = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setEditingEmails(editingEmails.filter(validateEmail));
    setIsEditing(false);
  };

  const onInputClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const onChipInputChange = (values) => {
    setEditingEmails(values);
  };

  const resetInputValues = () => {
    setIsEditing(false);
    setEditingEmails(currentEmails);
    inputRef.current?.resetValues(currentEmails as string[]);
  };

  const onCancelButtonClick = () => {
    resetInputValues();
    saveBillingContactsCancel();
  };

  const onSaveButtonClick = () => {
    const invalidEmail = editingEmails.find((email) => !validateEmail(email));

    if (invalidEmail) {
      showDialogsRequest({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: 'Error',
          description: intl.formatMessage({ id: 'desc.invalidEmailExists' }, { invalidEmail }),
          confirmText: intl.formatMessage({ id: 'label.ok' }),
          hideCancel: true,
        },
      });
      return;
    }

    saveBillingContactsRequest({
      organization_uid,
      emails: Array.from(new Set(editingEmails)), // Delete duplicated items
    });
  };

  const hasChanges =
    currentEmails.length !== editingEmails.length || currentEmails.some((email) => !editingEmails.includes(email));

  return (
    <SettingsCard
      title={intl.formatMessage({ id: 'label.billingContacts' })}
      description={intl.formatMessage({ id: 'desc.billingContacts' })}
      singleColumn={true}
      actions={
        isPermitted(['organization.billing.all'])
          ? [
              {
                key: 'cancel',
                label: intl.formatMessage({ id: 'label.cancel' }),
                buttonType: 'tertiary',
                onClick: onCancelButtonClick,
              },
              {
                key: 'save',
                label: intl.formatMessage({ id: 'label.save' }),
                buttonType: 'primary',
                type: 'submit',
                disabled: isSaving || !hasChanges || !editingEmails.length,
                isLoading: isSaving || isSavingOwnProps,
                onClick: onSaveButtonClick,
              },
            ]
          : []
      }
      showActions={
        editingEmails.length !== currentEmails.length ||
        editingEmails.some((email, index) => email !== currentEmails[index])
      }
    >
      <Input
        ref={inputRef}
        placeholder={intl.formatMessage({ id: 'ph.billingContacts' })}
        values={editingEmails}
        readonly={!isEditing}
        validator={validateEmail}
        onClick={onInputClick}
        onChange={onChipInputChange}
        disabled={isSaving || !isPermitted(['organization.billing.all'])}
        multiline={true}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </SettingsCard>
  );
};

export const BillingContacts = connect(mapStateToProps, mapDispatchToProps)(BillingContactsConnectable);
