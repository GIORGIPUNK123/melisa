export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export const isUserOnline = (
  lastSeenAt?: string | null,
  appearOffline?: boolean,
  nowMs: number = Date.now(),
) => {
  if (appearOffline || !lastSeenAt) return false;

  const lastSeenMs = new Date(lastSeenAt).getTime();
  if (Number.isNaN(lastSeenMs)) return false;

  return nowMs - lastSeenMs <= ONLINE_WINDOW_MS;
};
