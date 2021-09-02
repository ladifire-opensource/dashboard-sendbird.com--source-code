
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-announcements/2916'
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
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`1 announcement for 1 group channel with 1 URL`}</strong></p>
      </blockquote>
      <p>{`Regardless of how many users are in a group channel (as long as it is under 10,000 users), an announcement message sent out to a group channel with the same URL will count as one announcement message.`}</p>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <hr></hr>
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all announcement messages sent out across all existing applications within the organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Announcement message count for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 3
`}<strong parentName="p">{`App B:`}</strong>{` 5
`}<strong parentName="p">{`App C:`}</strong>{` 2`}</p>
      </blockquote>
      <p>{`Then, organization’s `}<strong parentName="p">{`announcements`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`3 + 5 + 2 = `}<strong parentName="p">{`10 announcement messages`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;