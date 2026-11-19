import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { NotificationT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';
import {
  IconInfo,
  IconMessage,
  IconSettings,
  IconUsers,
  IconX,
} from '../../../atoms/Icon';

const typeIcon = (type: string) => {
  switch (type) {
    case 'friend_request':
      return IconUsers;
    case 'message':
      return IconMessage;
    case 'system':
      return IconSettings;
    default:
      return IconInfo;
  }
};

export const NotificationDetailModal = (props: {
  notification: NotificationT | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}) => {
  const { notification, onClose, onMarkAsRead } = props;
  const navigate = useNavigate();

  useEffect(() => {
    if (!notification) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [notification, onClose]);

  if (!notification) return null;

  const TypeIcon = typeIcon(notification.type);
  const ctaLabel =
    notification.type === 'friend_request' ? 'View requests' : 'Open';
  console.log('notification link: ', notification.link);
  return (
    <div
      className='flex fixed inset-0 justify-center items-end backdrop-blur-sm z-60 bg-background/70 sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, onClose)}
    >
      <div className='w-full max-w-md overflow-hidden rounded-t-card border border-border-strong bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:rounded-card'>
        <div className='flex gap-3 justify-between items-center px-4 py-3 border-b border-border'>
          <div className='flex gap-3 items-center min-w-0'>
            <div
              className={` flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                notification.is_read
                  ? 'bg-surface text-subtle'
                  : 'bg-primary-soft text-primary'
              }`}
            >
              <TypeIcon size={16} />
            </div>
            <h2 className='truncate text-[16px] font-semibold tracking-tight text-foreground'>
              {notification.title}
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close'
            className='flex justify-center items-center w-8 h-8 rounded-lg transition cursor-pointer shrink-0 focus-ring text-muted hover:bg-surface-hover hover:text-foreground'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='px-4 py-4'>
          <p className='text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
            {notification.message || 'No additional details.'}
          </p>
          <div className='flex gap-3 justify-between items-center mt-4'>
            <p className='text-[11px] text-subtle'>
              {new Date(notification.created_at).toLocaleString()}
            </p>
            {!notification.is_read && (
              <span className='rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary'>
                Unread
              </span>
            )}
          </div>
        </div>

        {(notification.link || !notification.is_read) && (
          <div className='flex gap-2 justify-end items-center px-4 py-3 border-t border-border'>
            {!notification.is_read && (
              <button
                type='button'
                onClick={() => onMarkAsRead(notification.id)}
                className='px-3 py-2 text-xs font-medium rounded-xl border transition cursor-pointer focus-ring border-border-strong text-muted-foreground hover:bg-surface-hover hover:text-foreground'
              >
                Mark as read
              </button>
            )}
            {notification.link && (
              <button
                type='button'
                onClick={() => {
                  if (!notification.is_read) onMarkAsRead(notification.id);
                  navigate(notification.link!);
                  onClose();
                }}
                className='focus-ring cursor-pointer rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-background transition hover:bg-primary-strong'
              >
                {ctaLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
