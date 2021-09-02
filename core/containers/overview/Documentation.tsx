import { useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { IconName, cssVariables, Headings, Subtitles, Body, Link, IconButton, transitionDefault } from 'feather';

const StyledDocumentation = styled.div`
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
  padding: 0 24px;
  overflow: hidden;
`;

const DocumentationHeader = styled.div`
  display: flex;
  align-items: center;
  padding-top: 18px;
  padding-bottom: 18px;
`;

const DocumentationTitle = styled.h2`
  flex: 1;
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-10')};
  display: flex;
  align-items: center;
`;

const DocumentationToggle = styled.div<{ expanded: boolean }>`
  align-self: flex-end;
  ${({ expanded }) => {
    return css`
      svg {
        transform: rotate(${expanded ? 0 : -90}deg);
        transition: transform 0.3s ${transitionDefault};
      }
    `;
  }}
`;

const DocumentationBody = styled.div<{ expanded: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 32px;
  position: relative;
  max-height: ${({ expanded }) => (expanded ? 180 : 0)}px;
  transition: max-height 0.3s ${transitionDefault}, padding-top 0.3s ${transitionDefault},
    padding-bottom 0.3s ${transitionDefault};
  &:before {
    position: absolute;
    content: '';
    top: 0;
    right: 0;
    left: 0;
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const DocumentationProduct = styled.div`
  display: flex;
  align-items: stretch;
  flex-direction: column;

  padding-top: 18px;
  margin-bottom: 24px;
`;

const DocumentationProductTitle = styled.div`
  ${Subtitles['subtitle-02']};
  margin-bottom: 8px;
  color: ${cssVariables('neutral-10')};
`;

const DocumentationProductDescription = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
  flex: 1;
`;

const DocumentationProductLinks = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(5, 32px);
  grid-column-gap: 20px;
  margin-top: 24px;
  svg {
    fill: ${cssVariables('neutral-7')};
  }
  a:hover {
    svg {
      fill: ${cssVariables('neutral-7')};
    }
  }
`;

type Document = {
  name: string;
  description: string;
  links: {
    icon: IconName;
    url: string;
  }[];
};

export const Documentation = () => {
  const intl = useIntl();

  const [expanded, setExpanded] = useState(true);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const documents: Document[] = [
    {
      name: intl.formatMessage({ id: 'common.home.documentation.chat.title' }),
      description: intl.formatMessage({ id: 'common.home.documentation.chat.description' }),
      links: [
        {
          icon: 'apple',
          url: 'https://sendbird.com/docs/chat/v3/ios/getting-started/about-chat-sdk',
        },
        {
          icon: 'android',
          url: 'https://sendbird.com/docs/chat/v3/android/getting-started/about-chat-sdk',
        },
        {
          icon: 'javascript',
          url: 'https://sendbird.com/docs/chat/v3/javascript/getting-started/about-chat-sdk',
        },
        {
          icon: 'unity',
          url: 'https://sendbird.com/docs/chat/v3/unity/getting-started/chat-sdk-setup',
        },
        {
          icon: 'dotnet',
          url: 'https://sendbird.com/docs/chat/v3/dotnet/getting-started/chat-sdk-setup',
        },
      ],
    },
    {
      name: intl.formatMessage({ id: 'common.home.documentation.syncManager.title' }),
      description: intl.formatMessage({ id: 'common.home.documentation.syncManager.description' }),
      links: [
        {
          icon: 'apple',
          url: 'https://sendbird.com/docs/syncmanager/v1/ios/getting-started/about-syncmanager',
        },
        {
          icon: 'android',
          url: 'https://sendbird.com/docs/syncmanager/v1/android/getting-started/about-syncmanager',
        },
        {
          icon: 'javascript',
          url: 'https://sendbird.com/docs/syncmanager/v1/javascript/getting-started/about-syncmanager',
        },
      ],
    },
    {
      name: intl.formatMessage({ id: 'common.home.documentation.uiKit.title' }),
      description: intl.formatMessage({ id: 'common.home.documentation.uiKit.description' }),
      links: [
        {
          icon: 'apple',
          url: 'https://sendbird.com/docs/uikit/v1/ios/getting-started/about-uikit',
        },
        {
          icon: 'android',
          url: 'https://sendbird.com/docs/uikit/v1/android/getting-started/about-uikit',
        },
        {
          icon: 'javascript',
          url: 'https://sendbird.com/docs/uikit/v1/javascript/getting-started/about-uikit',
        },
      ],
    },
  ];
  return (
    <StyledDocumentation>
      <DocumentationHeader>
        <DocumentationTitle>
          {intl.formatMessage({ id: 'core.overview.documentation.title' })}
          <div id="tourTargetDocs" style={{ width: 48, height: 5 }} />
        </DocumentationTitle>
        <DocumentationToggle expanded={expanded}>
          <IconButton buttonType="secondary" size="small" icon="chevron-down" onClick={handleToggle} />
        </DocumentationToggle>
      </DocumentationHeader>
      <DocumentationBody expanded={expanded}>
        {documents.map(({ name, description, links }) => {
          return (
            <DocumentationProduct key={`overview_document_${name}`}>
              <DocumentationProductTitle>{name}</DocumentationProductTitle>
              <DocumentationProductDescription>{description}</DocumentationProductDescription>
              <DocumentationProductLinks>
                {links.map(({ icon, url }) => {
                  return (
                    <li key={url}>
                      <Link href={url} target="_blank" tabIndex={-1}>
                        <IconButton buttonType="secondary" icon={icon} iconSize={24} size="small" />
                      </Link>
                    </li>
                  );
                })}
              </DocumentationProductLinks>
            </DocumentationProduct>
          );
        })}
      </DocumentationBody>
    </StyledDocumentation>
  );
};
