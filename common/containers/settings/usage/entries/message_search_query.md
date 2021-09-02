
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-message-search/2964'
};

const layoutProps = {
  frontMatter
};
const MDXLayout = "wrapper"
export default function MDXContent({
  components,
  ...props
}) {
  return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


    <OrderComponent id="application" mdxType="OrderComponent">
      <h2>{`Usage calculation per Application?`}</h2>
      <p>{`The number of times search queries of strings are made.
Empty string (" ") API calls also count as one search query.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following is an example of usage calculation for message search query at an application level.`}</p>
      <blockquote>
        <p parentName="blockquote">{`"I love birds!" = 1 search query
" " = 1 search query
`}<strong parentName="p">{`Total = 2 search queries`}</strong></p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all search queries made across all existing applications within the organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Message search query count for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 100 search queries
`}<strong parentName="p">{`App B:`}</strong>{` 105 search queries
`}<strong parentName="p">{`App C:`}</strong>{` 25 search queries`}</p>
      </blockquote>
      <p>{`Then, organization’s `}<strong parentName="p">{`message search query`}</strong>{` count for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`100 + 105 + 25 = `}<strong parentName="p">{`230 search queries`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;