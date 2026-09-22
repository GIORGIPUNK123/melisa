import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';
import { unwrapGroupKey, wrapGroupKey } from '../utils/chatCrypto';

const apiError = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { error?: string } } })
    ?.response?.data?.error;
  if (response) return response;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const groupActionError = apiError;

const loadGroupKey = async (
  conversationId: string,
  selfId: string,
  privateKey: string,
) => {
  const { data, error } = await supabase
    .from('conversation_key_envelopes')
    .select('nonce, key_box, wrapped_by')
    .eq('conversation_id', conversationId)
    .eq('user_id', selfId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.key_box || !data.nonce || !data.wrapped_by) {
    throw new Error('Could not unlock this group.');
  }

  const { data: wrapper, error: wrapperError } = await supabase
    .from('public_profiles')
    .select('public_key')
    .eq('id', data.wrapped_by)
    .maybeSingle();

  if (wrapperError) throw wrapperError;
  if (!wrapper?.public_key) {
    throw new Error('Could not unlock this group.');
  }

  const groupKey = unwrapGroupKey(
    data.key_box,
    data.nonce,
    wrapper.public_key,
    privateKey,
  );
  if (!groupKey) throw new Error('Could not unlock this group.');
  return groupKey;
};

export const inviteGroupMembers = async (args: {
  conversationId: string;
  memberIds: string[];
  selfId: string;
  privateKey: string;
}) => {
  const memberIds = [...new Set(args.memberIds)].filter(
    (id) => id && id !== args.selfId,
  );
  if (memberIds.length === 0) {
    throw new Error('Choose at least one friend.');
  }

  const groupKey = await loadGroupKey(
    args.conversationId,
    args.selfId,
    args.privateKey,
  );

  const { data: profiles, error } = await supabase
    .from('public_profiles')
    .select('id, public_key')
    .in('id', memberIds);

  if (error) throw error;

  const publicKeys = new Map(
    (profiles || []).map((profile) => [String(profile.id), profile.public_key]),
  );
  if (memberIds.some((id) => !publicKeys.get(id))) {
    throw new Error('Every member needs an encryption key.');
  }

  const envelopes = memberIds.map((id) => {
    const wrapped = wrapGroupKey(
      groupKey,
      publicKeys.get(id) as string,
      args.privateKey,
    );
    return { userId: id, nonce: wrapped.nonce, keyBox: wrapped.keyBox };
  });

  await api.post(`/conversations/group/${args.conversationId}/members`, {
    memberIds,
    envelopes,
  });
};

export const kickGroupMember = async (
  conversationId: string,
  userId: string,
) => {
  await api.delete(`/conversations/group/${conversationId}/members/${userId}`);
};

export const setGroupMemberRole = async (
  conversationId: string,
  userId: string,
  role: 'admin' | 'moderator' | 'member',
  permissions?: {
    canKick?: boolean;
    canChangePhoto?: boolean;
    canChangeName?: boolean;
    canClearMessages?: boolean;
  },
) => {
  await api.put(`/conversations/group/${conversationId}/admins/${userId}`, {
    role,
    canKick: permissions?.canKick === true,
    canChangePhoto: permissions?.canChangePhoto === true,
    canChangeName: permissions?.canChangeName === true,
    canClearMessages: permissions?.canClearMessages === true,
  });
};

export const updateGroupName = async (conversationId: string, name: string) => {
  await api.put(`/conversations/group/${conversationId}/name`, { name });
};

export const updateGroupPhoto = async (
  conversationId: string,
  avatarUrl: string | null,
) => {
  await api.put(`/conversations/group/${conversationId}/photo`, { avatarUrl });
};

export const leaveGroup = async (
  conversationId: string,
  choice?: { successorId?: string; random?: boolean },
) => {
  await api.post(`/conversations/group/${conversationId}/leave`, choice || {});
};

export const clearGroupMessages = async (conversationId: string) => {
  await api.delete(`/conversations/group/${conversationId}/messages`);
};

export const deleteGroup = async (conversationId: string) => {
  await api.delete(`/conversations/group/${conversationId}`);
};
