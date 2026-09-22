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
  onRemoveFriend?: (username: string, userId?: string) => void;
  onDeleteChat?: () => void;
  isGroup?: boolean;
  muted?: boolean;
  muteSaving?: boolean;
  muteError?: string | null;
  onToggleMute?: () => void;
  isBlocked?: (userId?: string | null) => boolean;
  isFriend?: (userId?: string | null) => boolean;
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
  const otherOnline = otherUser
    ? isUserOnline(otherUser.last_seen_at, otherUser.appear_offline, nowMs)
    : false;

  return (
    <>
      <div
        className='fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px]'
        onClick={props.onClose}
      />

      <aside className='fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-700/80 bg-slate-900 shadow-2xl'>
        <div className='flex items-center justify-between border-b border-slate-800 px-5 py-4'>
          <div>
            <h3 className='text-sm font-semibold tracking-wide text-white'>
              Conversation
            </h3>
            <p className='mt-0.5 text-xs text-slate-500'>Details and actions</p>
          </div>
          <button
            onClick={props.onClose}
            className='rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
            aria-label='Close chat info'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.8}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {otherUser && (
            <div className='border-b border-slate-800 px-5 py-6'>
              <div className='flex flex-col items-center text-center'>
                {otherUser.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.nickname}
                    className='h-14 w-14 rounded-full object-cover ring-1 ring-slate-700'
                  />
                ) : (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-200 ring-1 ring-slate-700'>
                    {otherUser.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <h4 className='mt-3 text-[16px] font-semibold tracking-tight text-white'>
                  {otherUser.nickname}
                </h4>
                <p className='text-[13px] text-slate-400'>@{otherUser.username}</p>
                <div className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300'>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      otherOnline ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  {otherOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          )}

          <div className='px-5 py-4'>
            <p className='mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500'>
              Members
            </p>
            <div className='space-y-1'>
              {sortedMembers.length > 0 ? (
                sortedMembers.map((member) => {
                  const online = isUserOnline(
                    member.last_seen_at,
                    member.appear_offline,
                    nowMs,
                  );
                  const isYou = member.id === currentUserId;

                  return (
                    <button
                      key={member.id}
                      type='button'
                      disabled={isYou || !props.onViewProfile}
                      onClick={() => {
                        if (!isYou) props.onViewProfile?.(member.username);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                        isYou
                          ? 'cursor-default'
                          : 'hover:bg-slate-800/80'
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.nickname}
                          className='h-9 w-9 rounded-full object-cover'
                        />
                      ) : (
                        <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-200'>
                          {member.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='truncate text-sm text-white'>
                            {member.nickname}
                          </span>
                          {isYou && (
                            <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400'>
                              You
                            </span>
                          )}
                        </div>
                        <div className='truncate text-xs text-slate-500'>
                          @{member.username}
                        </div>
                      </div>
                      <span
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          online ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                        title={online ? 'Online' : 'Offline'}
                      />
                    </button>
                  );
                })
              ) : (
                <p className='px-2.5 text-sm text-slate-500'>No members</p>
              )}
            </div>
          </div>
        </div>

        <div className='border-t border-slate-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <div className='space-y-1'>
            {props.onToggleMute && (
              <button
                type='button'
                onClick={props.onToggleMute}
                disabled={props.muteSaving}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-50 ${
                  props.muted
                    ? 'bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {props.muted ? 'Unmute conversation' : 'Mute conversation'}
              </button>
            )}
            {props.muteError && (
              <p className='px-3 text-xs leading-5 text-rose-400'>
                {props.muteError}
              </p>
            )}
            {otherUser && !props.isGroup && props.isFriend?.(otherUser.id) && (
              <button
                type='button'
                onClick={() => {
                  props.onRemoveFriend?.(otherUser.username, otherUser.id);
                }}
                className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800'
              >
                Remove friend
              </button>
            )}
            {otherUser && !props.isGroup && (
              <button
                type='button'
                onClick={() => {
                  props.onBlockUser?.(otherUser.username, otherUser.id);
                }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  props.isBlocked?.(otherUser.id)
                    ? 'bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {getBlockButtonLabel(Boolean(props.isBlocked?.(otherUser.id)))}
              </button>
            )}
            <button
              type='button'
              onClick={props.onDeleteChat}
              className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-400 transition-colors hover:bg-rose-500/10'
            >
              {props.isGroup ? 'Leave group' : 'Delete conversation'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
