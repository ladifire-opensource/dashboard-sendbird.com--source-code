
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'NEW FEATURES',
  title: 'Open channel with dynamic partitioning',
  date: new Date('2020-12-15T08:00:02.000Z')
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

    <p>{`We’re proud to announce that we’re relaunching Open channel with dynamic partitioning for hosting large scale public chats. The new Sendbird Chat Open channel with dynamic partitioning can host up to 20,000 members in public chats. If customers choose a dedicated server, the new Open channel can host up to 60,000 members in public chats.`}</p>
    <p>{`To ensure that the experience remains pleasant for users and is handled reliably at high scale we have built dynamic partitioning into open channels. Dynamic partitioning splits a large open channel into smaller sub-channels so it is easier to manage user engagement of the front end and chat load on the backend.`}</p>
    <p>{`Open channel supports moderation features to ensure that conversations adhere to your brand standards. Features such as ban user, mute user, spam flood protection, profanity filters, domain filters, regex filters, share media, smart throttling come out of the box in the open channel.`}</p>
    <p>{`Open channel with dynamic partitioning is available in all plans. Give it a try today!`}</p>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;