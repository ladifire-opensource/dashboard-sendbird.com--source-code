
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-monthly-active-users/2861'
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
      <p>{`The highest count of active users connected to Sendbird server in a single day of a given month.
Different devices with the same user ID are counted as 1 MAU.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let's say there are a total of `}<strong parentName="p">{`three`}</strong>{` users in your application that connected to Sendbird server this month.`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`User 1:`}</strong>{` connected on January 1, 5, 15.
`}<strong parentName="p">{`User 2:`}</strong>{` connected on January 5, 15.
`}<strong parentName="p">{`User 3:`}</strong>{` connected on January 1, 15.`}</p>
      </blockquote>
      <p>{`Then, the count of `}<strong parentName="p">{`active users`}</strong>{` for each day is:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`January 1:`}</strong>{` 2 users (User1,3)
`}<strong parentName="p">{`January 5:`}</strong>{` 2 users (User1,2)
`}<strong parentName="p">{`January 15:`}</strong>{` 3 users (User1,2,3)`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`Application MAU`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`3 users`}</strong>{` because January 15th has the highest number of active users for this month.`}</p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all applications’ MAU usages within your organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let's say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
MAU for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 3
`}<strong parentName="p">{`App B:`}</strong>{` 5
`}<strong parentName="p">{`App C:`}</strong>{` 2`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`Organization MAU`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`3+5+2 = `}<strong parentName="p">{`10 users`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;