import { FC, MouseEventHandler, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Icon, cssVariables, toast, Spinner } from 'feather';

import { addTag } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

type Props = {
  tag: TicketTag;
  isAdded: boolean;
  ticketId?: Ticket['id'];
  onTagAdded: (tag: TicketTag) => void;
};

const Container = styled.div<{ isDisabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;

  span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      pointer-events: none;
      color: ${cssVariables('neutral-5')};
    `}
`;

const StatusIconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: -28px;
  width: 20px;
  height: 20px;
`;

export const TicketTagDropdownItem: FC<Props> = ({ tag, isAdded, ticketId, onTagAdded }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const [addRequestStatus, setAddRequestStatus] = useState<'idle' | 'pending' | 'done'>('idle');
  const isDisabled = isAdded || ticketId == null || addRequestStatus !== 'idle';

  const handleClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    // avoid triggering onItemSelected component of Dropdown (which will rerender this component)
    event.stopPropagation();
    if (ticketId == null || isDisabled) {
      return;
    }

    setAddRequestStatus('pending');
    try {
      await addTag(pid, region, { ticketId, tagId: tag.id });
      setAddRequestStatus('done');
      onTagAdded(tag);
    } catch (error) {
      if (error?.data?.code === 'desk400119') {
        // The tag user tried to add to the ticket was already added (maybe by others).
        // In this case, don't show an error.
        setAddRequestStatus('done');
        onTagAdded(tag);
        return;
      }

      const errorMessage =
        error?.data?.code === 'desk400121'
          ? intl.formatMessage({ id: 'desk.tickets.ticketTagDropdown.error.maxTagsPerTicket' })
          : getErrorMessage(error);

      toast.error({ message: errorMessage });
      setAddRequestStatus('idle');
    }
  };

  return (
    <Container isDisabled={isDisabled} data-test-id="TicketTagDropdownItemContainer" onClick={handleClick}>
      <Icon
        icon="tag"
        size={20}
        color={isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-10')}
        css={`
          flex: none;
          margin-right: 8px;
        `}
      />
      <span data-test-id="TicketTagDropdownItemName">{tag.name}</span>
      <StatusIconWrapper>
        {isAdded ? (
          <Icon icon="done" size={20} color={cssVariables('neutral-5')} />
        ) : (
          addRequestStatus === 'pending' && <Spinner stroke={cssVariables('neutral-5')} size={20} />
        )}
      </StatusIconWrapper>
    </Container>
  );
};
