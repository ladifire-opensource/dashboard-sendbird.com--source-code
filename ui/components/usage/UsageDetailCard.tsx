import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import getDate from 'date-fns/getDate';
import isSameMonth from 'date-fns/isSameMonth';
import lastDayOfMonth from 'date-fns/lastDayOfMonth';
import { cssVariables, Subtitles, Body, Spinner, Typography } from 'feather';
import qs from 'qs';

import { useFormatDateTimeRange } from '@hooks/useFormatDate';

type Props = {
  className?: string;
  title?: string;
  description?: ReactNode;
  isMultiple?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  quotaNotification?: ReactNode;
  disabled?: boolean;
};
const Placeholder = styled.div`
  position: absolute;
  z-index: 1;
  top: 48px;
  left: 0;
  width: 100%;
  height: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${Typography['caption-01']};
  color: ${cssVariables('neutral-7')};
  background: white;
`;

const Card = styled.div<{ isMultiple?: boolean; isBuilding?: boolean }>`
  position: relative;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};

  & + & {
    margin-top: 8px;
  }
  > div[role='progressbar'] {
    position: absolute;
    z-index: 2;
    top: 48px;
    left: 0;
    width: 100%;
    height: 192px;
  }
  &[aria-disabled='true'] > div:not([role='progressbar']),
  &[aria-disabled='true'] > div:not(${Placeholder}) {
    opacity: 0.5;
    pointer-events: none;
  }

  ${({ isBuilding }) => {
    if (isBuilding) {
      return css`
        > div[role='progressbar'] {
          background: white;
        }
      `;
    }
  }}

  ${({ isMultiple }) => {
    if (isMultiple) {
      return css`
        padding: 24px 0 0;
      `;
    }
    return css`
      padding: 24px 0;
    `;
  }}
`;

const CardHeader = styled.div`
  padding: 0 24px;
  margin-bottom: 24px;
`;

const CardTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CardDescription = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 8px;
`;

const Title = styled.span`
  ${Subtitles['subtitle-02']};
`;

const MonthRange = styled.span`
  ${Subtitles['subtitle-02']};

  ${Title} + & {
    margin-left: 4px;
  }
`;

const DaysLeft = styled.small`
  margin-left: 8px;
  ${Body['body-short-01']};
  color: ${cssVariables('content-2')};
`;

export const UsageDetailCardGroup = styled.div<{ $isMultiple: boolean }>`
  ${Card} {
    ${({ $isMultiple }) => {
      if ($isMultiple) {
        return css`
          & + ${Card} {
            margin-top: 8px;
          }
        `;
      }
      return css`
        &:not(:first-child) {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          margin-top: -1px;
        }

        &:not(:last-child) {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      `;
    }}
  }
`;

export const UsageDetailCard: FC<Props> = ({
  children,
  className,
  title,
  description,
  isMultiple = false,
  isLoading = false,
  placeholder,
  disabled = false,
  quotaNotification,
}) => {
  const intl = useIntl();
  const location = useLocation<{ date?: string }>();
  const formatDateTimeRange = useFormatDateTimeRange();

  const queryParams = location.search ? qs.parse(location.search.slice(1)) : null;
  const isDateSelected = queryParams !== null;
  const today = new Date();
  const selectedDate = isDateSelected ? new Date(queryParams.date) : today;

  const isLatestMonth = isDateSelected ? isSameMonth(selectedDate, today) : true;
  const lastDay = getDate(lastDayOfMonth(selectedDate));
  const currentDay = getDate(today);
  const daysLeft = lastDay - currentDay;
  const formattedDateRange = formatDateTimeRange(selectedDate.setDate(1), selectedDate.setDate(lastDay), {
    dateStyle: 'long',
  });

  return (
    <Card className={className} isMultiple={isMultiple} isBuilding={isLoading} aria-disabled={disabled}>
      {isLoading && <Spinner stroke={cssVariables('neutral-6')} size={20} />}
      {placeholder && <Placeholder>{placeholder}</Placeholder>}
      <CardHeader>
        <CardTitleWrapper>
          {title && (
            <Title>{intl.formatMessage({ id: 'common.settings.usage.usageDetail.title.on' }, { title })}</Title>
          )}
          <MonthRange>{formattedDateRange}</MonthRange>
          {isLatestMonth && (
            <DaysLeft>
              {intl.formatMessage({ id: 'common.settings.usage.usageDetail.title.daysLeft' }, { daysLeft })}
            </DaysLeft>
          )}
        </CardTitleWrapper>
        {description !== '' && <CardDescription>{description}</CardDescription>}
        {quotaNotification && <div css="margin-top: 16px;">{quotaNotification}</div>}
      </CardHeader>
      {children}
    </Card>
  );
};
