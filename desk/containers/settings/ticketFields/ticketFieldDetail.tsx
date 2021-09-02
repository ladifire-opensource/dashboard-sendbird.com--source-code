import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';

import { deskActions } from '@actions';
import { useShallowEqualSelector } from '@hooks';
import { PropsOf } from '@utils';

import { CustomFieldsDetail } from '../CustomFieldsDetail';

const mapDispatchToProps = {
  createField: deskActions.createTicketFieldRequest,
  updateField: deskActions.updateTicketFieldRequest,
  deleteField: deskActions.deleteTicketFieldRequest,
  checkFieldKeyValidation: deskActions.checkTicketFieldKeyValidationRequest,
  setCheckingStatusFieldKeyValidation: deskActions.setCheckingStatusTicketFieldKeyValidation,
};

type Props = Omit<PropsOf<typeof CustomFieldsDetail>, 'name' | 'customFields'>;

export const TicketFieldDetail = connect(
  null,
  mapDispatchToProps,
)((props: Props) => {
  const { fieldId: fieldIdParam } = useParams<{ fieldId: string }>();
  const location = useLocation<{ selectedRow: CustomField } | undefined>();
  const dispatch = useDispatch();
  const history = useHistory();
  const customFields = useShallowEqualSelector((state) => state.ticketFields);
  const fieldId = fieldIdParam === undefined ? undefined : Number(fieldIdParam);

  useEffect(() => {
    if (fieldId !== undefined && !Number.isInteger(+fieldId)) {
      history.replace('../ticket-fields');
      return;
    }
    if (location.state?.selectedRow) {
      dispatch(deskActions.getTicketFieldSuccess(location.state.selectedRow));
    } else {
      fieldId && dispatch(deskActions.getTicketFieldRequest({ id: +fieldId }));
    }
  }, [dispatch, fieldId, fieldIdParam, history, location.state]);

  return <CustomFieldsDetail name="ticket" editingFieldId={fieldId} customFields={customFields} {...props} />;
});
