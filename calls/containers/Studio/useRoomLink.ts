import { useEffect } from 'react';

import { isProduction } from '@constants';
import { useAsync } from '@hooks';

import useAuthData from './useAuthData';

const sampleLink = isProduction ? 'https://sample.calls.sendbird.com' : 'https://sample.calls-stg.sendbirdtest.com';

const useRoomLink = ({ user, roomId }: { user?: SDKUser; roomId: string }) => {
  const generate = useAuthData();
  const [{ data }, load] = useAsync(async (user?: SDKUser) => (user ? generate(user, roomId) : undefined), [
    generate,
    roomId,
  ]);

  useEffect(() => {
    load(user);
  }, [load, user]);

  const link = data ? `${sampleLink}/group-call/full-screen?q=${data}` : undefined;

  return link;
};

export default useRoomLink;
