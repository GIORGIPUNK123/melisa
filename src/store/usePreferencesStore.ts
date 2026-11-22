import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  savePreferences,
  type PreferencesPatch,
} from '../features/settings/services/preferencesService';

export type AccentT = 'teal' | 'blue' | 'violet' | 'rose';
export type TextSizeT = 'small' | 'default' | 'large';

type PreferencesState = {
  accent: AccentT;
  textSize: TextSizeT;
  notificationSoundsMuted: boolean;
  userId?: string;
  setAccent: (accent: AccentT) => void;
  setTextSize: (textSize: TextSizeT) => void;
  setNotificationSoundsMuted: (muted: boolean) => void;
  setUserId: (userId?: string) => void;
  hydrateFromServer: (patch: PreferencesPatch) => void;
};

const SAVE_DELAY = 500;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pending: PreferencesPatch = {};

/** Writes any queued changes immediately. Safe to call when nothing is queued. */
export const flushPreferences = () => {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;

  const patch = pending;
  pending = {};
  const { userId } = usePreferencesStore.getState();
  if (userId && Object.keys(patch).length > 0) {
    void savePreferences(userId, patch);
  }
};

const scheduleSave = (patch: PreferencesPatch) => {
  pending = { ...pending, ...patch };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushPreferences, SAVE_DELAY);
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      accent: 'teal',
      textSize: 'default',
      notificationSoundsMuted: false,
      userId: undefined,

      setAccent: (accent) => {
        set({ accent });
        scheduleSave({ accent });
      },
      setTextSize: (textSize) => {
        set({ textSize });
        scheduleSave({ textSize });
      },
      setNotificationSoundsMuted: (notificationSoundsMuted) => {
        set({ notificationSoundsMuted });
        scheduleSave({ notificationSoundsMuted });
      },

      setUserId: (userId) => set({ userId }),

      hydrateFromServer: (patch) => {
        // Server values win after login; discard anything still queued locally.
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = null;
        pending = {};
        set(patch);
      },
    }),
    {
      name: 'melisa-preferences',
      partialize: (state) => ({
        accent: state.accent,
        textSize: state.textSize,
        notificationSoundsMuted: state.notificationSoundsMuted,
      }),
    },
  ),
);
