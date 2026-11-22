import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'pulling' | 'ready' | 'refreshing';

const MAX_PULL = 90;
const THRESHOLD = 64;
const REFRESH_HOLD = 44;

// Rubber band: the farther you pull, the more resistance you feel.
const damp = (distance: number) =>
  MAX_PULL * (1 - Math.exp(-distance / 180));

export type PullToRefreshHandle = {
  refresh: () => Promise<void>;
};

type Props = {
  onRefresh: () => Promise<void>;
  onRefreshingChange?: (refreshing: boolean) => void;
  enabled?: boolean;
  className?: string;
  children: ReactNode;
};

export const PullToRefresh = forwardRef<PullToRefreshHandle, Props>(
  function PullToRefresh(
    { onRefresh, onRefreshingChange, enabled = true, className = '', children },
    ref,
  ) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    const [phase, setPhase] = useState<Phase>('idle');
    const phaseRef = useRef<Phase>('idle');
    const pullRef = useRef(0);
    const startYRef = useRef<number | null>(null);
    const startXRef = useRef(0);
    const crossedRef = useRef(false);
    const refreshingRef = useRef(false);

    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;
    const onRefreshingChangeRef = useRef(onRefreshingChange);
    onRefreshingChangeRef.current = onRefreshingChange;

    const setPhaseBoth = useCallback((next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
    }, []);

    // Only the moving parts are updated during a touch frame. React state is
    // reserved for phase changes, which keeps the drag at full frame rate.
    const paintIndicator = useCallback((value: number) => {
      const indicator = indicatorRef.current;
      if (indicator) {
        const progress = Math.min(value / MAX_PULL, 1);
        indicator.style.opacity = String(Math.min(1, value / 30));
        indicator.style.transform = `translateY(${value * 0.22}px) scale(${0.92 + progress * 0.08})`;
      }
      const icon = iconRef.current;
      if (icon && phaseRef.current !== 'refreshing') {
        icon.style.transform = `rotate(${value * 3}deg)`;
      }
    }, []);

    const moveTo = useCallback(
      (value: number, animate: boolean) => {
        pullRef.current = value;
        const content = contentRef.current;
        if (content) {
          content.style.transition = animate
            ? 'transform 280ms cubic-bezier(.22, 1, .36, 1)'
            : 'none';
          content.style.transform = `translate3d(0, ${value}px, 0)`;
        }
        paintIndicator(value);
      },
      [paintIndicator],
    );

    const reset = useCallback(() => {
      setPhaseBoth('idle');
      crossedRef.current = false;
      moveTo(0, true);
    }, [setPhaseBoth, moveTo]);

    const startRefresh = useCallback(async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      setPhaseBoth('refreshing');
      if (iconRef.current) iconRef.current.style.transform = '';
      onRefreshingChangeRef.current?.(true);
      moveTo(REFRESH_HOLD, true);

      try {
        await onRefreshRef.current();
      } finally {
        refreshingRef.current = false;
        onRefreshingChangeRef.current?.(false);
        setPhaseBoth('idle');
        crossedRef.current = false;
        moveTo(0, true);
      }
    }, [setPhaseBoth, moveTo]);

    useImperativeHandle(ref, () => ({ refresh: startRefresh }), [startRefresh]);

    useEffect(() => {
      const node = scrollRef.current;
      if (!node || !enabled) return;

      const onTouchStart = (event: TouchEvent) => {
        if (refreshingRef.current || event.touches.length !== 1) return;
        if (node.scrollTop > 0) {
          startYRef.current = null;
          return;
        }
        startYRef.current = event.touches[0].clientY;
        startXRef.current = event.touches[0].clientX;
      };

      const onTouchMove = (event: TouchEvent) => {
        if (
          startYRef.current === null ||
          refreshingRef.current ||
          event.touches.length !== 1
        ) {
          return;
        }

        const delta = event.touches[0].clientY - startYRef.current;
        const horizontal = Math.abs(event.touches[0].clientX - startXRef.current);

        // Leave horizontal swipes (including the iOS back gesture) alone.
        if (horizontal > Math.max(delta, 8)) {
          if (pullRef.current > 0) reset();
          startYRef.current = null;
          return;
        }

        if (delta <= 0) {
          if (pullRef.current > 0) reset();
          startYRef.current = null;
          return;
        }

        // Claim the gesture so the browser's own pull-to-refresh cannot take
        // over mid-drag.
        event.preventDefault();

        const pull = damp(delta);
        const ready = pull >= THRESHOLD;
        if (ready !== crossedRef.current) {
          crossedRef.current = ready;
          if (ready) navigator.vibrate?.(10);
        }
        if (phaseRef.current !== (ready ? 'ready' : 'pulling')) {
          setPhaseBoth(ready ? 'ready' : 'pulling');
        }
        moveTo(pull, false);
      };

      const onTouchEnd = () => {
        if (startYRef.current === null) return;
        startYRef.current = null;
        if (phaseRef.current === 'ready') {
          void startRefresh();
        } else {
          reset();
        }
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
    }, [enabled, moveTo, reset, setPhaseBoth, startRefresh]);

    const label =
      phase === 'refreshing'
        ? 'Refreshing…'
        : phase === 'ready'
          ? 'Release to refresh'
          : 'Pull to refresh';

    return (
      <div className={`relative min-h-0 ${className}`}>
        <div className='pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center'>
          <div
            ref={indicatorRef}
            className='flex items-center gap-2 rounded-full border border-solid border-border-strong bg-panel-raised/95 px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-lg shadow-background/30 backdrop-blur'
            style={{ opacity: 0 }}
          >
            <div
              ref={iconRef}
              className={`flex h-4 w-4 items-center justify-center text-primary ${
                phase === 'refreshing' ? 'refresh-spin' : ''
              }`}
            >
              <RefreshCw size={15} strokeWidth={2.5} />
            </div>
            <span>{label}</span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className='absolute inset-0 overflow-y-auto overscroll-y-contain'
        >
          <div
            ref={contentRef}
            className='min-h-full pb-4 will-change-transform'
            onTransitionEnd={(event) => {
              if (event.propertyName === 'transform' && contentRef.current) {
                contentRef.current.style.transition = 'none';
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
