
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-peak-concurrent-connections/2907'
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
      <p>{`The highest single-day count of devices simultaneously connected to Sendbird server in a month. Each device used, and each tab opened are counted as concurrent connections.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following shows an application's Peak Concurrent Connection for each day of the month.`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`January 1:`}</strong>{` 100 connections
`}<strong parentName="p">{`January 2:`}</strong>{` 101 connections
`}<strong parentName="p">{`January 3:`}</strong>{` 110 connections
...
`}<strong parentName="p">{`January 31:`}</strong>{` 101 connections`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`Application's PCC`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`110 connections`}</strong>{` because it is the highest single-day count.`}</p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all applications’ Peak Concurrent Connections within your organization.`}</p>
      <h4>{`[Calculation Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
PCC for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 101 connections
`}<strong parentName="p">{`App B:`}</strong>{` 59 connections
`}<strong parentName="p">{`App C:`}</strong>{` 200 connections`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`Organization PCC`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`101+59+200 = `}<strong parentName="p">{`360 connections`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;