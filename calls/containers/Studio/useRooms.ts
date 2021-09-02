import { useEffect, useState } from 'react';

import { createRoom, fetchRoom } from '@calls/api';
import { Room, RoomType } from '@calls/api/types';
import { useAppId, useAsync } from '@hooks';
import { ClientStorage } from '@utils';

const MAX_ROOMS = 10;

const getRoomIds = (appId: string): string[] => ClientStorage.getObject('callsStudioRooms')?.[appId] ?? [];

const setRoomIds = (appId: string, roomIds: string[]) =>
  ClientStorage.upsertObject('callsStudioRooms', { [appId]: roomIds });

const loadRooms = async (appId: string): Promise<Room[]> => {
  const roomIds = getRoomIds(appId);

  if (roomIds.length === 0) {
    return [];
  }
  const responses = await Promise.all(roomIds.map((roomId) => fetchRoom(appId, roomId)));

  return responses.map((response) => response.data.room);
};

const useRooms = () => {
  const appId = useAppId();
  const [rooms, setRooms] = useState<Room[]>();
  const [loadState, load] = useAsync(() => loadRooms(appId), [appId]);
  const [createState, create] = useAsync((type: RoomType) => createRoom(appId, { type }), [appId]);

  const { status: loadStatus, data: loadResponse, error: loadError } = loadState;
  const { status: createStatus, data: createResponse, error: createError } = createState;

  const add = (room: Room) => {
    setRooms((rooms = []) => [...rooms, room]);
  };

  const remove = (id: string) => {
    setRooms((rooms = []) => rooms.filter((room) => room.room_id !== id));
  };

  useEffect(() => {
    if (loadResponse) {
      setRooms(loadResponse);
    }
  }, [loadResponse]);

  useEffect(() => {
    if (createResponse) {
      const created = createResponse.data.room;
      add(created);
    }
  }, [appId, createResponse]);

  useEffect(() => {
    if (rooms) {
      const roomIds = rooms.map((room) => room.room_id);
      setRoomIds(appId, roomIds);
    }
  }, [appId, rooms]);

  const isLoading = loadStatus === 'loading';
  const isCreating = createStatus === 'loading';
  const canAdd = !rooms || rooms.length < MAX_ROOMS;

  return { rooms, isLoading, isCreating, canAdd, create, add, remove, load, loadError, createError };
};

export default useRooms;
