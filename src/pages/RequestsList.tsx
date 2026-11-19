import { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  useRequestStore,
  type PendingRequest,
} from '../store/useRequestStore';
import { useFriendStore } from '../store/useFriendStore';
import { fetchFriendsList } from '../features/friends/utils/friendsFunctions';

const Avatar = ({ request }: { request: PendingRequest }) => {
  const initial = (request.nickname || request.username || '?')
    .charAt(0)
    .toUpperCase();

  return request.avatarUrl ? (
    <img
      src={request.avatarUrl}
      alt=''
      className='h-10 w-10 flex-shrink-0 rounded-card object-cover'
    />
  ) : (
    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-surface text-sm font-bold text-muted-foreground'>
      {initial}
    </div>
  );
};

const SectionLabel = ({
  label,
  count,
}: {
  label: string;
  count: number;
}) => (
  <div className='mb-2 flex items-center justify-between px-1'>
    <span className='text-xs font-bold text-subtle'>{label}</span>
    <span className='rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted'>
      {count}
    </span>
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <div className='rounded-xl border border-dashed border-border-strong bg-panel/40 px-4 py-6 text-center'>
    <p className='text-xs text-subtle'>{text}</p>
  </div>
);

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
    <li className='rounded-xl border border-border-strong bg-panel p-3 transition-colors hover:border-border-strong'>
      <div className='flex items-start gap-3'>
        <Avatar request={request} />
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <p className='truncate text-sm font-semibold text-foreground'>
              {request.nickname || request.username}
            </p>
          </div>
          <p className='truncate text-xs text-muted'>@{request.username}</p>
          <p className='mt-1 text-[11px] text-subtle'>
            {new Date(request.createdAt).toLocaleString()}
          </p>

          <div className='mt-3 flex items-center gap-2'>
            {variant === 'received' ? (
              <>
                <button
                  type='button'
                  disabled={busy}
                  onClick={props.onReject}
                  aria-label={`Decline request from ${request.username}`}
                  className='focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <X size={14} />
                  Decline
                </button>
                <button
                  type='button'
                  disabled={busy}
                  onClick={props.onAccept}
                  aria-label={`Accept request from ${request.username}`}
                  className='focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-background transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Check size={14} />
                  Accept
                </button>
              </>
            ) : (
              <button
                type='button'
                disabled={busy}
                onClick={props.onCancel}
                className='focus-ring flex items-center justify-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
              >
                <X size={14} />
                Cancel request
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export const RequestsList = () => {
  const receivedRequests = useRequestStore((state) => state.receivedRequests);
  const sentRequests = useRequestStore((state) => state.sentRequests);
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
    <div className='space-y-5 px-1'>
      {error && (
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
          {error}
        </div>
      )}

      <section>
        <SectionLabel label='RECEIVED' count={receivedRequests.length} />
        {receivedRequests.length === 0 ? (
          <EmptyHint text='Incoming requests will appear here.' />
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
        <SectionLabel label='SENT' count={sentRequests.length} />
        {sentRequests.length === 0 ? (
          <EmptyHint text='Requests you send will appear here.' />
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
  );
};
