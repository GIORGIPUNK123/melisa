import { Bell, Mail, MessageSquare, UsersRound } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { Logo } from '../../../../atoms/Logo';
import { UserCircle } from './UserCircle';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const AppSidebar = (props: { avatarUrl?: string }) => {
  const avatarUrl = props.avatarUrl;
  const [activeTab, setActiveTab] = useState<
    'chats' | 'friends' | 'requests' | 'notifications'
  >('chats');
  const navigate = useNavigate();
  return (
    <div className='shrink-0 py-5 w-[72px] flex flex-col items-center justify-between bg-[#0A1018]'>
      <div>
        <Logo />
        <div className='flex flex-col items-center gap-5 mt-10'>
          <SidebarItem
            onClick={() => {
              setActiveTab('chats');
              navigate('/chats');
            }}
            icon={<MessageSquare />}
            active={activeTab === 'chats'}
          />
          <SidebarItem
            onClick={() => {
              navigate('/friends');
              setActiveTab('friends');
            }}
            icon={<UsersRound />}
            active={activeTab === 'friends'}
          />
          <SidebarItem
            onClick={() => {
              navigate('/requests');
            }}
            icon={<Mail />}
            active={false}
          />
          <SidebarItem
            onClick={() => {
              navigate('/notifications');
            }}
            icon={<Bell />}
            active={false}
          />
        </div>
      </div>
      <div onClick={() => navigate('/settings')}>
        <UserCircle firstLetter='U' avatarUrl={avatarUrl} />
      </div>
    </div>
  );
};
