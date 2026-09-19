import { NotificationT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';
import {
  IconCheck,
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

export const NotificationsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationT[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) => {
  if (!props.isOpen) return null;

  const unreadCount = props.notifications.filter((n) => !n.is_read).length;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border-slate-700/70 bg-slate-900 shadow-2xl sm:max-h-[85vh] sm:rounded-2xl sm:border'>
        <div className='flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5'>
          <div className='min-w-0'>
            <h2 className='text-[17px] font-semibold tracking-tight text-white'>
              Notifications
            </h2>
            <p className='mt-0.5 text-[12px] text-slate-500'>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You are up to date'}
            </p>
          </div>
          <div className='flex flex-shrink-0 items-center gap-2'>
            {unreadCount > 0 && (
              <button
                onClick={props.onMarkAllAsRead}
                className='rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white'
              >
                Mark all read
              </button>
            )}
            <button
              onClick={props.onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
              aria-label='Close'
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto bg-slate-950/50'>
          {props.notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
              <p className='text-base font-medium text-slate-200'>
                No notifications
              </p>
              <p className='mt-1 text-sm text-slate-500'>
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
                        ? 'border-slate-800/80 bg-slate-900/70'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          notification.is_read
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-indigo-500/15 text-indigo-300'
                        }`}
                      >
                        <TypeIcon size={14} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <div className='flex items-center gap-2'>
                              <h3 className='truncate text-sm font-medium text-white'>
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400' />
                              )}
                            </div>
                            {notification.message && (
                              <p className='mt-1 text-sm leading-relaxed text-slate-400'>
                                {notification.message}
                              </p>
                            )}
                            <p className='mt-2 text-[11px] text-slate-500'>
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <button
                              onClick={() =>
                                props.onMarkAsRead(notification.id)
                              }
                              className='flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
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
    </div>
  );
};
