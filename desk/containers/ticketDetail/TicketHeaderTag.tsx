import { FC, useState } from 'react';

import { Tag, TagVariant, toast } from 'feather';

import { removeTag } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

type Props = { ticketId: Ticket['id']; tag: TicketTag; onRemoveComplete: (tag: TicketTag) => void };

type RequestStatus = 'idle' | 'pending' | 'done';

export const TicketHeaderTag: FC<Props> = ({ ticketId, tag, onRemoveComplete }) => {
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const [removeRequestStatus, setRemoveRequestStatus] = useState<RequestStatus>('idle');

  const removeTicketTag = async () => {
    if (removeRequestStatus === 'pending') {
      return;
    }

    setRemoveRequestStatus('pending');
    try {
      await removeTag(pid, region, { ticketId, tagId: tag.id });
      setRemoveRequestStatus('done');
      onRemoveComplete(tag);
    } catch (error) {
      if (error?.data?.code === 'desk400120') {
        // The tag user tried to delete does not exist on the ticket (maybe already deleted by others).
        // Don't show an error in this case.
        setRemoveRequestStatus('done');
        onRemoveComplete(tag);
        return;
      }
      toast.error({ message: getErrorMessage(error) });
      setRemoveRequestStatus('idle');
    }
  };

  if (removeRequestStatus === 'idle') {
    return (
      <Tag variant={TagVariant.Dark} onRemove={removeTicketTag} tooltipProps={{ placement: 'bottom' }}>
        {tag.name}
      </Tag>
    );
  }
  return null;
};
