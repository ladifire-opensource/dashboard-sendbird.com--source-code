
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-auto-thumbnail-generator/2913'
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
      <p>{`Each thumbnail created for a file message is counted as one usage.`}</p>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all applications’ usages within your organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Auto-generated image count for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 3
`}<strong parentName="p">{`App B:`}</strong>{` 5
`}<strong parentName="p">{`App C:`}</strong>{` 2`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`organization usage`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`3+5+2 = `}<strong parentName="p">{`10 Auto-generated images`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;