import { NotificationT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';
import { NotificationList } from '../components/NotificationList';
import { IconX } from '../../../atoms/Icon';

export const NotificationsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationT[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) => {
  if (!props.isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-card border border-border-strong bg-panel shadow-panel sm:max-h-[85vh] sm:rounded-card'>
        <div className='flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5'>
          <h2 className='text-[17px] font-semibold tracking-tight text-foreground'>
            Notifications
          </h2>
          <button
            type='button'
            onClick={props.onClose}
            className='focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-hover hover:text-foreground'
            aria-label='Close'
          >
            <IconX size={18} />
          </button>
        </div>
        <NotificationList
          notifications={props.notifications}
          onMarkAsRead={props.onMarkAsRead}
          onMarkAllAsRead={props.onMarkAllAsRead}
        />
      </div>
    </div>
  );
};
