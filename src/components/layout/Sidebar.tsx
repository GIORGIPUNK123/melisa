import { User } from '@supabase/supabase-js';
import { supabase } from '../../db/supabase';
import { useNavigate } from 'react-router';
import { NotificationT } from '../../types';
import { FriendsList } from './FriendsList';
import { ConversationsList } from './ConversationsList';
import { useConversations } from '../../hooks/useConversations';
import { useFriendsList } from '../../hooks/useFriendsList';

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
}) => {
  const navigate = useNavigate();

  const { conversations, isLoading: conversationLoading } = useConversations(
    props.user.id,
  );
  const {
    friends,
    isLoading: friendsLoading,
    getOrCreateConversation,
  } = useFriendsList();
  console.log('conversations: ', conversations);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOverlayClick = () => {
    // Only close sidebar if there's an active conversation
    // This prevents users from getting stuck with no sidebar and no chat
    if (props.activeConversationId && props.onClose) {
      props.onClose();
    }
  };

  const handleNotificationsClick = () => {
    props.onNotificationsClick?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {props.isVisible && (
        <div
          className='fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden'
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-20
        flex flex-col justify-between w-80 sm:w-96 lg:w-full lg:max-w-sm h-screen 
        border-r border-slate-700 bg-slate-950
        transform transition-transform duration-300 ease-in-out
        ${props.isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Header */}
        <div className='p-6 border-b border-slate-700'>
          <div className='flex items-center gap-3'>
            {props.avatarUrl ? (
              <img
                src={props.avatarUrl}
                alt='Avatar'
                className='object-cover w-10 h-10 border rounded-full border-slate-700'
              />
            ) : (
              <div className='flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                {(props.nickname || 'U').trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className='text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                Chats
              </h1>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-slate-400'>
                  {props.nickname || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-slate-700'>
          <button
            onClick={() => props.setActiveTab('chats')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              props.activeTab === 'chats'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => props.setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              props.activeTab === 'friends'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Friends
          </button>
        </div>

        {/* Chat/Friends List */}
        <div className='flex-1 overflow-y-auto'>
          {props.activeTab === 'chats' ? (
            <ConversationsList
              onConversationSelect={props.onFriendSelect}
              activeConversationId={props.activeConversationId}
              unreadCounts={props.unreadCounts || {}}
              conversations={conversations}
              isLoading={conversationLoading}
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

        {/* Notifications */}
        <div className='px-4 pb-4'>
          <button
            onClick={handleNotificationsClick}
            className='flex items-center justify-between w-full mb-2 transition-colors hover:text-white'
          >
            <h3 className='text-sm tracking-wider uppercase text-slate-400'>
              Notifications
            </h3>
            <div className='flex items-center gap-2'>
              {props.notifications.filter((n) => !n.is_read).length > 0 && (
                <span className='px-2 py-0.5 text-xs font-medium text-white bg-indigo-600 rounded-full'>
                  {props.notifications.filter((n) => !n.is_read).length}
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
            ) : props.notifications.filter((n) => !n.is_read).length === 0 ? (
              <div className='text-sm text-slate-500'>
                No unread notifications
              </div>
            ) : (
              props.notifications
                .filter((n) => !n.is_read)
                .slice(0, 5)
                .map((n) => (
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

        {/* Action Buttons */}
        <div className='p-4 space-y-2 border-t border-slate-700'>
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
