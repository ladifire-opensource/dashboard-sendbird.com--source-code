import { forwardRef, useMemo, useState, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { cssVariables } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { DeskMessageRenderMode } from '@constants';
import { ConversationActions } from '@desk/actions';
import { getTwitterStatus } from '@desk/api';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import SocialMediaPostBubble from '@desk/components/chatBubble/SocialMediaPostBubble';
import SocialMediaPostBubbleMessage from '@desk/components/chatBubble/SocialMediaPostBubbleMessage';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import { parseTextAndFilesFromTwitterStatus, getTwitterStatusURL } from '@desk/utils/twitterUtils';
import { useShowDialog } from '@hooks';
import { convertURLsAndEmailsToLinks } from '@utils';

import { SystemMessage } from './systemMessage';
import { useTwitterMessageSenderInfo } from './useTwitterMessageSenderInfo';

type Props = {
  ticketInfo: Pick<TwitterTicket, 'customer' | 'twitterUser' | 'lastSeenAt'>;
  message: MergedTwitterStatus;
  messageRenderMode?: DeskMessageRenderMode;
  onReplyActionClick: () => void;
  options: { hideSender: boolean; hideProfile: boolean };
  origin: DeskOrigin;
  showAsSocialMediaPost?: boolean;
};

type QuotedStatusState = {
  twitterStatus: TwitterAPITwitterStatus | null;
  isExpanded: boolean;
  isFetching: boolean;
};

const EmbeddedSocialMediaPostBubbleMessage = styled(SocialMediaPostBubbleMessage)`
  margin-top: 8px;
`;

export const TwitterStatus = forwardRef<HTMLDivElement, Props>(
  (
    {
      ticketInfo,
      message,
      messageRenderMode = 'default',
      onReplyActionClick,
      options,
      origin,
      showAsSocialMediaPost = false,
    },
    ref,
  ) => {
    const {
      agent,
      entities,
      extendedEntities,
      favoriteCount,
      favorited = false,
      id,
      isTemp,
      messageType,
      retweetCount,
      retweeted = false,
      senderId,
      status,
      statusId,
      text,
      timestamp,
      twitterStatusTwitterUserId,
      quotedStatusId,
      quotedStatusPermalink,
    } = message;
    const intl = useIntl();
    const dispatch = useDispatch();
    const { customerTwitterUser, pid, region } = useSelector((state: RootState) => ({
      customerTwitterUser: state.twitter.twitterUser,
      pid: state.desk.project.pid,
      region: state.applicationState.data?.region ?? '',
    }));
    const showDialog = useShowDialog();

    const { customer, twitterUser, lastSeenAt: ticketLastSeenAt } = ticketInfo;

    const [quotedStatus, setQuotedStatus] = useState<QuotedStatusState>({
      twitterStatus: null,
      isExpanded: false,
      isFetching: false,
    });
    const isOwn = senderId === twitterUser.userId;
    const senderAgentName = agent ? agent.displayName : undefined;

    const { senderName, twitterScreenName, avatar } = useTwitterMessageSenderInfo({
      agent,
      customer,
      customerTwitterUser,
      isOwn,
      twitterUser,
    });

    const isDeleted = status === 'remove';
    const statusText = useMemo(() => {
      if (isDeleted) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.status.deleted' });
      }
      if (!isTemp && isOwn && senderAgentName) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.status.sentBy' }, { senderName: senderAgentName });
      }
      return undefined;
    }, [intl, isDeleted, isOwn, isTemp, senderAgentName]);
    const twitterStatusURL = customerTwitterUser
      ? getTwitterStatusURL({ screenName: customerTwitterUser.screen_name, statusId })
      : undefined;
    const deliveryStatus = useMemo(() => {
      const isDeliveryStatusVisible = isOwn && messageRenderMode !== 'compact' && origin === 'conversation';
      if (!isDeliveryStatusVisible) {
        return undefined;
      }
      if (message.isTemp) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.sending' }) as 'sending';
      }
      if (ticketLastSeenAt >= timestamp) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.read' }) as 'read';
      }
      return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.sent' }) as 'sent';
    }, [intl, isOwn, message.isTemp, messageRenderMode, origin, ticketLastSeenAt, timestamp]);

    const { displayedText, files } = useMemo(
      () =>
        parseTextAndFilesFromTwitterStatus({
          text,
          entities,
          extendedEntities,
          showImagePreviewRequest: (payload) => dispatch(commonActions.showImagePreviewRequest(payload)),
          quotedStatusPermalink,
        }),
      [text, entities, extendedEntities, quotedStatusPermalink, dispatch],
    );

    const actions = useMemo(() => {
      const isActionsVisible = messageRenderMode !== 'compact' && origin === 'conversation' && !isDeleted;
      if (!isActionsVisible) {
        return undefined;
      }

      const onDeleteActionClick = () => {
        showDialog({
          dialogTypes: DialogType.Delete,
          dialogProps: {
            title: intl.formatMessage({ id: 'desk.conversation.twitter.dialog.delete.title' }),
            description: intl.formatMessage(
              { id: 'desk.conversation.twitter.dialog.delete.description' },
              { break: <br /> },
            ),
            confirmText: intl.formatMessage({ id: 'desk.conversation.twitter.dialog.delete.button.delete' }),
            cancelText: intl.formatMessage({ id: 'desk.conversation.twitter.dialog.delete.button.cancel' }),
            onDelete: () => dispatch(ConversationActions.patchTwitterStatusRequest({ id, status: 'remove' })),
          },
        });
      };
      const onRetweetActionClick = () => {
        if (twitterStatusTwitterUserId) {
          dispatch(
            ConversationActions.patchTwitterStatusTwitterUserRequest({
              id: twitterStatusTwitterUserId,
              twitterStatusId: id,
              update: { retweeted: !retweeted },
            }),
          );
        }
      };
      const onLikeActionClick = () => {
        if (twitterStatusTwitterUserId) {
          dispatch(
            ConversationActions.patchTwitterStatusTwitterUserRequest({
              id: twitterStatusTwitterUserId,
              twitterStatusId: id,
              update: { favorited: !favorited },
            }),
          );
        }
      };
      const actions = [
        {
          label: retweeted
            ? intl.formatMessage({ id: 'desk.conversation.twitter.action.undoRetweet' })
            : intl.formatMessage({ id: 'desk.conversation.twitter.action.retweet' }),
          onClick: onRetweetActionClick,
        },
        {
          label: favorited
            ? intl.formatMessage({ id: 'desk.conversation.twitter.action.undoLike' })
            : intl.formatMessage({ id: 'desk.conversation.twitter.action.like' }),
          onClick: onLikeActionClick,
        },
        { label: intl.formatMessage({ id: 'desk.conversation.twitter.action.reply' }), onClick: onReplyActionClick },
        ...(isOwn
          ? [
              {
                label: intl.formatMessage({ id: 'desk.conversation.twitter.action.delete' }),
                onClick: onDeleteActionClick,
              },
            ]
          : []),
      ];
      return actions;
    }, [
      messageRenderMode,
      origin,
      isDeleted,
      retweeted,
      intl,
      favorited,
      onReplyActionClick,
      isOwn,
      showDialog,
      dispatch,
      id,
      twitterStatusTwitterUserId,
    ]);

    const reactions = useMemo(
      () =>
        [
          {
            icon: 'retweet' as const,
            count: retweetCount,
            participated: retweeted,
          },
          {
            icon: 'like' as const,
            activeColor: cssVariables('red-5'),
            count: favoriteCount,
            participated: favorited,
          },
        ].filter((item) => item.count > 0),
      [retweetCount, retweeted, favoriteCount, favorited],
    );

    const embeddedSocialMediaPost = useMemo(() => {
      if (!quotedStatusId) {
        return undefined;
      }
      const { isExpanded, isFetching, twitterStatus } = quotedStatus;
      const onCollapseButtonClick = showAsSocialMediaPost
        ? undefined
        : () => {
            setQuotedStatus((value) => ({ ...value, isExpanded: false }));
          };

      const onExpandButtonClick = async () => {
        if (quotedStatus.twitterStatus) {
          setQuotedStatus((value) => ({ ...value, isExpanded: true }));
          return;
        }
        setQuotedStatus((value) => ({ ...value, isFetching: true }));
        const { data } = await getTwitterStatus(pid, region, {
          id: twitterUser.id,
          statusId: quotedStatusId,
        });
        setQuotedStatus((value) => ({ ...value, isFetching: false, isExpanded: true, twitterStatus: data }));
      };

      const commonProps: Pick<
        ComponentProps<typeof SocialMediaPostBubbleMessage>,
        | 'collapsedBubbleBackgroundColor'
        | 'collapsedMessage'
        | 'isExpanded'
        | 'isFetching'
        | 'linkURL'
        | 'onCollapseButtonClick'
        | 'onExpandButtonClick'
        | 'layoutDirection'
      > = {
        collapsedBubbleBackgroundColor: 'white' as const,
        collapsedMessage: intl.formatMessage({ id: 'desk.conversation.twitter.message.retweetedMessage' }),
        isExpanded,
        isFetching,
        linkURL: quotedStatusPermalink || undefined,
        onCollapseButtonClick,
        onExpandButtonClick,
        layoutDirection: 'horizontal' as const,
      };

      if (twitterStatus) {
        const {
          created_at,
          entities,
          extended_entities: extendedEntities,
          full_text: text,
          user: { screen_name, profile_image_url_https },
          quoted_status_permalink,
        } = twitterStatus;
        const { displayedText, files } = parseTextAndFilesFromTwitterStatus({
          text,
          entities,
          extendedEntities,
          showImagePreviewRequest: (payload) => dispatch(commonActions.showImagePreviewRequest(payload)),
          quotedStatusPermalink: quoted_status_permalink ? quoted_status_permalink.expanded : null,
        });
        return (
          <EmbeddedSocialMediaPostBubbleMessage
            {...commonProps}
            avatar={profile_image_url_https}
            authorName={screen_name}
            date={moment(created_at)}
            media={files}
            text={displayedText}
          />
        );
      }
      return <EmbeddedSocialMediaPostBubbleMessage {...commonProps} />;
    }, [
      dispatch,
      intl,
      pid,
      quotedStatus,
      quotedStatusId,
      quotedStatusPermalink,
      region,
      showAsSocialMediaPost,
      twitterUser.id,
    ]);

    const date = moment(timestamp);

    if (!text) {
      return null;
    }
    if (messageType === 'system') {
      return <SystemMessage date={timestamp}>{convertURLsAndEmailsToLinks(message.text)}</SystemMessage>;
    }
    return (
      <ChatBubbleMaxWidthGetterContext.Consumer>
        {(getChatBubbleMaxWidth) => {
          const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
          const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;

          if (showAsSocialMediaPost) {
            return (
              <SocialMediaPostBubble
                ref={ref}
                isOwn={isOwn}
                avatar={avatar || undefined}
                authorName={senderName || undefined}
                media={files}
                date={date}
                text={displayedText}
                linkURL={twitterStatusURL}
                maxWidth={chatBubbleMaxWidth}
                embeddedSocialMediaPost={embeddedSocialMediaPost}
              />
            );
          }

          return (
            <ChatBubble
              ref={ref}
              messageId={id}
              isOwn={isOwn}
              senderName={senderName || undefined}
              twitterScreenName={twitterScreenName || undefined}
              avatar={avatar}
              isSenderHidden={options.hideSender}
              isAvatarHidden={options.hideProfile}
              isStatusHidden={options.hideProfile && reactions.length === 0}
              message={displayedText}
              date={date}
              isDeleted={isDeleted}
              status={statusText}
              files={files}
              deliveryStatus={deliveryStatus}
              mediaMaxSize={mediaMaxSize}
              socialMediaLink={twitterStatusURL ? { type: 'twitter' as const, url: twitterStatusURL } : undefined}
              actions={actions}
              reactions={reactions}
              embeddedSocialMediaPost={embeddedSocialMediaPost}
            />
          );
        }}
      </ChatBubbleMaxWidthGetterContext.Consumer>
    );
  },
);
