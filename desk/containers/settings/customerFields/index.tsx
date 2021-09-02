import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { Button } from 'feather';

import { deskActions } from '@actions';
import { AppSettingsContainer } from '@common/containers/layout/appSettingsLayout';
import { AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';

import { CustomFields } from '../CustomFields';

const AddFieldButton = styled(Button)`
  margin-left: auto;
`;

export const CustomerFields = () => {
  const intl = useIntl();
  const history = useHistory();

  const { customerFields } = useSelector((state: RootState) => ({ customerFields: state.customerFields }));
  const dispatch = useDispatch();

  const fetchFields = useCallback(
    ({ offset, limit }) => {
      dispatch(deskActions.fetchCustomerFieldsRequest({ offset, limit }));
    },
    [dispatch],
  );

  const deleteField = useCallback(
    (field: CustomField) => {
      dispatch(deskActions.deleteCustomerFieldRequest(field));
    },
    [dispatch],
  );

  const handleAddFieldClick = () => history.push('customer-fields/create');

  return (
    <AppSettingsContainer isTableView={true} css="padding-bottom: 32px;">
      <AppSettingPageHeader
        css={`
          * + ${AppSettingPageHeader.Description} {
            margin-top: 24px;
          }
        `}
      >
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.customerFields.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <AddFieldButton buttonType="primary" icon="plus" size="small" onClick={handleAddFieldClick}>
            {intl.formatMessage({ id: 'desk.customFields.customer.settings.header.button.add' })}
          </AddFieldButton>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description>
          {intl.formatMessage({ id: 'desk.customFields.customer.settings.header.description' })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <CustomFields fields={customerFields} fieldType="customer" fetchFields={fetchFields} deleteField={deleteField} />
    </AppSettingsContainer>
  );
};
