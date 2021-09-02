import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { animationFadeInOut, Link, Tag, Body, cssVariables, Headings } from 'feather';

import { EMPTY_TEXT } from '@constants';
import { LoadMoreTableColumn } from '@ui/components';

import { AnnouncementStatusLozenge } from './AnnouncementStatusLozenge';
import { TimestampCellContent } from './TimestampCellContent';
import { getAnnouncementProp } from './aliasMappers';
import { formatInteger, formatPercentage } from './formatters';
import { useAnnouncementVersion } from './useAnnouncementVersion';
import { useFieldNames } from './useFieldNames';
import { useStatusDefinitionList } from './useStatusDefinition';

const AnimationFadeInOut = styled.div<{ running: boolean }>`
  ${(props) =>
    props.running
      ? css<{ running: boolean }>`
          animation-name: ${animationFadeInOut};
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          animation-fill-mode: both;
        `
      : null};
`;

const UniqueIdLink = styled(Link)`
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Message = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatusDefinitionList = styled.dl`
  width: 280px;
  margin-left: 28px;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
`;

const DefinitionListItem = styled.div`
  margin-bottom: 4px;

  dt,
  dd {
    display: inline;
  }

  dt {
    position: relative;
    ${Headings['heading-01']};

    &::before {
      content: '•';
      ${Headings['heading-01']};
      position: absolute;
      top: 0;
      left: -24px;
    }
  }

  dd {
    margin-bottom: 4px;

    b {
      font-weight: 600;
    }
  }
`;

export const useTableColumns = (status): LoadMoreTableColumn<AnnouncementUnknownVersion>[] => {
  const intl = useIntl();
  const history = useHistory();
  const announcementVersion = useAnnouncementVersion();
  const fieldNames = useFieldNames();

  return [
    {
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.uniqueId' }),
      dataIndex: 'unique_id',
      render: (record) => {
        const uniqueId = getAnnouncementProp(record, 'unique_id', announcementVersion);
        return (
          <UniqueIdLink href={`${history.location.pathname}/${uniqueId}?status=${status}`} useReactRouter={true}>
            {uniqueId}
          </UniqueIdLink>
        );
      },
      styles: css`
        flex: 184px 1 1;
        max-width: 400px;
      `,
    },
    {
      dataIndex: 'scheduled_at',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.scheduledAt' }),
      render: ({ scheduled_at }) => <TimestampCellContent value={scheduled_at} />,
      styles: css`
        flex: 144px 0 1;
      `,
    },
    {
      key: 'message',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.message' }),
      render: (record) => <Message>{getAnnouncementProp(record, 'message', announcementVersion).content}</Message>,
      styles: 'flex: 256px 3 1;',
    },
    {
      title: announcementVersion === 'v1.0' ? 'Group' : fieldNames.announcementGroup,
      key: 'announcement_group',
      render: (record) => {
        const value = getAnnouncementProp(record, 'announcement_group', announcementVersion);
        return value ? <Tag>{value}</Tag> : EMPTY_TEXT;
      },
      styles: 'flex: 144px 2 1;',
    },
    {
      dataIndex: 'target_user_count',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.targetUserCount' }),
      render: ({ target_user_count }) =>
        target_user_count < 0
          ? intl.formatMessage({ id: 'chat.announcements.detail.info.targetCount.notApplicable' })
          : formatInteger(target_user_count),
      styles: css`
        flex: 88px 0 1;
      `,
    },
    {
      dataIndex: 'open_rate',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.openRate' }),
      render: ({ open_rate }) => formatPercentage(open_rate),
      styles: css`
        justify-content: flex-end;
        text-align: right;
        flex: 80px 0 1;
      `,
    },
    {
      key: 'completed_at',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.completedAt' }),
      render: (record) => (
        <TimestampCellContent value={getAnnouncementProp(record, 'completed_at', announcementVersion)} />
      ),
      styles: css`
        flex: 144px 0 1;
      `,
    },
    {
      dataIndex: 'enable_push',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.enablePush' }),
      titleTooltip: { content: intl.formatMessage({ id: 'chat.announcements.list.table.column.enablePush.tooltip' }) },
      render: ({ enable_push }) =>
        intl.formatMessage({
          id: enable_push ? 'chat.announcements.item.enablePush.on' : 'chat.announcements.item.enablePush.off',
        }),
      styles: css`
        flex: 136px 0 1;
      `,
    },
    {
      dataIndex: 'status',
      title: intl.formatMessage({ id: 'chat.announcements.list.table.column.status' }),
      titleTooltip: {
        placement: 'bottom-end',
        content: (
          <StatusDefinitionList>
            {useStatusDefinitionList().map(([label, description]) => (
              <DefinitionListItem key={label}>
                <dt>{label}: </dt>
                <dd>
                  {description}
                  <br />
                </dd>
              </DefinitionListItem>
            ))}
          </StatusDefinitionList>
        ),
        tooltipWidth: 360,
      },
      styles: css`
        width: 98px;
        flex: none;
      `,
      render: ({ status }) => (
        <AnimationFadeInOut running={status === 'running'}>
          <AnnouncementStatusLozenge status={status} tooltipPlacement="bottom-end" />
        </AnimationFadeInOut>
      ),
    },
  ];
};
