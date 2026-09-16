import { NotificationT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';

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
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='w-full max-w-2xl h-[75vh] sm:h-[600px] max-h-[85vh] overflow-hidden border shadow-2xl rounded-xl sm:rounded-2xl border-slate-700/50 bg-slate-900 flex flex-col'>
        <div className='flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-semibold text-white'>Notifications</h2>
            {unreadCount > 0 && (
              <span className='px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full'>
                {unreadCount} new
              </span>
            )}
          </div>
          <div className='flex items-center gap-2 flex-wrap sm:flex-nowrap'>
            {unreadCount > 0 && (
              <button
                onClick={props.onMarkAllAsRead}
                className='px-3 py-1 text-xs font-medium transition-colors rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600'
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={props.onClose}
              className='transition-colors text-slate-400 hover:text-white'
              aria-label='Close'
            >
              ✕
            </button>
          </div>
        </div>

        <div className='flex-1 p-4 sm:p-6 space-y-3 overflow-y-auto'>
          {props.notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center text-slate-400'>
              <div className='mb-2 text-5xl'>🔔</div>
              <p className='text-lg font-medium'>No notifications</p>
              <p className='text-sm'>You're all caught up!</p>
            </div>
          ) : (
            props.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 rounded-lg border transition-all ${
                  notification.is_read
                    ? 'bg-slate-800/60 border-slate-700'
                    : 'bg-slate-800 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-lg'>
                        {notification.type === 'friend_request'
                          ? '👥'
                          : notification.type === 'message'
                            ? '💬'
                            : notification.type === 'system'
                              ? '⚙️'
                              : '📢'}
                      </span>
                      <h3 className='font-semibold text-white'>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className='w-2 h-2 bg-indigo-500 rounded-full'></span>
                      )}
                    </div>
                    {notification.message && (
                      <p className='text-sm text-slate-300'>
                        {notification.message}
                      </p>
                    )}
                    <p className='mt-2 text-xs text-slate-500'>
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => props.onMarkAsRead(notification.id)}
                      className='px-3 py-1 text-xs font-medium transition-colors rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600 whitespace-nowrap'
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
