import { useEffect, useState } from 'react';
import { FriendT, PublicProfileT } from '../../../types';
import { ui } from '../../../shared/ui';
import { IconX } from '../../../atoms';
import { GroupMemberAccess } from '../hooks/useChatState';
import {
  clearGroupMessages,
  deleteGroup,
  groupActionError,
  kickGroupMember,
  leaveGroup,
  setGroupMemberRole,
  updateGroupPhoto,
} from '../api/groupAdmin';
import { emitGroupMessagesCleared } from '../utils/groupEvents';
import { InviteGroupMembersModal } from './InviteGroupMembersModal';

const roleLabel = (
  userId: string,
  creatorId: string | null | undefined,
  access?: GroupMemberAccess,
) => {
  if (userId === creatorId) return 'Creator';
  if (access?.role === 'admin') return 'Admin';
  if (access?.role === 'moderator') return 'Moderator';
  return '';
};

export const GroupSettings = (props: {
  members: PublicProfileT[];
  memberAccess: Record<string, GroupMemberAccess>;
  creatorId?: string | null;
  conversationId: string;
  groupName: string;
  avatarUrl?: string | null;
  currentUserId: string;
  friends: FriendT[];
  privateKey: string;
  muted: boolean;
  muteSaving?: boolean;
  muteError?: string | null;
  onClose: () => void;
  onToggleMute: () => void;
  onViewProfile: (username: string) => void;
  onMembersChanged: () => void;
  onPhotoUpdated: () => void;
  onLeft: () => void;
  onDeleted: () => void;
  onConfirm: (data: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
}) => {
  const [photoUrl, setPhotoUrl] = useState(props.avatarUrl || '');
  const [photoSaving, setPhotoSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setPhotoUrl(props.avatarUrl || '');
  }, [props.avatarUrl]);

  const mine = props.memberAccess[props.currentUserId];
  const isCreator = props.creatorId === props.currentUserId;
  const isAdmin = isCreator || mine?.role === 'admin';
  const canChangePhoto = Boolean(isAdmin || mine?.canChangePhoto);
  const canClear = Boolean(isAdmin || mine?.canClearMessages);
  const canDelete = isAdmin;
  const previewUrl = canChangePhoto ? photoUrl.trim() : props.avatarUrl || '';
  const orderedMembers = [...props.members].sort((a, b) => {
    const rank = (id: string) => {
      if (id === props.creatorId) return 0;
      const role = props.memberAccess[id]?.role;
      if (role === 'admin') return 1;
      if (role === 'moderator') return 2;
      return 3;
    };
    return rank(a.id) - rank(b.id) || a.nickname.localeCompare(b.nickname);
  });
  const mustAppoint = props.members.length > 1 && isAdmin;
  const selected = props.members.find((member) => member.id === selectedId) || null;

  const fail = (error: unknown, fallback: string) => {
    setActionError(groupActionError(error, fallback));
  };

  const savePhoto = async () => {
    setPhotoSaving(true);
    setActionError(null);
    try {
      await updateGroupPhoto(props.conversationId, photoUrl.trim() || null);
      props.onPhotoUpdated();
      props.onMembersChanged();
    } catch (error) {
      fail(error, 'Could not update the group photo.');
    } finally {
      setPhotoSaving(false);
    }
  };

  const leaveNow = async (choice?: { successorId?: string; random?: boolean }) => {
    setActionError(null);
    try {
      await leaveGroup(props.conversationId, choice);
      setLeaveOpen(false);
      props.onLeft();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        props.onMembersChanged();
        setLeaveOpen(true);
        return;
      }
      fail(error, 'Could not leave the group.');
    }
  };

  const startLeave = () => {
    if (props.members.length <= 1) {
      props.onConfirm({
        title: 'Leave group',
        message: 'You are the last person here. Leaving deletes the group.',
        confirmText: 'Leave and delete',
        onConfirm: () => {
          void leaveNow();
        },
      });
      return;
    }
    if (mustAppoint) {
      setLeaveOpen(true);
      return;
    }
    props.onConfirm({
      title: 'Leave group',
      message: `Leave ${props.groupName}? You can be added again later.`,
      confirmText: 'Leave',
      onConfirm: () => {
        void leaveNow();
      },
    });
  };

  return (
    <>
      <div
        className='fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px]'
        onClick={props.onClose}
      />
      <aside className='fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-700/80 bg-slate-900 shadow-2xl'>
        <div className='flex items-center justify-between border-b border-slate-800 px-5 py-4'>
          <div>
            <h3 className='text-sm font-semibold tracking-wide text-white'>
              Group settings
            </h3>
            <p className='mt-0.5 text-xs text-slate-500'>
              {props.members.length} members
            </p>
          </div>
          <button
            type='button'
            onClick={props.onClose}
            className='rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
            aria-label='Close group settings'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='border-b border-slate-800 px-5 py-6'>
            <div className='flex flex-col items-center text-center'>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={props.groupName}
                  className='h-16 w-16 rounded-full object-cover ring-1 ring-slate-700'
                />
              ) : (
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white ring-1 ring-slate-700'>
                  {props.groupName.charAt(0).toUpperCase()}
                </div>
              )}
              <h4 className='mt-3 text-[16px] font-semibold text-white'>
                {props.groupName}
              </h4>
            </div>
            {canChangePhoto && (
              <div className='mt-4 space-y-2'>
                <label className={ui.label}>Group photo link</label>
                <input
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  placeholder='https://...'
                  className={ui.input}
                />
                <button
                  type='button'
                  onClick={() => void savePhoto()}
                  disabled={photoSaving}
                  className={ui.btnSecondary}
                >
                  {photoSaving ? 'Saving...' : 'Save photo'}
                </button>
              </div>
            )}
          </div>

          <div className='px-5 py-4'>
            <p className='mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500'>
              Members
            </p>
            <div className='space-y-1'>
              {orderedMembers.map((member) => {
                const label = roleLabel(
                  member.id,
                  props.creatorId,
                  props.memberAccess[member.id],
                );
                const isYou = member.id === props.currentUserId;
                const isTargetCreator = member.id === props.creatorId;
                const targetRole = props.memberAccess[member.id]?.role;
                const canEditRole = isAdmin && !isYou && !isTargetCreator;
                const canKick =
                  !isYou &&
                  !isTargetCreator &&
                  (isAdmin || (mine?.canKick === true && targetRole === 'member'));
                const manageable = canEditRole || canKick;

                return (
                  <button
                    key={member.id}
                    type='button'
                    onClick={() => {
                      if (manageable) setSelectedId(member.id);
                      else if (!isYou) props.onViewProfile(member.username);
                    }}
                    className='flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-slate-800/80'
                  >
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt=''
                        className='h-9 w-9 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-200'>
                        {member.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='truncate text-sm text-white'>
                          {member.nickname}
                        </span>
                        {isYou && (
                          <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400'>
                            You
                          </span>
                        )}
                        {label && (
                          <span className='rounded bg-indigo-600/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-indigo-300'>
                            {label}
                          </span>
                        )}
                      </div>
                      <div className='truncate text-xs text-slate-500'>
                        @{member.username}
                      </div>
                    </div>
                    {manageable && (
                      <span className='shrink-0 text-xs text-slate-500'>Manage</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className='space-y-1 border-t border-slate-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <button
            type='button'
            onClick={props.onToggleMute}
            disabled={props.muteSaving}
            className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50'
          >
            {props.muted ? 'Unmute group' : 'Mute group'}
          </button>
          <button
            type='button'
            onClick={() => setInviteOpen(true)}
            className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800'
          >
            Add people
          </button>
          {canClear && (
            <button
              type='button'
              onClick={() =>
                props.onConfirm({
                  title: 'Clear messages',
                  message: `Delete every message in ${props.groupName} for everyone?`,
                  confirmText: 'Clear',
                  onConfirm: () => {
                    void clearGroupMessages(props.conversationId)
                      .then(() => emitGroupMessagesCleared(props.conversationId))
                      .catch((error) => fail(error, 'Could not clear messages.'));
                  },
                })
              }
              className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800'
            >
              Clear messages
            </button>
          )}
          {canDelete && (
            <button
              type='button'
              onClick={() =>
                props.onConfirm({
                  title: 'Delete group',
                  message: `Delete ${props.groupName} for everyone? Members will be notified.`,
                  confirmText: 'Delete group',
                  onConfirm: () => {
                    void deleteGroup(props.conversationId)
                      .then(() => props.onDeleted())
                      .catch((error) => fail(error, 'Could not delete the group.'));
                  },
                })
              }
              className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10'
            >
              Delete group
            </button>
          )}
          <button
            type='button'
            onClick={startLeave}
            className='w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10'
          >
            Leave group
          </button>
          {(actionError || props.muteError) && (
            <p className='px-3 text-xs leading-5 text-rose-400'>
              {actionError || props.muteError}
            </p>
          )}
        </div>
      </aside>

      {selected && (
        <MemberOptions
          member={selected}
          access={props.memberAccess[selected.id]}
          canEditRole={
            isAdmin &&
            selected.id !== props.currentUserId &&
            selected.id !== props.creatorId
          }
          canKick={
            selected.id !== props.currentUserId &&
            selected.id !== props.creatorId &&
            (isAdmin ||
              (mine?.canKick === true &&
                props.memberAccess[selected.id]?.role === 'member'))
          }
          onClose={() => setSelectedId(null)}
          onSave={async (role, permissions) => {
            await setGroupMemberRole(
              props.conversationId,
              selected.id,
              role,
              permissions,
            );
            props.onMembersChanged();
            setSelectedId(null);
          }}
          onKick={async () => {
            await kickGroupMember(props.conversationId, selected.id);
            props.onMembersChanged();
            setSelectedId(null);
          }}
          onViewProfile={() => {
            props.onViewProfile(selected.username);
            setSelectedId(null);
          }}
          onError={(error) => fail(error, 'Could not update this member.')}
        />
      )}

      {leaveOpen && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center'>
          <div className='flex max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl'>
            <div className='px-5 py-4'>
              <h3 className={ui.title}>Choose the next admin</h3>
              <p className={`mt-1 ${ui.subtitle}`}>
                {isCreator
                  ? 'You are the creator. Pick who takes that place, or choose someone at random. You stay until you do.'
                  : 'Pick the next admin, or choose someone at random. You stay until you do.'}
              </p>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-2'>
              {props.members
                .filter((member) => member.id !== props.currentUserId)
                .map((member) => (
                  <button
                    key={member.id}
                    type='button'
                    onClick={() => void leaveNow({ successorId: member.id })}
                    className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-800'
                  >
                    <div className='min-w-0 flex-1'>
                      <div className={ui.name}>{member.nickname}</div>
                      <div className={ui.meta}>
                        {roleLabel(
                          member.id,
                          props.creatorId,
                          props.memberAccess[member.id],
                        ) || 'Member'}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
            <div className='space-y-2 border-t border-slate-800 p-4'>
              <button
                type='button'
                onClick={() => void leaveNow({ random: true })}
                className={ui.btnPrimary}
              >
                Choose randomly
              </button>
              <button
                type='button'
                onClick={() => setLeaveOpen(false)}
                className={ui.btnSecondary}
              >
                Stay in group
              </button>
            </div>
          </div>
        </div>
      )}

      <InviteGroupMembersModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        friends={props.friends}
        memberIds={props.members.map((member) => member.id)}
        conversationId={props.conversationId}
        selfId={props.currentUserId}
        privateKey={props.privateKey}
        onInvited={() => props.onMembersChanged()}
      />
    </>
  );
};

const MemberOptions = (props: {
  member: PublicProfileT;
  access?: GroupMemberAccess;
  canEditRole: boolean;
  canKick: boolean;
  onClose: () => void;
  onSave: (
    role: 'admin' | 'moderator' | 'member',
    permissions: {
      canKick: boolean;
      canChangePhoto: boolean;
      canClearMessages: boolean;
    },
  ) => Promise<void>;
  onKick: () => Promise<void>;
  onViewProfile: () => void;
  onError: (error: unknown) => void;
}) => {
  const initialRole =
    props.access?.role === 'admin' || props.access?.role === 'moderator'
      ? props.access.role
      : 'member';
  const [role, setRole] = useState<'admin' | 'moderator' | 'member'>(initialRole);
  const [canKick, setCanKick] = useState(props.access?.canKick === true && initialRole === 'moderator');
  const [canChangePhoto, setCanChangePhoto] = useState(
    props.access?.canChangePhoto === true && initialRole === 'moderator',
  );
  const [canClear, setCanClear] = useState(
    props.access?.canClearMessages === true && initialRole === 'moderator',
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await props.onSave(role, {
        canKick,
        canChangePhoto,
        canClearMessages: canClear,
      });
    } catch (error) {
      props.onError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center'>
      <div className='w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl'>
        <h3 className={ui.title}>{props.member.nickname}</h3>
        <p className={`mt-1 ${ui.subtitle}`}>@{props.member.username}</p>

        {props.canEditRole && (
          <div className='mt-4 space-y-2'>
            {(
              [
                ['member', 'Member', 'No group controls'],
                ['moderator', 'Moderator', 'Only the permissions you turn on'],
                ['admin', 'Admin', 'Same controls as the creator, except the creator'],
              ] as const
            ).map(([value, title, detail]) => (
              <button
                key={value}
                type='button'
                onClick={() => setRole(value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left ${
                  role === value
                    ? 'border-indigo-500 bg-indigo-600/15'
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className='text-sm text-white'>{title}</div>
                <div className='text-xs text-slate-400'>{detail}</div>
              </button>
            ))}
            {role === 'moderator' && (
              <div className='space-y-2 rounded-xl border border-slate-800 px-3 py-3'>
                <Toggle
                  label='Kick members'
                  checked={canKick}
                  onChange={setCanKick}
                />
                <Toggle
                  label='Change group photo'
                  checked={canChangePhoto}
                  onChange={setCanChangePhoto}
                />
                <Toggle
                  label='Clear messages'
                  checked={canClear}
                  onChange={setCanClear}
                />
              </div>
            )}
            <button
              type='button'
              onClick={() => void save()}
              disabled={saving}
              className={ui.btnPrimary}
            >
              {saving ? 'Saving...' : 'Save role'}
            </button>
          </div>
        )}

        <button
          type='button'
          onClick={props.onViewProfile}
          className={`${ui.btnSecondary} mt-3`}
        >
          View profile
        </button>
        {props.canKick && (
          <button
            type='button'
            onClick={() => {
              void props.onKick().catch(props.onError);
            }}
            className={`${ui.btnSecondary} mt-3 text-rose-300`}
          >
            Remove from group
          </button>
        )}
        <button
          type='button'
          onClick={props.onClose}
          className={`${ui.btnSecondary} mt-2`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Toggle = (props: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <button
    type='button'
    onClick={() => props.onChange(!props.checked)}
    className='flex w-full items-center justify-between text-left text-sm text-slate-200'
  >
    <span>{props.label}</span>
    <span
      className={`h-5 w-9 rounded-full p-0.5 ${
        props.checked ? 'bg-indigo-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white transition ${
          props.checked ? 'translate-x-4' : ''
        }`}
      />
    </span>
  </button>
);
