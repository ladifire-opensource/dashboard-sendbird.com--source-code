import { FC } from 'react';

import { Tag, TagProps } from 'feather';

import { useAnnouncementVersion } from './useAnnouncementVersion';

type Props = Omit<TagProps, 'children'>;

export const VersionTag: FC<Props> = (props) => {
  const announcementVersion = useAnnouncementVersion();

  // remove 'v' from the version string literal values.
  return (
    <Tag
      css={`
        // override display: inline-flex
        display: flex;
      `}
      {...props}
    >
      V {announcementVersion?.slice(1)}
    </Tag>
  );
};
