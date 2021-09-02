import { useMemo } from 'react';

import { DeskAvatarType } from '@constants';

type HookOptions = {
  /**
   * Agent who sent the message
   */
  agent: AgentSummary | null;
  customer: Customer;
  customerTwitterUser: TwitterUserDetail | null;
  /**
   * Set true if the message is from an agent or an integrated account
   */
  isOwn: boolean;
  /**
   * Integrated Twitter account
   */
  twitterUser: TwitterUser;
};

export const useTwitterMessageSenderInfo = ({
  agent,
  customer,
  customerTwitterUser,
  isOwn,
  twitterUser,
}: HookOptions) => {
  return useMemo(() => {
    if (isOwn) {
      const senderName = twitterUser.name;
      const twitterScreenName = `@${twitterUser.screenName}`;
      return {
        senderName,
        twitterScreenName,
        avatar: {
          type: DeskAvatarType.Agent,
          imageUrl: twitterUser.profileImageUrl || undefined,
          profileID: agent?.email || senderName || twitterScreenName,
        },
      };
    }
    const senderName = customer.displayName;
    const twitterScreenName = customerTwitterUser && `@${customerTwitterUser.screen_name}`;
    return {
      senderName,
      twitterScreenName,
      avatar: {
        type: DeskAvatarType.Customer,
        imageUrl: customer.photoThumbnailUrl || undefined,
        profileID: senderName,
      },
    };
  }, [
    agent,
    customer.displayName,
    customer.photoThumbnailUrl,
    customerTwitterUser,
    isOwn,
    twitterUser.name,
    twitterUser.profileImageUrl,
    twitterUser.screenName,
  ]);
};
