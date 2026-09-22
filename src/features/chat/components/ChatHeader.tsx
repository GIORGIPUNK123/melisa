import { PublicProfileT } from '../../../types';
import { ui } from '../../../shared/ui';
import { IconVolume, IconVolumeOff } from '../../../atoms';

interface ChatHeaderProps {
  members: PublicProfileT[];
  currentUserId?: string;
  onToggleSidebar: () => void;
  onToggleChatInfo: () => void;
  fallbackName?: string;
  fallbackAvatar?: string;
  blockedByMe?: boolean;
  muted?: boolean;
  muteAvailable?: boolean;
  muteSaving?: boolean;
  muteError?: string | null;
  onToggleMute?: () => void;
}

export const ChatHeader = ({
  members,
  currentUserId,
  onToggleSidebar,
  onToggleChatInfo,
  fallbackName,
  fallbackAvatar,
  blockedByMe,
  muted = false,
  muteAvailable = true,
  muteSaving = false,
  muteError,
  onToggleMute,
}: ChatHeaderProps) => {
  const otherMember = members.find((m) => m.id !== currentUserId);
  const displayName =
    otherMember?.nickname || otherMember?.username || fallbackName;
  const displayAvatar = otherMember?.avatar_url || fallbackAvatar;
  const displayInitial = (displayName || '?').charAt(0).toUpperCase();

  return (
    <div className='flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-4'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <button
          onClick={onToggleSidebar}
          className={`${ui.iconBtn} lg:hidden`}
          title='Toggle sidebar'
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
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>

        {(otherMember || displayName) && (
          <>
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className={ui.avatar}
              />
            ) : (
              <div className={`${ui.avatarFallback} bg-indigo-600 text-white`}>
                {displayInitial}
              </div>
            )}
            <div className='min-w-0'>
              <h2 className={ui.name}>{displayName}</h2>
              {(blockedByMe || muted) && (
                <p className={ui.meta}>
                  {[blockedByMe ? 'Blocked' : null, muted ? 'Muted' : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {muteError && (
                <p className='text-[12px] leading-4 text-rose-400'>{muteError}</p>
              )}
            </div>
          </>
        )}
      </div>
      <div className='flex items-center gap-1'>
        {onToggleMute && (
          <button
            type='button'
            onClick={onToggleMute}
            disabled={muteSaving}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute conversation' : 'Mute conversation'}
            title={
              muteAvailable
                ? muted
                  ? 'Unmute'
                  : 'Mute'
                : 'Mute needs a database update before it can be saved'
            }
            className={`${ui.iconBtn} ${muted ? 'bg-slate-800 text-white' : ''} disabled:opacity-50`}
          >
            {muted ? (
              <IconVolumeOff size={20} />
            ) : (
              <IconVolume size={20} />
            )}
          </button>
        )}
        <button
          onClick={onToggleChatInfo}
          className={ui.iconBtn}
          title='Toggle chat info'
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
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
