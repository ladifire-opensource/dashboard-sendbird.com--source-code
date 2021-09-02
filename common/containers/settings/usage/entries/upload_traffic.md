
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-file-upload-traffic/2911'
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
      <p>{`The cumulative amount of file size uploaded within a month.
Usage calculation resets on the first day of every month.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following shows an application's file upload traffic in a month.`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`January 1:`}</strong>{` 10 GB
`}<strong parentName="p">{`January 5:`}</strong>{` 15 GB
`}<strong parentName="p">{`January 15:`}</strong>{` 15 GB`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`file upload traffic`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`10 + 15 + 15 = `}<strong parentName="p">{`40 GB`}</strong></p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all file size uploaded across all applications within your application.
Usage calculation resets on the first of day every month.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Upload traffic usage for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 40 GB
`}<strong parentName="p">{`App B:`}</strong>{` 100 GB
`}<strong parentName="p">{`App C:`}</strong>{` 20 GB`}</p>
      </blockquote>
      <p>{`Then, organization's `}<strong parentName="p">{`file upload traffic`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`40 + 100 + 20 = `}<strong parentName="p">{`160 GB`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;