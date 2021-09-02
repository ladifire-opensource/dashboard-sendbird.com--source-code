import React, { ChangeEvent, memo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, Checkbox, cssVariables, Subtitles, Toggle } from 'feather';

import { Card } from '@ui/components';

const Title = styled.h3`
  ${Subtitles['subtitle-01']}
  margin-bottom: 4px;
`;

const Subtitle = styled.h4`
  ${Subtitles['subtitle-01']}
  display: grid;
  grid-template-columns: 1fr 40px;
  margin-bottom: 16px;
`;

const Description = styled.p`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-7')};
  margin-bottom: 8px;
`;

const StyledGroupChannelInformation = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 24px;
  ${Card} {
    padding: 18px 24px;
  }
`;

type Props = {
  isEditable: boolean;
  includeMembers: boolean;
  includeUnreadCount: boolean;
  setIncludeMembers: React.Dispatch<React.SetStateAction<boolean>>;
  setIncludeUnreadCount: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GroupChannelInformation = memo<Props>(
  ({ isEditable, setIncludeMembers, includeMembers, setIncludeUnreadCount, includeUnreadCount }) => {
    const intl = useIntl();
    const onChangeIncludeMembers = (checked: boolean) => {
      setIncludeMembers(checked);
    };

    const onChangeIncludeUnreadCount = (e: ChangeEvent<HTMLInputElement>) => {
      setIncludeUnreadCount(e.target.checked);
    };

    return (
      <StyledGroupChannelInformation>
        <Title>{intl.formatMessage({ id: 'chat.settings.webhooks.groupChannelInformation.title' })}</Title>
        <Description>
          <FormattedMessage id="chat.settings.webhooks.groupChannelInformation.desc" />
        </Description>
        <Card>
          <Subtitle>
            {intl.formatMessage({ id: 'chat.settings.webhooks.groupChannelInformation.subTitle' })}
            <Toggle name="includeMembers" checked={includeMembers} onChange={onChangeIncludeMembers} />
          </Subtitle>
          <Checkbox
            name="includeUnreadCount"
            checked={includeUnreadCount}
            label={intl.formatMessage({
              id: 'chat.settings.webhooks.groupChannelInformation.label.includeUnreadCount',
            })}
            onChange={onChangeIncludeUnreadCount}
            disabled={!isEditable || !includeMembers}
          />
        </Card>
      </StyledGroupChannelInformation>
    );
  },
);
