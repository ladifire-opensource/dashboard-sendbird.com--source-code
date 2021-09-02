import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { ScrollBarRef } from 'feather';

import { deskActions } from '@actions';

import { CollapsibleSection } from '../collapsibleSection';
import { CustomFieldList } from '../customFieldList';

interface OwnProps {
  ticket: Ticket;
  scrollBarRef: React.RefObject<ScrollBarRef>;
}

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  role: state.auth.role,
  customers: state.customers,
  customerFields: state.customerFields,
  ticketFields: state.ticketFields,
  ...props,
});

const mapDispatchToProps = {
  addCustomerFieldData: deskActions.addCustomerFieldDataRequest,
  updateCustomerFieldData: deskActions.updateCustomerFieldDataRequest,
  addTicketFieldData: deskActions.addTicketFieldDataRequest,
  updateTicketFieldData: deskActions.updateTicketFieldDataRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

// FIXME: when ticket field didn't render, customer field border-bottom looks weird
const CollapsedInformation = styled(CollapsibleSection)<{ hasBorder: boolean }>`
  ${(props) => !props.hasBorder && 'border-bottom: none;'}
`;

export interface EditingField {
  id?: CustomFieldData['id'];
  name?: 'ticket' | 'customer';
}

const CustomFieldsInformationConnectable: React.FC<Props> = ({
  role,
  ticket,
  customerFields,
  ticketFields,
  addCustomerFieldData,
  updateCustomerFieldData,
  addTicketFieldData,
  updateTicketFieldData,
  scrollBarRef,
}) => {
  const intl = useIntl();
  const [currentEditingField, setEditingField] = useState<EditingField>({});

  const handleAddOrEditButtonClick = (name: EditingField['name']) => (id: EditingField['id']) => () =>
    setEditingField({ id, name });

  const handleCancelButtonClick = () => setEditingField({});

  return (
    <>
      {/* FIXME: handle empty customer fields */}
      {customerFields.items.length > 0 && (
        <CollapsedInformation
          title={intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.customerFields.lbl' })}
          hasBorder={true}
          scrollBarRef={scrollBarRef}
          data-test-id="CustomerFieldsCollapsedInformation"
        >
          <CustomFieldList
            id={ticket.customer.id}
            fields={customerFields}
            currentEditingField={currentEditingField.name === 'customer' ? currentEditingField : undefined}
            addFieldData={addCustomerFieldData}
            updateFieldData={updateCustomerFieldData}
            onAddOrEditButtonClick={handleAddOrEditButtonClick('customer')}
            onCancelButtonClick={handleCancelButtonClick}
            role={role}
          />
        </CollapsedInformation>
      )}
      {/* FIXME: handle empty ticket fields */}
      {ticketFields.items.length > 0 && (
        <CollapsedInformation
          title={intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketFields.lbl' })}
          hasBorder={false}
          scrollBarRef={scrollBarRef}
          data-test-id="TicketFieldsCollapsedInformation"
        >
          <CustomFieldList
            id={ticket.id}
            fields={ticketFields}
            currentEditingField={currentEditingField.name === 'ticket' ? currentEditingField : undefined}
            addFieldData={addTicketFieldData}
            updateFieldData={updateTicketFieldData}
            onAddOrEditButtonClick={handleAddOrEditButtonClick('ticket')}
            onCancelButtonClick={handleCancelButtonClick}
            role={role}
          />
        </CollapsedInformation>
      )}
    </>
  );
};

export const CustomFieldsInformation = connect(mapStateToProps, mapDispatchToProps)(CustomFieldsInformationConnectable);
