import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Dropdown, Headings } from 'feather';

const OperatorFilterLabel = styled.label`
  ${Headings['heading-01']};
  margin-right: 11px;
`;

const operatorFilterItems: OperatorFilter[] = ['all', 'operator', 'nonoperator'];

const getIntl = (intl, key) => {
  if (operatorFilterItems.includes(key)) {
    return intl.formatMessage({ id: `chat.channelDetail.header.operatorFilter.item.${key}` });
  }
  return key;
};

type Props = {
  operatorFilter: OperatorFilter;
  onItemSelected: (item: OperatorFilter) => void;
};

export const OperatorFilter: FC<Props> = ({ operatorFilter, onItemSelected }) => {
  const intl = useIntl();
  const { sessionStorage } = window;
  const initial = sessionStorage.getItem('operatorFilter');
  const handleItemSelected = (item: OperatorFilter) => {
    sessionStorage.setItem('operatorFilter', item);
    onItemSelected(item);
  };
  return (
    <>
      <OperatorFilterLabel>
        {intl.formatMessage({ id: 'chat.channelDetail.header.btn.operatorFilter' })}
      </OperatorFilterLabel>
      <Dropdown<OperatorFilter>
        itemToString={(item) => getIntl(intl, item)}
        initialSelectedItem={(initial as OperatorFilter) || operatorFilter}
        items={operatorFilterItems}
        size="small"
        onItemSelected={handleItemSelected}
      />
    </>
  );
};
