import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { chatActions } from '@actions';
import { useTypedSelector } from '@hooks';

const useScrollLock = () => {
  const scrollLock = useTypedSelector((state) => state.groupChannels.scrollLock);
  const dispatch = useDispatch();
  const toggleScrollLock = useCallback(
    (value: boolean) => {
      dispatch(chatActions.toggleGroupChannelScrollLock(value));
    },
    [dispatch],
  );
  return [scrollLock, toggleScrollLock] as const;
};

export default useScrollLock;
