import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';
import { generateGroupKey, wrapGroupKey } from '../utils/chatCrypto';

export const createGroupChat = async (args: {
  name: string;
  memberIds: string[];
  selfId: string;
  selfPublicKey?: string | null;
  privateKey: string;
}) => {
  const memberIds = [...new Set([args.selfId, ...args.memberIds])];
  const { data: profiles, error } = await supabase
    .from('public_profiles')
    .select('id, public_key')
    .in('id', memberIds);

  if (error) throw error;

  const publicKeys = new Map(
    (profiles || []).map((profile) => [String(profile.id), profile.public_key]),
  );
  if (args.selfPublicKey) {
    publicKeys.set(args.selfId, args.selfPublicKey);
  }

  if (memberIds.some((id) => !publicKeys.get(id))) {
    throw new Error('Every member needs an encryption key.');
  }

  const groupKey = generateGroupKey();
  const envelopes = memberIds.map((id) => {
    const wrapped = wrapGroupKey(
      groupKey,
      publicKeys.get(id) as string,
      args.privateKey,
    );
    return {
      userId: id,
      nonce: wrapped.nonce,
      keyBox: wrapped.keyBox,
    };
  });

  const response = await api.post('/conversations/group', {
    name: args.name,
    memberIds,
    envelopes,
  });

  return String(response.data.conversationId);
};
