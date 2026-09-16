import { useEffect, useState, useMemo } from 'react';
import { PublicProfileT } from '../../../types';
import { getBlockButtonLabel } from '../../friends/hooks/useBlockedUsers';
import { isUserOnline } from '../../../shared/utils/presence';
import { useTickingNow } from '../../../shared/hooks/useTickingNow';
import { supabase } from '../../../db/supabase';

export const ChatInfo = (props: {
  members: PublicProfileT[];
  onClose?: () => void;
  onViewProfile?: (username: string) => void;
  onBlockUser?: (username: string, userId?: string) => void;
  onDeleteChat?: () => void;
  isBlocked?: (userId?: string | null) => boolean;
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  // Safely memoize the sorting operation to float 'You' to the top index cleanly
  const sortedMembers = useMemo(() => {
    if (!props.members) return [];
    return [...props.members].sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return 0;
    });
  }, [props.members, currentUserId]);

  const otherUser = sortedMembers.find((member) => member.id !== currentUserId);
  const nowMs = useTickingNow();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className='fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden'
        onClick={props.onClose}
      />

      {/* Chat Info Panel */}
      <div
        className={`
          fixed lg:relative inset-y-0 right-0 z-30
          flex flex-col w-72 sm:w-80 lg:w-72 h-screen border-l border-slate-700 bg-slate-800 p-4 sm:p-6
          transform transition-transform duration-300 ease-in-out
        `}
      >
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-bold text-white'>Chat Info</h3>
          <button
            onClick={props.onClose}
            className='p-1 transition-colors rounded lg:hidden text-slate-400 hover:text-white hover:bg-slate-800'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='flex-1 pr-1 space-y-4 overflow-y-auto'>
          <div>
            <p className='text-sm tracking-wider uppercase text-slate-400'>
              Members ({sortedMembers.length})
            </p>
            <div className='mt-3 space-y-2'>
              {sortedMembers.length > 0 ? (
                sortedMembers.map((member) => {
                  const online = isUserOnline(
                    member.last_seen_at,
                    member.appear_offline,
                    nowMs,
                  );

                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (
                          member.id !== currentUserId &&
                          props.onViewProfile
                        ) {
                          props.onViewProfile(member.username);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 transition-colors rounded-lg ${
                        member.id !== currentUserId
                          ? 'cursor-pointer bg-slate-700 hover:bg-slate-600'
                          : 'bg-slate-800'
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.nickname}
                          className='object-cover w-10 h-10 rounded-full'
                        />
                      ) : (
                        <div className='flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                          {member.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-white truncate'>
                          {member.nickname}
                        </div>
                        <div className='text-xs truncate text-slate-400'>
                          @{member.username}
                        </div>
                        <div className='flex items-center gap-1 mt-1'>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              online ? 'bg-green-500' : 'bg-slate-500'
                            }`}
                          />
                          <span className='text-xs capitalize text-slate-400'>
                            {online ? 'online' : 'offline'}
                          </span>
                        </div>
                      </div>
                      {member.id === currentUserId && (
                        <span className='flex-shrink-0 px-2 py-1 text-xs text-white bg-indigo-600 rounded'>
                          You
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className='text-sm text-slate-500'>No members</div>
              )}
            </div>
          </div>

          <div className='pt-4 border-t border-slate-700'>
            <p className='text-sm tracking-wider uppercase text-slate-400'>
              Actions
            </p>
            <div className='mt-3 space-y-2'>
              <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                📌 Pin Chat
              </button>
              <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                🔔 Mute Notifications
              </button>
              {otherUser && (
                <button
                  onClick={() => {
                    props.onBlockUser?.(otherUser.username, otherUser.id);
                  }}
                  className='w-full px-3 py-2 text-sm text-left text-orange-400 transition-colors rounded-lg hover:bg-slate-700'
                >
                  {getBlockButtonLabel(
                    Boolean(props.isBlocked?.(otherUser.id)),
                  )}
                </button>
              )}
              <button
                onClick={props.onDeleteChat}
                className='w-full px-3 py-2 text-sm text-left text-red-400 transition-colors rounded-lg hover:bg-slate-700'
              >
                🗑️ Delete Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
