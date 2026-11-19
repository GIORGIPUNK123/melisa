import { useCallback, useRef } from 'react';
import {
  useSound,
  type LibrarySoundName,
  type SoundOptions,
} from 'react-sounds';

// Keep a stable reference: useSound's `play` depends on this object, so
// recreating it on every render would make `playSound` unstable and cause
// effects that depend on it to re-run (and replay the sound) on every render.
const SOUND_OPTIONS: SoundOptions = { volume: 0.42 };

export const useAudioNotification = (soundName: LibrarySoundName) => {
  const { play, stop, checkPermission } = useSound(soundName, SOUND_OPTIONS);
  const lastPlayAtRef = useRef(0);

  const ensureEnabled = useCallback(async () => {
    try {
      await play({ volume: 0 });
      stop();
      return (await checkPermission()) === 'granted';
    } catch {
      return false;
    }
  }, [checkPermission, play, stop]);

  const playSound = useCallback(async () => {
    const now = Date.now();
    if (now - lastPlayAtRef.current < 400) return;
    lastPlayAtRef.current = now;

    try {
      await play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [play]);

  return { playSound, ensureEnabled };
};
