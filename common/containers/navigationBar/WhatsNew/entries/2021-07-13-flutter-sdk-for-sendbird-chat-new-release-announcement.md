
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsxRuntime classic */
/* @jsx mdx */

export const frontMatter = {
  category: 'UPDATES',
  title: 'Flutter SDK for Sendbird Chat new release announcement',
  date: new Date('2021-07-09T00:00:00.000Z')
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

    <p><strong parentName="p">{`Community Announcement:`}</strong></p>
    <p>{`Sendbird is happy to announce our latest release of our `}<a parentName="p" {...{
        "href": "https://sendbird.com/docs/chat/v3/flutter/getting-started/about-chat-sdk?&tum_source=community&utm_medium=referral&utm_campaign=flutter&utm_content=flutter_null_safety_announcement"
      }}>{`Chat Flutter SDK`}</a>{`, available at `}<a parentName="p" {...{
        "href": "https://github.com/sendbird/sendbird-sdk-flutter"
      }}>{`this repo`}</a>{` or through this `}<a parentName="p" {...{
        "href": "https://pub.dev/packages/sendbird_sdk"
      }}>{`pub.dev entry`}</a>{`. It is now `}<a parentName="p" {...{
        "href": "https://dart.dev/null-safety"
      }}>{`null safety`}</a>{` compliant, a feature that makes catching null dereferencing errors during edit and compile time possible and is recommended to create more robust applications.`}</p>
    <p>{`With this update there are a few breaking changes for a few constructors listed in `}<a parentName="p" {...{
        "href": "https://github.com/sendbird/sendbird-sdk-flutter/blob/master/CHANGELOG.md"
      }}>{`this doc`}</a>{`.`}</p>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;