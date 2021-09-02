import { useContext, useRef, useEffect, useState, HTMLAttributes, FC } from 'react';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, Typography, Body, Icon, cssColors } from 'feather';
import { rgba } from 'polished';

import { DrawerContext } from '@ui/components';

import { drawerID } from './constants';
import { WhatsNewEntry } from './types';

// Remove remarks when read status check feature is added.
// const MoreIconButton = styled(IconButton).attrs({
//   icon: 'more',
//   size: 'small',
//   buttonType: 'secondary',
// })`
//   justify-self: end;
//   width: 20px;
//   height: 20px;
// `;

const ContentContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 16px;
  margin: 8px 0;
  background-color: ${cssVariables('neutral-1')};
  border-radius: 4px;
`;

const ContentCategory = styled.label`
  ${Typography['label-01']}
  margin-bottom: 8px;
  color: ${cssVariables('neutral-6')};
`;

const ContentTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 12px;
`;

const ContentText = styled.div<{ $isReadMoreShown: boolean }>`
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']}
  ${({ $isReadMoreShown }) => $isReadMoreShown && 'max-height: 120px; overflow: hidden;'}

  a {
    text-decoration: underline;
  }

  li {
    display: flex;
    flex-direction: row;
  }

  li:not(:last-child) {
    margin-bottom: 4px;
  }

  li:before {
    content: '';
    display: block;
    min-width: 4px;
    height: 4px;
    margin-top: 8px;
    margin-right: 4px;
    background-color: ${cssVariables('neutral-7')};
    border-radius: 50%;
  }

  b,
  strong {
    font-weight: 600;
  }

  p + p,
  p + ul,
  ul + p {
    margin-top: 8px;
  }
`;

const ReadMoreButton = styled.div`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${cssVariables('purple-7')};

  &:before {
    position: absolute;
    content: '';
    right: 0;
    bottom: 38px;
    left: 0;
    height: 32px;
    background-image: linear-gradient(
      to bottom,
      ${rgba(cssColors('neutral-1'), 0)} 2%,
      ${cssVariables('neutral-1')} 91%
    );
  }

  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-8')};

    svg {
      fill: ${cssVariables('purple-8')};
    }
  }

  svg {
    display: inline;
    vertical-align: text-bottom;
    margin-left: 4px;
    fill: ${cssVariables('purple-7')};
  }

  &[aria-hidden='true'] {
    margin-top: 0;
    height: 0;
    overflow: hidden;

    &:before {
      display: none;
    }
  }
`;

export const WhatsNewListItem: FC<{ entry: Readonly<WhatsNewEntry> }> = ({ entry }) => {
  const contentTextRef = useRef<HTMLParagraphElement>(null);
  const [isReadMoreShown, setReadMoreShown] = useState(false);
  const { activeDrawerID, closeDrawer } = useContext(DrawerContext);
  const history = useHistory();

  const isDrawerOpen = activeDrawerID === drawerID;

  const handleReadMoreClick = () => setReadMoreShown(false);

  useEffect(() => {
    if (contentTextRef.current) {
      const contentNode = contentTextRef.current;
      const clickEventListener = (event: MouseEvent) => {
        const { tagName = '', href } = event.target as HTMLAnchorElement;

        if (tagName.match(/^a$/i) && href && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
          if (new URL(href).host === window.location.host) {
            event.preventDefault();
            history.push((event.target as HTMLAnchorElement).getAttribute('href')!);
          } else {
            // open external links in a new tab
            (event.target as HTMLAnchorElement).target = '_blank';
          }
        }
      };
      contentNode.addEventListener('click', clickEventListener);

      return () => {
        contentNode.removeEventListener('click', clickEventListener);
      };
    }
  }, [history]);

  useEffect(() => {
    if (contentTextRef.current && contentTextRef.current.clientHeight > 120) setReadMoreShown(isDrawerOpen);
  }, [isDrawerOpen]);

  const onContentClick: HTMLAttributes<HTMLDivElement>['onClick'] = (event) => {
    const eventTarget = event.target as HTMLElement;
    if (eventTarget.tagName === 'A' && eventTarget.getAttribute('target') !== '_blank') {
      // close the sidebar as user navigates to another page within the current window.
      closeDrawer(drawerID);
    }
  };

  const { category, title, text, component } = entry;
  const Component = (component as unknown) as FC;
  const body = Component ? <Component /> : text;

  return (
    <ContentContainer>
      <ContentCategory>{category}</ContentCategory>
      <ContentTitle>{title}</ContentTitle>
      <ContentText ref={contentTextRef} $isReadMoreShown={isReadMoreShown} onClick={onContentClick}>
        {body}
      </ContentText>
      <ReadMoreButton role="button" onClick={handleReadMoreClick} aria-hidden={!isReadMoreShown}>
        Read more
        <Icon icon="chevron-down" size={16} />
      </ReadMoreButton>
    </ContentContainer>
  );
};
