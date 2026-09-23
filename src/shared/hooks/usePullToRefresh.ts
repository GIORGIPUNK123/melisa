import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 72;
const PULL_MAX = 110;
const HELD_OFFSET = 64;
const MIN_REFRESH_MS = 520;

export const usePullToRefresh = (options: {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}) => {
  const enabled = options.enabled !== false;
  const onRefreshRef = useRef(options.onRefresh);
  onRefreshRef.current = options.onRefresh;

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const setPull = (value: number) => {
    pullRef.current = value;
    setPullDistance(value);
  };

  const finishPull = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    const distance = pullRef.current;

    if (distance < PULL_THRESHOLD || refreshingRef.current) {
      setPull(0);
      return;
    }

    setPull(HELD_OFFSET);
    refreshingRef.current = true;
    setRefreshing(true);
    const started = Date.now();
    try {
      await onRefreshRef.current();
    } finally {
      const remaining = MIN_REFRESH_MS - (Date.now() - started);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      refreshingRef.current = false;
      setRefreshing(false);
      setPull(0);
    }
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) return;

    const onTouchStart = (event: TouchEvent) => {
      if (refreshingRef.current) return;
      if (node.scrollTop > 0) return;
      startY.current = event.touches[0]?.clientY ?? 0;
      pulling.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pulling.current || refreshingRef.current) return;
      if (node.scrollTop > 0) {
        pulling.current = false;
        setPull(0);
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = currentY - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }

      const distance = Math.min(delta * 0.45, PULL_MAX);
      setPull(distance);
      if (distance > 8) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      void finishPull();
    };

    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    node.addEventListener('touchcancel', onTouchEnd);

    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, finishPull]);

  return {
    containerRef,
    pullDistance,
    refreshing,
    readyToRefresh: pullDistance >= PULL_THRESHOLD,
  };
};
