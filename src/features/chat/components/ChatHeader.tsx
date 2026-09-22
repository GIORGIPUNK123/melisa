import { PublicProfileT } from '../../../types';
import { ui } from '../../../shared/ui';
import { IconInfo, IconSettings, IconVolume, IconVolumeOff } from '../../../atoms';

interface ChatHeaderProps {
  members: PublicProfileT[];
  currentUserId?: string;
  onToggleSidebar: () => void;
  onToggleChatInfo: () => void;
  fallbackName?: string;
  fallbackAvatar?: string;
  isGroup?: boolean;
  memberCount?: number;
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
  isGroup = false,
  memberCount = 0,
  blockedByMe,
  muted = false,
  muteAvailable = true,
  muteSaving = false,
  muteError,
  onToggleMute,
}: ChatHeaderProps) => {
  const otherMember = members.find((m) => m.id !== currentUserId);
  const displayName = isGroup
    ? fallbackName || 'Group'
    : otherMember?.nickname || otherMember?.username || fallbackName;
  const displayAvatar = isGroup
    ? fallbackAvatar
    : otherMember?.avatar_url || fallbackAvatar;
  const statusParts = [
    isGroup ? (memberCount > 0 ? `${memberCount} members` : 'Group') : null,
    !isGroup && blockedByMe ? 'Blocked' : null,
    muted ? 'Muted' : null,
  ].filter((part): part is string => Boolean(part));
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
              {statusParts.length > 0 && (
                <p className={ui.meta}>{statusParts.join(' · ')}</p>
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
          title={isGroup ? 'Group settings' : 'Conversation details'}
          aria-label={isGroup ? 'Group settings' : 'Conversation details'}
        >
          {isGroup ? <IconSettings size={20} /> : <IconInfo size={20} />}
        </button>
      </div>
    </div>
  );
};
