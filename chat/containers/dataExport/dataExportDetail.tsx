import React, { FC, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { SpinnerFull, Icon, cssVariables, Body, Typography, Button } from 'feather';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';

import { SettingsGridGroup, SettingsGridCard } from '@common/containers/layout';
import { TIME_DATE_FORMAT } from '@constants';
import { PageContainer, PageHeader } from '@ui/components';

import { DataExportStatusLozenge } from './DataExportStatusLozenge';
import { useAutoRefreshDataExportItems } from './useAutoRefreshDataExportItems';
import { useDataExport } from './useDataExport';

const DetailContainer = styled(PageContainer)`
  max-width: 1088px;
  padding-bottom: 64px;

  ${PageHeader} + * {
    margin-top: 24px;
  }
`;

const Type = styled.div`
  ${Body['body-short-01']}
`;

const StyledDetail = styled.div`
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 24px;
  margin-top: 24px;
  & + & {
    margin-top: 16px;
  }
`;

const DetailLabel = styled.label`
  ${Typography['label-02']}
  color: ${cssVariables('neutral-6')};
`;

const DetailContent = styled.ul`
  ${Body['body-short-01']}
  list-style: none;
  margin-top: 6px;
`;

const StyledDetailContentItem = styled.li`
  display: flex;
  align-items: center;
  & + & {
    margin-top: 2px;
  }
  span {
    margin-left: 2px;
  }
`;

const TextWrapper = styled.div`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-10')};
`;

const DetailItem = ({ icon, text }) => (
  <StyledDetailContentItem>
    {icon} <span>{text}</span>
  </StyledDetailContentItem>
);

type DetailProps = {
  intlKey: string;
  itemKey: string;
  data: string[];
};

const Detail: FC<DetailProps> = ({ intlKey, itemKey, data }) => {
  const intl = useIntl();
  return (
    <StyledDetail>
      <DetailLabel>
        {intl.formatMessage({ id: intlKey })}
        {` (${data.length})`}
      </DetailLabel>
      <DetailContent>
        {data.map((text) => (
          <DetailItem
            key={`detailItem_${itemKey}`}
            icon={itemKey.includes('channel') ? <Icon icon="link" size={12} /> : '@'}
            text={text}
          />
        ))}
      </DetailContent>
    </StyledDetail>
  );
};

const detailItems: { [key: string]: { intlKey: string; itemKey: string }[] } = {
  messages: [
    {
      intlKey: 'chat.dataExport.detail.type.channelURLs',
      itemKey: 'channel_urls',
    },
    {
      intlKey: 'chat.dataExport.detail.type.excludeChannelURLs',
      itemKey: 'exclude_channel_urls',
    },
    {
      intlKey: 'chat.dataExport.detail.type.senderIDs',
      itemKey: 'sender_ids',
    },
    {
      intlKey: 'chat.dataExport.detail.type.excludeSenderIDs',
      itemKey: 'exclude_sender_ids',
    },
  ],
  channels: [
    {
      intlKey: 'chat.dataExport.detail.type.channelURLs',
      itemKey: 'channel_urls',
    },
    {
      intlKey: 'chat.dataExport.detail.type.excludeChannelURLs',
      itemKey: 'exclude_channel_urls',
    },
  ],
  users: [
    {
      intlKey: 'chat.dataExport.detail.type.userIDs',
      itemKey: 'user_ids',
    },
  ],
};

const renderDetail = (dataExport: DataExport): React.ReactNode[] => {
  return detailItems[dataExport.data_type].map(
    ({ itemKey, intlKey }) =>
      (dataExport[itemKey]?.length ?? 0) > 0 && (
        <Detail key={`detail_${itemKey}`} intlKey={intlKey} itemKey={itemKey} data={dataExport[itemKey]} />
      ),
  );
};

export const DataExportDetail: FC = () => {
  const intl = useIntl();
  const { current, isFetchingCurrent } = useDataExport();

  useAutoRefreshDataExportItems(useMemo(() => (current ? [current] : []), [current]));

  const handleDownloadClick = useCallback(() => {
    if (current?.file) {
      window.open(current.file.url);
    }
  }, [current]);

  if (!current) {
    return null;
  }

  const { request_id, status, start_ts, end_ts, data_type, format, created_at, file, timezone } = current;

  const currentTimestamp = moment().unix() * 1000;

  return (
    <DetailContainer>
      {isFetchingCurrent ? <SpinnerFull transparent={true} /> : ''}
      <PageHeader>
        <PageHeader.BackButton href="../data_exports" />
        <PageHeader.Title>
          {request_id}
          <div style={{ marginLeft: '8px' }} data-test-id="Status">
            <DataExportStatusLozenge status={status} file={file} />
          </div>
        </PageHeader.Title>
        <PageHeader.Actions>
          {file && file.expires_at > currentTimestamp && (
            <Button buttonType="primary" icon="download" size="small" onClick={handleDownloadClick}>
              {intl.formatMessage({ id: 'chat.dataExport.button.download' })}
            </Button>
          )}
        </PageHeader.Actions>
      </PageHeader>
      <SettingsGridGroup>
        <SettingsGridCard title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.date' })} titleColumns={4}>
          <TextWrapper data-test-id="DateRange">
            {`${moment.tz(start_ts, timezone).format(TIME_DATE_FORMAT)} - ${moment
              .tz(end_ts, timezone)
              .format(TIME_DATE_FORMAT)}`}{' '}
            ({timezone})
          </TextWrapper>
        </SettingsGridCard>
        <SettingsGridCard title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.format' })} titleColumns={4}>
          <TextWrapper data-test-id="Format">{format.toUpperCase()}</TextWrapper>
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.type' })}
          titleColumns={4}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <Type data-test-id="DataType">{upperFirst(data_type)}</Type>
          {renderDetail(current)}
        </SettingsGridCard>
        <SettingsGridCard title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.createdAt' })} titleColumns={4}>
          <TextWrapper data-test-id="CreatedAt">{moment(created_at).format(TIME_DATE_FORMAT)}</TextWrapper>
        </SettingsGridCard>
      </SettingsGridGroup>
      {file && (
        <SettingsGridCard title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.expiresAt' })} titleColumns={4}>
          <TextWrapper data-test-id="ExpiresAt">{moment(file.expires_at).format(TIME_DATE_FORMAT)}</TextWrapper>
        </SettingsGridCard>
      )}
    </DetailContainer>
  );
};
