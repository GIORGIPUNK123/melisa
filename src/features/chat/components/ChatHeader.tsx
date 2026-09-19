import { PublicProfileT } from '../../../types';

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
    <div className='flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 md:px-6'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <button
          onClick={onToggleSidebar}
          className='p-2 transition-colors rounded-lg lg:hidden text-slate-400 hover:text-white hover:bg-slate-800'
          title='Toggle sidebar'
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
                className='w-8 h-8 rounded-full sm:w-10 sm:h-10'
              />
            ) : (
              <div className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-indigo-600 rounded-full sm:w-10 sm:h-10'>
                {displayInitial}
              </div>
            )}
            <div className='min-w-0'>
              <h2 className='text-sm font-semibold text-white truncate sm:text-base'>
                {displayName}
              </h2>
              {blockedByMe && (
                <p className='text-xs text-slate-400'>Blocked</p>
              )}
            </div>
          </>
        )}
      </div>
      <button
        onClick={onToggleChatInfo}
        className='flex-shrink-0 p-2 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-800'
        title='Toggle chat info'
      >
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
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
