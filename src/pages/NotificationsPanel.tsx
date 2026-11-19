import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationList } from '../features/notifications/components/NotificationList';
import { ui } from '../shared/ui';

export const NotificationsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return (
    <div className='h-full w-full overflow-y-auto bg-[#080D14]'>
      <div className='mx-auto flex h-full w-full max-w-2xl flex-col px-4 py-6 sm:px-6'>
        <header className='mb-6 flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-[#65E0C1]/20 bg-[#65E0C1]/10 text-[#65E0C1]'>
            <Bell size={20} />
          </div>
          <div>
            <h1 className='text-[20px] font-semibold tracking-tight text-[#F4F8FB]'>
              Notifications
            </h1>
            <p className={ui.subtitle}>Updates from your friends and chats.</p>
          </div>
        </header>

        <div className='flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#1B2A3A] bg-[#0E1621]'>
          {isLoading ? (
            <div className='space-y-2 p-4'>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className='h-[76px] animate-pulse rounded-xl border border-[#162231] bg-[#0A1018]'
                />
              ))}
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={() => {
                if (user?.id) void markAllAsRead(user.id);
              }}
              onNotificationClick={(notification) => {
                void markAsRead(notification.id);
                if (notification.link) navigate(notification.link);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
