import { useRef } from 'react';

export const useAudioNotification = (
  frequency: number,
  duration: number = 0.3,
) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (audioContextRef.current) return audioContextRef.current;
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioContextRef.current;
  };

  const ensureEnabled = async () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return true;
    } catch (err) {
      console.warn('Failed to ensure audio context enabled:', err);
      return false;
    }
  };

  const playSound = async () => {
    try {
      const ctx = getAudioContext();
      console.debug('[useAudioNotification] audio context state before play:', ctx.state);
      if (ctx.state === 'suspended') {
        // try to resume; may fail without user gesture
        try {
          await ctx.resume();
        } catch (err) {
          console.warn('AudioContext.resume() failed:', err);
        }
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  return { playSound, ensureEnabled };
};
