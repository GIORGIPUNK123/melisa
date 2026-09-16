import { usePublicProfile } from '../hooks/usePublicProfile';
import { getBlockButtonLabel } from '../hooks/useBlockedUsers';
import { isUserOnline } from '../../../shared/utils/presence';
import { useTickingNow } from '../../../shared/hooks/useTickingNow';
import { handleBackdropClick } from '../../../shared/utils/modal';

export const UserProfileModal = (props: {
  isOpen: boolean;
  username: string | null;
  onClose: () => void;
  onBlockUser?: (username: string, userId?: string) => void;
  onMessageUser?: (userId: string) => void;
  isBlocked?: (userId?: string | null) => boolean;
}) => {
  const { profile, isLoading, error } = usePublicProfile(props.username);
  const nowMs = useTickingNow();

  if (!props.isOpen) return null;

  const isOnline = profile
    ? isUserOnline(profile.lastSeenAt, profile.appearOffline, nowMs)
    : false;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='w-full max-w-md overflow-hidden border shadow-2xl rounded-2xl border-slate-700/50 bg-slate-900'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>User Profile</h2>
          <button
            onClick={props.onClose}
            className='transition-colors text-slate-400 hover:text-white'
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        <div className='p-6'>
          {isLoading ? (
            <div className='text-center text-slate-400'>Loading...</div>
          ) : error ? (
            <div className='text-center text-red-400'>{error}</div>
          ) : profile ? (
            <div className='space-y-4'>
              <div className='flex flex-col items-center'>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.nickname}
                    className='object-cover w-24 h-24 border-2 rounded-full border-slate-700'
                  />
                ) : (
                  <div className='flex items-center justify-center w-24 h-24 text-3xl font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                    {profile.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className='mt-4 text-2xl font-bold text-white'>
                  {profile.nickname}
                </h3>
                <p className='text-slate-400'>@{profile.username}</p>
                {profile && (
                  <span
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      isOnline
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isOnline ? 'online' : 'offline'}
                  </span>
                )}
              </div>

              <div className='pt-4 border-t border-slate-700'>
                <p className='text-sm text-slate-400'>
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className='pt-4 space-y-2 border-t border-slate-700'>
                <button
                  onClick={() => {
                    if (props.onMessageUser && profile.id) {
                      props.onMessageUser(profile.id);
                      props.onClose();
                    }
                  }}
                  disabled={!props.onMessageUser}
                  className='w-full px-4 py-2 text-sm font-medium text-blue-400 transition-colors border rounded-lg border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Message
                </button>
                <button
                  onClick={() => {
                    if (props.onBlockUser && profile.username) {
                      props.onBlockUser(profile.username, profile.id);
                      props.onClose();
                    }
                  }}
                  className='w-full px-4 py-2 text-sm font-medium text-orange-400 transition-colors border rounded-lg border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20'
                >
                  {getBlockButtonLabel(Boolean(props.isBlocked?.(profile.id)))}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
