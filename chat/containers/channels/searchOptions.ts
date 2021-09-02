import { OpenChannelSearchOperator, GroupChannelSearchOperator } from '@constants';

export const openChannelSearchOptions: ChannelSearchOption<'open_channels'>[] = [
  {
    label: 'name',
    suffix: ' (contains)',
    key: OpenChannelSearchOperator.nameContains,
    description: 'Channel Name',
  },
  {
    label: 'url',
    suffix: ' (equals)',
    key: OpenChannelSearchOperator.urlEquals,
    description: 'Channel URL',
  },
  {
    label: 'custom_type',
    suffix: ' (equals)',
    key: OpenChannelSearchOperator.customTypeEquals,
    description: 'Custom Type',
  },
];

export const groupChannelSearchOptions: ChannelSearchOption<'group_channels'>[] = [
  {
    label: 'nickname',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.nicknameEquals,
    description: 'User Nickname',
  },
  {
    label: 'user_id',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.userIdEquals,
    description: 'User ID',
  },
  {
    label: 'url',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.urlEquals,
    description: 'Channel URL',
  },
  {
    label: 'custom_type',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.customTypeEquals,
    description: 'Custom Type',
  },
  {
    label: 'name',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.nameEquals,
    description: 'Channel Name',
  },
  {
    label: 'name',
    suffix: ' (startswith)',
    key: GroupChannelSearchOperator.nameStartswith,
    description: 'Channel Name',
  },
  {
    label: 'members_include_in',
    suffix: ' (equals)',
    key: GroupChannelSearchOperator.membersIncludeIn,
    description: 'Comma Separated User IDs',
  },
];
