export type SelectFieldDescription<T> = { key: T; labelIntlKey: string; descriptionIntlKey: string };

export const pageSize = 20;
export const ALL_STATUS = 'ALL_STATUS';
// This object contains intl message keys for tooltips and dropdowns.
export const targetAtDescriptionsWithIntlKeys: SelectFieldDescription<
  AnnouncementV10['mode'] | AnnouncementPropsFromV15['target_at']
>[] = [
  {
    key: 'sender_all_channels',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.senderAllChannels',
    descriptionIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.senderAllChannelsDescription',
  },
  {
    key: 'target_channels',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetChannels',
    descriptionIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetChannelsDescription',
  },
  {
    key: 'target_users_included_channels',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersIncludedChannels',
    descriptionIntlKey:
      'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersIncludedChannelsDescription',
  },
  {
    key: 'target_users_only_channels',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersOnlyChannels',
    descriptionIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersOnlyChannelsDescription',
  },
  {
    key: 'my_channels',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.senderAllChannels',
    descriptionIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.senderAllChannelsDescription',
  },
  {
    key: 'target_users_include_in',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersIncludedChannels',
    descriptionIntlKey:
      'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersIncludedChannelsDescription',
  },
  {
    key: 'target_users_exactly_in',
    labelIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersOnlyChannels',
    descriptionIntlKey: 'chat.announcements.createAnnouncement.fields.targetAt_lbl.targetUsersOnlyChannelsDescription',
  },
];

// This object contains intl message keys for tooltips and dropdowns.
export const targetChannelTypeDescriptionsWithIntlKeys: SelectFieldDescription<
  CreateAnnouncementAPIPayloadV15['target_channel_type']
>[] = [
  {
    key: 'distinct',
    labelIntlKey: 'chat.announcements.targetChannelType.distinct',
    descriptionIntlKey: 'chat.announcements.targetChannelType.distinctDescription',
  },
  {
    key: 'non_distinct',
    labelIntlKey: 'chat.announcements.targetChannelType.nonDistinct',
    descriptionIntlKey: 'chat.announcements.targetChannelType.nonDistinctDescription',
  },
  {
    key: 'all',
    labelIntlKey: 'chat.announcements.targetChannelType.all',
    descriptionIntlKey: 'chat.announcements.targetChannelType.allDescription',
  },
];
