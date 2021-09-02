
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-auto-image-moderation/2915'
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
      <p>{`Each message blocked by image moderation is counted as one usage.`}</p>
      <p><strong parentName="p">{`Note:`}</strong>{` Image moderation is powered by Google Cloud Vision API which moderates the text and file messages with explicit images or inappropriate image URLs, and uses five categories such as adult, spoof, medical, violence, and racy.`}</p>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all applications’ usages within your organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Auto-moderated image count for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 3 images
`}<strong parentName="p">{`App B:`}</strong>{` 5 images
`}<strong parentName="p">{`App C:`}</strong>{` 2 images`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`organization usage`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`3+5+2 = `}<strong parentName="p">{`10 auto-moderated images`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;