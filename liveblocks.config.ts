import { createRoomContext } from "@liveblocks/react";

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
type Presence = {
  // Example, real-time cursor coordinates
  // cursor: { x: number; y: number };
};

type Storage = {
  // Example, a conflict-free list
  // animals: LiveList<string>;
};

type UserMeta = {
  id: string;
  info: {
    // Example properties, for useSelf, useUser, useOthers, etc.
    // name: string;
    // avatar: string;
  };
};

type RoomEvent = {};
  // Example has two events, using a union
  // | { type: "PLAY" }
  // | { type: "REACTION"; emoji: "🔥" };

type ThreadMetadata = {
  // Example, attaching coordinates to a thread
  // x: number;
  // y: number;
};

type RoomInfo = {
  // Example, rooms with a title and url
  // title: string;
  // url: string;
};

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useSelf,
  useRoom,
  useActiveUsers,
  useReadonlyMyPresence,
  useReadonlyOthers,
  useReadonlySelf,
  useReadonlyRoom,
  useReadonlyActiveUsers,
  useReadonlyStorage,
  useReadonlyMutation,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStatus,
  useLostConnectionListener,
  useDisconnectListener,
  useConnectListener,
  useUser,
  useThreads,
  useCreateThread,
  useEditThreadMetadata,
  useDeleteThread,
  useAddReaction,
  useRemoveReaction,
  useEditComment,
  useDeleteComment,
  useRoomInfo,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata, RoomInfo>(
  {
    async resolveUsers({ userIds }) {
      // Used for fetching user info and avatars in the UI
      // for example, a user's name and avatar url
      return userIds.map((id) => ({
        id,
        info: {
          name: `User ${id}`,
          avatar: `https://liveblocks.io/avatars/avatar-${Math.floor(
            Math.random() * 30
          )}.png`,
        },
      }));
    },
    async resolveRoomInfo({ roomIds }) {
      // Used for fetching room info in the UI
      // for example, a room's title and url
      return roomIds.map((id) => ({
        id,
        info: {
          title: `Room ${id}`,
          url: `/rooms/${id}`,
        },
      }));
    },
  }
);
