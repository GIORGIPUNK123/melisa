import { useState, type ReactNode } from 'react';
import { Check, Clock, Inbox, UserPlus, X } from 'lucide-react';
import { useRequestStore, PendingRequest } from '../store/useRequestStore';
import { useFriendStore } from '../store/useFriendStore';
import { fetchFriendsList } from '../features/friends/utils/friendsFunctions';
import { ui } from '../shared/ui';

const Avatar = ({ request }: { request: PendingRequest }) => {
  const initial = (request.nickname || request.username || '?')
    .charAt(0)
    .toUpperCase();
  return request.avatarUrl ? (
    <img
      src={request.avatarUrl}
      alt=''
      className={ui.avatar}
    />
  ) : (
    <div className={ui.avatarFallback}>{initial}</div>
  );
};

const RequestCard = (props: {
  request: PendingRequest;
  variant: 'received' | 'sent';
  busy: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}) => {
  const { request, variant, busy } = props;
  return (
    <li className='flex items-center gap-3 rounded-2xl border border-[#1B2A3A] bg-[#0E1621] p-3.5'>
      <Avatar request={request} />
      <div className='min-w-0 flex-1'>
        <p className={ui.name}>{request.nickname || request.username}</p>
        <p className={ui.meta}>@{request.username}</p>
      </div>
      <div className='flex flex-shrink-0 items-center gap-2'>
        {variant === 'received' ? (
          <>
            <button
              type='button'
              disabled={busy}
              onClick={props.onReject}
              aria-label={`Decline request from ${request.username}`}
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-[#1B2A3A] text-[#8192A4] transition hover:bg-[#162231] hover:text-[#EEF3F8] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <X size={16} />
            </button>
            <button
              type='button'
              disabled={busy}
              onClick={props.onAccept}
              aria-label={`Accept request from ${request.username}`}
              className='flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#65E0C1] px-3 text-[13px] font-semibold text-[#07110F] transition hover:bg-[#7BE9CE] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Check size={15} />
              <span className='hidden sm:inline'>Accept</span>
            </button>
          </>
        ) : (
          <button
            type='button'
            disabled={busy}
            onClick={props.onCancel}
            className='flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#1B2A3A] px-3 text-[13px] font-medium text-[#8192A4] transition hover:bg-[#162231] hover:text-[#EEF3F8] disabled:cursor-not-allowed disabled:opacity-50'
          >
            <X size={15} />
            Cancel
          </button>
        )}
      </div>
    </li>
  );
};

const EmptyState = (props: { icon: ReactNode; title: string; text: string }) => (
  <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1B2A3A] bg-[#0E1621]/40 px-6 py-10 text-center'>
    <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#162231] text-[#65E0C1]'>
      {props.icon}
    </div>
    <p className='text-sm font-medium text-[#F4F8FB]'>{props.title}</p>
    <p className='mt-1 text-xs text-[#8192A4]'>{props.text}</p>
  </div>
);

export const RequestsPanel = () => {
  const receivedRequests = useRequestStore((state) => state.receivedRequests);
  const sentRequests = useRequestStore((state) => state.sentRequests);
  const isLoading = useRequestStore((state) => state.isLoading);
  const acceptRequest = useRequestStore((state) => state.acceptRequest);
  const rejectRequest = useRequestStore((state) => state.rejectRequest);
  const cancelRequest = useRequestStore((state) => state.cancelRequest);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshFriends = async () => {
    try {
      const data = await fetchFriendsList();
      useFriendStore.getState().setFriends(data);
    } catch (err) {
      console.error('Failed to refresh friends after accepting request:', err);
    }
  };

  const run = async (
    friendshipId: string,
    action: (id: string) => Promise<boolean>,
    failureMessage: string,
    refresh = false,
  ) => {
    setBusyId(friendshipId);
    setError(null);
    const ok = await action(friendshipId);
    setBusyId(null);
    if (!ok) {
      setError(failureMessage);
      return;
    }
    if (refresh) await refreshFriends();
  };

  return (
    <div className='h-full w-full overflow-y-auto bg-[#080D14]'>
      <div className='mx-auto w-full max-w-2xl px-4 py-6 sm:px-6'>
        <header className='mb-6 flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-[#65E0C1]/20 bg-[#65E0C1]/10 text-[#65E0C1]'>
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className='text-[20px] font-semibold tracking-tight text-[#F4F8FB]'>
              Friend requests
            </h1>
            <p className='text-[13px] text-[#8192A4]'>
              Review requests you have sent and received.
            </p>
          </div>
        </header>

        {error && (
          <div className='mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-300'>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className='space-y-3'>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className='h-[68px] animate-pulse rounded-2xl border border-[#162231] bg-[#0E1621]'
              />
            ))}
          </div>
        ) : (
          <div className='space-y-8'>
            <section>
              <div className='mb-3 flex items-center gap-2'>
                <h2 className={ui.section}>Received</h2>
                <span className='rounded-full bg-[#162231] px-2 py-0.5 text-[11px] font-semibold text-[#C8D4E0]'>
                  {receivedRequests.length}
                </span>
              </div>
              {receivedRequests.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={20} />}
                  title='No incoming requests'
                  text='When someone adds you, their request will appear here.'
                />
              ) : (
                <ul className='space-y-2'>
                  {receivedRequests.map((request) => (
                    <RequestCard
                      key={request.friendshipId}
                      request={request}
                      variant='received'
                      busy={busyId === request.friendshipId}
                      onAccept={() =>
                        run(
                          request.friendshipId,
                          acceptRequest,
                          'Failed to accept request.',
                          true,
                        )
                      }
                      onReject={() =>
                        run(
                          request.friendshipId,
                          rejectRequest,
                          'Failed to decline request.',
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className='mb-3 flex items-center gap-2'>
                <h2 className={ui.section}>Sent</h2>
                <span className='rounded-full bg-[#162231] px-2 py-0.5 text-[11px] font-semibold text-[#C8D4E0]'>
                  {sentRequests.length}
                </span>
              </div>
              {sentRequests.length === 0 ? (
                <EmptyState
                  icon={<Clock size={20} />}
                  title='No pending requests'
                  text='Requests you send will show up here until they are accepted.'
                />
              ) : (
                <ul className='space-y-2'>
                  {sentRequests.map((request) => (
                    <RequestCard
                      key={request.friendshipId}
                      request={request}
                      variant='sent'
                      busy={busyId === request.friendshipId}
                      onCancel={() =>
                        run(
                          request.friendshipId,
                          cancelRequest,
                          'Failed to cancel request.',
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
