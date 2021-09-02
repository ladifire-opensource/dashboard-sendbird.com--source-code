export const isOpenChannel = (channel: Channel): channel is OpenChannel => {
  return typeof (channel as OpenChannel).participant_count === 'number';
};

export const isGroupChannel = (channel: Channel): channel is GroupChannel => {
  return typeof (channel as GroupChannel).member_count === 'number';
};
