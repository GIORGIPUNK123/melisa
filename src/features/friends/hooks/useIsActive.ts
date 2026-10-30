import { usePresenceStore } from '../../../store/usePresenceStore';

export const useIsActive = (targetUserId: string | undefined) => {
  return usePresenceStore((state) =>
    targetUserId ? state.onlineUserIds.has(targetUserId) : false,
  );
};
