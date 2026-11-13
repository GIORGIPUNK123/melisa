import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationT } from '../../../types';

export const fetchConversations = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  try {
    const { data, error } = await supabase
      .from('conversation_members')
      .select(
        `
          muted,
          last_read_at,
          last_message_at,
          joined_at,
            conversations (
            id,
            type,
            name,
            conversation_members (
                public_profiles (
                id,
                nickname,
                username,
                avatar_url,
                public_key
                )
            )
            )
        `,
      )
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    const formattedConvs: ConversationT[] = (data || []).map((m: any) => {
      const otherUser = m.conversations.conversation_members.find(
        (member: any) => member.public_profiles.id !== userId,
      );

      return {
        id: m.conversations.id,
        type: m.conversations.type,
        name:
          m.conversations.name ||
          otherUser?.public_profiles?.nickname ||
          'Unknown',
        conversationMembers: m.conversations.conversation_members.map(
          (m2: any) => {
            const profile = m2.public_profiles;
            return {
              id: profile.id,
              nickname: profile.nickname,
              username: profile.username,
              avatarUrl: profile.avatar_url,
              publicKey: profile.public_key,
              lastReadAt: m2.last_read_at || m.last_read_at,
              lastMessageAt: m2.last_message_at || m.last_message_at,
              joinedAt: m2.joined_at || m.joined_at,
            };
          },
        ),
        muted: m.muted,
        lastMessageTime: m.last_message_at,
      };
    });

    return formattedConvs;
  } catch (err) {
    console.error('Failed to fetch chats:', err);
    return [];
  }
};
