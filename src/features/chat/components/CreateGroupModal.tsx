import { useMemo, useState } from 'react';
import { FriendT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';
import { ui } from '../../../shared/ui';
import { IconUsers, IconX } from '../../../atoms';
import { createGroupChat } from '../api/createGroupChat';

export const CreateGroupModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendT[];
  selfId: string;
  selfPublicKey?: string | null;
  privateKey: string;
  onCreated: (conversationId: string) => Promise<void> | void;
}) => {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const visibleFriends = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return props.friends;
    return props.friends.filter((friend) => {
      return (
        friend.nickname.toLowerCase().includes(needle) ||
        friend.username.toLowerCase().includes(needle)
      );
    });
  }, [props.friends, query]);

  const reset = () => {
    setName('');
    setQuery('');
    setSelectedIds([]);
    setError(null);
    setCreating(false);
  };

  const close = () => {
    if (creating) return;
    reset();
    props.onClose();
  };

  const toggleFriend = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give the group a name.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Add at least one friend.');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const conversationId = await createGroupChat({
        name: trimmed,
        memberIds: selectedIds,
        selfId: props.selfId,
        selfPublicKey: props.selfPublicKey,
        privateKey: props.privateKey,
      });
      await props.onCreated(conversationId);
      reset();
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Could not create the group.';
      setError(message);
      setCreating(false);
    }
  };

  if (!props.isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={(event) => handleBackdropClick(event, close)}
    >
      <div className='relative flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl'>
        <div className='flex items-start gap-3 px-6 pb-2 pt-6 pr-14'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300'>
            <IconUsers size={18} />
          </div>
          <div>
            <h2 className={ui.title}>New group</h2>
            <p className={`mt-1 ${ui.subtitle}`}>
              Name the group and choose friends. You can add up to 49 friends.
            </p>
          </div>
          <button
            type='button'
            onClick={close}
            className={`${ui.iconBtn} absolute right-3 top-3`}
            aria-label='Close new group'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='space-y-3 px-6 py-4'>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={64}
            placeholder='Group name'
            className={ui.input}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search friends'
            className={ui.input}
          />
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-2'>
          {props.friends.length === 0 ? (
            <p className='px-3 py-6 text-center text-sm text-slate-400'>
              Add friends before creating a group.
            </p>
          ) : visibleFriends.length === 0 ? (
            <p className='px-3 py-6 text-center text-sm text-slate-400'>
              No friends match that search.
            </p>
          ) : (
            visibleFriends.map((friend) => {
              const selected = selectedIds.includes(friend.userId);
              return (
                <button
                  key={friend.userId}
                  type='button'
                  onClick={() => toggleFriend(friend.userId)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    selected ? 'bg-indigo-600/20' : 'hover:bg-slate-800/80'
                  }`}
                >
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.nickname}
                      className={ui.avatar}
                    />
                  ) : (
                    <div className={ui.avatarFallback}>
                      {friend.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <div className={ui.name}>{friend.nickname}</div>
                    <div className={ui.meta}>@{friend.username}</div>
                  </div>
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                      selected
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-slate-600'
                    }`}
                    aria-hidden
                  >
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error && (
          <p className='px-6 pb-2 text-sm text-rose-300'>{error}</p>
        )}

        <div className='border-t border-slate-800 p-4'>
          <button
            type='button'
            onClick={() => void handleCreate()}
            disabled={creating || props.friends.length === 0}
            className={ui.btnPrimary}
          >
            {creating
              ? 'Creating...'
              : selectedIds.length > 0
                ? `Create group (${selectedIds.length + 1})`
                : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
};
