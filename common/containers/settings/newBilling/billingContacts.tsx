import { FC, useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Button, cssVariables, Dropdown, IconButton, InputText, toast, Spinner } from 'feather';
import isEqual from 'lodash/isEqual';

import { updateBillingContacts, fetchBillingContacts } from '@common/api';
import { SettingsGridCard } from '@common/containers/layout';
import { PrimaryContacts } from '@constants';
import { getErrorMessage } from '@epics';
import { useAsync, useAuthorization } from '@hooks';

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
`;

const BillingRow = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 6px;
`;

const EmailList = styled.ul``;

const EmailItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${cssVariables('neutral-2')};
  color: ${cssVariables('neutral-7')};
  padding: 4px 8px 4px 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 20px;

  & + & {
    margin-top: 8px;
  }
`;

const AddContact = styled.div`
  display: flex;
  align-items: center;

  form {
    display: flex;
    align-items: center;
    > div:first-child {
      flex: 1;
      margin-right: 8px;
    }

    > button + button {
      margin-left: 4px;
    }
  }

  margin-top: 8px;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const AddBillingContactForm = styled.form`
  display: flex;
  flex-direction: row;
  width: 100%;

  input {
    flex: 1;
  }
`;

const useBillingContactsAPI = () => {
  const intl = useIntl();
  const organization_uid = useSelector((state: RootState) => state.organizations.current.uid);
  const [billingContacts, setBillingContacts] = useState<BillingContactsPayload | undefined>(undefined);

  const [{ status }, load] = useAsync(async () => {
    const response = await fetchBillingContacts(organization_uid);
    setBillingContacts(response.data);
    return response;
  }, []);

  const [{ status: updateStatus, error: updateError }, update] = useAsync(async (payload) => {
    const response = await updateBillingContacts({ uid: organization_uid, payload });
    setBillingContacts(response.data);
    return response;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (updateStatus === 'success') {
      toast.success({ message: intl.formatMessage({ id: 'common.changesSaved' }) });
    }
  }, [intl, updateStatus]);

  useEffect(() => {
    if (updateError) {
      toast.error({ message: getErrorMessage(updateError) });
    }
  }, [updateError]);
  return {
    status,
    updateStatus,
    isLoading: status === 'loading',
    isUpdating: updateStatus === 'loading',
    billingContacts,
    update,
  };
};

export const parseCurrentEmails = (billing_email: string): string[] => {
  try {
    const parsedBillingEmail = JSON.parse(billing_email);
    return Array.isArray(parsedBillingEmail) ? parsedBillingEmail : [billing_email];
  } catch {
    return [billing_email];
  }
};

type PrimaryContactItem = {
  label: string;
  value: PrimaryContacts;
};

const primaryContactItems = [
  {
    label: 'Owner only',
    value: PrimaryContacts.OwnerOnly,
  },
  {
    label: 'Owner and admins',
    value: PrimaryContacts.OwnerAdmin,
  },
  {
    label: 'Owner, admins, and billing',
    value: PrimaryContacts.OwnerAdminBilling,
  },
  // {
  //   label: 'All members',
  //   value: PrimaryContacts.All,
  // },
];

export const BillingContacts: FC = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();

  const { status, isLoading, isUpdating, billingContacts, update } = useBillingContactsAPI();

  const [primaryContact, setPrimaryContact] = useState<PrimaryContactItem>(primaryContactItems[0]);
  const [contacts, setContacts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      const billingEmails = billingContacts ? parseCurrentEmails(billingContacts.billing_email) : [];
      setContacts(billingEmails);
      setPrimaryContact(
        primaryContactItems.find((item) => item.value === billingContacts?.primary_contact) || primaryContactItems[0],
      );
    }
  }, [billingContacts, status]);

  const handlePrimaryContactSelected = (item) => {
    setPrimaryContact(item);
  };

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveEmailClick = (email) => () => {
    const filteredEmails = contacts.filter((contact) => contact !== email);
    try {
      setIsEditing(true);
      setContacts(filteredEmails);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    }
  };

  const handleAddEmailClick = () => {
    setIsEditing(true);
  };

  const handleCancelEditingClick = () => {
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    if (billingContacts) {
      setContacts(parseCurrentEmails(billingContacts.billing_email));
    }
    setPrimaryContact(
      primaryContactItems.find((item) => item.value === billingContacts?.primary_contact) || primaryContactItems[0],
    );
  };

  const handleAddEmailSubmit = (e) => {
    e.preventDefault();
    const email = emailInputRef.current?.value;
    if (email) {
      if (contacts.includes(email)) {
        toast.warning({
          message: intl.formatMessage({
            id: 'common.settings.billing.billingContacts.additionalContacts.toast.exists',
          }),
        });
        return;
      }
      try {
        setContacts([...contacts, email]);
        if (emailInputRef.current) {
          emailInputRef.current.value = '';
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      }
    }
  };

  const handleSaveClick = () => {
    update({ billing_email: JSON.stringify(contacts), primary_contact: primaryContact.value });
    setIsEditing(false);
  };

  // TODO
  const showActions =
    status === 'success' &&
    billingContacts &&
    (!isEqual(contacts, parseCurrentEmails(billingContacts.billing_email)) ||
      billingContacts.primary_contact !== primaryContact.value);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'common.settings.billing.billingContacts.title' })}
      description={intl.formatMessage({ id: 'common.settings.billing.billingContacts.description' })}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
      showActions={showActions}
      actions={[
        {
          key: `default-cancel`,
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: handleCancelClick,
        },
        {
          key: `default-save`,
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: handleSaveClick,
          isLoading: isUpdating,
          disabled: isUpdating,
        },
      ]}
    >
      {isLoading ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <Wrapper>
          <BillingRow data-test-id="PrimaryEmail">
            <Label
              aria-label={intl.formatMessage({ id: 'common.settings.billing.billingContacts.primaryContacts.label' })}
            >
              {intl.formatMessage({ id: 'common.settings.billing.billingContacts.primaryContacts.label' })}
            </Label>
            <Dropdown
              items={primaryContactItems}
              selectedItem={primaryContact}
              onItemSelected={handlePrimaryContactSelected}
              itemToString={(item) => item.label}
              width="100%"
              disabled={!isPermitted(['organization.billing.all'])}
            />
          </BillingRow>
          <BillingRow>
            <Label>
              {intl.formatMessage({ id: 'common.settings.billing.billingContacts.additionalContacts.label' })}
            </Label>
            <EmailList>
              {contacts.map((email) => (
                <EmailItem key={`billingEmail_${email}`} data-test-id="BillingContactsEmail">
                  {email}
                  <IconButton
                    title={intl.formatMessage({
                      id: 'common.settings.billing.billingContacts.additionalContacts.button.remove',
                    })}
                    buttonType="tertiary"
                    icon="delete"
                    size="small"
                    onClick={handleRemoveEmailClick(email)}
                    data-test-id="DeleteButton"
                  />
                </EmailItem>
              ))}
              <AddContact>
                {isEditing ? (
                  <AddBillingContactForm onSubmit={handleAddEmailSubmit} data-test-id="AddBillingContactForm">
                    <InputText ref={emailInputRef} type="email" />
                    <Button type="button" buttonType="tertiary" onClick={handleCancelEditingClick}>
                      {intl.formatMessage({
                        id: 'common.settings.billing.billingContacts.additionalContacts.button.cancel',
                      })}
                    </Button>
                    <Button type="submit" buttonType="primary" isLoading={isLoading}>
                      {intl.formatMessage({
                        id: 'common.settings.billing.billingContacts.additionalContacts.button.add',
                      })}
                    </Button>
                  </AddBillingContactForm>
                ) : (
                  <Button
                    buttonType="primary"
                    variant="ghost"
                    icon="plus"
                    onClick={handleAddEmailClick}
                    disabled={!isPermitted(['organization.billing.all'])}
                    data-test-id="AddEmailButton"
                  >
                    {intl.formatMessage({
                      id: 'common.settings.billing.billingContacts.additionalContacts.button.addEmail',
                    })}
                  </Button>
                )}
              </AddContact>
            </EmailList>
          </BillingRow>
        </Wrapper>
      )}
    </SettingsGridCard>
  );
};
