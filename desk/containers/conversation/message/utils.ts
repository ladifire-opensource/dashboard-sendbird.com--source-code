import SendBird from 'sendbird';

export const getMessageThumbnail = (thumbnails: SendBird.FileMessage['thumbnails']) => {
  if (thumbnails.length === 0) {
    return undefined;
  }

  /**
   * The length of @param message.thumbnails can be varied, and we cannot anticipate which one in the array has proper size.
   * Therefore, if its length is less than two, we will use the last one, which has the biggest size.
   *
   * If its length is greater than 2, event though we have max size limit on media components,
   * we want to use more suitable size than max size.
   * Therefore, we will use one before last which may have more chance to store right size for the screen.
   */
  return thumbnails.length > 2 ? thumbnails[thumbnails.length - 2] : thumbnails[thumbnails.length - 1];
};
