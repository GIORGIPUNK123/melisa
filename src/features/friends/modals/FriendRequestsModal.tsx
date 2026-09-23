import { usePendingRequests } from '../hooks/usePendingRequests';
import { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';
import { handleBackdropClick } from '../../../shared/utils/modal';
import { IconX } from '../../../atoms/Icon';
import { ui } from '../../../shared/ui';

export const FriendRequestsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  onFriendsChanged?: () => void;
}) => {
  const {
    sentRequests,
    receivedRequests,
    isLoading,
    cancelRequest,
    acceptRequest,
    rejectRequest,
  } = usePendingRequests();

  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  const handleCancel = async (friendshipId: string) => {
    const success = await cancelRequest(friendshipId);
    if (!success) {
      alert('Failed to cancel request');
    }
  };

  const handleAccept = async (friendshipId: string) => {
    const success = await acceptRequest(friendshipId);
    if (!success) {
      alert('Failed to accept request');
      return;
    }
    props.onFriendsChanged?.();
  };

  const handleReject = async (friendshipId: string) => {
    const success = await rejectRequest(friendshipId);
    if (!success) {
      alert('Failed to reject request');
    }
  };

  if (!props.isOpen) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
        onClick={(event) => handleBackdropClick(event, props.onClose)}
      >
        <div className='w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col'>
          <div className='flex items-center justify-between border-b border-slate-800 px-4 py-3.5 sm:px-5'>
            <h2 className={ui.title}>Friend requests</h2>
            <button
              onClick={props.onClose}
              className={ui.iconBtn}
              aria-label='Close'
            >
              <IconX size={18} />
            </button>
          </div>

          <div className='flex-1 space-y-6 overflow-y-auto p-4 sm:p-5'>
            {isLoading ? (
              <div className='text-center text-slate-400'>Loading...</div>
            ) : (
              <>
                {/* Received Requests */}
                <div>
                  <h3 className={`${ui.section} mb-3`}>
                    Received ({receivedRequests.length})
                  </h3>
                  {receivedRequests.length === 0 ? (
                    <p className='text-slate-500 text-sm'>
                      No pending requests
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {receivedRequests.map((req) => (
                        <div
                          key={req.friendshipId}
                          className='flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700'
                        >
                          <button
                            onClick={() => setSelectedUsername(req.username)}
                            className='flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity'
                          >
                            {req.avatarUrl ? (
                              <img
                                src={req.avatarUrl}
                                alt={req.nickname}
                                className={ui.avatar}
                              />
                            ) : (
                              <div className={ui.avatarFallback}>
                                {req.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className='text-left'>
                              <div className={ui.name}>{req.nickname}</div>
                              <div className={ui.meta}>@{req.username}</div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleAccept(req.friendshipId)}
                            className={`${ui.btnCompact} bg-emerald-600 hover:bg-emerald-500`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(req.friendshipId)}
                            className='inline-flex h-9 items-center rounded-xl bg-slate-700 px-3 text-[13px] font-medium text-white hover:bg-slate-600'
                          >
                            Reject
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h3 className={`${ui.section} mb-3`}>
                    Sent ({sentRequests.length})
                  </h3>
                  {sentRequests.length === 0 ? (
                    <p className='text-slate-500 text-sm'>No sent requests</p>
                  ) : (
                    <div className='space-y-2'>
                      {sentRequests.map((req) => (
                        <div
                          key={req.friendshipId}
                          className='flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700'
                        >
                          <button
                            onClick={() => setSelectedUsername(req.username)}
                            className='flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity'
                          >
                            {req.avatarUrl ? (
                              <img
                                src={req.avatarUrl}
                                alt={req.nickname}
                                className={ui.avatar}
                              />
                            ) : (
                              <div className={ui.avatarFallback}>
                                {req.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className='text-left'>
                              <div className={ui.name}>{req.nickname}</div>
                              <div className={ui.meta}>@{req.username}</div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleCancel(req.friendshipId)}
                            className='inline-flex h-9 items-center rounded-xl bg-rose-600 px-3 text-[13px] font-medium text-white hover:bg-rose-500'
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={!!selectedUsername}
        username={selectedUsername}
        onClose={() => setSelectedUsername(null)}
      />
    </>
  );
};
