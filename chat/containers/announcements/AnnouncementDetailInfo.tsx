import { FC, useCallback, ComponentType } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Subtitles, Body, Tag, Link, LinkVariant, LinkProps } from 'feather';

import { EMPTY_TEXT } from '@constants';
import { useAppId } from '@hooks';

import { AnnouncementStatusLozenge } from './AnnouncementStatusLozenge';
import { useAnnouncementTimezone } from './AnnouncementTimezoneContextProvider';
import { EllipsizedText } from './EllipsizedText';
import { getAnnouncementProp } from './aliasMappers';
import { targetAtDescriptionsWithIntlKeys } from './constants';
import { formatInteger, formatCeaseAtResumeAt, formatTimestampWithTimezone } from './formatters';
import { useAnnouncementOpenStatus } from './useAnnouncementOpenStatus';
import { useAnnouncementVersion } from './useAnnouncementVersion';
import { useFieldNames } from './useFieldNames';
import { useStatusDefinition } from './useStatusDefinition';

const Container = styled.div`
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const DList = styled.dl`
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-gap: 16px 40px;
  padding: 24px;

  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }

  dt {
    ${Subtitles['subtitle-01']};
    color: ${cssVariables('neutral-10')};
  }

  dd {
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-7')};

    &:empty::after {
      content: '${EMPTY_TEXT}';
    }
  }

  & & {
    // nested DList
    grid-gap: 8px 24px;
    margin-top: 16px;
    border-top: 1px solid ${cssVariables('neutral-3')};
    padding: 0;
    padding-top: 16px;

    dt {
      font-weight: 400;
    }
  }
`;

// BRDM will be deprecated and ADMM is more prefered value.
const messageTypeLabelMap: Record<AnnouncementMessage['type'], string> = {
  ADMM: 'chat.announcements.detail.info.type.admm',
  BRDM: 'chat.announcements.detail.info.type.admm',
  MESG: 'chat.announcements.detail.info.type.mesg',
};

// The values are different based on API version, but we use the shared terms for v1.6 for the user interface.
const targetChannelTypeLabelMap = {
  // v1.6: non_distinct, distinct
  non_distinct: 'chat.announcements.targetChannelType.nonDistinct',
  distinct: 'chat.announcements.targetChannelType.distinct',

  // v1.5: group_chat, group_dm
  group_chat: 'chat.announcements.targetChannelType.nonDistinct',
  group_dm: 'chat.announcements.targetChannelType.distinct',

  // v1.0: new_only, existing_only
  new_only: 'chat.announcements.targetChannelType.nonDistinct',
  existing_only: 'chat.announcements.targetChannelType.distinct',

  all: 'chat.announcements.targetChannelType.all',
};

const renderTag = (content?: string | null) => content && <Tag>{content}</Tag>;

const LoadingLink = styled<ComponentType<LinkProps & { isLoading: boolean }>>(Link)`
  ${({ isLoading }) =>
    isLoading &&
    css`
      &::after {
        display: block;
        content: '';
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% {
          content: '';
        }
        25% {
          content: '.';
        }
        50% {
          content: '..';
        }

        75% {
          content: '...';
        }
      }
    `}
`;

export const AnnouncementDetailInfo: FC<{ announcement: AnnouncementUnknownVersion }> = ({ announcement }) => {
  const intl = useIntl();
  const appId = useAppId();
  const timezone = useAnnouncementTimezone();
  const announcementVersion = useAnnouncementVersion();
  const fieldNames = useFieldNames();
  const statusDefinition = useStatusDefinition(true);

  const renderTargetAt = useCallback(
    (value: string) => {
      const { labelIntlKey } = targetAtDescriptionsWithIntlKeys.find((item) => item.key === value) ?? {};
      return labelIntlKey ? intl.formatMessage({ id: labelIntlKey }) : value;
    },
    [intl],
  );

  const formatTimestamp = useCallback(
    (value: number) => (value ? formatTimestampWithTimezone(value, timezone) : EMPTY_TEXT),
    [timezone],
  );

  const [uniqueId, message, ceaseAt, resumeAt, endAt, targetAt] = ([
    'unique_id',
    'message',
    'cease_at',
    'resume_at',
    'end_at',
    'target_at',
  ] as const).map((key) => getAnnouncementProp(announcement, key, announcementVersion));
  const createChannelOptions: RenamedAnnouncementProps['create_channel_options'] = getAnnouncementProp(
    announcement,
    'create_channel_options',
    announcementVersion,
  );

  const {
    isAvailable: isOpenStatusAvailable,
    isPreparingCSV: isPreparingOpenStatusCSV,
    download: downloadOpenStatus,
  } = useAnnouncementOpenStatus(appId, uniqueId);

  const isTargetingUsers = targetAt.startsWith('target_users');

  return (
    <Container>
      <DList>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.id' })}</dt>
        <dd>{uniqueId}</dd>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.status' })}</dt>
        <dd
          css={`
            * {
              display: inline;
              vertical-align: baseline;
            }

            b {
              font-weight: 500;
            }

            span {
              margin-left: 8px;
            }
          `}
        >
          {/* disable tooltip here because the status definition is next to the lozenge. */}
          <AnnouncementStatusLozenge status={announcement.status} disableTooltip={true} />{' '}
          <span>{statusDefinition[announcement.status]}</span>
        </dd>
      </DList>
      <DList>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.type.label' })}</dt>
        <dd>{intl.formatMessage({ id: messageTypeLabelMap[message.type] })}</dd>

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.senderId.label' })}</dt>
        <dd>{message.user_id}</dd>

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.message.label' })}</dt>
        <dd>
          <EllipsizedText
            content={message.content}
            showMoreDialogTitle={intl.formatMessage({ id: 'chat.announcements.detail.info.message.label' })}
          />
        </dd>

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.messageData.label' })}</dt>
        <dd>
          {message.data && (
            <EllipsizedText
              content={message.data}
              showMoreDialogTitle={intl.formatMessage({ id: 'chat.announcements.detail.info.messageData.label' })}
            />
          )}
        </dd>

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.messageCustomType.label' })}</dt>
        <dd>{renderTag(message.custom_type)}</dd>

        <dt>{fieldNames.announcementGroup}</dt>
        <dd>{renderTag(getAnnouncementProp(announcement, 'announcement_group', announcementVersion))}</dd>
      </DList>

      <DList>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.targetAt.label' })}</dt>
        <dd>{renderTargetAt(targetAt)}</dd>

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.targetUserCount.label' })}</dt>
        <dd>
          {announcement.target_user_count < 0
            ? intl.formatMessage({ id: 'chat.announcements.detail.info.targetCount.notApplicable' })
            : formatInteger(announcement.target_user_count)}
          {isOpenStatusAvailable && (
            <LoadingLink
              role="button"
              disabled={isPreparingOpenStatusCSV}
              isLoading={isPreparingOpenStatusCSV}
              onClick={downloadOpenStatus}
              variant={LinkVariant.Inline}
              css={`
                margin-left: 8px;
              `}
            >
              {intl.formatMessage({
                id: 'chat.announcements.detail.info.targetUserCount.btn.downloadAnnouncementOpenStatus',
              })}
            </LoadingLink>
          )}
        </dd>

        {isTargetingUsers && (
          <>
            <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.targetChannelType.label' })}</dt>
            <dd>
              {intl.formatMessage({
                id:
                  targetChannelTypeLabelMap[
                    getAnnouncementProp(announcement, 'target_channel_type', announcementVersion)
                  ],
              })}
            </dd>
          </>
        )}

        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.targetChannelCount.label' })}</dt>
        <dd>
          {announcement.target_channel_count < 0
            ? intl.formatMessage({ id: 'chat.announcements.detail.info.targetCount.notApplicable' })
            : formatInteger(announcement.target_channel_count)}
        </dd>

        {isTargetingUsers && (
          <>
            <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.createChannel' })}</dt>
            <dd>
              {announcement.create_channel ? (
                <>
                  {intl.formatMessage({ id: 'chat.announcements.detail.info.createChannel.true' })}
                  <DList>
                    <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.createChannelOptions.type' })}</dt>
                    <dd>
                      {createChannelOptions.distinct
                        ? intl.formatMessage({ id: 'chat.announcements.targetChannelType.distinct' })
                        : intl.formatMessage({ id: 'chat.announcements.targetChannelType.nonDistinct' })}
                    </dd>
                    <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.createChannelOptions.name' })}</dt>
                    <dd>{createChannelOptions.name}</dd>
                    <dt>
                      {intl.formatMessage({
                        id: 'chat.announcements.detail.info.createChannelOptions.coverImageUrl',
                      })}
                    </dt>
                    <dd>{createChannelOptions.cover_url}</dd>
                    <dt>
                      {intl.formatMessage({ id: 'chat.announcements.detail.info.createChannelOptions.customType' })}
                    </dt>
                    <dd>{renderTag(createChannelOptions.custom_type)}</dd>
                    <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.createChannelOptions.data' })}</dt>
                    <dd>
                      {createChannelOptions.data && (
                        <EllipsizedText
                          content={createChannelOptions.data}
                          showMoreDialogTitle={intl.formatMessage({
                            id: 'chat.announcements.detail.info.createChannelOptions.data',
                          })}
                        />
                      )}
                    </dd>
                  </DList>
                </>
              ) : (
                intl.formatMessage({ id: 'chat.announcements.detail.info.createChannel.false' })
              )}
            </dd>
          </>
        )}
      </DList>

      <DList>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.scheduledAt.label' })}</dt>
        <dd>{formatTimestamp(announcement.scheduled_at)}</dd>

        {ceaseAt && resumeAt && (
          <>
            <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.ceaseAtResumeAt.label' })}</dt>
            <dd>
              {formatCeaseAtResumeAt(ceaseAt, timezone)}–{formatCeaseAtResumeAt(resumeAt, timezone)}
            </dd>
          </>
        )}

        {endAt && (
          <>
            <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.endAt.label' })}</dt>
            <dd>{formatTimestamp(endAt)}</dd>
          </>
        )}

        <dt>{fieldNames.completedAt}</dt>
        <dd>{formatTimestamp(getAnnouncementProp(announcement, 'completed_at', announcementVersion))}</dd>
      </DList>

      <DList>
        <dt>{intl.formatMessage({ id: 'chat.announcements.detail.info.enablePush.label' })}</dt>
        <dd>
          {intl.formatMessage({
            id: announcement.enable_push
              ? 'chat.announcements.item.enablePush.on'
              : 'chat.announcements.item.enablePush.off',
          })}
        </dd>
      </DList>
    </Container>
  );
};
