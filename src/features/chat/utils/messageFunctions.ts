import type { SupabaseClient } from '@supabase/supabase-js';

const MEMBER_COLUMNS =
  'last_read_at, last_message_at, joined_at, muted, public_profiles(id, nickname, username, avatar_url, public_key)';

export type ConversationMemberRow = {
  last_read_at: string;
  last_message_at: string;
  joined_at: string;
  muted: boolean;
  public_profiles: {
    id: string;
    nickname: string;
    username: string;
    avatar_url: string | null;
    public_key: string;
  };
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_edited: boolean;
  created_at: string;
  updated_at: string;
};

export const fetchConversationMembers = async (
  supabase: SupabaseClient,
  conversationId: string | number,
): Promise<ConversationMemberRow[]> => {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(MEMBER_COLUMNS)
    .eq('conversation_id', conversationId);

  if (error) throw error;
  return (data || []) as unknown as ConversationMemberRow[];
};

export const fetchConversationMessages = async (
  supabase: SupabaseClient,
  conversationId: string | number,
): Promise<MessageRow[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as MessageRow[];
};
