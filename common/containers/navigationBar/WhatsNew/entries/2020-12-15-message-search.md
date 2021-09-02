
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'NEW FEATURES',
  title: 'Message search',
  date: new Date('2020-12-15T08:00:01.000Z')
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

    <p>{`Sendbird is excited to announce Message Search for Sendbird Chat, another table stakes feature that users have come to expect in their in-app chat experiences.`}</p>
    <p>{`Users send hundreds of messages everyday in many channels. Sometimes it's difficult to keep track of all the conversations - a user might feel the need to come back to a message to seek important information from conversation history, or start a new conversation from an old exchange, or sometimes just reflect on a conversation and so on. There are many ways in which message search can be actioned but the advantages remain the same - improve user experience, and increase user engagement in your app.`}</p>
    <p>{`With Message Search for Sendbird Chat, developers can build message search experiences in in-app chat. Developers can build capabilities for users to search for messages from within the channel, as well as from outside the channel from the channel list view. Users can search across any conversation they are a part of. For now message search is limited to searching for text in message text, and not message metadata or filenames.`}</p>
    <p>{`Message search is available in all plans. Give it a try today!`}</p>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;