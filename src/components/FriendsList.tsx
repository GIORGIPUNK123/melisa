import { useFriendsList } from '../hooks/useFriendsList';

export const FriendsList = (props: {
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
}) => {
  const { friends, isLoading, getOrCreateConversation } = useFriendsList();

  const handleFriendClick = async (friend: (typeof friends)[0]) => {
    const conversationId = await getOrCreateConversation(friend.userId);
    if (conversationId) {
      props.onFriendSelect(conversationId);
    }
  };

  const handleViewProfile = (
    e: React.MouseEvent,
    friend: (typeof friends)[0],
  ) => {
    e.stopPropagation();
    props.onViewProfile(friend.username);
  };

  return (
    <div className='flex flex-col h-full'>
      <h3 className='text-sm uppercase tracking-wider text-slate-400 px-4 py-3 border-b border-slate-700'>
        Friends ({friends.length})
      </h3>

      {isLoading ? (
        <div className='flex items-center justify-center py-8 text-slate-400'>
          Loading friends...
        </div>
      ) : friends.length === 0 ? (
        <div className='flex items-center justify-center py-8 text-slate-400 text-sm'>
          No friends yet
        </div>
      ) : (
        <div className='flex-1 overflow-y-auto space-y-1 p-2'>
          {friends.map((friend) => (
            <div key={friend.friendshipId} className='relative group'>
              <button
                onClick={() => handleFriendClick(friend)}
                className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-left'
              >
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.nickname}
                    className='w-10 h-10 rounded-full object-cover flex-shrink-0'
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>
                    {friend.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <div className='text-white font-medium truncate'>
                    {friend.nickname}
                  </div>
                  <div className='text-slate-400 text-xs truncate'>
                    @{friend.username}
                  </div>
                </div>
                {friend.status === 'online' && (
                  <div className='w-2 h-2 rounded-full bg-green-500 flex-shrink-0'></div>
                )}
              </button>

              {/* View Profile Button */}
              <button
                onClick={(e) => handleViewProfile(e, friend)}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100'
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
          ))}
        </div>
      )}
    </div>
  );
};
