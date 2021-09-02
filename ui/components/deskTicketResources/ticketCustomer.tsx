import { memo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { CLOUD_FRONT_URL } from '@constants';
import DeskCustomerAvatar from '@desk/components/DeskCustomerAvatar';
import { getRandomNumber } from '@utils';

const AvatarWrapper = styled(DeskCustomerAvatar)`
  flex: none;
  margin-right: 8px;
`;

const LinkedText = styled(Link)`
  max-width: 100%;
  font-weight: 500;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ${transitionDefault};

  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-7')};
    text-decoration: underline;
  }
`;

type Props = {
  ticket: Ticket;
};
export const TicketCustomer = memo<Props>(
  ({
    ticket: {
      channelName,
      customer: { displayName, photoThumbnailUrl, id: customerId },
    },
  }) => {
    const { data: application } = useSelector((state: RootState) => state.applicationState);
    const imageUrl =
      photoThumbnailUrl || `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(channelName, 3)}.svg`;

    return (
      <>
        <AvatarWrapper size="small" profileID={customerId} imageUrl={imageUrl} />
        <LinkedText to={`/${application?.app_id}/desk/customers/${customerId}`}>{displayName}</LinkedText>
      </>
    );
  },
);
