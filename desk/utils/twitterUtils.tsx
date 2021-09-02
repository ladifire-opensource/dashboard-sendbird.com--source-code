import React from 'react';

import runes from 'runes';

import { commonActions } from '@actions';
import { ImageFile, VideoFile } from '@desk/components/chatBubble/fileInterfaces';
import { convertURLsAndEmailsToLinks, convertNodeArrayToReactFragment, safeParseJSON } from '@utils';

export const getTwitterStatusURL = ({ screenName = 'user', statusId }: { screenName?: string; statusId: string }) =>
  /**
   * If you put any string such as `user` in the place of screenName, it will be redirected to the correct URL by
   * Twitter as long as a correct statusId is given.
   */
  `https://twitter.com/${screenName}/status/${statusId}`;

export const parseTextAndFilesFromTwitterStatus = (parameters: {
  text: string;
  entities: TwitterEntities | null;
  extendedEntities?: EntityParsedTwitterStatus['extendedEntities'];
  showImagePreviewRequest?: typeof commonActions.showImagePreviewRequest;
  quotedStatusPermalink: string | null;
}) => {
  const { text, entities, extendedEntities, showImagePreviewRequest, quotedStatusPermalink } = parameters;
  const mergedEntities = Object.entries(entities || {})
    .reduce<
      {
        entityType: 'hashtags' | 'urls' | 'user_mentions' | 'media' | 'symbols';
        indices: readonly [number, number];
        [key: string]: any;
      }[]
    >((acc, [entityType, entityList]) => {
      if (entityType !== 'media') {
        // media entities are included in extendedEntities.
        acc.push(...(entityList as any[]).map((entity) => ({ entityType, ...entity })));
      }
      return acc;
    }, [])
    .concat(((extendedEntities && extendedEntities.media) || []).map((entity) => ({ entityType: 'media', ...entity })));

  // Sort entities based on indices in a descending order to replace substrings from the end
  mergedEntities.sort((a, b) => b.indices[0] - a.indices[0]);

  const onAttachmentPhotoClick = async (mediaURL: string) => {
    showImagePreviewRequest && showImagePreviewRequest([{ name: '', url: mediaURL }]);
  };

  let prefixText = text;
  const textNodes: React.ReactNode[] = [];
  const files: (ImageFile | VideoFile)[] = [];

  mergedEntities.forEach((entity) => {
    const { entityType, indices } = entity;
    const [startIndex, endIndex] = indices;
    const [predecessor, target, successor] = [
      runes(prefixText).slice(0, startIndex).join(''),
      runes(prefixText).slice(startIndex, endIndex).join(''),
      runes(prefixText).slice(endIndex).join(''),
    ];

    prefixText = predecessor;
    switch (entityType) {
      case 'hashtags':
      case 'symbols': {
        try {
          textNodes.unshift(
            <a
              key={`${entityType}_${text}`}
              href={`https://twitter.com/search?q=${encodeURIComponent(target)}`}
              target="_blank"
            >
              {target}
            </a>,
            successor,
          );
        } catch (err) {
          // skip
        }

        break;
      }
      case 'urls': {
        const { url, expanded_url, display_url } = (entity as unknown) as TwitterURLEntity;
        if (expanded_url === quotedStatusPermalink) {
          // Quoted status will be displayed as SocialMediaPostBubble. So just remove the URL from the text.
          break;
        }
        textNodes.unshift(
          <a key={`${entityType}_${display_url}_${url}`} href={expanded_url} target="_blank">
            {display_url}
          </a>,
          successor,
        );
        break;
      }
      case 'user_mentions': {
        const { id_str, screen_name } = (entity as unknown) as TwitterUserMentionEntity;
        textNodes.unshift(
          <a key={`${entityType}_${id_str}`} href={`https://twitter.com/${screen_name}`} target="_blank">
            {target}
          </a>,
          successor,
        );
        break;
      }
      case 'media': {
        const { type } = (entity as unknown) as TwitterMediaObject;
        switch (type) {
          case 'photo': {
            const {
              media_url_https,
              sizes: {
                medium: { w: width, h: height },
              },
            } = (entity as unknown) as TwitterMediaObject;

            files.push({
              type: 'image' as const,
              url: media_url_https,
              dimension: { width, height },
              onClick: () => onAttachmentPhotoClick(media_url_https),
            });
            break;
          }
          case 'animated_gif':
          case 'video': {
            const {
              video_info: { aspect_ratio, variants },
            } = (entity as unknown) as TwitterMediaVideoObject;
            const [x, y] = aspect_ratio;

            // The browser will use the first source it understands. We want the variant with the highest bitrate to be used if possible.
            const sortedByBitrateDescVariants = [...variants]
              .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
              .map(({ content_type: contentType, ...variant }) => ({ ...variant, contentType }));

            files.push({
              type: type === 'animated_gif' ? ('twitter-gif' as const) : ('video' as const),
              aspectRatio: { x, y },
              sources: sortedByBitrateDescVariants,
            });
            break;
          }
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  });

  const displayedText =
    prefixText || textNodes.length > 0 ? (
      <>
        {convertURLsAndEmailsToLinks(prefixText)}
        {convertNodeArrayToReactFragment(
          textNodes.map((node) => (typeof node === 'string' ? convertURLsAndEmailsToLinks(node) : node)),
        )}
      </>
    ) : null;

  return { displayedText, files };
};

export const parseTwitterStatusEntities = (twitterStatus: TwitterStatus): EntityParsedTwitterStatus => ({
  ...twitterStatus,
  entities: safeParseJSON(twitterStatus.entities),
  extendedEntities: safeParseJSON(twitterStatus.extendedEntities),
});

export const convertTwitterStatusTicketToMergedTwitterStatus = (
  twitterStatusTicket: TwitterStatusTicket,
): MergedTwitterStatus => {
  const { twitterStatus, agent, ticket, recipientId, id, twitterStatusTwitterUser } = twitterStatusTicket;
  const { id: twitterStatusTwitterUserId = null, retweeted = false, favorited = false, twitterUser = null } =
    twitterStatusTwitterUser || {};
  return {
    ...parseTwitterStatusEntities(twitterStatus),
    agent,
    favorited,
    recipientId,
    retweeted,
    retweetedFavoritedBy: twitterUser,
    ticket,
    twitterStatusTwitterUserId,
    twitterStatusTicketId: id,
  };
};

export const parseTwitterDirectMessageEventAttachments = (
  message: TwitterDirectMessageEvent,
): AttachmentParsedTwitterDirectMessageEvent => ({
  ...message,
  attachment: safeParseJSON(message.attachment),
});
