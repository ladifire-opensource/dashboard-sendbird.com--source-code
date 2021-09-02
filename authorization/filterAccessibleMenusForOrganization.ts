import { Page } from '@constants';
import { LNBMenu } from '@core/containers/app/useLNBItems';

export const filterAccessibleMenusForOrganization = (uid: string): ((menu: LNBMenu) => boolean) => {
  if (process.env.NODE_ENV === 'development' || process.env.BUILD_MODE === 'staging') {
    return () => true;
  }

  /**
   * @org 59381ffd6e8f605be5d9ff6f8286394d8d3fd79e: KB Liiv Talk
   * Remove open_channels, group_channels, messages
   */
  if (uid === '59381ffd6e8f605be5d9ff6f8286394d8d3fd79e') {
    const hiddenMenus: LNBMenu[] = [Page.openChannels, Page.groupChannels, 'messages'];
    return (v) => !hiddenMenus.includes(v);
  }

  return () => true;
};
