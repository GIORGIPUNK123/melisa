import { Bell, Mail, MessageSquare, UsersRound } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { Logo } from '../../../../atoms/Logo';
import { UserCircle } from './UserCircle';
import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useRequestStore } from '../../../../store/useRequestStore';
import { useNotificationStore } from '../../../../store/useNotificationStore';

export const AppSidebar = () => {
  const avatarUrl = useAuthStore((state) => state.profile?.avatar_url);
  const receivedRequestCount = useRequestStore(
    (state) => state.receivedRequests.length,
  );
  const unreadNotificationCount = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.is_read).length,
  );
  const [activeTab, setActiveTab] = useState<
    'chats' | 'friends' | 'requests' | 'notifications' | 'settings'
  >('chats');
  const navigate = useNavigate();
  const location = useLocation();
  // Keep active tab in sync with current route if needed
  useEffect(() => {
    if (location.pathname.includes('/requests')) setActiveTab('requests');
    else if (location.pathname.includes('/friends')) setActiveTab('friends');
    else if (location.pathname.includes('/notifications'))
      setActiveTab('notifications');
    else if (location.pathname.includes('/chats')) setActiveTab('chats');
  }, [location.pathname]);

  return (
    <div className='shrink-0 bg-sidebar py-2 xl:py-5 flex xl:flex-col items-center justify-between w-full xl:w-18 border-t xl:border-t-0 border-border'>
      <div className='flex justify-between items-center w-full xl:w-auto xl:flex-col xl:justify-start'>
        <div onClick={() => navigate('/')} className='hidden mb-5 xl:block'>
          <Logo />
        </div>
        <div className='flex justify-around items-center px-3 w-full xl:w-auto xl:justify-normal xl:gap-5 xl:px-0 xl:flex-col'>
          <SidebarItem
            onClick={() => {
              setActiveTab('chats');
              navigate('/chats');
            }}
            icon={<MessageSquare size={20} />}
            active={activeTab === 'chats'}
            label='Messages'
          />
          <SidebarItem
            onClick={() => {
              setActiveTab('friends');
              navigate('/friends');
            }}
            icon={<UsersRound size={20} />}
            active={activeTab === 'friends'}
            label='Friends'
          />
          <SidebarItem
            onClick={() => {
              setActiveTab('requests');
              navigate('/requests');
            }}
            icon={<Mail size={20} />}
            active={activeTab === 'requests'}
            label='Requests'
            badge={receivedRequestCount}
          />
          <SidebarItem
            onClick={() => {
              setActiveTab('notifications');
              navigate('/notifications');
            }}
            icon={<Bell size={20} />}
            active={activeTab === 'notifications'}
            label='Notifications'
            badge={unreadNotificationCount}
          />
        </div>
      </div>
      <div
        className={`hidden cursor-pointer xl:block ${activeTab === 'settings' ? 'scale-115' : ''}`}
        onClick={() => {
          setActiveTab('settings');
          navigate('/settings');
        }}
      >
        <UserCircle firstLetter='U' avatarUrl={avatarUrl} />
      </div>
    </div>
  );
};
