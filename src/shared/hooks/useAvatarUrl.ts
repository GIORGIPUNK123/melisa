import { useEffect, useState } from 'react';
import {
  AVATAR_SIGNED_URL_TTL,
  getCachedAvatarUrl,
  isAvatarStoragePath,
  resolveAvatarUrl,
  subscribeToAvatarUpdates,
} from '../utils/avatars';

const initialUrl = (source?: string | null): string | null => {
  const value = source?.trim();
  if (!value) return null;
  return getCachedAvatarUrl(value) ?? (isAvatarStoragePath(value) ? null : value);
};

export const useAvatarUrl = (source?: string | null): string | null => {
  const [state, setState] = useState<{
    source?: string | null;
    url: string | null;
  }>(() => ({ source, url: initialUrl(source) }));

  useEffect(() => {
    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const next = await resolveAvatarUrl(source);
        if (active) setState({ source, url: next });
      } catch {
        if (active) setState({ source, url: null });
      }
    };

    void load();

    const unsubscribe = subscribeToAvatarUpdates((updatedPath) => {
      if (updatedPath === source?.trim()) void load();
    });

    if (isAvatarStoragePath(source)) {
      refreshTimer = setTimeout(
        () => void load(),
        (AVATAR_SIGNED_URL_TTL - 60) * 1000,
      );
    }

    return () => {
      active = false;
      unsubscribe();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [source]);

  if (state.source !== source) return initialUrl(source);
  return state.url;
};
