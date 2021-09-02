
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */
import OrderComponent from './OrderComponent';
export const frontMatter = {
  communityUrl: 'https://community.sendbird.com/t/usage-calculation-chatbot-interface/2963'
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
      <p>{`The number of translated characters, including whitespace and symbols.`}</p>
      <h4>{`[Example]`}</h4>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`I love birds!`}</strong>{`
10 alphabets + 2 whitespace + 1 symbol = `}<strong parentName="p">{`13 characters`}</strong></p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all applications’ usages within your organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
Translated characters for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A:`}</strong>{` 13 characters
`}<strong parentName="p">{`App B:`}</strong>{` 25 characters
`}<strong parentName="p">{`App C:`}</strong>{` 22 characters`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`organization usage`}</strong>{` is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`13 + 25 + 22 = `}<strong parentName="p">{`60 characters`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;