
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'NEW FEATURES',
  title: 'UIKit Open source',
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

    <p>{`We’re very excited to announce that we are making Sendbird UIKit open source. With this announcement, Sendbird UIKit will become the fastest and most flexible, UI-centric modern development toolkit for developers to build chat in apps. This will allow developers to extend the UIKit to any use case, vertical or workflow they can imagine. Sendbird UIKit source code is available in the UIKit sample app repository in Github. Developers can freely fork the UIKit source code and use it to build for their own use case.`}</p>
    <p>{`To learn more on how to get started please visit the links to the Github repositories:`}</p>
    <ul>
      <li parentName="ul"><a parentName="li" {...{
          "href": "https://github.com/sendbird/sendbird-uikit-react-sources"
        }}>{`JavaScript open source`}</a></li>
      <li parentName="ul"><a parentName="li" {...{
          "href": "https://github.com/sendbird/sendbird-uikit-ios-sources"
        }}>{`iOS open source`}</a></li>
      <li parentName="ul"><a parentName="li" {...{
          "href": "https://github.com/sendbird/sendbird-uikit-android-sources"
        }}>{`Android open source`}</a></li>
    </ul>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;