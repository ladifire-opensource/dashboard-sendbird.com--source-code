import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';

import { deskActions } from '@actions';
import { useShallowEqualSelector } from '@hooks';
import { PropsOf } from '@utils';

import { CustomFieldsDetail } from '../CustomFieldsDetail';

const mapDispatchToProps = {
  createField: deskActions.createCustomerFieldRequest,
  updateField: deskActions.updateCustomerFieldRequest,
  deleteField: deskActions.deleteCustomerFieldRequest,
  checkFieldKeyValidation: deskActions.checkCustomerFieldKeyValidationRequest,
  setCheckingStatusFieldKeyValidation: deskActions.setCheckingStatusCustomerFieldKeyValidation,
};

type Props = Omit<PropsOf<typeof CustomFieldsDetail>, 'name' | 'customFields'>;

export const CustomerFieldDetail = connect(
  null,
  mapDispatchToProps,
)((props: Props) => {
  const { fieldId: fieldIdParam } = useParams<{ fieldId: string }>();
  const location = useLocation<{ selectedRow: CustomField } | undefined>();
  const dispatch = useDispatch();
  const history = useHistory();
  const customFields = useShallowEqualSelector((state) => state.customerFields);
  const fieldId = fieldIdParam === undefined ? undefined : Number(fieldIdParam);

  useEffect(() => {
    if (fieldId !== undefined && !Number.isInteger(+fieldId)) {
      history.replace('../customer-fields');
      return;
    }
    if (location.state?.selectedRow) {
      dispatch(deskActions.getCustomerFieldSuccess(location.state.selectedRow));
    } else {
      fieldId && dispatch(deskActions.getCustomerFieldRequest({ id: +fieldId }));
    }
  }, [dispatch, fieldId, fieldIdParam, history, location.state]);

  return <CustomFieldsDetail name="customer" editingFieldId={fieldId} customFields={customFields} {...props} />;
});
