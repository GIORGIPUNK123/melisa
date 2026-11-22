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
        last_read_at,
        last_message_at,
        joined_at,
        conversations (
          id,
          type,
          name,
          avatar_url,
          conversation_mutes (user_id, conversation_id),
          conversation_members (
            last_read_at,
            joined_at,
            last_read_message_id,
            unread_count,
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
      .eq('conversations.conversation_mutes.user_id', userId)
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
        avatarUrl:
          m.conversations.type === 'group'
            ? m.conversations.avatar_url || undefined
            : otherUser?.public_profiles?.avatar_url || undefined,
        conversationMembers: m.conversations.conversation_members.map(
          (m2: any) => {
            const profile = m2.public_profiles;
            return {
              id: profile.id,
              nickname: profile.nickname,
              username: profile.username,
              avatarUrl: profile.avatar_url,
              publicKey: profile.public_key,
              lastReadAt: m2.last_read_at ?? '',
              joinedAt: m2.joined_at ?? '',
              lastReadMessageId: m2.last_read_message_id ?? 0,
              unreadCount: m2.unread_count ?? 0,
            };
          },
        ),
        muted: m.conversations.conversation_mutes.some(
          (mute: any) => mute.user_id === userId,
        ),
        lastMessageAt: m.last_message_at,
      };
    });

    return formattedConvs;
  } catch (err) {
    console.error('Failed to fetch chats:', err);
    return [];
  }
};
