import { usePendingRequests } from '../hooks/usePendingRequests';
import { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';
import { handleBackdropClick } from '../../../shared/utils/modal';

export const FriendRequestsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
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
    }
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
          <div className='flex items-center justify-between px-6 py-4 border-b border-slate-700'>
            <h2 className='text-xl font-semibold text-white'>
              Friend Requests
            </h2>
            <button
              onClick={props.onClose}
              className='text-slate-400 hover:text-white transition-colors'
              aria-label='Close'
            >
              ✕
            </button>
          </div>

          <div className='overflow-y-auto flex-1 p-6 space-y-6'>
            {isLoading ? (
              <div className='text-center text-slate-400'>Loading...</div>
            ) : (
              <>
                {/* Received Requests */}
                <div>
                  <h3 className='text-sm uppercase tracking-wider text-slate-400 mb-3'>
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
                                className='w-10 h-10 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                                {req.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className='text-left'>
                              <div className='text-white font-medium'>
                                {req.nickname}
                              </div>
                              <div className='text-slate-400 text-sm'>
                                @{req.username}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleAccept(req.friendshipId)}
                            className='px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium'
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(req.friendshipId)}
                            className='px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium'
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
                  <h3 className='text-sm uppercase tracking-wider text-slate-400 mb-3'>
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
                                className='w-10 h-10 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                                {req.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className='text-left'>
                              <div className='text-white font-medium'>
                                {req.nickname}
                              </div>
                              <div className='text-slate-400 text-sm'>
                                @{req.username}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleCancel(req.friendshipId)}
                            className='px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium'
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
