import { NotificationT } from '../../../types';
import {
  IconCheck,
  IconInfo,
  IconMessage,
  IconSettings,
  IconUsers,
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

export const NotificationList = (props: {
  notifications: NotificationT[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: NotificationT) => void;
}) => {
  const unreadCount = props.notifications.filter((n) => !n.is_read).length;

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5'>
        <div className='min-w-0'>
          <p className='text-[12px] text-muted'>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'You are up to date'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type='button'
            onClick={props.onMarkAllAsRead}
            className='focus-ring rounded-lg border border-border-strong bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary'
          >
            Mark all read
          </button>
        )}
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {props.notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
            <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-panel text-primary'>
              <IconInfo size={22} />
            </div>
            <p className='text-base font-medium text-foreground'>
              No notifications
            </p>
            <p className='mt-1 text-sm text-muted'>
              New activity will show up here.
            </p>
          </div>
        ) : (
          <ul className='space-y-2 p-3 sm:p-4'>
            {props.notifications.map((notification) => {
              const TypeIcon = typeIcon(notification.type);
              return (
                <li
                  key={notification.id}
                  className={`rounded-xl border px-3.5 py-3 transition-colors ${
                    notification.is_read
                      ? 'border-border bg-panel/70'
                      : 'border-border-strong bg-panel'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        notification.is_read
                          ? 'bg-surface text-subtle'
                          : 'bg-primary-soft text-primary'
                      }`}
                    >
                      <TypeIcon size={14} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            {props.onNotificationClick &&
                            notification.link ? (
                              <button
                                type='button'
                                onClick={() =>
                                  props.onNotificationClick?.(notification)
                                }
                                className='focus-ring truncate text-left text-sm font-medium text-foreground transition hover:text-primary'
                              >
                                {notification.title}
                              </button>
                            ) : (
                              <h3 className='truncate text-sm font-medium text-foreground'>
                                {notification.title}
                              </h3>
                            )}
                            {!notification.is_read && (
                              <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary' />
                            )}
                          </div>
                          {notification.message && (
                            <p className='mt-1 text-sm leading-relaxed text-muted'>
                              {notification.message}
                            </p>
                          )}
                          <p className='mt-2 text-[11px] text-subtle'>
                            {new Date(
                              notification.created_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            type='button'
                            onClick={() =>
                              props.onMarkAsRead(notification.id)
                            }
                            className='focus-ring flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-surface-hover hover:text-primary'
                            title='Mark as read'
                          >
                            <IconCheck size={14} />
                            <span className='hidden sm:inline'>Read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
