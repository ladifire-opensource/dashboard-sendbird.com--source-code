import { forwardRef, AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import styled, { StyledComponent } from 'styled-components';

import { Body, cssVariables, Headings, IconButton } from 'feather';

const PageTitle = styled.h1`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  ${Headings['heading-04']};
`;

const PageActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const PageDescription = styled.div<{ $textOnly?: boolean }>`
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};
  ${({ $textOnly }) => $textOnly && 'max-width: 1312px;'}

  > p {
    max-width: 1312px;
  }
`;

const PageHeaderBackButton = styled(
  forwardRef<HTMLAnchorElement, { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>>(
    ({ href, ...props }, ref) => {
      return (
        <Link to={href} {...props} innerRef={ref}>
          <IconButton icon="arrow-left" size="small" buttonType="secondary" />
        </Link>
      );
    },
  ),
)``;

type PageHeaderComponent = StyledComponent<'header', any> & {
  Title: typeof PageTitle;
  Description: typeof PageDescription;
  Actions: typeof PageActions;
  BackButton: typeof PageHeaderBackButton;
};

/**
 * You can use this component to render a page title.
 *
 * ```
 * <PageHeader>
 *   <PageHeader.BackButton href="../list" />
 *   <PageHeader.Title>Page title</PageHeader.Title>
 *   <PageHeader.Actions>
 *     <Button>Create</Button>
 *   </PageHeader.Actions>
 *   <PageHeader.Description css={`
 *     // override styles
 *   `}>
 *     Page description
 *   </PageHeader.Description>
 * </PageHeader>
 * ```
 */
export const PageHeader: PageHeaderComponent = styled.header`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 32px auto;
  grid-template-areas:
    'back        title       actions'
    'description description description';
  align-items: center;

  ${PageHeaderBackButton} {
    grid-area: back;
    position: relative;
    left: -8px;
  }

  ${PageTitle} {
    grid-area: title;
  }

  ${PageActions} {
    grid-area: actions;
  }

  ${PageDescription} {
    grid-area: description;
    margin-top: 24px;
  }
` as any;

PageHeader.Title = PageTitle;
PageHeader.Description = PageDescription;
PageHeader.Actions = PageActions;
PageHeader.BackButton = PageHeaderBackButton;
