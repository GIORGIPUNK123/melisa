/** Best-effort device vibration. No-op on unsupported browsers (e.g. iOS Safari). */
export const haptic = (pattern: number | number[] = 40) => {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
};

/** Medium “selection” pulse used when a long-press menu opens. */
export const hapticLongPress = () => haptic(45);

/** Light tap when a reaction is chosen. */
export const hapticSelection = () => haptic(12);
