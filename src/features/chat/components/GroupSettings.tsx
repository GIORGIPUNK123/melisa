import { ReactNode, useEffect, useState } from 'react';
import { FriendT, PublicProfileT } from '../../../types';
import { ui } from '../../../shared/ui';
import { IconUserPlus, IconUsers, IconVolume, IconVolumeOff, IconX } from '../../../atoms';
import { GroupMemberAccess } from '../hooks/useChatState';
import {
  clearGroupMessages,
  deleteGroup,
  groupActionError,
  kickGroupMember,
  leaveGroup,
  setGroupMemberRole,
  updateGroupName,
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

const markBox = (size: number) => ({
  width: size,
  height: size,
  minWidth: size,
  minHeight: size,
});

function GroupMark(props: { name: string; src?: string; onError?: () => void }) {
  return (
    <div
      className='mx-auto flex items-center justify-center overflow-hidden rounded-full bg-indigo-500 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]'
      style={markBox(76)}
    >
      {props.src ? (
        <img
          src={props.src}
          alt=''
          onError={props.onError}
          className='h-full w-full object-cover'
        />
      ) : (
        <span className='text-[26px] font-semibold leading-none text-white'>
          {props.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function PersonMark(props: { name: string; src?: string | null; size?: number }) {
  const size = props.size ?? 40;
  return (
    <div
      className='flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 font-medium leading-none text-slate-100'
      style={{ ...markBox(size), fontSize: size < 32 ? 11 : 14 }}
    >
      {props.src ? (
        <img src={props.src} alt='' className='h-full w-full object-cover' />
      ) : (
        props.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function Chevron(props: { direction?: 'left' | 'right' }) {
  const left = props.direction === 'left';
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='shrink-0 text-slate-500'
      aria-hidden
    >
      <path d={left ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

function SwitchMark(props: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
        props.on ? 'bg-indigo-500' : 'bg-slate-700'
      }`}
      aria-hidden
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          props.on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </span>
  );
}

function IconClear() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M3 6h18' />
      <path d='M8 6V4h8v2' />
      <path d='m19 6-1 14H6L5 6' />
    </svg>
  );
}

function ActionRow(props: {
  label: string;
  detail?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  pressed?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={props.onClick}
      disabled={props.disabled}
      aria-pressed={props.pressed}
      className={`flex w-full items-center gap-3 border-t border-slate-800 px-3.5 py-3 text-left transition-colors first:border-t-0 disabled:opacity-50 ${
        props.danger
          ? 'text-rose-400 hover:bg-rose-500/10'
          : 'text-slate-100 hover:bg-slate-800/60'
      }`}
    >
      {props.icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            props.danger ? 'bg-rose-500/10 text-rose-300' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {props.icon}
        </span>
      )}
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-[15px] font-medium leading-5'>
          {props.label}
        </span>
        {props.detail && (
          <span className='mt-0.5 block truncate text-[12px] leading-4 text-slate-500'>
            {props.detail}
          </span>
        )}
      </span>
      {props.trailing}
    </button>
  );
}

function PersonRow(props: {
  member: PublicProfileT;
  role: string;
  isYou: boolean;
  interactive: boolean;
  onClick: () => void;
}) {
  const body = (
    <>
      <PersonMark name={props.member.nickname} src={props.member.avatar_url} />
      <span className='min-w-0 flex-1'>
        <span className='flex items-center gap-2'>
          <span className='truncate text-[15px] font-medium leading-5 text-white'>
            {props.member.nickname}
          </span>
          {props.isYou && (
            <span className='shrink-0 text-[12px] text-slate-500'>You</span>
          )}
        </span>
        <span className='mt-0.5 block truncate text-[12px] leading-4 text-slate-500'>
          @{props.member.username}
        </span>
      </span>
      {props.role && (
        <span
          className={`shrink-0 text-[12px] font-medium ${
            props.role === 'Creator' ? 'text-indigo-300' : 'text-slate-400'
          }`}
        >
          {props.role}
        </span>
      )}
      {props.interactive && <Chevron />}
    </>
  );
  const className =
    'flex w-full items-center gap-3 border-t border-slate-800 px-3.5 py-3 text-left';

  if (!props.interactive) {
    return <div className={className}>{body}</div>;
  }

  return (
    <button
      type='button'
      onClick={props.onClick}
      className={`${className} transition-colors hover:bg-slate-800/60`}
    >
      {body}
    </button>
  );
}

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
  onRenamed: () => void;
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
  const [photoBroken, setPhotoBroken] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [nameDraft, setNameDraft] = useState(props.groupName);
  const [editingName, setEditingName] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'people'>('home');

  useEffect(() => {
    setPhotoUrl(props.avatarUrl || '');
    setPhotoBroken(false);
  }, [props.avatarUrl]);

  useEffect(() => {
    if (!editingName) setNameDraft(props.groupName);
  }, [props.groupName, editingName]);

  const mine = props.memberAccess[props.currentUserId];
  const isCreator = props.creatorId === props.currentUserId;
  const isAdmin = isCreator || mine?.role === 'admin';
  const canChangePhoto = Boolean(isAdmin || mine?.canChangePhoto);
  const canRename = Boolean(isAdmin || mine?.canChangeName);
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
  const peopleLabel =
    props.members.length === 1 ? '1 person' : `${props.members.length} people`;
  const showPhoto = Boolean(previewUrl) && !photoBroken;

  const controlsFor = (memberId: string) => {
    const isYou = memberId === props.currentUserId;
    const isTargetCreator = memberId === props.creatorId;
    const targetRole = props.memberAccess[memberId]?.role;
    const canEditRole = isAdmin && !isYou && !isTargetCreator;
    const canKick =
      !isYou &&
      !isTargetCreator &&
      (isAdmin || (mine?.canKick === true && targetRole === 'member'));
    return {
      isYou,
      canEditRole,
      canKick,
      manageable: canEditRole || canKick,
    };
  };

  const fail = (error: unknown, fallback: string) => {
    setActionError(groupActionError(error, fallback));
  };

  const saveName = async () => {
    const nextName = nameDraft.replace(/\s+/g, ' ').trim();
    if (!nextName) {
      setActionError('Group name is required.');
      return;
    }
    setNameSaving(true);
    setActionError(null);
    try {
      await updateGroupName(props.conversationId, nextName);
      setEditingName(false);
      props.onRenamed();
    } catch (error) {
      fail(error, 'Could not rename the group.');
    } finally {
      setNameSaving(false);
    }
  };

  const savePhoto = async () => {
    setPhotoSaving(true);
    setActionError(null);
    try {
      await updateGroupPhoto(props.conversationId, photoUrl.trim() || null);
      setEditingPhoto(false);
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
      <aside className='fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-800 bg-slate-900 shadow-2xl'>
        <div className='flex shrink-0 items-center justify-between border-b border-slate-800 px-3 py-3'>
          <div className='flex min-w-0 items-center gap-1'>
            {view === 'people' && (
              <button
                type='button'
                onClick={() => setView('home')}
                className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
                aria-label='Back to group settings'
              >
                <Chevron direction='left' />
              </button>
            )}
            <div className={view === 'home' ? 'px-2' : 'min-w-0'}>
              <h3 className='text-[15px] font-semibold tracking-tight text-white'>
                {view === 'people' ? 'People' : 'Group settings'}
              </h3>
              {view === 'people' && (
                <p className='text-[12px] leading-4 text-slate-500'>{peopleLabel}</p>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={props.onClose}
            className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
            aria-label='Close group settings'
          >
            <IconX size={18} />
          </button>
        </div>

        {view === 'home' && (
          <div className='shrink-0 border-b border-slate-800 px-5 pb-5 pt-6 text-center'>
            <GroupMark
              name={props.groupName}
              src={showPhoto ? previewUrl : ''}
              onError={() => setPhotoBroken(true)}
            />
            <h4 className='mt-3 text-[17px] font-semibold tracking-tight text-white'>
              {props.groupName}
            </h4>
            <p className='mt-0.5 text-[13px] text-slate-400'>{peopleLabel}</p>
            {(canRename || canChangePhoto) && !editingName && !editingPhoto && (
              <div className='mt-3 flex items-center justify-center gap-4'>
                {canRename && (
                  <button
                    type='button'
                    onClick={() => {
                      setNameDraft(props.groupName);
                      setEditingName(true);
                    }}
                    className='text-[13px] font-medium text-indigo-300 transition-colors hover:text-indigo-200'
                  >
                    Change name
                  </button>
                )}
                {canChangePhoto && (
                  <button
                    type='button'
                    onClick={() => setEditingPhoto(true)}
                    className='text-[13px] font-medium text-indigo-300 transition-colors hover:text-indigo-200'
                  >
                    Change photo
                  </button>
                )}
              </div>
            )}
            {canRename && editingName && (
              <div className='mx-auto mt-4 max-w-xs space-y-2 text-left'>
                <label className={ui.label} htmlFor='group-name'>
                  Group name
                </label>
                <input
                  id='group-name'
                  value={nameDraft}
                  maxLength={64}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className={ui.input}
                />
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setNameDraft(props.groupName);
                      setEditingName(false);
                    }}
                    className={ui.btnSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={() => void saveName()}
                    disabled={nameSaving || nameDraft.replace(/\s+/g, ' ').trim().length < 1}
                    className={ui.btnPrimary}
                  >
                    {nameSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
            {canChangePhoto && editingPhoto && (
              <div className='mx-auto mt-4 max-w-xs space-y-2 text-left'>
                <label className={ui.label} htmlFor='group-photo-url'>
                  Photo link
                </label>
                <input
                  id='group-photo-url'
                  value={photoUrl}
                  onChange={(event) => {
                    setPhotoBroken(false);
                    setPhotoUrl(event.target.value);
                  }}
                  placeholder='https://...'
                  className={ui.input}
                />
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setPhotoUrl(props.avatarUrl || '');
                      setPhotoBroken(false);
                      setEditingPhoto(false);
                    }}
                    className={ui.btnSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={() => void savePhoto()}
                    disabled={photoSaving}
                    className={ui.btnPrimary}
                  >
                    {photoSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
          {view === 'home' ? (
            <div className='space-y-3'>
              <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40'>
                <ActionRow
                  icon={
                    props.muted ? (
                      <IconVolumeOff size={18} />
                    ) : (
                      <IconVolume size={18} />
                    )
                  }
                  label={props.muted ? 'Unmute group' : 'Mute group'}
                  detail={
                    props.muted ? 'Notifications are off' : 'Notifications are on'
                  }
                  onClick={props.onToggleMute}
                  disabled={props.muteSaving}
                  pressed={props.muted}
                  trailing={<SwitchMark on={props.muted} />}
                />
                <ActionRow
                  icon={<IconUsers size={18} />}
                  label='Manage people'
                  detail={peopleLabel}
                  onClick={() => setView('people')}
                  trailing={
                    <span className='flex items-center gap-2'>
                      <span className='flex -space-x-1.5'>
                        {orderedMembers.slice(0, 3).map((member) => (
                          <span
                            key={member.id}
                            className='rounded-full ring-2 ring-slate-950'
                          >
                            <PersonMark
                              name={member.nickname}
                              src={member.avatar_url}
                              size={22}
                            />
                          </span>
                        ))}
                      </span>
                      <Chevron />
                    </span>
                  }
                />
                <ActionRow
                  icon={<IconUserPlus size={18} />}
                  label='Add people'
                  detail='Invite a friend'
                  onClick={() => setInviteOpen(true)}
                  trailing={<Chevron />}
                />
                {canClear && (
                  <ActionRow
                    icon={<IconClear />}
                    label='Clear messages'
                    detail='Deletes them for everyone'
                    onClick={() =>
                      props.onConfirm({
                        title: 'Clear messages',
                        message: `Delete every message in ${props.groupName} for everyone?`,
                        confirmText: 'Clear',
                        onConfirm: () => {
                          void clearGroupMessages(props.conversationId)
                            .then(() => emitGroupMessagesCleared(props.conversationId))
                            .catch((error) =>
                              fail(error, 'Could not clear messages.'),
                            );
                        },
                      })
                    }
                  />
                )}
              </div>

              <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40'>
                {canDelete && (
                  <ActionRow
                    danger
                    label='Delete group'
                    onClick={() =>
                      props.onConfirm({
                        title: 'Delete group',
                        message: `Delete ${props.groupName} for everyone? Members will be notified.`,
                        confirmText: 'Delete group',
                        onConfirm: () => {
                          void deleteGroup(props.conversationId)
                            .then(() => props.onDeleted())
                            .catch((error) =>
                              fail(error, 'Could not delete the group.'),
                            );
                        },
                      })
                    }
                  />
                )}
                <ActionRow danger label='Leave group' onClick={startLeave} />
              </div>

              {(actionError || props.muteError) && (
                <p className='px-1 text-[13px] leading-5 text-rose-400'>
                  {actionError || props.muteError}
                </p>
              )}
            </div>
          ) : (
            <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40'>
              <ActionRow
                icon={<IconUserPlus size={18} />}
                label='Add someone'
                onClick={() => setInviteOpen(true)}
                trailing={<Chevron />}
              />
              {orderedMembers.map((member) => {
                const label = roleLabel(
                  member.id,
                  props.creatorId,
                  props.memberAccess[member.id],
                );
                const controls = controlsFor(member.id);
                const open = () => {
                  if (controls.manageable) setSelectedId(member.id);
                  else if (!controls.isYou) props.onViewProfile(member.username);
                };
                const interactive = controls.manageable || !controls.isYou;

                return (
                  <PersonRow
                    key={member.id}
                    member={member}
                    role={label}
                    isYou={controls.isYou}
                    interactive={interactive}
                    onClick={open}
                  />
                );
              })}
              {(actionError || props.muteError) && (
                <p className='px-4 py-3 text-[13px] leading-5 text-rose-400'>
                  {actionError || props.muteError}
                </p>
              )}
            </div>
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
                    <PersonMark
                      name={member.nickname}
                      src={member.avatar_url}
                      size={36}
                    />
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
      canChangeName: boolean;
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
  const [canChangeName, setCanChangeName] = useState(
    props.access?.canChangeName === true && initialRole === 'moderator',
  );
  const [canClear, setCanClear] = useState(
    props.access?.canClearMessages === true && initialRole === 'moderator',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await props.onSave(role, {
        canKick,
        canChangePhoto,
        canChangeName,
        canClearMessages: canClear,
      });
    } catch (saveError) {
      setError(groupActionError(saveError, 'Could not update this member.'));
      props.onError(saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center'>
      <div className='flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl'>
        <div className='flex items-center gap-3 border-b border-slate-800 px-4 py-4'>
          <PersonMark name={props.member.nickname} src={props.member.avatar_url} />
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-[16px] font-semibold text-white'>
              {props.member.nickname}
            </h3>
            <p className='truncate text-[13px] text-slate-400'>
              @{props.member.username}
            </p>
          </div>
          <button
            type='button'
            onClick={props.onClose}
            className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
            aria-label='Close'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto p-4'>
          {props.canEditRole && (
            <div className='space-y-2'>
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
                  onClick={() => {
                    setError(null);
                    setRole(value);
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left ${
                    role === value
                      ? 'border-indigo-500 bg-indigo-600/15'
                      : 'border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className='text-sm text-white'>{title}</div>
                  <div className='text-xs text-slate-400'>{detail}</div>
                </button>
              ))}
              {role === 'moderator' && (
                <div className='space-y-3 rounded-xl border border-slate-800 px-3 py-3'>
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
                    label='Change group name'
                    checked={canChangeName}
                    onChange={setCanChangeName}
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

          <div className='mt-3 overflow-hidden rounded-2xl border border-slate-800'>
            <button
              type='button'
              onClick={props.onViewProfile}
              className='w-full px-3.5 py-3 text-left text-[15px] font-medium text-slate-100 transition-colors hover:bg-slate-800/60'
            >
              View profile
            </button>
            {props.canKick && (
              <button
                type='button'
                onClick={() => {
                  setError(null);
                  void props.onKick().catch((kickError) => {
                    setError(
                      groupActionError(kickError, 'Could not remove this person.'),
                    );
                    props.onError(kickError);
                  });
                }}
                className='w-full border-t border-slate-800 px-3.5 py-3 text-left text-[15px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10'
              >
                Remove from group
              </button>
            )}
          </div>
          {error && (
            <p className='mt-3 text-[13px] leading-5 text-rose-400'>{error}</p>
          )}
        </div>
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
