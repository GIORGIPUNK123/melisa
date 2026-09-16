import { User } from '@supabase/supabase-js';
import { supabase } from '../../db/supabase';
import { useNavigate } from 'react-router';
import { ConversationT, NotificationT } from '../../types';
import { FriendsList } from '../../features/friends/components/FriendsList';
import { ConversationsList } from './ConversationsList';
import { useFriendsList } from '../../features/friends/hooks/useFriendsList';
import { BrandMark } from '../../atoms/BrandMark';

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
}) => {
  const navigate = useNavigate();
  const {
    friends,
    isLoading: friendsLoading,
    getOrCreateConversation,
  } = useFriendsList();
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
        flex h-[100dvh] w-full flex-col border-r border-slate-700 bg-slate-950
        lg:h-screen lg:w-full lg:max-w-sm
        transform transition-transform duration-300 ease-in-out
        ${props.isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className='flex items-center gap-3 border-b border-slate-700 px-3 py-2.5 lg:p-6'>
          {props.avatarUrl ? (
            <img
              src={props.avatarUrl}
              alt='Avatar'
              className='object-cover w-9 h-9 lg:w-10 lg:h-10 border rounded-full border-slate-700'
            />
          ) : (
            <div className='flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
              {(props.nickname || 'U').trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <BrandMark align='left' size='xs' />
            <p className='text-xs lg:text-sm text-slate-400 truncate'>
              {props.nickname || 'User'}
            </p>
          </div>
          <button
            onClick={handleNotificationsClick}
            className='relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden'
            aria-label='Notifications'
          >
            <span className='text-base'>🔔</span>
            {unreadNotifications.length > 0 && (
              <span className='absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-4 text-white'>
                {unreadNotifications.length}
              </span>
            )}
          </button>
        </div>

        <div className='flex border-b border-slate-700'>
          <button
            onClick={() => props.setActiveTab('chats')}
            className={`flex-1 py-2 text-sm font-medium transition-colors lg:py-3 ${
              props.activeTab === 'chats'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => props.setActiveTab('friends')}
            className={`flex-1 py-2 text-sm font-medium transition-colors lg:py-3 ${
              props.activeTab === 'friends'
                ? 'text-white border-b-2 border-indigo-500'
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
            />
          ) : (
            <FriendsList
              friends={friends}
              isLoading={friendsLoading}
              getOrCreateConversation={getOrCreateConversation}
              onFriendSelect={props.onFriendSelect}
              onViewProfile={props.onViewProfile}
              ensureTargetSubscription={props.ensureTargetSubscription}
            />
          )}
        </div>

        <div className='hidden px-4 pb-4 lg:block'>
          <button
            onClick={handleNotificationsClick}
            className='flex items-center justify-between w-full mb-2 transition-colors hover:text-white'
          >
            <h3 className='text-sm tracking-wider uppercase text-slate-400'>
              Notifications
            </h3>
            <div className='flex items-center gap-2'>
              {unreadNotifications.length > 0 && (
                <span className='px-2 py-0.5 text-xs font-medium text-white bg-indigo-600 rounded-full'>
                  {unreadNotifications.length}
                </span>
              )}
              <span className='text-xs text-slate-500'>
                {props.notifications.length}
              </span>
            </div>
          </button>
          <div
            className='pr-1 space-y-2 overflow-y-auto max-h-40'
            onClick={handleNotificationsClick}
          >
            {props.notificationsLoading ? (
              <div className='text-sm text-slate-500'>Loading...</div>
            ) : unreadNotifications.length === 0 ? (
              <div className='text-sm text-slate-500'>
                No unread notifications
              </div>
            ) : (
              unreadNotifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className='p-3 text-white transition-colors border rounded-lg cursor-pointer bg-slate-800 border-indigo-500/40 hover:bg-slate-700/60'
                >
                  <div className='text-sm font-medium'>{n.title}</div>
                  {n.message && (
                    <div className='mt-1 text-xs text-slate-400'>
                      {n.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className='grid grid-cols-4 gap-1 border-t border-slate-700 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden'>
          <button
            onClick={props.onAddFriendClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-200 hover:bg-slate-800'
          >
            <span>👥</span>
            Add
          </button>
          <button
            onClick={props.onFriendRequestsClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-200 hover:bg-slate-800'
          >
            <span>📬</span>
            Requests
          </button>
          <button
            onClick={props.onSettingsClick}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-200 hover:bg-slate-800'
          >
            <span>⚙️</span>
            Settings
          </button>
          <button
            onClick={handleLogout}
            className='flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-slate-200 hover:bg-slate-800'
          >
            <span>🚪</span>
            Log out
          </button>
        </div>

        <div className='hidden space-y-2 border-t border-slate-700 p-4 lg:block'>
          <button
            onClick={props.onAddFriendClick}
            className='flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          >
            <span>👥</span>
            Add Friends
          </button>
          <button
            onClick={props.onFriendRequestsClick}
            className='flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200'
          >
            <span>📬</span>
            Friend Requests
          </button>
          <button
            onClick={props.onSettingsClick}
            className='flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200'
          >
            <span>⚙️</span>
            Settings
          </button>
          <button
            onClick={handleLogout}
            className='flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200'
          >
            <span>🚪</span>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};
