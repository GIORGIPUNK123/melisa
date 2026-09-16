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
      <div
        className='fixed inset-0 z-30 bg-black/50 lg:hidden'
        onClick={props.onClose}
      />

      <div className='fixed inset-x-0 bottom-0 z-40 flex max-h-[75dvh] w-full flex-col rounded-t-2xl border-t border-slate-700 bg-slate-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:relative lg:inset-auto lg:h-screen lg:max-h-none lg:w-72 lg:rounded-none lg:border-l lg:border-t-0 lg:p-6'>
        <div className='mx-auto mb-3 h-1 w-10 rounded-full bg-slate-600 lg:hidden' />
        <div className='mb-4 flex items-center justify-between lg:mb-6'>
          <h3 className='text-base font-bold text-white lg:text-lg'>
            Chat Info
          </h3>
          <button
            onClick={props.onClose}
            className='p-1 transition-colors rounded text-slate-400 hover:text-white hover:bg-slate-700'
            aria-label='Close chat info'
          >
            <svg
              className='w-5 h-5'
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

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'>
          <div>
            <p className='text-xs tracking-wider uppercase text-slate-400 lg:text-sm'>
              Members ({sortedMembers.length})
            </p>
            <div className='mt-2 space-y-1.5 lg:mt-3 lg:space-y-2'>
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
                      className={`flex items-center gap-3 p-2.5 transition-colors rounded-lg lg:p-3 ${
                        member.id !== currentUserId
                          ? 'cursor-pointer bg-slate-700 hover:bg-slate-600'
                          : 'bg-slate-800'
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.nickname}
                          className='object-cover w-9 h-9 rounded-full lg:w-10 lg:h-10'
                        />
                      ) : (
                        <div className='flex items-center justify-center flex-shrink-0 w-9 h-9 text-sm font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600 lg:w-10 lg:h-10'>
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
                        <div className='flex items-center gap-1 mt-0.5'>
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

          <div className='border-t border-slate-700 pt-3 lg:pt-4'>
            <p className='text-xs tracking-wider uppercase text-slate-400 lg:text-sm'>
              Actions
            </p>
            <div className='mt-2 grid grid-cols-2 gap-1.5 lg:mt-3 lg:grid-cols-1 lg:space-y-0 lg:gap-2'>
              <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                📌 Pin Chat
              </button>
              <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                🔔 Mute
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
