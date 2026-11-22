import type { AccentT, TextSizeT } from '../../store/usePreferencesStore';

export const applyAppearance = (accent: AccentT, textSize: TextSizeT) => {
  const root = document.documentElement;
  root.dataset.accent = accent;
  root.dataset.textSize = textSize;
};
