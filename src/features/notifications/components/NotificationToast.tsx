import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAudioNotification } from '../hooks/useAudioNotification';
import { IconInfo, IconUsers, IconX } from '../../../atoms/Icon';

export const NotificationToast = () => {
  const toast = useNotificationStore((state) => state.toast);
  const dismissToast = useNotificationStore((state) => state.dismissToast);
  const { playSound } = useAudioNotification('notification/notification');
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    void playSound();
    const timer = window.setTimeout(dismissToast, 4500);
    return () => window.clearTimeout(timer);
  }, [toast?.id, playSound, dismissToast]);

  if (!toast) return null;

  const ToastIcon = toast.type === 'friend_request' ? IconUsers : IconInfo;

  return (
    <div
      role='status'
      className='fixed bottom-20 right-4 z-[70] w-[min(360px,calc(100vw-2rem))] rounded-card border border-primary/30 bg-panel p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] xl:bottom-5'
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary'>
          <ToastIcon size={16} />
        </div>
        <button
          type='button'
          className='focus-ring min-w-0 flex-1 text-left'
          onClick={() => {
            if (toast.link) navigate(toast.link);
            dismissToast();
          }}
        >
          <p className='truncate text-sm font-semibold text-foreground'>
            {toast.title}
          </p>
          <p className='mt-0.5 line-clamp-2 text-xs leading-5 text-muted'>
            {toast.message}
          </p>
        </button>
        <button
          type='button'
          aria-label='Dismiss notification'
          onClick={dismissToast}
          className='focus-ring flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-subtle transition hover:bg-surface-hover hover:text-foreground'
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
};
