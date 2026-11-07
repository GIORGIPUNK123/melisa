import { Bell, Mail, MessageSquare, UsersRound } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { Logo } from '../../../../atoms/Logo';
import { UserCircle } from './UserCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const AppSidebar = (props: { avatarUrl?: string }) => {
  const avatarUrl = props.avatarUrl;
  const [activeTab, setActiveTab] = useState<
    'chats' | 'friends' | 'requests' | 'notifications'
  >('chats');
  const navigate = useNavigate();
  const location = useLocation();

  // Keep active tab in sync with current route if needed
  useEffect(() => {
    if (location.pathname.includes('/friends')) setActiveTab('friends');
    else if (location.pathname.includes('/requests')) setActiveTab('requests');
    else if (location.pathname.includes('/notifications'))
      setActiveTab('notifications');
    else if (location.pathname.includes('/chats')) setActiveTab('chats');
  }, [location.pathname]);

  return (
    <div className='shrink-0 bg-[#080D14] py-2 xl:py-5 flex xl:flex-col items-center justify-between w-full xl:w-[72px] border-t xl:border-t-0 border-[#162231]'>
      <div className='flex justify-between items-center w-full xl:w-auto xl:flex-col xl:justify-start'>
        <div className='hidden mb-5 xl:block'>
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
          />
          <SidebarItem
            onClick={() => {
              setActiveTab('notifications');
              navigate('/notifications');
            }}
            icon={<Bell size={20} />}
            active={activeTab === 'notifications'}
            label='Notifications'
          />
        </div>
      </div>
      <div
        className='hidden cursor-pointer xl:block'
        onClick={() => navigate('/settings')}
      >
        <UserCircle firstLetter='U' avatarUrl={avatarUrl} />
      </div>
    </div>
  );
};
