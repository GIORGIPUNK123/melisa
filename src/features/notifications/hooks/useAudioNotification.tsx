import { useCallback, useEffect, useRef } from 'react';

type ChimeNote = {
  freq: number;
  start: number;
  duration: number;
  gain: number;
};

const createChimeUrl = (baseFrequency: number) => {
  const sampleRate = 44100;
  const totalDuration = 0.32;
  const sampleCount = Math.max(1, Math.floor(sampleRate * totalDuration));
  const bytes = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(bytes);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  const notes: ChimeNote[] = [
    { freq: baseFrequency, start: 0, duration: 0.16, gain: 0.16 },
    { freq: baseFrequency * 1.26, start: 0.07, duration: 0.22, gain: 0.14 },
  ];

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    let sample = 0;

    for (const note of notes) {
      if (t < note.start || t >= note.start + note.duration) continue;

      const localT = t - note.start;
      const attack = Math.min(1, localT / 0.01);
      const release = Math.min(1, (note.duration - localT) / 0.09);
      const envelope = attack * release * attack;
      sample += Math.sin(2 * Math.PI * note.freq * localT) * envelope * note.gain;
      sample +=
        Math.sin(2 * Math.PI * note.freq * 2 * localT) *
        envelope *
        note.gain *
        0.06;
    }

    view.setInt16(44 + i * 2, Math.tanh(sample) * 0x7fff, true);
  }

  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
};

export const useAudioNotification = (
  frequency: number,
  _duration: number = 0.3,
) => {
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getBeepUrl = useCallback(() => {
    if (!urlRef.current) {
      urlRef.current = createChimeUrl(frequency);
    }
    return urlRef.current;
  }, [frequency]);

  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(getBeepUrl());
      audio.preload = 'auto';
      audio.volume = 0.42;
      audio.setAttribute('playsinline', 'true');
      audio.style.position = 'fixed';
      audio.style.left = '-1000px';
      audio.style.width = '0';
      audio.style.height = '0';
      document.body.appendChild(audio);
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [getBeepUrl]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playOscillator = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const start = ctx.currentTime;
    const notes = [
      { freq: frequency, at: 0, dur: 0.16, gain: 0.12 },
      { freq: frequency * 1.26, at: 0.07, dur: 0.22, gain: 0.1 },
    ];

    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = note.freq;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const noteStart = start + note.at;
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(note.gain, noteStart + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + note.dur,
      );

      oscillator.start(noteStart);
      oscillator.stop(noteStart + note.dur);
    }
  }, [frequency, getAudioContext]);

  const ensureEnabled = useCallback(async () => {
    try {
      const audio = getAudioElement();
      audio.muted = true;
      audio.currentTime = 0;
      await audio.play();
      audio.pause();
      audio.muted = false;
      audio.currentTime = 0;
    } catch {
      // Ignore unlock failures; the next user gesture retries.
    }

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }, [getAudioContext, getAudioElement]);

  const lastPlayAtRef = useRef(0);

  const playSound = useCallback(async () => {
    const now = Date.now();
    if (now - lastPlayAtRef.current < 400) return;
    lastPlayAtRef.current = now;

    try {
      const audio = getAudioElement();
      audio.muted = false;
      audio.volume = 0.42;
      audio.currentTime = 0;
      await audio.play();
      return;
    } catch {
      // Fall through to Web Audio if HTMLAudio is still blocked.
    }

    try {
      await playOscillator();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [getAudioElement, playOscillator]);

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [frequency]);

  return { playSound, ensureEnabled };
};
