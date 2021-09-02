import { memo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
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

export const TicketFields = memo(() => {
  const intl = useIntl();
  const history = useHistory();

  const { ticketFields } = useSelector((state: RootState) => ({ ticketFields: state.ticketFields }));
  const dispatch = useDispatch();

  const fetchFields = useCallback(
    ({ offset, limit }) => {
      dispatch(deskActions.fetchTicketFieldsRequest({ offset, limit }));
    },
    [dispatch],
  );

  const deleteField = useCallback(
    (field: CustomField) => {
      dispatch(deskActions.deleteTicketFieldRequest(field));
    },
    [dispatch],
  );

  const handleAddFieldClick = () => {
    history.push('ticket-fields/create');
  };

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
          {intl.formatMessage({ id: 'desk.settings.ticketFields.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <AddFieldButton buttonType="primary" icon="plus" size="small" onClick={handleAddFieldClick}>
            {intl.formatMessage({ id: 'desk.customFields.ticket.settings.header.button.add' })}
          </AddFieldButton>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description $textOnly={true}>
          {intl.formatMessage({ id: 'desk.customFields.ticket.settings.header.description' })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <CustomFields fields={ticketFields} fieldType="ticket" fetchFields={fetchFields} deleteField={deleteField} />
    </AppSettingsContainer>
  );
});
