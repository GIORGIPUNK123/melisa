import { useEffect } from 'react';
import {
  flushPreferences,
  usePreferencesStore,
} from '../../../store/usePreferencesStore';
import {
  loadPreferences,
  savePreferences,
} from '../services/preferencesService';

/**
 * Hydrates appearance/sound preferences from Supabase once per session.
 * Local changes stay optimistic and are written back with a short debounce.
 */
export const usePreferencesSync = (userId?: string) => {
  useEffect(() => {
    // Save anything queued for the previous account before switching users.
    flushPreferences();
    usePreferencesStore.getState().setUserId(userId);
    if (!userId) return;

    let cancelled = false;
    const hydrate = async () => {
      const remote = await loadPreferences(userId);
      if (cancelled) return;

      if (remote) {
        usePreferencesStore.getState().hydrateFromServer(remote);
        return;
      }

      // First sign-in on this account: seed the row from local values.
      const { accent, textSize, notificationSoundsMuted } =
        usePreferencesStore.getState();
      await savePreferences(userId, {
        accent,
        textSize,
        notificationSoundsMuted,
      });
    };
    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const flushOnHide = () => {
      if (document.visibilityState === 'hidden') flushPreferences();
    };
    document.addEventListener('visibilitychange', flushOnHide);
    window.addEventListener('pagehide', flushPreferences);

    return () => {
      document.removeEventListener('visibilitychange', flushOnHide);
      window.removeEventListener('pagehide', flushPreferences);
    };
  }, []);
};
