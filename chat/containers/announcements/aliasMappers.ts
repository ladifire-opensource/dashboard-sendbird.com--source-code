export const getAnnouncementV10Prop = (announcement: AnnouncementV10, key: keyof AnnouncementV16) => {
  switch (key) {
    case 'message': {
      return { ...announcement.announcement, content: announcement.announcement.message } as AnnouncementV16['message'];
    }

    case 'target_at':
      return announcement.mode;

    case 'target_channel_type':
      return announcement.target_distinct;

    case 'unique_id':
      return announcement.event_id;

    case 'completed_at':
      return announcement.done_at;

    case 'announcement_group':
      return announcement.group;

    case 'create_channel_options':
      return announcement.channel_creation_options;

    default:
      return announcement[key];
  }
};

export const getAnnouncementGroup = (announcement: AnnouncementUnknownVersion, version: AnnouncementVersion) => {
  return {
    'v1.0': (announcement as AnnouncementV10).group,
    'v1.5': (announcement as AnnouncementV15).custom_type,
    'v1.6': (announcement as AnnouncementV16).announcement_group,
  }[version];
};

export const getAnnouncementProp = (
  announcement: AnnouncementUnknownVersion,
  key: keyof AnnouncementV16,
  version: AnnouncementVersion | undefined, // this parameter is meant to be specified but not optional.
) => {
  if (version === 'v1.0') {
    return getAnnouncementV10Prop(announcement as AnnouncementV10, key);
  }
  return key === 'announcement_group' && version ? getAnnouncementGroup(announcement, version) : announcement[key];
};
