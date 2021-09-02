
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
      <h4>{`[Formula]`}</h4>
      <blockquote>
        <p parentName="blockquote">{`Active chatbot usage = (number of active chatbot) `}{`*`}{` (active days per chatbot)`}</p>
      </blockquote>
      <p>{`Takes the number of active chatbot integrated over the course of the month.
Then, counts how many day(s) each integrated chatbot stayed active within the month.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`The following is an example of usage calculation for active chatbot at an application level.`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`Usage for January 1 - 31:`}</strong>{`
January 1: integrated 1 chatbot (active for 31days)
January 10: integrated 2 chatbot (active for 22days)
January 15: integrated 1 chatbot (active for 17days)`}</p>
      </blockquote>
      <p>{`Then, `}<strong parentName="p">{`active chatbot`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`(1 `}<em parentName="p">{` 31) + (2 `}</em>{` (31-9)) + (1 `}{`*`}{` (31-14))
= (31) + (44) + (17)
= `}<strong parentName="p">{`92 active chatbot`}</strong></p>
      </blockquote>
    </OrderComponent>
    <OrderComponent id="organization" mdxType="OrderComponent">
      <h2>{`Usage calculation per Organization?`}</h2>
      <p>{`The sum of all active chatbot usage in Sendbird server across all existing applications within the organization.`}</p>
      <h4>{`[Example]`}</h4>
      <p>{`Let’s say there are a total of `}<strong parentName="p">{`3 applications`}</strong>{` within your organization.
active chatbot usage for each application is as shown below:`}</p>
      <blockquote>
        <p parentName="blockquote"><strong parentName="p">{`App A :`}</strong>{` 40 active chatbots
`}<strong parentName="p">{`App B :`}</strong>{` 100 active chatbots
`}<strong parentName="p">{`App C :`}</strong>{` 20 active chatbots`}</p>
      </blockquote>
      <p>{`Then, organization’s `}<strong parentName="p">{`active chatbot`}</strong>{` usage for this month is:`}</p>
      <blockquote>
        <p parentName="blockquote">{`40 + 100 + 20 = `}<strong parentName="p">{`160 active chatbots`}</strong></p>
      </blockquote>
    </OrderComponent>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;