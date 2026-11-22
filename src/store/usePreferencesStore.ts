import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentT = 'teal' | 'blue' | 'violet' | 'rose';
export type TextSizeT = 'small' | 'default' | 'large';

type PreferencesState = {
  accent: AccentT;
  textSize: TextSizeT;
  notificationSoundsMuted: boolean;
  setAccent: (accent: AccentT) => void;
  setTextSize: (textSize: TextSizeT) => void;
  setNotificationSoundsMuted: (muted: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      accent: 'teal',
      textSize: 'default',
      notificationSoundsMuted: false,
      setAccent: (accent) => set({ accent }),
      setTextSize: (textSize) => set({ textSize }),
      setNotificationSoundsMuted: (notificationSoundsMuted) =>
        set({ notificationSoundsMuted }),
    }),
    { name: 'melisa-preferences' },
  ),
);
