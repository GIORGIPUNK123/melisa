import { useCallback, useEffect, useRef } from 'react';
import { useSound, type LibrarySoundName } from 'react-sounds';

export const useAudioNotification = (soundName: LibrarySoundName) => {
  const { play, stop, checkPermission } = useSound(soundName, {
    volume: 0.42,
  });
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

  useEffect(() => {
    const unlock = () => {
      void ensureEnabled();
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [ensureEnabled]);

  return { playSound, ensureEnabled };
};
