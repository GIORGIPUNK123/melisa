import { useEffect, useState } from 'react';

export const useNotificationSound = (
  notificationsCount: number,
  playSound: () => void,
) => {
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    if (
      notificationsCount > lastNotificationCount &&
      lastNotificationCount > 0
    ) {
      playSound();
    }
    setLastNotificationCount(notificationsCount);
  }, [notificationsCount, lastNotificationCount, playSound]);

  return { lastNotificationCount };
};
