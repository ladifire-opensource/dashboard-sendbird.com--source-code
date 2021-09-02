
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'NEW FEATURES',
  title: 'IP Whitelisting',
  date: new Date('2020-12-15T08:00:00.000Z')
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

    <p>{`IP Whitelisting is an extra layer of security to keep your chat application secure. IP Whitelisting lets you create a list of whitelisted IPs in the Sendbird Chat dashboard, from which REST API calls can be made to the Sendbird Chat Platform API. Only servers residing on these whitelisted IPs have the privilege to make calls to the Sendbird Chat Platform API - thereby creating an extra layer of security for your application and organization even in case your API key were to be compromised.`}</p>
    <p>{`IP Whitelisting has tremendous use for businesses which have a stringent requirement around security and who want to manage chat securely from the server side.`}</p>
    <p>{`Give it a try and see what you think.`}</p>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;