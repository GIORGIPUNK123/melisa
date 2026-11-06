import type { User } from '@supabase/supabase-js';
import {
  downloadChatFile,
  openChatFileBytes,
  type ChatFilePayload,
} from '../utils/chatFiles';
import type { ConversationMemberT } from '../../../types';

export const useChatFileActions = (params: {
  isAuthenticated: boolean;
  privateKey: string | null;
  user: User | null;
  conversationMembers: ConversationMemberT[];
}) => {
  const { isAuthenticated, privateKey, user, conversationMembers } = params;

  const openChatFile = async (payload: ChatFilePayload) => {
    if (!isAuthenticated || !privateKey || !user) {
      throw new Error('Chat is locked');
    }

    const cipher = await downloadChatFile(payload.path);
    const plain = openChatFileBytes(cipher, payload, {
      privateKey,
      groupKey: null,
      members: conversationMembers,
      currentUserId: user.id,
    });

    if (!plain) throw new Error('Could not decrypt file');

    return new Blob([plain as any], {
      type: payload.mime || 'application/octet-stream',
    });
  };

  return { openChatFile };
};
