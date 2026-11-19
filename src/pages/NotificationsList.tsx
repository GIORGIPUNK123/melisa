import { useState } from 'react';
import {
  IconCheck,
  IconInfo,
  IconMessage,
  IconSettings,
  IconUsers,
} from '../atoms/Icon';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNotificationStore } from '../store/useNotificationStore';
import type { NotificationT } from '../types';
import { NotificationDetailModal } from '../features/notifications/components/NotificationDetailModal';
import { formatConversationTime } from '../shared/utils/dates';

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

const NotificationRow = (props: {
  notification: NotificationT;
  onRead: () => void;
  onOpen: () => void;
}) => {
  const { notification } = props;
  const TypeIcon = typeIcon(notification.type);

  return (
    <div
      onClick={props.onOpen}
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-tight px-3 py-3 transition-colors hover:bg-primary-soft ${
        notification.is_read ? '' : 'bg-primary-soft'
      }`}
    >
      <div className='flex gap-3 items-start min-w-0'>
        <div
          className={`mt-0.5 bg-primary-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-card text-primary`}
        >
          <TypeIcon size={18} />
        </div>
        <div className='flex flex-col min-w-0'>
          <div className='flex gap-2 items-center'>
            <span className='text-sm font-semibold text-foreground truncate'>
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
            )}
          </div>
          <span className='mt-1 text-[11px] text-muted'>
            {formatConversationTime(notification.created_at, new Date())}
          </span>
        </div>
      </div>

      {!notification.is_read && (
        <button
          type='button'
          title='Mark as read'
          aria-label='Mark notification as read'
          onClick={(event) => {
            event.stopPropagation();
            props.onRead();
          }}
          className='focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-hover hover:text-primary'
        >
          <IconCheck size={15} />
        </button>
      )}
    </div>
  );
};

export const NotificationsList = () => {
  const { user } = useAuth();
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const [selected, setSelected] = useState<NotificationT | null>(null);
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const selectedNotification = selected
    ? (notifications.find((notification) => notification.id === selected.id) ??
      selected)
    : null;

  if (notifications.length === 0) {
    return (
      <p className='px-3 py-10 text-center text-xs text-subtle'>
        You are up to date.
      </p>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center px-3 mb-2'>
        <span className='text-xs font-bold text-subtle'>
          {unreadCount > 0 ? `${unreadCount} UNREAD` : 'RECENT'}
        </span>
        {unreadCount > 0 && (
          <button
            type='button'
            onClick={() => {
              if (user?.id) void markAllAsRead(user.id);
            }}
            className='focus-ring text-[11px] font-medium text-primary transition hover:text-primary-strong'
          >
            Mark all read
          </button>
        )}
      </div>
      <div className='space-y-0.5'>
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onRead={() => void markAsRead(notification.id)}
            onOpen={() => {
              if (!notification.is_read) void markAsRead(notification.id);
              setSelected(notification);
            }}
          />
        ))}
      </div>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelected(null)}
        onMarkAsRead={(id) => void markAsRead(id)}
      />
    </div>
  );
};
