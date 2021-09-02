import React, { useState, useCallback, useContext, useLayoutEffect } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';
import isEqual from 'lodash/isEqual';

import { EMPTY_TEXT, SuperRoles, PredefinedRoles } from '@constants';
import { useAuthorization } from '@hooks/useAuthorization';
import { logException } from '@utils/logException';

import { CollapsibleSectionContext } from '../collapsibleSection';
import { EditingField } from '../customField';
import { CustomFieldInputForm } from '../customFieldInputForm';
import { CustomFieldValue } from '../customFieldValue';
import { SpinnerFull } from '../spinner';
import { TextButton } from '../textButton';

type TicketID = Ticket['id'];
type CustomerID = Customer['id'];

type AddTicketFieldData = TicketFieldsActionCreators['addTicketFieldDataRequest'];
type AddCustomerFieldData = CustomerFieldsActionCreators['addCustomerFieldDataRequest'];

type UpdateTicketFieldData = TicketFieldsActionCreators['updateTicketFieldDataRequest'];
type UpdateCustomerFieldData = CustomerFieldsActionCreators['updateCustomerFieldDataRequest'];

interface CustomFieldItemProps {
  field: CustomField;
  id: TicketID | CustomerID;
  data: CustomFieldData;
  hasAdminPermission: boolean;
  isEditing: boolean;
  addFieldData: AddTicketFieldData | AddCustomerFieldData;
  updateFieldData: UpdateTicketFieldData | UpdateCustomerFieldData;

  onAddButtonClick: () => void;
  onEditButtonClick: () => void;
  onCancelButtonClick: () => void;
}

interface CustomFieldListProps extends Pick<CustomFieldItemProps, 'id' | 'addFieldData' | 'updateFieldData'> {
  fields: TicketFieldsState | CustomerFieldsState;
  currentEditingField?: EditingField;
  settingLink?: string;

  onAddOrEditButtonClick: (id: number) => () => void;
  onCancelButtonClick: () => void;
  role: AuthorizedRole;
}

const CustomFieldListContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CustomFieldItemContainer = styled.li`
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CustomField = styled.div`
  display: inline-block;
  width: 100%;
  height: 100%;
`;

const CustomFieldLabel = styled.label`
  width: 100%;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 0;
  margin-right: 16px;
  word-break: break-word;
`;

const CustomFieldListFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FooterLeft = styled.div``;
const FooterRight = styled.div``;

const SettingButton = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 14px;

  > svg {
    margin-left: 4px;
  }
`;

const ShowMoreButton = styled(TextButton)`
  display: inline-flex;
  align-items: center;

  > svg {
    margin-left: 4px;
  }
`;

const CustomFieldItem = React.memo<CustomFieldItemProps>(
  ({
    field,
    data,
    hasAdminPermission,
    isEditing,
    onAddButtonClick,
    onEditButtonClick,
    onCancelButtonClick,
    ...customFieldInputFormProps
  }) => {
    const intl = useIntl();

    const checkIsDataEmpty = (customData) => {
      let isLinkEmpty = false;

      if (field.fieldType === 'LINK' && customData?.value) {
        try {
          const { text, url } = JSON.parse(customData.value);
          isLinkEmpty = text.trim() === '' && url.trim() === '';
        } catch (error) {
          logException({ error, context: { jsonInput: customData?.value } });
        }
      }
      return !customData || customData.value.trim() === '' || isLinkEmpty;
    };

    const renderCustomFieldData = () => {
      const isDataEmpty = checkIsDataEmpty(data);
      if (isEditing) {
        return (
          <CustomFieldInputForm
            customField={field}
            customFieldData={data}
            onCancel={onCancelButtonClick}
            {...customFieldInputFormProps}
          />
        );
      }
      if (isDataEmpty) {
        if (field.readOnly && !hasAdminPermission) return <div data-test-id="CustomFieldEmptyText">{EMPTY_TEXT}</div>;
        return (
          <TextButton onClick={onAddButtonClick}>
            {intl.formatMessage({ id: 'desk.customFields.list.button.add' })}
          </TextButton>
        );
      }
      return (
        <CustomFieldValue
          isEditable={field.readOnly ? hasAdminPermission : true}
          field={field}
          value={data.value}
          onEditButtonClick={onEditButtonClick}
        />
      );
    };

    return (
      <CustomFieldItemContainer>
        <CustomFieldLabel>{field.name}</CustomFieldLabel>
        <CustomField>{renderCustomFieldData()}</CustomField>
      </CustomFieldItemContainer>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);

export const CustomFieldList: React.FC<CustomFieldListProps> = ({
  fields,
  currentEditingField,
  onAddOrEditButtonClick,
  settingLink,
  role,
  ...customFieldItemProps
}) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const [isShowMore, setIsShowMore] = useState(false);
  const { resizeSection } = useContext(CollapsibleSectionContext);
  const slicedItems = fields.items.slice(0, 10);

  const handleToggleShowMore = useCallback(() => {
    setIsShowMore(!isShowMore);
  }, [isShowMore]);

  useLayoutEffect(() => {
    resizeSection({ scrollToTop: true });
  }, [isShowMore, resizeSection]);

  if (fields.isFetching || fields.isFetchingFieldData) return <SpinnerFull />;

  const hasAdminPermission =
    SuperRoles.includes(role.name) || role.name === PredefinedRoles.DESK_ADMIN || isPermitted(['desk.admin']);

  return (
    <CustomFieldListContainer>
      {(isShowMore ? fields.items : slicedItems).map((item) => {
        const fieldDataList = fields.customFieldDataList;
        // FIXME: union type Array find
        const itemData = (fieldDataList as any).find(({ ticketField, customerField }) => {
          return ticketField === item.id || customerField === item.id;
        });
        return (
          <CustomFieldItem
            key={item.key}
            field={item}
            data={itemData}
            hasAdminPermission={hasAdminPermission}
            isEditing={currentEditingField ? currentEditingField.id === item.id : false}
            onAddButtonClick={onAddOrEditButtonClick(item.id)}
            onEditButtonClick={onAddOrEditButtonClick(item.id)}
            {...customFieldItemProps}
          />
        );
      })}
      <CustomFieldListFooter>
        <FooterLeft>
          {fields.items.length > 10 && (
            <ShowMoreButton onClick={handleToggleShowMore} data-test-id="CustomFieldListShowMoreButton">
              {isShowMore
                ? intl.formatMessage({ id: 'desk.customFields.list.button.showLess' })
                : intl.formatMessage({ id: 'desk.customFields.list.button.showMore' })}
              <Icon icon={isShowMore ? 'chevron-up' : 'chevron-down'} size={16} color={cssVariables('purple-7')} />
            </ShowMoreButton>
          )}
        </FooterLeft>
        <FooterRight>
          {settingLink && (
            <SettingButton to={settingLink} data-test-id="CustomFieldListSettingsLink">
              {intl.formatMessage({ id: 'label.settings' })}
              <Icon icon="open-in-new" size={16} color={cssVariables('purple-7')} />
            </SettingButton>
          )}
        </FooterRight>
      </CustomFieldListFooter>
    </CustomFieldListContainer>
  );
};
