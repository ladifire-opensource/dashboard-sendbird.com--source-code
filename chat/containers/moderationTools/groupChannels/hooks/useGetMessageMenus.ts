import { useCallback } from 'react';

import { useTypedSelector } from '@hooks';
import { MessageType } from '@utils';

import { BaseMessageType, MessageMenuType } from '../../message/baseMessage';

const defaultMessageMenus = [MessageMenuType.edit, MessageMenuType.delete, MessageMenuType.copyUrl];

/**
 * @returns a function that returns the array of menus to show for the given message.
 */
const useGetMessageMenus = () => {
  const isModeratorInfoInAdminMessage = useTypedSelector((state) => state.settings.isModeratorInfoInAdminMessage);

  return useCallback(
    ({ type, data }: Pick<BaseMessageType, 'type' | 'data'>): MessageMenuType[] => {
      if (type === MessageType.admin && isModeratorInfoInAdminMessage && !!data) {
        return [MessageMenuType.showDataInformation, ...defaultMessageMenus];
      }
      return defaultMessageMenus;
    },
    [isModeratorInfoInAdminMessage],
  );
};

export default useGetMessageMenus;
