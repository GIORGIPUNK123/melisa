import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentT = 'teal' | 'blue' | 'violet' | 'rose';
export type TextSizeT = 'small' | 'default' | 'large';

type PreferencesState = {
  accent: AccentT;
  textSize: TextSizeT;
  setAccent: (accent: AccentT) => void;
  setTextSize: (textSize: TextSizeT) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      accent: 'teal',
      textSize: 'default',
      setAccent: (accent) => set({ accent }),
      setTextSize: (textSize) => set({ textSize }),
    }),
    { name: 'melisa-preferences' },
  ),
);
