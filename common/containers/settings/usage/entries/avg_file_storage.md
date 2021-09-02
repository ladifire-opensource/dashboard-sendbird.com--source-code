
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-file-storage/2908'
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
      <h4>{`[Formula]`}</h4>
      <p>{`File storage is measured once a day and added to the cumulative monthly usage.
The usage does not reset unless file(s) is deleted by users or channel retention.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following is an example of usage calculation for file storage at an application level.`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`Usage for January 1 - 31:`}</strong>{`
January 1: stored 1GB
January 10: stored 2GB
January 15: stored 6GB`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`file storage`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`1GB + 2GB + 6GB = 9GB`}</p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all file size stored in Sendbird server across all existing applications within the organization.
The usage does not reset unless file(s) is deleted by a user or channel retention.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
file size stored for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A :`}</strong>{` 40 GB
`}<strong parentName="p">{`App B :`}</strong>{` 100 GB
`}<strong parentName="p">{`App C :`}</strong>{` 20 GB`}</p>
      </blockquote>
      <p>{`Then, organization’s `}<strong parentName="p">{`file storage`}</strong>{` for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`40 + 100 + 20 = `}<strong parentName="p">{`160 GB`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;