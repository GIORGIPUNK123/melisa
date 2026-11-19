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
      className='fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-[#1B2A3A] bg-[#0E1621] shadow-2xl sm:max-h-[85vh] sm:rounded-2xl'>
        <div className='flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#162231] px-4 py-3 sm:px-5'>
          <h2 className='text-[17px] font-semibold tracking-tight text-[#F4F8FB]'>
            Notifications
          </h2>
          <button
            type='button'
            onClick={props.onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-[#8192A4] transition hover:bg-[#162231] hover:text-[#EEF3F8]'
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
