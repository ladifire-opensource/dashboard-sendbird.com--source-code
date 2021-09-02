
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
      <p>{`The number of messages that are indexed. Message indexing happens when either a new message is created or an existing message is updated or removed. Indexable message types are admin messages, text messages, file messages, announcements, and auto-generated admin messages.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following is an example of usage calculation for message search query at an application level.`}</p>
      <blockquote>
        <p parentName="blockquote">{`"I love birds!" = 1 indexed message
"I hate birds!" = 1 indexed message
`}<strong parentName="p">{`Total = 2 indexed messages`}</strong></p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all indexed message counts across all existing applications within the organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Indexed message count for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 100 indexed messages
`}<strong parentName="p">{`App B:`}</strong>{` 105 indexed messages
`}<strong parentName="p">{`App C:`}</strong>{` 25 indexed messages`}</p>
      </blockquote>
      <p>{`Then, organization’s `}<strong parentName="p">{`indexed message`}</strong>{` count for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`100 + 105 + 25 = `}<strong parentName="p">{`230 indexed messages`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;