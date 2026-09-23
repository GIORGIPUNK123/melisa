import { MouseEvent } from 'react';
import { FriendT } from '../../../types';
import { isUserOnline } from '../../../shared/utils/presence';
import { useTickingNow } from '../../../shared/hooks/useTickingNow';
import { ui } from '../../../shared/ui';
import { ListSkeleton } from '../../../components/layout/ListSkeleton';

const getInitials = (nickname: string) => nickname.charAt(0).toUpperCase();

const FriendRow = ({
  friend,
  nowMs,
  onFriendSelect,
  onViewProfile,
  onOpenConversation,
}: {
  friend: FriendT;
  nowMs: number;
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
  onOpenConversation: (friendUserId: string) => Promise<string | null>;
}) => {
  const isOnline = isUserOnline(
    friend.last_seen_at,
    friend.appear_offline,
    nowMs,
  );

  const handleFriendClick = async () => {
    if (friend.conversationId) {
      onFriendSelect(friend.conversationId);
      return;
    }

    const conversationId = await onOpenConversation(friend.userId);
    if (conversationId) {
      onFriendSelect(conversationId);
    }
  };

  const handleViewProfile = (e: MouseEvent) => {
    e.stopPropagation();
    onViewProfile(friend.username);
  };

  return (
    <div className='relative group'>
      <button
        onClick={handleFriendClick}
        className='flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-800/80'
      >
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.nickname}
            className={ui.avatar}
          />
        ) : (
          <div className={ui.avatarFallback}>
            {getInitials(friend.nickname)}
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <div className={ui.name}>{friend.nickname}</div>
          <div className={ui.meta}>@{friend.username}</div>
        </div>
        <div
          className={`h-2 w-2 rounded-full flex-shrink-0 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-500'
          }`}
          title={isOnline ? 'online' : 'offline'}
        />
      </button>

      <button
        onClick={handleViewProfile}
        className='absolute p-2 transition-all -translate-y-1/2 rounded-lg right-2 top-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
        title='View Profile'
      >
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      </button>
    </div>
  );
};

export const FriendsList = (props: {
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
  ensureTargetSubscription?: (userId: string) => void;
  friends: FriendT[];
  isLoading: boolean;
  refreshing?: boolean;
  getOrCreateConversation: (friendUserId: string) => Promise<string | null>;
}) => {
  const {
    friends,
    isLoading,
    getOrCreateConversation,
    onViewProfile,
    onFriendSelect,
  } = props;
  const nowMs = useTickingNow();
  const showSkeleton = isLoading || Boolean(props.refreshing);

  return (
    <div className='flex flex-col'>
      {showSkeleton ? (
        <ListSkeleton withHeader rows={Math.max(friends.length, 5)} />
      ) : (
        <h3 className={`${ui.section} border-b border-slate-800 px-4 py-2.5`}>
          Friends ({friends.length})
        </h3>
      )}

      {showSkeleton ? null : friends.length === 0 ? (
        <div className='flex items-center justify-center py-10 text-[13px] text-slate-400'>
          No friends yet
        </div>
      ) : (
        <div className='space-y-0.5 p-2'>
          {friends.map((friend) => (
            <FriendRow
              key={friend.friendshipId}
              friend={friend}
              nowMs={nowMs}
              onFriendSelect={onFriendSelect}
              onViewProfile={onViewProfile}
              onOpenConversation={getOrCreateConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
