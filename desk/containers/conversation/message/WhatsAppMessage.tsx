import { useCallback, ReactNode, useEffect, useMemo, forwardRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import { sanitize } from 'dompurify';
import { Icon, cssVariables, ContextualHelp } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { fetchWhatsAppMedia } from '@desk/api/conversation';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync } from '@hooks';
import { createGoogleMapLink, checkIsMediaTypeWAMessageContent, attachPlusSignToPhoneNumber } from '@utils/desk';
import { formatWhatsAppMessage } from '@utils/formatWhatsAppMessage';
import { convertURLsAndEmailsToLinks } from '@utils/messages';

import { WhatsAppRejectedCode } from '../constants';
import { SystemMessage } from './systemMessage';

type Props = {
  message: WhatsAppMessageType;
  ticketInfo: Pick<WhatsAppTicket, 'nexmoAccount'>;
};

const DeliveryStatusIconWrapper = styled.div<{ isOwn: boolean }>`
  display: flex;
  align-items: center;
  height: 16px;
  ${({ isOwn }) => (isOwn ? 'margin-left: 4px;' : 'margin-right: 4px;')}
`;

const FormattedMessageContent = styled.div`
  & > code {
    font-family: 'Roboto Mono', monospace;
  }

  & > strong {
    font-weight: 600;
  }
`;

export const WhatsAppMessage = forwardRef<HTMLDivElement, Props>(({ message, ticketInfo }, ref) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();

  const { messageType, timestamp, fromNumber, content, id, status, rejectLog } = message;
  const { nexmoAccount } = ticketInfo;
  const isOwn = fromNumber === nexmoAccount?.whatsappNumber;
  const { text, type, location, image, audio, video, file } = JSON.parse(content) as ParsedWhatsAppMessageContent;

  const [
    { status: fetchWhatsAppMediaStatus, data: fetchWhatsAppMediaResponse },
    fetchWhatsAppMediaCallback,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ] = useAsync(() => fetchWhatsAppMedia(pid, region, id), []);

  const handleImageClick = useCallback(
    (url: string, name: string = '') => () => {
      dispatch(commonActions.showImagePreviewRequest([{ url, name }]));
    },
    [dispatch],
  );

  const files = useMemo(() => {
    if (fetchWhatsAppMediaStatus === 'success' && fetchWhatsAppMediaResponse != null) {
      const { media_url } = fetchWhatsAppMediaResponse.data;
      switch (type) {
        case 'image':
          return image
            ? [{ type, url: media_url, name: image.caption, onClick: handleImageClick(media_url, image.caption) }]
            : undefined;
        case 'audio':
          return audio ? [{ type, url: media_url }] : undefined;
        case 'video':
          return video ? [{ type, url: media_url, name: video.caption }] : undefined;
        case 'file':
          return file
            ? [{ type: 'misc' as const, url: media_url, name: file.caption, onClick: () => window.open(media_url) }]
            : undefined;
        default:
          return undefined;
      }
    }
    return undefined;
  }, [fetchWhatsAppMediaStatus, fetchWhatsAppMediaResponse, type, image, handleImageClick, audio, video, file]);

  const messageContent = useMemo(() => {
    if (type === 'unsupported') {
      return intl.formatMessage({ id: 'desk.conversation.whatsapp.message.unsupported' });
    }
    if (type === 'location' && location != null) {
      return createGoogleMapLink(location.lat, location.long);
    }

    if (text) {
      const trimmed = text.trim();
      const formatted = formatWhatsAppMessage(trimmed);
      if (trimmed === formatted) {
        return trimmed;
      }
      return <FormattedMessageContent dangerouslySetInnerHTML={{ __html: sanitize(formatted) }} />;
    }
  }, [intl, location, text, type]);

  const renderStatus = useCallback(() => {
    const date = moment(timestamp);
    let icon: ReactNode = null;

    switch (status) {
      case 'SUBMITTED':
        icon = <Icon icon="done" size={16} color={cssVariables('neutral-6')} data-test-id="SubmittedIcon" />;
        break;
      case 'DELIVERED':
        icon = <Icon icon="done-all" size={16} color={cssVariables('neutral-6')} data-test-id="DeliveredIcon" />;
        break;
      case 'READ':
        icon = <Icon icon="done-all" size={16} color={cssVariables('green-5')} data-test-id="ReadIcon" />;
        break;
      case 'REJECTED': {
        icon = (
          <>
            <Icon icon="warning" size={16} color={cssVariables('red-5')} data-test-id="RejectedWarningIcon" />
            <span
              css={css`
                margin-left: 4px;
                color: ${cssVariables('red-5')};
              `}
            >
              {intl.formatMessage({ id: 'desk.conversation.whatsapp.message.lbl.failed' })}
            </span>
          </>
        );
        if (rejectLog) {
          // Error reason: Sent Outside Allowed Window
          const { code } = JSON.parse(rejectLog as string);
          if (code === WhatsAppRejectedCode.OutsideAllowedWindow) {
            icon = (
              <ContextualHelp
                content={intl.formatMessage({ id: 'desk.conversation.whatsapp.message.tooltip.notAllowed' })}
                tooltipContentStyle={css`
                  max-width: 256px;
                `}
                placement="top-end"
              >
                <Icon icon="time" size={16} color={cssVariables('red-5')} data-test-id="RejectedTimeIcon" />
              </ContextualHelp>
            );
          }
        }
        break;
      }
      default:
        break;
    }

    if (isOwn) {
      return (
        <>
          <DeliveryStatusIconWrapper isOwn={isOwn} data-test-id="DeliveryStatusIconWrapper">
            {icon}
          </DeliveryStatusIconWrapper>
          <span>{date && date.format('HH:mm')}</span>
          <span aria-hidden={true} style={{ width: 8, textAlign: 'center' }}>
            ∙
          </span>
          <span>{intl.formatMessage({ id: 'desk.conversation.whatsapp.message.lbl.sentOnWhatsapp' })}</span>
        </>
      );
    }
    return <span>{date && date.format('HH:mm')}</span>;
  }, [intl, isOwn, rejectLog, status, timestamp]);

  useEffect(() => {
    checkIsMediaTypeWAMessageContent(message) && fetchWhatsAppMediaCallback();
  }, [fetchWhatsAppMediaCallback, message]);

  if (messageType === 'system') {
    return <SystemMessage date={timestamp}>{convertURLsAndEmailsToLinks(text)}</SystemMessage>;
  }
  return (
    <ChatBubble
      ref={ref}
      messageId={id}
      isOwn={isOwn}
      isDimmed={type === 'unsupported'}
      message={messageContent}
      files={files}
      date={moment(timestamp)}
      senderName={attachPlusSignToPhoneNumber(fromNumber)}
      renderStatus={renderStatus}
    />
  );
});
