import { useMemo, useState } from 'react';
import { FriendT } from '../../../types';
import { handleBackdropClick } from '../../../shared/utils/modal';
import { ui } from '../../../shared/ui';
import { IconUserPlus, IconX } from '../../../atoms';
import { groupActionError, inviteGroupMembers } from '../api/groupAdmin';

const MAX_GROUP_MEMBERS = 50;

export const InviteGroupMembersModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendT[];
  memberIds: string[];
  conversationId: string;
  selfId: string;
  privateKey: string;
  onInvited: () => Promise<void> | void;
}) => {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const slotsLeft = Math.max(0, MAX_GROUP_MEMBERS - props.memberIds.length);
  const memberSet = useMemo(() => new Set(props.memberIds), [props.memberIds]);

  const visibleFriends = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return props.friends.filter((friend) => {
      if (memberSet.has(friend.userId)) return false;
      if (!needle) return true;
      return (
        friend.nickname.toLowerCase().includes(needle) ||
        friend.username.toLowerCase().includes(needle)
      );
    });
  }, [props.friends, query, memberSet]);

  const close = () => {
    if (saving) return;
    setQuery('');
    setSelectedIds([]);
    setError(null);
    props.onClose();
  };

  const toggleFriend = (userId: string) => {
    setSelectedIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }
      if (current.length >= slotsLeft) return current;
      return [...current, userId];
    });
  };

  const handleInvite = async () => {
    if (selectedIds.length === 0) {
      setError('Choose at least one friend.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await inviteGroupMembers({
        conversationId: props.conversationId,
        memberIds: selectedIds,
        selfId: props.selfId,
        privateKey: props.privateKey,
      });
      setQuery('');
      setSelectedIds([]);
      await props.onInvited();
      props.onClose();
    } catch (err) {
      setError(groupActionError(err, 'Could not add those people.'));
    } finally {
      setSaving(false);
    }
  };

  if (!props.isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={(event) => handleBackdropClick(event, close)}
    >
      <div className='relative flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl'>
        <div className='px-6 pb-2 pt-6 pr-14'>
          <h2 className={ui.title}>Add people</h2>
          <p className={`mt-1 ${ui.subtitle}`}>
            Add your friends to this group. {slotsLeft} spots left.
          </p>
          <button
            type='button'
            onClick={close}
            className={`${ui.iconBtn} absolute right-3 top-3`}
            aria-label='Close add people'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='px-6 py-3'>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search friends'
            className={ui.input}
          />
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-2'>
          {slotsLeft === 0 ? (
            <p className='px-3 py-6 text-center text-sm text-slate-400'>
              This group is full.
            </p>
          ) : visibleFriends.length === 0 ? (
            <p className='px-3 py-6 text-center text-sm text-slate-400'>
              No friends left to add.
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
                  <div className='min-w-0 flex-1'>
                    <div className={ui.name}>{friend.nickname}</div>
                    <div className={ui.meta}>@{friend.username}</div>
                  </div>
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-xs ${
                      selected
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-slate-600'
                    }`}
                  >
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error && <p className='px-6 pb-2 text-sm text-rose-300'>{error}</p>}

        <div className='border-t border-slate-800 p-4'>
          <button
            type='button'
            onClick={() => void handleInvite()}
            disabled={saving || slotsLeft === 0 || selectedIds.length === 0}
            className={`${ui.btnPrimary} gap-2`}
          >
            <IconUserPlus size={16} />
            {saving ? 'Adding...' : 'Add to group'}
          </button>
        </div>
      </div>
    </div>
  );
};
