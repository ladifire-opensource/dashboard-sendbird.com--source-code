
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'NEW FEATURES',
  title: 'Group calls',
  date: new Date('2021-04-22T08:00:00.000Z')
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

    <p>{`Sendbird Calls now offers groups calls for all customers. Create rooms where users can enter to participate in group calls. Both audio and video rooms are available in which you’ll be able to see a list of rooms created on your app, and view the participants who have joined group calls in each room.`}</p>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;