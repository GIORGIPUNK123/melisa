import { PublicProfileT } from '../../../types';
import { ui } from '../../../shared/ui';

interface ChatHeaderProps {
  members: PublicProfileT[];
  currentUserId?: string;
  onToggleSidebar: () => void;
  onToggleChatInfo: () => void;
  fallbackName?: string;
  fallbackAvatar?: string;
  blockedByMe?: boolean;
}

export const ChatHeader = ({
  members,
  currentUserId,
  onToggleSidebar,
  onToggleChatInfo,
  fallbackName,
  fallbackAvatar,
  blockedByMe,
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
              {blockedByMe && <p className={ui.meta}>Blocked</p>}
            </div>
          </>
        )}
      </div>
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
  );
};
