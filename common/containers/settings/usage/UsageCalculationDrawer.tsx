import { FC, MouseEventHandler, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { IconButton, Headings, Body, cssVariables, Link } from 'feather';

import { useOutsideEventByRef } from '@hooks/useOutsideEventByRef';
import { TransitionedDrawer } from '@ui/components';
import { useDrawer } from '@ui/components/drawer/useDrawer';

import { UsageCalculationDrawerState } from './hooks/useUsageCalculationDrawer';
import { loadUsageCalculationEntries } from './loadUsageCalculationEntries';

export const USAGE_CALCULATION_DRAWER_ID = 'UsageCalculationDrawer';

const ContentDividerStyle = css`
  content: '';
  display: block;
  margin: 16px 0;
  width: 100%;
  height: 1px;
  background: ${cssVariables('border-3')};
`;

const TransitionedDrawerContainer = styled(TransitionedDrawer)`
  grid-template-rows: auto 1fr auto;
  width: 400px;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 16px 24px;
`;

const HeaderTitle = styled.span`
  ${Headings['heading-03']};
  font-weight: 600;
  letter-spacing: -0.25px;
  line-height: 24px;

  b {
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
  }
`;

const Content = styled.div<{ reverseOrder: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  max-height: calc(100% - 160px);
  white-space: pre-wrap;
  overflow-y: auto;

  h1 {
    ${Headings['heading-01']};
  }

  h2 {
    ${Headings['heading-03']};
  }

  h3 {
    ${Headings['heading-01']};
  }

  h4 {
    ${Headings['heading-01']};
  }

  p {
    ${Body['body-short-01']};
  }

  b,
  strong {
    font-weight: normal;
  }

  hr {
    margin: 16px 0;
    height: 0;
    border-style: solid;
    border-width: 1px 0 0 0;
    border-color: ${cssVariables('border-3')};
  }

  blockquote {
    display: block;
    padding: 8px 12px;
    border: 1px solid ${cssVariables('border-3')};
    border-radius: 4px;
    ${Body['body-short-01']};
  }

  h1 + p,
  h2 + p,
  h3 + p,
  h4 + p {
    margin-top: 4px;
  }

  h1 + blockquote,
  h2 + blockquote,
  h3 + blockquote,
  h4 + blockquote,
  p + blockquote {
    margin-top: 8px;
  }

  p + p,
  p + h1,
  p + h2,
  p + h3,
  p + h4,
  blockquote + p {
    margin-top: 16px;
  }

  ${({ reverseOrder }) =>
    reverseOrder
      ? css`
          #application {
            order: 2;
            &::before {
              ${ContentDividerStyle}
            }
          }

          #organization {
            order: 1;
          }
        `
      : css`
          #application {
            order: 1;
          }

          #organization {
            order: 2;
            &::before {
              ${ContentDividerStyle}
            }
          }
        `};
`;

const Footer = styled.div`
  padding: 16px 24px;

  > a {
    font-size: 14px;
    font-weight: 600;
  }
`;

const COMMUNITY_LINK_ORIGIN = 'https://community.sendbird.com';

type Props = {
  openedFrom: 'organization' | 'application';
};

const usageCalculationEntries = loadUsageCalculationEntries();

const UsageCalculationDrawer: FC<Props> = ({ openedFrom = 'application' }) => {
  const intl = useIntl();
  const { activeDrawerID, drawerState, closeDrawer } = useDrawer<UsageCalculationDrawerState>();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const { subscribe, unsubscribe } = useOutsideEventByRef({
    ref: drawerRef,
    onOutsideClick: () => {
      closeDrawer();
    },
  });
  const handleCloseDrawer: MouseEventHandler<HTMLButtonElement> = () => {
    closeDrawer();
  };

  useEffect(() => {
    if (!drawerState || !drawerState.usageField) {
      closeDrawer();
    }
  }, [closeDrawer, drawerState]);

  useEffect(() => {
    if (activeDrawerID === USAGE_CALCULATION_DRAWER_ID) {
      subscribe();
      return unsubscribe;
    }
  }, [activeDrawerID, subscribe, unsubscribe]);

  const title = drawerState?.title ?? '';
  const usageField = drawerState?.usageField ?? null;

  const entry = usageField ? usageCalculationEntries[usageField] : null;
  const UsageCalculationGuideMD = entry ? ((entry.component as unknown) as FC) : () => null;

  return (
    <TransitionedDrawerContainer id={USAGE_CALCULATION_DRAWER_ID} ref={drawerRef} isFullHeight={true}>
      <Header>
        <HeaderTitle>{title}</HeaderTitle>
        <IconButton
          buttonType="secondary"
          icon="close"
          size="small"
          onClick={handleCloseDrawer}
          css="transform: translate(12px, -6px);"
        />
      </Header>
      <Content reverseOrder={openedFrom === 'organization'}>
        <UsageCalculationGuideMD />
      </Content>
      <Footer>
        <Link
          href={entry?.communityUrl ?? COMMUNITY_LINK_ORIGIN}
          iconProps={{ icon: 'open-in-new', size: 16 }}
          target="_blank"
        >
          {intl.formatMessage({ id: 'common.settings.usage.usageDetail.calculation.drawer.button' })}
        </Link>
      </Footer>
    </TransitionedDrawerContainer>
  );
};

export default UsageCalculationDrawer;
