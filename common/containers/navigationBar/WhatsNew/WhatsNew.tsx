import React, { useContext, useRef, useEffect, useCallback, ReactNode, useMemo } from 'react';

import styled from 'styled-components';

import { ScrollBar, Headings, IconButton, cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { CLOUD_FRONT_URL } from '@constants';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import { Drawer, DrawerContext, drawerTransitionDurationSecond } from '@ui/components';

import { WhatsNewListItem } from './WhatsNewListItem';
import { drawerID } from './constants';
import { loadEntries } from './loadEntries';
import { WhatsNewEntry } from './types';

const UpdateTime = styled.h2`
  padding-left: 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
`;

const Container = styled(Drawer)`
  width: 336px;
`;

const Header = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 28px 1fr;
  grid-column-gap: 8px;
  height: 72px;
  padding-left: 16px;
  padding-right: 12px;
`;

const Title = styled.div`
  ${Headings['heading-04']}
`;

const WhatsNewPresentImage = styled.img.attrs({
  src: `${CLOUD_FRONT_URL}/dashboard/img-present-01.png`,
  alt: "What's new",
})`
  width: 28px;
  height: 30px;
`;

const CloseIconButton = styled(IconButton).attrs({
  icon: 'close',
  size: 'small',
  buttonType: 'secondary',
})`
  justify-self: end;
`;

const SectionByDate = styled.section.attrs({ role: 'group' })`
  & + & {
    margin-top: 24px;
  }
`;

const getDateString = (value: WhatsNewEntry['date']) => moment(value).format('YYYY-MM-DD');

/**
 *
 * @param entries What's New entries sorted newest to oldest
 * @returns Array of `WhatsNewEntry[]` grouped by date
 */
const groupByDate = (entries: WhatsNewEntry[]) => {
  return entries.reduce((result, cur) => {
    if (result.length === 0 || getDateString(cur.date) !== getDateString(result[result.length - 1][0].date)) {
      result.push([cur]);
    } else {
      result[result.length - 1].push(cur);
    }
    return result;
  }, [] as WhatsNewEntry[][]);
};

/**
 *
 * @param entries What's New entries sorted newest to oldest
 * @param dateRenderer A function that returns the title of a date group given a moment object
 */
const groupByDateAndRender = (entries: WhatsNewEntry[], dateRenderer: (moment: Moment) => ReactNode) => {
  const browserTimezone = moment.tz.guess();
  return groupByDate(entries).map((group) => {
    const updateDate = moment.tz(group[0].date, browserTimezone);
    const key = `whats-new-date-${updateDate.toISOString()}`;
    return (
      <SectionByDate aria-labelledby={key} key={key}>
        <UpdateTime id={key}>{dateRenderer(updateDate)}</UpdateTime>
        {group.map((content) => (
          <WhatsNewListItem key={content.key || `${content.date}-${content.title}`} entry={content} />
        ))}
      </SectionByDate>
    );
  });
};

const entries = loadEntries();

export const WhatsNew: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeDrawerID, closeDrawer } = useContext(DrawerContext);

  useEffect(() => {
    const windowClickEventListener = (e: MouseEvent) => {
      if (!containerRef.current || (e.target instanceof Node && !containerRef.current.contains(e.target))) {
        closeDrawer(drawerID);
      }
    };

    if (activeDrawerID && activeDrawerID === drawerID) {
      setTimeout(() => {
        window.addEventListener('click', windowClickEventListener, true);
      }, drawerTransitionDurationSecond * 1000);
    }

    return () => {
      window.removeEventListener('click', windowClickEventListener, true);
    };
  }, [activeDrawerID, closeDrawer]);

  const formatTimeAgo = useFormatTimeAgo();

  const contents = useMemo(() => {
    const browserTimezone = moment.tz.guess();
    const today = moment.tz(new Date(), browserTimezone);
    const updateAsTodayContents = entries.filter(({ date }) => date.diff(today, 'day') === 0);
    const updateAsYesterdayContents = entries.filter(({ date }) => date.diff(today, 'day') === -1);
    const updateAsRecentlyContents = entries.filter(
      ({ date }) => date.diff(today, 'day') < -1 && date.diff(today, 'day') >= -7,
    );
    const oldUpdateContents = entries.filter(({ date }) => date.diff(today, 'day') < -7);

    return (
      <>
        {updateAsTodayContents.length > 0 && (
          <SectionByDate>
            <UpdateTime>Today</UpdateTime>
            {updateAsTodayContents.map((content, index) => (
              <WhatsNewListItem key={`${content.date}${index}`} entry={content} />
            ))}
          </SectionByDate>
        )}
        {updateAsYesterdayContents.length > 0 && (
          <SectionByDate>
            <UpdateTime>Yesterday</UpdateTime>
            {updateAsYesterdayContents.map((content, index) => (
              <WhatsNewListItem key={`${content.date}${index}`} entry={content} />
            ))}
          </SectionByDate>
        )}
        {groupByDateAndRender(updateAsRecentlyContents, (momentObj) => formatTimeAgo(momentObj.valueOf()))}
        {groupByDateAndRender(oldUpdateContents, (momentObj) => momentObj.format('LL'))}
      </>
    );
  }, []);

  const onCloseButtonClick = useCallback(() => {
    closeDrawer(drawerID);
  }, [closeDrawer]);

  return (
    <Container id={drawerID} ref={containerRef}>
      <Header>
        <Title>What's new</Title>
        <WhatsNewPresentImage />
        {/* Use this component when read status check feature is added. 👉 <MoreIconButton /> */}
        <CloseIconButton onClick={onCloseButtonClick} />
      </Header>
      <ScrollBar style={{ height: 'calc(100% - 72px)' }}>
        <div style={{ padding: '0 16px', paddingBottom: 12 }}>{contents}</div>
      </ScrollBar>
    </Container>
  );
};
