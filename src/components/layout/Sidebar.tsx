import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router';
import { ConversationT, FriendT, NotificationT } from '../../types';
import { FriendsList } from '../../features/friends/components/FriendsList';
import { ConversationsList } from './ConversationsList';
import { BrandMark } from '../../atoms/BrandMark';
import {
  IconBell,
  IconInbox,
  IconLogOut,
  IconSettings,
  IconUserPlus,
} from '../../atoms/Icon';
import { supabase } from '../../db/supabase';
import { ui } from '../../shared/ui';

export const Sidebar = (props: {
  activeTab: 'chats' | 'friends';
  setActiveTab: (tab: 'chats' | 'friends') => void;
  user: User;
  nickname?: string;
  avatarUrl?: string | null;
  ensureTargetSubscription?: (userId: string) => void;
  notifications: NotificationT[];
  notificationsLoading?: boolean;
  onAddFriendClick: () => void;
  onFriendRequestsClick: () => void;
  onSettingsClick: () => void;
  onNotificationsClick?: () => void;
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
  activeConversationId?: string | null;
  isVisible?: boolean;
  onClose?: () => void;
  unreadCounts?: Record<string, number>;
  conversations: ConversationT[];
  conversationLoading?: boolean;
  friends: FriendT[];
  friendsLoading?: boolean;
  getOrCreateConversation: (friendUserId: string) => Promise<string | null>;
  isBlocked?: (userId?: string | null) => boolean;
  onCreateGroup?: () => void;
}) => {
  const navigate = useNavigate();
  const unreadNotifications = props.notifications.filter((n) => !n.is_read);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOverlayClick = () => {
    if (props.activeConversationId && props.onClose) {
      props.onClose();
    }
  };

  const handleNotificationsClick = () => {
    props.onNotificationsClick?.();
  };

  const navButtonClass = `${ui.btnSecondary} gap-2`;

  return (
    <>
      {props.isVisible && (
        <div
          className='fixed inset-0 z-10 bg-black/50 lg:hidden'
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-20
        flex h-[100dvh] w-full flex-col border-r border-slate-800 bg-slate-950
        lg:h-screen lg:w-full lg:max-w-sm
        transform transition-transform duration-300 ease-in-out
        ${props.isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className='flex items-center gap-3 border-b border-slate-800 px-3 py-3 lg:px-4 lg:py-4'>
          {props.avatarUrl ? (
            <img
              src={props.avatarUrl}
              alt='Avatar'
              className={`${ui.avatar} border border-slate-700`}
            />
          ) : (
            <div className={ui.avatarFallback}>
              {(props.nickname || 'U').trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <BrandMark
              align='left'
              size='xs'
              showMark={false}
              subtitle={props.nickname || 'User'}
            />
          </div>
          <button
            onClick={handleNotificationsClick}
            className={`${ui.iconBtn} relative lg:hidden`}
            aria-label='Notifications'
          >
            <IconBell size={18} />
            {unreadNotifications.length > 0 && (
              <span className='absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-4 text-white'>
                {unreadNotifications.length}
              </span>
            )}
          </button>
        </div>

        <div className='flex border-b border-slate-800'>
          <button
            onClick={() => props.setActiveTab('chats')}
            className={`flex-1 py-2.5 text-[14px] font-medium transition-colors lg:py-3 ${
              props.activeTab === 'chats'
                ? 'border-b-2 border-indigo-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => props.setActiveTab('friends')}
            className={`flex-1 py-2.5 text-[14px] font-medium transition-colors lg:py-3 ${
              props.activeTab === 'friends'
                ? 'border-b-2 border-indigo-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Friends
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {props.activeTab === 'chats' ? (
            <ConversationsList
              onConversationSelect={props.onFriendSelect}
              activeConversationId={props.activeConversationId}
              unreadCounts={props.unreadCounts || {}}
              conversations={props.conversations}
              isLoading={props.conversationLoading || false}
              isBlocked={props.isBlocked}
              onCreateGroup={props.onCreateGroup}
            />
          ) : (
            <FriendsList
              friends={props.friends}
              isLoading={props.friendsLoading || false}
              getOrCreateConversation={props.getOrCreateConversation}
              onFriendSelect={props.onFriendSelect}
              onViewProfile={props.onViewProfile}
              ensureTargetSubscription={props.ensureTargetSubscription}
            />
          )}
        </div>

        <div className='hidden border-t border-slate-800 px-4 py-3 lg:block'>
          <button
            onClick={handleNotificationsClick}
            className='mb-2 flex w-full items-center justify-between transition-colors hover:text-white'
          >
            <h3 className='flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500'>
              <IconBell size={14} />
              Notifications
            </h3>
            <div className='flex items-center gap-2'>
              {unreadNotifications.length > 0 && (
                <span className='rounded-md bg-indigo-600/90 px-1.5 py-0.5 text-[11px] font-medium text-white'>
                  {unreadNotifications.length}
                </span>
              )}
              <span className='text-xs text-slate-500'>
                {props.notifications.length}
              </span>
            </div>
          </button>
          <div
            className='max-h-40 space-y-1.5 overflow-y-auto pr-1'
            onClick={handleNotificationsClick}
          >
            {props.notificationsLoading ? (
              <div className='text-sm text-slate-500'>Loading...</div>
            ) : unreadNotifications.length === 0 ? (
              <div className='rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-sm text-slate-500'>
                No unread notifications
              </div>
            ) : (
              unreadNotifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className='cursor-pointer rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 transition-colors hover:border-slate-700 hover:bg-slate-800/80'
                >
                  <div className='truncate text-sm font-medium text-slate-100'>
                    {n.title}
                  </div>
                  {n.message && (
                    <div className='mt-0.5 line-clamp-2 text-xs text-slate-400'>
                      {n.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className='grid grid-cols-4 gap-1 border-t border-slate-800 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden'>
          <button
            onClick={props.onAddFriendClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
          >
            <IconUserPlus size={18} />
            Add
          </button>
          <button
            onClick={props.onFriendRequestsClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
          >
            <IconInbox size={18} />
            Requests
          </button>
          <button
            onClick={props.onSettingsClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
          >
            <IconSettings size={18} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
          >
            <IconLogOut size={18} />
            Log out
          </button>
        </div>

        <div className='hidden space-y-2 border-t border-slate-800 p-4 lg:block'>
          <button
            onClick={props.onAddFriendClick}
            className={`${ui.btnPrimary} gap-2`}
          >
            <IconUserPlus size={16} />
            Add Friends
          </button>
          <button onClick={props.onFriendRequestsClick} className={navButtonClass}>
            <IconInbox size={16} />
            Friend Requests
          </button>
          <button onClick={props.onSettingsClick} className={navButtonClass}>
            <IconSettings size={16} />
            Settings
          </button>
          <button onClick={handleLogout} className={navButtonClass}>
            <IconLogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};
